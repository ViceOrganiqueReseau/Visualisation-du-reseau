var hull = function(vertices){ return d3.polygonHull(vertices); };
var hullLine = d3.line()
  .curve(CONSTANTS.MEMBRANE.CURVE);

var membranePath = function(nodes, cluster){
  var padding = CONSTANTS.MEMBRANE.PADDING;
  var x = function(p){ return p.cosAngle * ((p.radius||0)+padding); };
  var y = function(p){ return p.sinAngle * ((p.radius||0)+padding); };
  var points = [], node, nodePoints;
  var nodeIndex, nodeNumber = nodes.length;
  
  var i, n;
  for(nodeIndex = 0; nodeIndex < nodeNumber; nodeIndex++){
    node = nodes[nodeIndex];
    if(cluster.hasNode(node)){
      nodePoints = node.points && node.points.length > 0 ? node.points : node.kernelPoints;
      n = nodePoints.length;
      for(i=0; i < n; i++){
        points.push([
          node.x + x(nodePoints[i]) - cluster.x,
          node.y + y(nodePoints[i]) - cluster.y
        ]);
      }
    }
  }

  var h = hull(points);
  delete points;
  if(h && h.length > 0){
    return hullLine(h);
  } else {
    return '';
  }
};

// rend valide des sélecteurs css
function purgeSpaces(string){
  return string
            .replace("(","")
            .replace(")","")
            .replace("/","")
            .replace("-","")
            .replace(" ","")
            .replace(" ","")
            .replace(" ","")
            .replace(" ","")
            .replace(",","")
            .replace(",","");
}

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

  console.log("membranes = ", membranes);

  membranes.forEach(function (membrane){
    var textelem = canvas.append("text")
      .classed("membranetext", true)
      .attr("id", "membranetext"+purgeSpaces(membrane.key))
      .attr("x", membrane.x)
      .attr("y", membrane.y)
    textelem.append("tspan")
      .classed("name", true)
      .attr("x", membrane.x+10)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="R"){ return membrane.y; }
        else { return membrane.y + 10; }
      })
      .text(membrane.key)
    textelem.append("tspan")
      .classed("count", true)
      .attr("fill-opacity", 0)
      .attr("x", membrane.x+10)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="R"){ return membrane.y + CONSTANTS.MEMBRANE.TEXT_PADDING; }
        else { return membrane.y + 10 + CONSTANTS.MEMBRANE.TEXT_PADDING; }
      })
      .text(membrane.nodeIDS.length+" organisations")
    textelem.append("tspan")
      .classed("budget", true)
      .attr("fill-opacity", 0)
      .attr("x", membrane.x+10)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="R"){ return membrane.y + 2*CONSTANTS.MEMBRANE.TEXT_PADDING; }
        else { return membrane.y + 10 + 2*CONSTANTS.MEMBRANE.TEXT_PADDING; }
      })
      .text(function (){
        // On calcule le budget total de lobbying
        var somme = 0;
        for (var i=0; i<nodes.length; i++){
          if (membrane.nodeIDS.indexOf(nodes[i].ID)!==-1 && nodes[i]["Dépenses Lobby (€)"]!=="NaN"){
            somme += Number(nodes[i]["Dépenses Lobby (€)"]);
          }
        }
        return "Budget Lobby : "+somme+" €";
      })
  })


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

  $membranes.on("mouseover", function (membrane){
    console.log("hover")
    canvas.select("#membranetext"+purgeSpaces(membrane.key)).select("tspan.count").attr("fill-opacity", 1);
    canvas.select("#membranetext"+purgeSpaces(membrane.key)).select("tspan.budget").attr("fill-opacity", 1);
  })

  $membranes.on("mouseout", function (membrane){
    canvas.select("#membranetext"+purgeSpaces(membrane.key)).select("tspan.count").attr("fill-opacity", 0);
    canvas.select("#membranetext"+purgeSpaces(membrane.key)).select("tspan.budget").attr("fill-opacity", 0);
  })
  
  return {membranes: $membranes, membranesExit: membranesExit};
}
