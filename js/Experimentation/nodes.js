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


var drawNodes = function(nodes){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var colors = CONSTANTS.COLORS;
  var $nodes = scene.getCanvas().selectAll('.node').data(nodes);
  var nodeEnter = $nodes.enter().append('g')
    .classed('node', true);

  
  var lobbyNodeEnter = nodeEnter.filter(function(d){
    return d.type == TYPES.LOBBY;
  });

  // premier cercle, la membrane externe.
  lobbyNodeEnter.append('path')
    .classed('circle-membrane', true)
    .attr('id', function(d){ return d.ID; })
    .attr('stroke', 'none')
    .attr('fill', function(d){
      var color = nodeColor(d);
      return fade(color, colors.BACKGROUND, 0.33);
    })
    .attr('d', function(d){
      return radialLine(d.points);
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

  $nodes = nodeEnter.merge($nodes);

  // suppresion des noeuds supprimé (propriété par exemple)
  // TODO: rajouter une constante. 
  $nodes.exit().transition(300)
    .attrTween('opacity', function(){
      return d3.interpolateNumber(1,0); })
    .remove();

  return $nodes;
}


