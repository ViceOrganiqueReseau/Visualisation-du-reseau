"use strict";
/**
 * Actuellement la mise à jour de la position d'une node de façon fluide est 
 * impossible lors d'une transition. Pour qu'elle le devienne il faut changer
 * la façon de dessiner les nodes. À la place de tracer de façon "bête" les 
 * nodes (avec des boucles) nous devons en prioriété utiliser le mécanisme
 * de jointure des données. En effet il nous faut mettre à jour la position
 * des noeuds et non pas recréer des données. 
 *
 * Ceci implique:
 * - Qu'afin de faire fonctionner la mise à jour des membrane nous devons avoir
 *   tracer les cluster différment. La façon de trouver la position des points
 *   doit changer. Au lieu de garder des références vers les noeuds nous devons
 *   a la place se baser sur les noeuds présent dans le DOM (virtuel ici).
 *   Par exemple:
 *   drawMembrane = (cluster)=>{
 *     nodes = selection d3 des noeuds du réseau.
 *     nodes.filter(function(d){
 *       var node = d.data();
 *       return cluster.nodeIDS.indexOf(node.ID) != -1;
 *     });
 *     // calcul des points du cluster à partir des coordonnées de la node.
 * - Pour la transition entre un nouveau cluster il nous faut mélanger transition
 *   les forces.
 *
 * Ressources:
 * - transition de forces à l'aide de strength https://bl.ocks.org/plmrry/a23c79db3a30af301386123279f9709bi
 * - transition de forces avec les transition() https://stackoverflow.com/questions/40963272/transition-between-difference-force-center-in-d3-v4
 * - article complet sur les transition (avec strength aussi) https://hi.stamen.com/forcing-functions-inside-d3-v4-forces-and-layout-transitions-f3e89ee02d12
 * - code d3 des simulation https://github.com/d3/d3-force/blob/master/src/simulation.js
 * - les forces de cluster utilisée: https://github.com/ericsoco/d3-force-cluster
 * - les transitions en canvas: https://github.com/quantmind/d3-canvas-transition
 * - utilisation des fx et fy dans les forceSimulation https://bl.ocks.org/mbostock/2990a882e007f8384b04827617752738
 */
var simulation, stats, scene, canvas;
// tire aléatoirement un nombre entre `min` et `max`
var rand  = function(min , max){ return Math.random()*max + min; };
// tire aléatoirement un élément du tableau `arr`. 
var randPick = function(arr){ return arr[Math.round(rand(0, arr.length-1))]; };
// retourne aléatoirement 1 ou -1
var randSign = function(){ return Math.random()>0.5 ? 1:-1 };

// var context = canvas.node().getContext('2d');

var radialLine = d3.radialLine()
  .angle(function(d){ return d.angle; })
  .radius(function(d){ return d.radius; })
  .curve(CONSTANTS.CIRCLE.CURVE);

  // var hull = d3.concaveHull().padding(CONSTANTS.MEMBRANE.PADDING).distance(1000);

var hull = function(vertices){ return d3.polygonHull(vertices); };
var hullLine = d3.line()
  .curve(CONSTANTS.MEMBRANE.CURVE);

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

var membranePath = function(nodes, cluster){
  var padding = CONSTANTS.MEMBRANE.PADDING;
  var x = function(p){ return Math.cos(p.angle) * ((p.radius||0)+padding); };
  var y = function(p){ return Math.sin(p.angle) * ((p.radius||0)+padding); };

  var clusterNodes = nodes.filter(function(node){
    return cluster.nodeIDS.indexOf(node['ID']) >= 0; 
  });

  var points = clusterNodes.map(function(node){
    var cx = node.x, cy = node.y;
    var points = node.points.length > 0 ? node.points : node.kernelPoints;
    return points.map(function(p){
      return [ cx+x(p), cy+y(p) ];
    });
  }).reduce((a,b)=>a.concat(b)); // reduce -> permet d'aplatir le tableau
  var h = hull(points);
  if(h && h.length > 0){
    return hullLine(h);
  } else {
    return '';
  }
};


var reshapeNode = function(node, duration){
  node.reshaping = true;
  var oldPoints = node.points;
  var newPoints = circlePoints(node.radius, oldPoints.length);
  var interpolator = d3.interpolateArray(oldPoints,newPoints);
  var timer = d3.timer((time)=>{
    var timeRatio = time/duration;
    var points = interpolator(timeRatio);
    node.points = points;
    if(timeRatio > 1.0){
      timer.stop();
      node.reshaping = false;
    }
  })
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
    node.x = _interpolatorX(timeRatio);
    node.y = _interpolatorY(timeRatio);
    if(timeRatio > 1.0){
      node.moving = false;
      timer.stop();
    }

  });
};


var draw = function(current, previous){
  var sectionChanged = !previous || (previous && (current.id != previous.id));
  var shouldHideMembrane = !current.showClustersMembrane; 
  var shouldShowMembrane = current.showClustersMembrane;
  var shouldUseTransition = current.showClustersMembrane != (previous||{}).showClustersMembrane;

  if(current.id != previous){}

  // if(!shouldShowMembrane){
  var nodes = current.data.nodes;
  drawNodes(nodes);
  // }
  if(current.links){
    drawLinks(current.links);
  }

  if(shouldShowMembrane){
    drawMembranes(current);
  }
};

var configureSimulation = function(scene, data, sectionsConfig){
  var _simulation,
  // animations intervals
  reshapeInterval, moveInterval,
  // d3 selections
  membraneExit, $nodes, $membranes;
  var userChoice = data.userChoice;
  var currentSectionIndex = 0;
  var previousSectionIndex;
  var sections = sectionsConfig;
  var animationStatus = {
    isReshapingNodes: false
  };

  // met à jour régulièrement la simulation.
  var updateAtEvery = function(interval){
    interval = interval || CONSTANTS.UPDATE_INTERVAL;
    d3.interval(function(){
      _simulation.alpha(0.2)
    }, UPDATE_SIMULATION_INTERVAL);


  };

  var reshapeIntervalCallback = function(time){
    var section = getCurrentSection();
    var _nodes = section.data.nodes.filter(function(circle){ return !circle.reshaping; });
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


  var startReshaping = function(){
    animationStatus.isReshapingNodes = true;
    if(!reshapeInterval){
      d3.interval( reshapeIntervalCallback, animations.shape.interval);
    } else {
      reshapeInterval.restart(reshapeIntervalCallback, animations.shape.interval);
    }
  };
  var startMoving = function(){ 
    animationStatus.isMovingNodes = true;
    if(!moveInterval){
      moveInterval = d3.interval( moveIntervalCallback, animations.position.interval);
    } else {
      reshapeInterval.restart(moveIntervalCallback, animations.position.interval);
    }
  };
  var findNodeCluster = function(d){
    var section = getCurrentSection();
    var clusters = section.clusters;
    return clusters.find(function(cluster){
      return cluster.nodeIDS.indexOf(d['ID']) >= 0;
    });
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
    setCurrentSection(currentSectionIndex > 0 ? (currentSectionIndex - 1) : currentSectionIndex);
    updateSimulation();
  };

  var nextSection = function(){
    setCurrentSection(currentSectionIndex < sections.length - 1 ? (currentSectionIndex + 1) : currentSectionIndex);
    updateSimulation();
  };


  var updateLinks = function(){
    var TYPES = CONSTANTS.DATA.TYPES.LINK;
    var links = getCurrentSection().data.links;
    var link = canvas.selectAll('.link').data(links);
    // var linkEnter = link.enter().append('');
  };

  var updateMembranes = function(){
    var section = getCurrentSection();
    var membranes = section.clusters;
    if(!section.showMembranes){
      membranes = [];
    }
    console.log('membranes to show', membranes);
    var membrane = canvas.selectAll('.membrane')
      .data(membranes, function(c){ return c.key; });

    var membraneEnter = membrane.enter()
      .append('path')
      .classed('membrane', true)
      .attr('d', function(cluster){
        return membranePath(section.data.nodes, cluster);
      })
      .attr('fill', function(cluster){
        return chroma(cluster.color);
      }).attr('fill-opacity', 0);

    // update
    membraneEnter.transition()
      .delay(300)
      .duration(1000)
      .attrTween('fill-opacity', function(){ return d3.interpolateNumber(0,1);});


    $membranes = membraneEnter.merge(membrane);

    // on cache les membrane qui ne seront plus utilisées.
    // TODO: ajouter une constante 
    membraneExit = membrane.exit();
    
    membraneExit.transition().duration(300)
      .attrTween('fill-opacity', function(){ return d3.interpolateNumber(1,0); });
    
    membraneExit.transition().delay(500).remove();

    
    $membranes = $membranes.merge(membraneExit);
  };

  var updateNodes = function(){
    var TYPES = CONSTANTS.DATA.TYPES.NODE;
    var nodes = getCurrentSection().data.nodes;
    var node = canvas.selectAll('.node').data(nodes);
    var nodeEnter = node.enter().append('g')
      .classed('node', true);

    var nodeColor = function(d){
      var colors = CONSTANTS.COLORS;
      if(userChoice.lobbyID == d.ID){
        return colors.ALLY;
      }
      if(userChoice.enemyID == d.ID){
        return colors.ENMEMY;
      }
      return d[userChoice.theme] === userChoice.position ? colors.SAME_POSITION : colors.DIFFERENT_POSITION;
    };
      
    var lobbyNodeEnter = nodeEnter.filter(function(d){
      return d.type == TYPES.LOBBY;
    });

    // premier cercle, la membrane externe.
    lobbyNodeEnter.append('path')
      .classed('circle-membrane', true)
      .attr('stroke', '')
      .attr('fill', function(d){
        var color = nodeColor(d);
        return chroma(color).alpha(0.5);
      })
      .attr('d', function(d){
        return radialLine(d.points);
      });

    // deuxième cercle, le noyau.
    lobbyNodeEnter.append('path')
      .classed('circle-kernel', true)
      .attr('stroke', function(d){ return chroma(nodeColor(d)); })
      .attr('fill', function(d){
        var color = nodeColor(d);
        return chroma(color);
      })
      .attr('d', function(d){
        return radialLine(d.kernelPoints);
      });

    $nodes = nodeEnter.merge(node);

    // suppresion des noeuds supprimé (propriété par exemple)
    // TODO: rajouter une constante. 
    node.exit().transition(1000)
      .attrTween('opacity', function(){
        return d3.interpolateNumber(1,0); })
      .remove();
  };

  var ticked = false;
  var forceTransition = function(name, fromStrength, toStrength, duration){
    // trouver la différence entre `from` et `toi`
    var strengthOffset = Math.abs(toStrength - fromStrength);
    var force = _simulation.force(name);
    force.strength(fromStrength);
    var t = d3.timer(function(elleapsed){

      var strength = fromStrength;
      var dt = elleapsed / duration;
      if(dt > 1.0){
        t.stop();
        dt = 1.0;
      }
      var sign = fromStrength < toStrength ? 1 : -1;
      strength += sign * Math.pow(dt, 3) * strengthOffset;
      force.strength(strength);
    });
  };

  var initializeNodesPosition = function(){
    var section = getCurrentSection();
    section.data.nodes.forEach(function(node){
      var cluster = findNodeCluster(node);
      node.x = cluster.x;
      node.y = cluster.y;
    });
  };
  var updateAnimations = function(){
  };

  var updateSimulationData = function(){
    var previousSection = getSectionAt(currentSectionIndex-1);
    var section = getCurrentSection();
    _simulation.nodes(section.data.nodes);
    _simulation.alphaTarget(0.3).restart();

    forceTransition('collide', 0.0, 0.5, 2000);
    forceTransition('cluster', 0.7, 0.2, 1500);
  };

  var initializeSimulation = function(){
    var kernelRadius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
    var collidePadding = CONSTANTS.FORCES.COLLIDE_PADDING;
    initializeNodesPosition();

    var nodes = getCurrentSection().data.nodes;
    _simulation = d3.forceSimulation(nodes)
      .on('tick', onTick)
      .force('collide', d3.forceCollide()
          .radius(function(d){
            return (d.radius > kernelRadius ? d.radius : kernelRadius) + collidePadding;
          }))
    .force('cluster', d3.forceCluster()
        .centers(function(d){
          var cluster = findNodeCluster(d);
          return cluster;
        })
        .centerInertia(1));

    _simulation.stop();
    _simulation.alphaTarget(0.3).restart();
    forceTransition('cluster', 0.5, 0.3, 1000);
    forceTransition('collide', 0.0, 0.5, 1500);
    updateNodes();
    updateMembranes();
    setTimeout(function(){
      _simulation.alphaTarget(0);
    }, 2000); 
  };

  var updateSimulation = function(){
    updateNodes();
    updateMembranes();
    updateLinks();
    updateAnimations();
    updateSimulationData();
  };

  var transform = function(node){
    return [
      'translate(', node.x, ',', node.y, ')'
    ].join('');
    };

    var onTick = function(){
      var n = nextSection;
      if(!ticked){
        ticked = true;
        console.log('onTick started');
      }
      var section = getCurrentSection();
      var DEBUG = CONSTANTS.DEBUG;
      // var previousSection = getPreviousSection();
      // var currentSection = getCurrentSection();

      // montre les FPS si nous somme en DEBUG.

      if(DEBUG){ stats.begin(); }

      $nodes.attr('transform', transform);
      $membranes.attr('d', function(d){return membranePath(section.data.nodes, d); });
      membraneExit.attr('d', function(d){return membranePath(section.data.nodes, d); });
      // nécessaire pour la capture des FPS en DEBUG.
      if(DEBUG){
        stats.end();
      }
    };

    return {
      alpha: function(a){ _simulation.alpha(a) },
      simulation: simulation,
      nextSection: nextSection,
      setCurrentSection: setCurrentSection,
      getCurrentSection: getCurrentSection,
      previousSection: previousSection,
      start: initializeSimulation
    };
};

// appellée une fois les données chargées
// Voir importdata.js
var runExperimentation = function(data){
  // global scene
  scene = setupScene();
  canvas = scene.getCanvas();

  // nous configurons les sections 
  // voir Experimentation/sections.js
  var sections = configureSections(data);


  // nous initialisons la simulation;
  // voir Experimentation/experimentation.js
  var simulation = configureSimulation(scene, data, sections);

  // enfin nous initialisons les controles de la simulation.
  // voir Experimentation/controls.js
  var controls = initControls(simulation);

  // nous démarrons ensuite la simulation
  simulation.start();
};
