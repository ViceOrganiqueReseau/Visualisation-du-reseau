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
    var angle = stepAngle*i;

    var jitterRadius = Utils.rand.sign() * Math.round(
        (radius*radiusJitter)*(Math.random())
    );
    points.push({
      // précalcul des cosinus et sinus pour éviter d'avoir à le faire 
      // lors du calcul de la membrane
      cosAngle: Math.cos(angle),
      sinAngle: Math.sin(angle),
      angle: angle,
      radius: radius + jitterRadius,
    });
  }
  return points;
};

var stopReshapeNodes = function($nodes){
  $nodes.interrupt();
};
var reshapeNodes = function($nodes){
  var duration = animations.circleShapes.duration;
  var attrTween = function(node){
    var old = d3.select(this).attr('d');
    var newPoints = circlePoints(node.radius, node.points.length);
    var newPath = radialLine(newPoints);
    node.points = newPoints;
    return d3.interpolatePath(old, newPath);
  };
  $nodes
    .filter(function(node){
      return node.points && node.points.length;
    })
    .select('.circle-membrane')
      .each(function(d,i){
        var _d = duration;
        var delay = i * 50;
        var $node = d3.select(this)

        function loop($node, delay, duration){
          $node.transition('reshape')
            .delay(delay)
            .ease(d3.easeLinear)
            .duration(duration)
            .attrTween('d', attrTween)
            .on('end', function(){
              loop($node, delay, _d); 
            });
        }
        loop($node, delay, _d);
      });
};

var nodeAnimations = {
  shape:{
    start: reshapeNodes,
    stop: stopReshapeNodes,
  }
};
var moveNode = function(node, duration){
  node.moving = true;
  var offsetX = randSign() * node.radius * 0.3;
  var offsetY = randSign() * node.radius * 0.3;

  var otherPosition = objectAssign({}, node, {
    x: node.x + offsetX,
    y: node.y + offsetY
  });

  var interpolateX = d3.interpolateNumber(node.x, otherPosition.x);
  var interpolateY = d3.interpolateNumber(node.y, otherPosition.y);

  var revInterpolateX = d3.interpolateNumber(otherPosition.x, node.x); 
  var revInterpolateY = d3.interpolateNumber(otherPosition.y, node.y); 

  var timer = d3.timer(function(time){
    var timeRatio = time/duration; 
    var _interpolatorX = timeRatio <= 0.5 ? interpolateX : revInterpolateX;
    var _interpolatorY = timeRatio <= 0.5 ? interpolateY : revInterpolateY;
    node.fx = _interpolatorX(timeRatio);
    node.fy = _interpolatorY(timeRatio);
    if(timeRatio > 1.0){
      node.moving = false;
      timer.stop();
    }
  });
};

// force permettant le mouvement des noeuds.
var randomMovementForce = function(){
  var nodes = [], strength = 1;

  function newTarget(node){
    node.tx = randSign() * Utils.rand.number(0, 6);
    node.ty = randSign() * Utils.rand.number(0, 6);
  }
  
  function initialize(){
    nodes.forEach(newTarget);
  }

  function force(alpha){
    var i, n = nodes.length, node;
    
    for(i = 0; i < n; i++){
      node = nodes[i];
      var mx = node.tx * alpha * strength * 0.5;
      var my = node.ty * alpha * strength * 0.5;
      node.vx += mx;
      node.vy += my;
      node.tx -= mx;
      node.ty -= my;
      // calcul de la fin du mouvement
      if(Math.abs(node.tx) < 1e-2 && Math.abs(node.ty) < 1e-2){
        newTarget(node);
      }
    }
  }
  force.strength = function(_){
    strength = _;
    return force;
  };

  force.initialize = function(_){
      nodes = _;
      initialize();
  };
  return force;
}


var nodeFill = function(node){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var colors = CONSTANTS.COLORS;
  // décommenter pour enlever le dégradé
  // return fade(Color.node(node), colors.BACKGROUND, 0.5);
  if(node.type === TYPES.LOBBY){
    return fade(Color.node(node), colors.BACKGROUND, 0.5);
  } else {
    return 'url(#radialGradient)'
  }
}; 

var drawNodes = function(nodes){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var $nodes = scene.getCanvas()
    .selectAll('.node')
    .data(nodes, function(node){ return node.ID; });

  var nodeEnter = $nodes.enter().append('g')
    .classed('node', true)
    .attr('transform', Utils.transform)
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
      $nodeLinks.transition().duration(200)
        .style('opacity', 1);

      $nodeLinks.classed('hidden', false);
    }
  }).on('mouseout', function(node){
    if(node.type === TYPES.PROPRIETARY){
      var $nodeLinks = canvas.selectAll('.link')
        .filter(function(link){
          return link.data.source.ID == node.ID;
        });
      $nodeLinks.transition().duration(150)
        .style('opacity', 0);
      $nodeLinks.classed('hidden', true);
    }
  });

  return $nodes;
}

