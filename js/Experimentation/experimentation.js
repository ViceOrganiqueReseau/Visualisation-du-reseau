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
/* Variables globales */
var simulation, stats, scene, canvas;

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




var configureSimulation = function(scene, data, sectionsConfig){
  var _simulation, ticks = 0,
  // animations intervals
  reshapeInterval, moveInterval,
  // d3 selections
  $nodes, $membranes, $membranesExit, $links, $linksExit;
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
    var drawn = drawLinks(links);
    $links = drawn.links;
    $linksExit = drawn.linksExit;
    // var linkEnter = link.enter().append('');
  };

  var updateMembranes = function(){
    var section = getCurrentSection();
    var membranes = section.showMembranes ? section.clusters: [];

    var drawn = drawMembranes(section.data.nodes, membranes);
    $membranes = drawn.membranes;
    $membranesExit = drawn.membranesExit;
    
  };

  var updateNodes = function(){
    var nodes = getCurrentSection().data.nodes;
    $nodes = drawNodes(nodes);
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

  var updateSimulationData = function(){
    var previousSection = getSectionAt(currentSectionIndex-1);
    var section = getCurrentSection();
    _simulation.nodes(section.data.nodes);
    _simulation.force('link').links(section.data.links);
    _simulation.alphaTarget(0.45).restart();

    var addLinkTransition = section.showLinks && !previousSection.showLinks;
    var removeLinkTransition = !section.showLinks && previousSection.showLinks; 
    var noLinkTransition = !section.showLinks && !previousSection.showLinks;


    forceTransition('collide', 0.0, 0.7, 3500);
    
    if(addLinkTransition){
      _simulation.force('cluster').strength(0);
      forceTransition('link', 0.7, 0.2, 2000);
      forceTransition('many', 0.7, 0.2, 3000);
    }

    if(removeLinkTransition){
      _simulation.force('link').strength(0);
      _simulation.force('many').strength(0);
      _simulation.force('center').strength(0);
      forceTransition('cluster', 0.7, 0.5, 3000);
    }
    if(noLinkTransition){
      forceTransition('cluster', 0.7, 0.5, 3000);
    }
  };

  var initializeSimulation = function(){
    var kernelRadius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
    var collidePadding = CONSTANTS.FORCES.COLLIDE_PADDING;
    initializeNodesPosition();

    var nodes = getCurrentSection().data.nodes;
    updateNodes();
    updateMembranes();
    
    _simulation = d3.forceSimulation(nodes)
      .on('tick', onTick)
      .force('many', d3.forceManyBody().strength(0).distanceMin(5).distanceMax(800))
      .force('link', d3.forceLink()
          .strength(0)
          .id(function(node){ return node.ID; }))
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
    _simulation.alpha(0.5).restart();
    forceTransition('cluster', 0.5, 0.3, 600);
    forceTransition('collide', 0.0, 0.5, 500);
    setTimeout(function(){
      _simulation.alphaTarget(0.3);
    }, 3000); 
  };

  var updateSimulation = function(){
    updateNodes();
    updateMembranes();
    updateLinks();
    updateSimulationData();
  };
  var updateLink = function($link){
    if(!$link){ return; }
    $links.select('.link-base').attr('transform', function(link){ return transform(link.source);});
    
    $links.select('.link-body').attr('d', function(d){
      return linkBodyPath(d);
    });

  }
  var onTick = function(){
    ticks+=1;
    var nodes = this.nodes();
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

    $nodes.attr('transform', function(node){ return transform(node); });
    $membranes.attr('d', function(d){return membranePath(nodes, d); });
    $membranesExit.attr('d', function(d){return membranePath(nodes, d); });
    updateLink($links);
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
