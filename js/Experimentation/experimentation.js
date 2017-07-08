'strict';
var DEBUG = true;
var simulation, stats;
// tire aléatoirement un nombre entre `min` et `max`
var rand  = function(min , max){ return Math.random()*max + min; };
// tire aléatoirement un élément du tableau `arr`. 
var randPick = function(arr){ return arr[Math.round(rand(0, arr.length-1))]; };
// retourne aléatoirement 1 ou -1
var randSign = function(){ return Math.random()>0.5 ? 1:-1 };

// on ajoute une classe de debug au contoles si nécessaire pour pouvoir cliquer dessus. 
d3.select('.controls').classed('controls--debug', DEBUG);
if(DEBUG){
  stats = new Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
}

var width = 960;
var height = 500;

// node constants
var SHOW_CIRCLE_POINTS = false;
var PHI = Math.PI * 4;
var POINTS_PER_CIRCLE = 22;
var CURVE =  d3.curveBasisClosed;    
var RADIUS_JITTER = 0.12;

// hull constants
var SHOW_HULL = true;
var HULL_PADDING = 10;
var HULL_DISTANCE = 200;
var HULL_CURVE =  CURVE;

// animations constants
var UPDATE_SIMULATION_INTERVAL = 500;
var animations = {
  position: {
    interval: 350,
    duration: 2000
  },
  shape: {
    interval:311,
    duration: 1000
  }
};

var canvas = d3.select("body").append("canvas")
  .attr("width", width)
  .attr("height", height);

var context = canvas.node().getContext('2d');

var radialLine = d3.radialLine()
  .angle(function(d){ return d.angle; })
  .radius(function(d){ return d.radius; })
  .curve(CURVE);

var hull = d3.concaveHull().padding(20).distance(200);
var hullLine = d3.line()
  .curve(HULL_CURVE);

var circlePoints = function(radius, nbPoints){
  var stepAngle = PHI/nbPoints;
  var points = [];
  for(var i=0; i<nbPoints; i++){
    var jitterAngle = randSign()*(Math.random()/nbPoints);
    var angle = stepAngle*i;

    sign = Math.round(Math.random()) == 0 ? 1 : -1;
    var jitterRadius = sign * Math.round(
        (radius*RADIUS_JITTER)*(Math.random())
        );
    points.push({
      angle: angle,
      radius: radius + jitterRadius,
    });
  }
  return points;
};

var reshapeNode = function(node, duration){
  node.reshaping = true;
  var oldPoints = node.points;
  var newPoints = circlePoints(node.radius, oldPoints.length);
  var interpolator = d3.interpolateArray(oldPoints,newPoints);
  var timer = d3.timer((time)=>{
    var timeRatio = time/duration;
    var points = interpolator(timeRatio);
    // console.log(points);
    node.points = points;
    if(timeRatio > 1.0){
      timer.stop();
      node.reshaping = false;
    }
  })
};

var moveNode = (node, duration)=>{
  node.moving = true;
  var offsetX = randSign() * node.radius * 0.3;
  var offsetY = randSign() * node.radius * 0.3;

  var otherPosition = objectAssign({}, node, {
    x: node.x + offsetX,
    y: node.y + offsetY
  });

  var interpolator = d3.interpolateObject(node, otherPosition);
  var revInterpolator = d3.interpolateObject(otherPosition, node); 

  var timer = d3.timer(function(time){
    var timeRatio = time/duration; 
    var _interpolator = timeRatio <= 0.5 ? interpolator : revInterpolator;
    var pos = _interpolator(timeRatio);
    node.x = pos.x;
    node.y = pos.y;
    if(timeRatio > 1.0){
      node.moving = false;
      timer.stop();
    }

  });
};


var drawNodes = function(nodes){
  nodes.forEach(function(node){
    if(!node.points){
      node.points = circlePoints(node.radius, POINTS_PER_CIRCLE);
    }
    context.translate(node.x, node.y);
    context.beginPath();

    var path = radialLine(node.points);
    context.fillStyle = node.color;
    context.fill(new Path2D(path));
    context.closePath();
    context.translate(-node.x, -node.y);

  });  
};

var drawMembranes = function(section, padding){
  var x = function(p){return Math.cos(p.angle) * (p.radius+padding);};
  var y = function(p){return Math.sin(p.angle) * (p.radius+padding);};

  sections.clusters.forEach(function(cluster){
    var nodes = cluster.nodes;

    // map -> récupération des coordonnées absolue dans le canvas
    var points = nodes.map(function(node){
      var {x:cx, y:cy} = node;
      return node.points.map(function(p){
        return [ cx+x(p), cy+y(p) ];
      });
    }).reduce((a,b)=>a.concat(b)); // reduce -> permet d'aplatir le tableau


    var path = hullLine(hull(points)[0]);

    context.beginPath();
    context.fillStyle = 'rgba(0,0,0,0)';
    context.strokeStyle = '#bbb';
    context.stroke(new Path2D(path));
    context.closePath();
  });
};

var drawLinks = function(links){
}

var draw = function(currentSection, previousSection){
  var sectionChanged = !previousSection || (previousSection && (currentSection.id != previousSection.id));
  var shouldHideMembrane = !currentSection.showClustersMembrane; 
  var shouldShowMembrane = !shouldHideMembrane;
  var shouldUseTransition = currentSection.showClustersMembrane != (previousSection||{}).showClustersMembrane;

  if(currentSection.id != previousSection){}

  drawNodes(currentSection.data.nodes);

  if(currentSection.links){
    drawLinks(currentSection.links);
  }

  if(shouldShowMembrane){
    drawMembranes(currentSection);
  }
};

var configureSimulation = function(data, sectionsConfig){
  var _simulation, reshapeInterval;
  var currentSectionIndex = 0;
  var previousSectionIndex;
  var sections = sectionsConfig;
  var animationStatus = {
    isReshapingNodes: false
  };
  // var ticks = 0;
  var config = {};

  // met à jour régulièrement la simulation.
  d3.interval(function(){
    _simulation.alpha(0.2)
  }, UPDATE_SIMULATION_INTERVAL);


  var reshapeIntervalCallback = function(time){
    var section = getCurrentSection();
    var _nodes = section.data.nodes.filter((circle)=>!circle.reshaping);
    if(_nodes.length){
      var node = randPick(_nodes);
      reshapeNode(node, animations.shape.duration);
    } 
  };

  var moveIntervalCallback = function(time){
    var section = getCurrentSection();
    var _nodes = section.data.nodes.filter(function(circle){ return !circle.animating; });
    if(_nodes.length){
      var node = randPick(_nodes);
      moveNode(node, animations.position.duration);
    } 
  };
  var moveInterval = d3.interval( moveIntervalCallback, animations.position.interval);


  var startReshaping = function(){
    animationStatus.isReshapingNodes = true;
    if(!reshapeInterval){
      d3.interval( reshapeIntervalCallback, animations.shape.interval);
    } else {
      reshapeInterval.restart(reshapeIntervalCallback, animations.shape.interval);
    }
  };

  var stopReshaping = function(){
    reshapeInterval.stop();
    animationStatus.isReshapingNodes = false;
  };

  var getSectionAt = function(i){
    return sections[i];
  };

  var getPreviousSection = function(){
    if(!previousSectionIndex){ return null; }
    return getSectionAt(previousSectionIndex);
  }
  var getCurrentSection = function(){
    return getSectionAt(currentSectionIndex);
  };

  var setCurrentSection = function(i){
    previousSectionIndex = currentSectionIndex;
    currentSectionIndex = i;
  };

  var previousSection = function(){
    setSection(currentSectionIndex > 0 ? (currentSectionIndex - 1) : currentSectionIndex);
    updateSimulation();
  };

  var nextSection = function(){
    currentSectionIndex = currentSectionIndex < sections.length - 1 ? (currentSectionIndex + 1) : currentSectionIndex;
    updateSimulation();
  };

  var onTick = function(){
    var previousSection = getPreviousSection();
    var currentSection = getCurrentSection();

    // montre les FPS si nous somme en DEBUG.
    DEBUG && stats.begin();

    // vide le canvas.
    context.clearRect(0, 0, width, height);

    draw(currentSection, previousSection);

    // nécessaire pour la capture des FPS en DEBUG.
    DEBUG && stats.end();
  };

  _simulation = d3.forceSimulation().on('tick', onTick);


  var updateSimulation = function(){
    updateData();
    updateAnimations();
    updateForces();
  };

  var updateAnimations = function(){
    var section = getCurrentSection();
    if(section.showClusterMembrane){
      if(animationsStatus.isReshapingNodes){
        stopReshaping();
      }
    } else {
      if(!animationStatus.isReshapingNodes){
        startReshaping();
      }
    }
  };

  var updateForces = function(){
    var section = getCurrentSection();
    for(var i in section.forces){
      _simulation.force(i, section.forces[i]);
    }
  };

  var updateData = function(){
    var section = getCurrentSection();
    _simulation.nodes(section.updateNodes());
  }

  return {
    alpha: function(a){ simulation.alpha(a) },
    simulation: simulation,
    nextSection: nextSection,
    setCurrentSection: setCurrentSection, 
    previousSection: previousSection,
    start: updateSimulation
  };
}



