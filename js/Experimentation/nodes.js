var radialLine = d3.radialLine()
  .angle(function(d){ return d.angle; })
  .radius(function(d){ return d.radius; })
  .curve(CONSTANTS.CIRCLE.CURVE);

var circlePoints = function(radius, nbPoints){
  nbPoints = nbPoints || CONSTANTS.CIRCLE.POINTS_NUMBER;
  var radiusJitter = CONSTANTS.CIRCLE.RADIUS_JITTER;
  var stepAngle = CONSTANTS.PHI/nbPoints;
  var points = [];
  for(var i=0; i<nbPoints; i++){
    var jitterAngle = randSign()*(Math.random()/nbPoints);
    var angle = stepAngle*i;

    var jitterRadius = randSign() * Math.round(
        (radius*radiusJitter)*(Math.random())
    );
    points.push({
      angle: angle,
      radius: radius + jitterRadius,
    });
  }
  return points;
};

var reshapeCircle = ($circle, circle, duration)=>{
  $circle.classed('reshaping', true);

  var old = $circle.attr('d') || circle.path;
  var newPath = radialLine(circlePoints(circle.radius, circle.points.length));
  var interpolator = d3.interpolatePath(old,newPath); 

  var t = d3.timer((p)=>{
    var r = p/duration;
    if(r>1.0){
      t.stop();
      r = 1.0;
      $circle.classed('reshaping', false);
    }
    var path = interpolator(r);
    $circle.attr('d', path);
  });
};

var nodeFill = function(node){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var colors = CONSTANTS.COLORS;
  
  if(node.type === TYPES.LOBBY){
    return fade(nodeColor(node), colors.BACKGROUND, 0.5);
  } else {
    return 'url(#radialGradient)'
  }
}; 

var drawNodes = function(nodes){
  console.log('nodes',nodes);
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var $nodes = scene.getCanvas()
    .selectAll('.node')
    .data(nodes, function(node){ return node.ID; });

  var nodeEnter = $nodes.enter().append('g')
    .classed('node', true)
    .attr('id', function(d){ return d.ID; });

 
  nodeEnter.append('path')
    .classed('circle-membrane', true)
    .attr('id', function(d){ return d.ID; })
    .attr('stroke', 'none')
    .attr('fill', nodeFill)
    .attr('d', function(d){
      return radialLine(d.points);
    });
  var lobbyNodeEnter = nodeEnter.filter(function(d){
    return d.type == TYPES.LOBBY;
  });

  // deuxième cercle, le noyau.
  lobbyNodeEnter.append('path')
    .classed('circle-kernel', true)
    .attr('stroke', function(d){ return chroma(nodeColor(d)); })
    .attr('fill', function(d){
      var color = Color.node(d);
      return chroma(color);
    })
    .attr('d', function(d){
      return radialLine(d.kernelPoints);
    });

  var proprietaryNodeEnter = nodeEnter.filter(function(d){
    return d.type == TYPES.PROPRIETARY;
  });
  
  proprietaryNodeEnter.select('.circle-membrane').on('mouveover', function(e){
    
  });
  // suppresion des noeuds supprimé (propriété par exemple)
  // TODO: rajouter une constante. 
  $nodes.exit().transition()
    .duration(300)
    .attrTween('opacity', function(){
      return d3.interpolateNumber(1,0); })
    .remove();

  $nodes = nodeEnter.merge($nodes);

  $nodes.on('mouseover', function(node){
    if(node.type === TYPES.PROPRIETARY){
      var $nodeLinks = canvas.selectAll('.link')
        .filter(function(link){
          return link.data.source.ID == node.ID;
        });
      $nodeLinks.transition().duration(300)
        .style('opacity', 1)

    }
  }).on('mouseout', function(node){
    if(node.type === TYPES.PROPRIETARY){
      var $nodeLinks = canvas.selectAll('.link')
        .filter(function(link){
          return link.data.source.ID == node.ID;
        });
      $nodeLinks.transition().duration(300)
        .style('opacity', 0);
    }
  });

  return $nodes;
}


