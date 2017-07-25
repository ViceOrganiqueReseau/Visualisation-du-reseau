var hull = function(vertices){ return d3.polygonHull(vertices); };
var hullLine = d3.line()
  .curve(CONSTANTS.MEMBRANE.CURVE);

var membranePath = function(nodes, cluster){
  var padding = CONSTANTS.MEMBRANE.PADDING;
  var x = function(p){ return Math.cos(p.angle) * ((p.radius||0)+padding); };
  var y = function(p){ return Math.sin(p.angle) * ((p.radius||0)+padding); };
  var points = [];
  var clusterNodes = nodes.filter(function(node){
    var cond = cluster.nodeIDS.indexOf(node['ID']) >= 0;
    // petit hack pour éviter une boucle map.
    if(cond){
      var nodePoints = node.points && node.points.length > 0 ? node.points : node.kernelPoints;
      nodePoints.forEach(function(p){
        points.push([
          node.x + x(p) - cluster.x,
          node.y + y(p) - cluster.y
        ]);
      });
    }
    return cond;
  });

  var h = hull(points);
  if(h && h.length > 0){
    return hullLine(h);
  } else {
    return '';
  }
};

var drawMembranes = function(nodes, membranes){
  var canvas = scene.getCanvas();
  var $membranes = canvas.selectAll('.membrane')
    .data(membranes, function(c){ return c.key; });

  var membraneEnter = $membranes.enter()
    .append('path')
    .classed('membrane', true)
    .attr('stroke', 'none')
    .attr('d', function(cluster){
      return membranePath(nodes, cluster);
    })
    .attr('fill', function(cluster){
      return chroma(cluster.color);
    }).attr('fill-opacity', 0);


  membraneEnter.transition()
    .delay(0)
    .duration(2200)
    .ease(d3.easeCubic)
    .attrTween('fill-opacity', function(){ return d3.interpolateNumber(0,1);});



  // on cache les membrane qui ne seront plus utilisées.
  // TODO: ajouter une constante 
  var membranesExit = $membranes.exit();

  membranesExit.transition().duration(400)
    .ease(d3.easeCubic)
    .attrTween('fill-opacity', function(){ return d3.interpolateNumber(1,0); });
  

  $membranes = membraneEnter.merge($membranes);

  membranesExit.transition().delay(500).remove();
  
  return {membranes: $membranes, membranesExit: membranesExit};
}
