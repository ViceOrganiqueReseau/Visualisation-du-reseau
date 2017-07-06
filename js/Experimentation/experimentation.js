'strict';

var DEBUG = true;
var simulation, stats;
// tire aléatoirement un nombre entre `min` et `max`
var rand  = function(min , max){ return Math.random()*max + min; };
// tire aléatoirement un élément du tableau `arr`. 
var randPick = function(arr){ return arr[Math.round(rand(0, arr.length-1))]; };
// retourne aléatoirement 1 ou -1
var randSign = function(){ return Math.random()>0.5 ? 1:-1 };

if(DEBUG){
  stats = new Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
}

var width = 960;
var height = 500;

// circle constants
var SHOW_CIRCLE_POINTS = false;
var PHI = Math.PI * 4;
var POINTS_PER_CIRCLE = 22;
var CURVE =  d3.curveBasisClosed;    
var RADIUS_JITTER = 0.12;

// hull constants
var SHOW_HULL = true;
var HULL_PADDING = 10;
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
  var offsetX = randSign() * circle.radius * 0.3;
  var offsetY = randSign() * circle.radius * 0.3;

  var otherPosition = Object.assign({}, circle, {
    x: circle.x + offsetX,
    y: circle.y + offsetY
  });

  var interpolator = d3.interpolateObject(circle, otherPosition);
  var revInterpolator = d3.interpolateObject(otherPosition, circle); 

  var timer = d3.timer(function(time){
    circle.animating = true;
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
// intervals, used to animate regularly the viz
d3.interval(()=>(simulation.alpha(0.2)), UPDATE_SIMULATION_INTERVAL);
d3.interval((time)=>{
  var _circles = circles.filter((circle)=>!circle.reshaping);
  if(_circles.length){
    var circle = randPick(_circles);
    reshapeCircle(circle, animations.shape.duration);
  } 
});
d3.interval(function(time){
  var _circles = circles.filter(function(circle){ return !circle.animating; });
  if(_circles.length){
    var circle = randPick(_circles);
    moveCircle(circle, animations.position.duration);
  } 
}, animations.position.interval);


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
  const x = function(p){return Math.cos(p.angle) * (p.radius+padding);};
  const y = function(p){return Math.sin(p.angle) * (p.radius+padding);};

  const points = nodes.map(function(node){
    const {x:cx, y:cy} = node;
    return node.points.map((p)=>[ cx+x(p), cy+y(p) ]);
  }).reduce((a,b)=>a.concat(b));


  const path = hullLine(hull(points)[0]);

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
    { show processData: function(){}, forces: {}}
];
var configSimulation = function(data, sectionsConfig, drawNodes){
  var simulation;
  var currentSectionIndex = 0;
  var sections = sectionsConfig;  
  var ticks = 0;
  var config = {};
 
  var currentSection = function(){
    return sections[currentSectionIndex];
  };

  
  var previousSection = function(){
    currentSectionIndex = currentSectionIndex > 0 ? (currentSectionIndex - 1) : currentSectionIndex;
    updateSimulation();
  };

  var nextSection = function(){
    currentSectionIndex = currentSectionIndex < sections.length - 1 ? (currentSectionIndex + 1) : currentSectionIndex;
    updateSimulation();
  } 
   
  var onTick = function(){
    DEBUG && stats.begin();
    ticks = ticks + 1;
    context.clearRect(0, 0, width, height);
    drawNodes(data);
    if(SHOW_HULL){
      drawHull(data, HULL_PADDING);
    }
    DEBUG && stats.end();
  };
  
  var simulation = d3.forceSimulation().on('tick', onTick);
  
 
  var updateSimulation = function(){
    updateForces();
    updateData();
  };

  var updateForces = function(){
    var currentSection = currentSection();
    for(var i in currentSection.forces){
      simulation.force(i, currentSection.forces[i]);
    }
  };

  var updateData = function(){
    // peut-être pas nécessaire. 
  }
  return {
    simulation: simulation,
    nextSection: nextSection,
    previousSection: previousSection
  };



  

}
// first initialisation of circles
circles.forEach(function(c){
  c.points = circlePoints(c.radius, POINTS_PER_CIRCLE);
});

simulation = configSimulation(circles, drawNodes);

initControls(simulation);
