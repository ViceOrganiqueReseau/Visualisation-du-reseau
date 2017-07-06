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

// circle varants
var SHOW_CIRCLE_POINTS = false;
var PHI = Math.PI * 4;
var POINTS_PER_CIRCLE = 22;
var CURVE =  d3.curveBasisClosed;    
var RADIUS_JITTER = 0.12;

// hull varants
var SHOW_HULL = true;
var HULL_PADDING = 10;
var HULL_DISTANCE = 200;
var HULL_CURVE =  CURVE;

// animations varants
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
var circles = [
{ animating: false, x: 340, y: 150, radius: 23, color: 'cyan' },
{ animating: false, x: 540, y: 127, radius: 106, color: 'red' },
{ animating: false, x: 200, y: 200, radius: 76, color: 'blue' },
{ animating: false, x: 403, y: 370, radius: 80, color: 'green' },
];

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

var reshapeCircle = function(circle, duration){
  circle.reshaping = true;
  var oldPoints = circle.points;
  var newPoints = circlePoints(circle.radius, oldPoints.length);
  var interpolator = d3.interpolateArray(oldPoints,newPoints);
  var timer = d3.timer((time)=>{
    var timeRatio = time/duration;
    var points = interpolator(timeRatio);
    // console.log(points);
    circle.points = points;
    if(timeRatio > 1.0){
      timer.stop();
      circle.reshaping = false;
    }
  })
};

var moveCircle = (circle, duration)=>{
  circle.animating = true;
  var offsetX = randSign() * circle.radius * 0.3;
  var offsetY = randSign() * circle.radius * 0.3;

  var otherPosition = objectAssign({}, circle, {
    x: circle.x + offsetX,
    y: circle.y + offsetY
  });

  var interpolator = d3.interpolateObject(circle, otherPosition);
  var revInterpolator = d3.interpolateObject(otherPosition, circle); 

  var timer = d3.timer(function(time){
    var timeRatio = time/duration; 
    var _interpolator = timeRatio <= 0.5 ? interpolator : revInterpolator;
    var pos = _interpolator(timeRatio);
    circle.x = pos.x;
    circle.y = pos.y;
    if(timeRatio > 1.0){
      circle.animating = false;
      timer.stop();
    }

  });
};


var drawNodes = function(nodes){
  nodes.forEach(function(node){
    context.translate(node.x, node.y);
    context.beginPath();

    var path = radialLine(node.points);
    context.fillStyle = node.color;
    context.fill(new Path2D(path));
    context.closePath();
    context.translate(-node.x, -node.y);

  });  
};

var drawHull = function(nodes, padding){
  var x = function(p){return Math.cos(p.angle) * (p.radius+padding);};
  var y = function(p){return Math.sin(p.angle) * (p.radius+padding);};

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

  if(SHOW_CIRCLE_POINTS){
    points.forEach((point)=>{
      context.beginPath();
      context.fillStyle = '#bbb';
      context.arc(point[0], point[1], 2,0, Math.PI*2);
      context.fill();
      context.closePath();
    });
  }
}
var sections = [
    { showClusterMembrane: true, processData: function(){}, forces: {}},
];

var configSimulation = function(data, sectionsConfig, drawNodes){
  var _simulation;
  var currentSectionIndex = 0;
  var sections = sectionsConfig;  
  // var ticks = 0;
  var config = {};

  // met à jour régulièrement la simulation.
  d3.interval(function(){
    _simulation.alpha(0.2)
  }, UPDATE_SIMULATION_INTERVAL);

  
  var reshapeIntervalCallback = function(time){
    var _circles = circles.filter((circle)=>!circle.reshaping);
    if(_circles.length){
      var circle = randPick(_circles);
      reshapeCircle(circle, animations.shape.duration);
    } 
  };

  var reshapeInterval = d3.interval( reshapeIntevalCallback, animations.shape.interval);

  var moveIntervalCallback = function(time){
    var _circles = circles.filter(function(circle){ return !circle.animating; });
    if(_circles.length){
      var circle = randPick(_circles);
      moveCircle(circle, animations.position.duration);
    } 
  };
  var moveInterval = d3.interval( moveIntervalCallback, animations.position.interval);


  var startReshaping = function(){
    reshapeInterval.restart(reshapeIntervalCallback, animations.shape.interval);
  };

  var stopReshaping = function(){
    reshapeInterval.stop();
  };

  var getSectionAt = function(i){ return sections[i]; };

  var getPreviousSection = function(){
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
    var currentSection = getCurrentSection();
    DEBUG && stats.begin();
    context.clearRect(0, 0, width, height);
    drawNodes(data);
    if(SHOW_HULL){
      drawHull(data, HULL_PADDING);
    }
    DEBUG && stats.end();
  };

  _simulation = d3.forceSimulation().on('tick', onTick);


  var updateSimulation = function(){
    updateForces();
    updateData();
  };

  var updateForces = function(){
    var section = getCurrentSection();
    for(var i in section.forces){
      simulation.force(i, section.forces[i]);
    }
  };

  var updateData = function(){
    // peut-être pas nécessaire. 
  }

  return {
    alpha: function(a){ simulation.alpha(a) },
    simulation: simulation,
    nextSection: nextSection,
    setCurrentSection: setCurrentSection, 
    previousSection: previousSection
  };
}

var initControls = function(simulation){
  this.simulation = simulation; 
  this.onNextClicked = function(){
    simulation.nextSection();
  }

  this.onPreviousClicked = function(){
    simulation.previousSection();
  }
  d3.select('.control--next').on('click', this.onNextClicked.bind(this));
  d3.select('.control--previous').on('click', this.onPreviousClicked.bind(this));
};


// first initialisation of circles
circles.forEach(function(c){
  c.points = circlePoints(c.radius, POINTS_PER_CIRCLE);
});

simulation = configSimulation(circles, sections, drawNodes);

initControls(simulation);
