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
// arrete la déformation des noeuds
var stopReshapeNodes = function($nodes){
  this.interval && this.interval.stop();
  $nodes.interrupt();
};
// démarre la déformation des noeuds à interval régulier.
var startReshapeNodes = function($nodes){
  this.stop($nodes);
  
  this.interval = d3.interval(function(){
    reshapeNodes($nodes) }, animations.circleShapes.interval);
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


  // les nodes non actuellement déformée:
  var $nodeStill = $nodes.filter(':not(.reshaping)')
    .filter(function(node){
      return node.points && node.points.length;
    })
    .select('.circle-membrane');
  
    
  // tire aléatoirement 5 noeuds.
  Utils.rand.pick($nodeStill.nodes(), 5)
    .forEach(function(node,i){
      var delay = i * 10;
      var $node = d3.select(node)
      $node.classed('reshaping', true);
      $node.transition('reshape')
        .delay(delay)
        .ease(d3.easeLinear)
        .duration(duration)
        .attrTween('d', attrTween)
        .on('end', function(){ $node.classed('reshaping', false); });
    });
};

var nodeAnimations = {
  shape:{
    start: startReshapeNodes,
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
  } else if (node.type === TYPES.PROPRIETARY) {
    return 'url(#radialGradient)'
  } else {
    return fade(CONSTANTS.COLORS.STORYNODE, CONSTANTS.COLORS.BACKGROUND, 0.5)
  }
};

function opacityNotOn (node){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  if ((node[CONSTANTS.DATA.SPENDING_KEY]>999999.99 && currentIndex>3) || (node.type !== TYPES.LOBBY && node.type !== TYPES.PROPRIETARY)){
    return 1;
  } else {
    return 0;
  }
}

var fadeNotNeighbours = function (node){
  // On grise les noeuds non voisins
  var alldata = CONSTANTS.NOTPROCESSEDDATA;
  var neighboursID = [node.ID];
  // On récupère les IDs de tous les voisins
  for (var i=0; i<alldata.linksaffiliation.length; i++){
    if (alldata.linksaffiliation[i].data.source.ID === node.ID){
      neighboursID.push(alldata.linksaffiliation[i].data.target.ID)
    } else if (alldata.linksaffiliation[i].data.target.ID === node.ID){
      neighboursID.push(alldata.linksaffiliation[i].data.source.ID)
    } else {
      // On grise le lien
      canvas.selectAll(".source-"+alldata.linksaffiliation[i].data.source.ID).selectAll(".target-"+alldata.linksaffiliation[i].data.target.ID+" path")
        .attr("fill", function (){
          return Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY)
        })
    }
  }
  // On n'oublie pas les voisins actionnaires
  var directprop = CONSTANTS.NOTPROCESSEDDATA.linksproprietary;
  var undirectprop = CONSTANTS.NOTPROCESSEDDATA.undirectlinks;
  for (var i=0; i<directprop.length; i++){
    if (directprop[i].data.source.ID === node.ID){
      neighboursID.push(directprop[i].data.target.ID)
    } else if (directprop[i].data.target.ID === node.ID){
      neighboursID.push(directprop[i].data.source.ID)
    }
  }
  for (var i=0; i<undirectprop.length; i++){
    if (undirectprop[i].data.source.ID === node.ID){
      neighboursID.push(undirectprop[i].data.target.ID)
    } else if (undirectprop[i].data.target.ID === node.ID){
      neighboursID.push(undirectprop[i].data.source.ID)
    }
  }
  console.log("neighboursID = ", neighboursID)
  // On n'oublie pas les voisins story
  console.log("story ? "+storyonread);
  if (storyonread!==false && CONSTANTS.STORIES.Histoires[storyonread].Liens){
    var storylinks = CONSTANTS.STORIES.Histoires[storyonread].Liens;
    var linktypes = Object.keys(storylinks);
    for (var i=0; i<linktypes.length; i++){
      for (var j=0; j<storylinks[linktypes[i]].length; j++){
        if (String(storylinks[linktypes[i]][j].source) === node.ID){
          neighboursID.push(String(storylinks[linktypes[i]][j].target));
        } else if (String(storylinks[linktypes[i]][j].target) === node.ID){
          neighboursID.push(String(storylinks[linktypes[i]][j].source));
        } 
      }
    }
  }
  // On donne la couleur fade(notselected, bg, 0.3) aux noeuds non selectionnés dans neighboursID
  for (var i=0; i<alldata.nodes.length; i++){
    if (neighboursID.indexOf(alldata.nodes[i].ID)===-1 && alldata.nodes[i].type === CONSTANTS.DATA.TYPES.NODE.LOBBY){
      canvas.select("#lobby"+alldata.nodes[i].ID).select(".circle-kernel")
        .attr("fill", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY))
        .attr("stroke", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY));
      canvas.select("#lobby"+alldata.nodes[i].ID).select(".circle-membrane")
        .attr("fill", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, 0.5*CONSTANTS.COLORS.UNSELECTED_OPACITY));
    }
  }
  // On efface les noms déjà écrits
  canvas.selectAll("tspan.name").attr("fill-opacity", 0);
  // On affiche les noms des voisins
  for (var i=0; i<neighboursID.length; i++){
    canvas.select("#lobbytext"+neighboursID[i]).select("tspan.name").attr("fill-opacity", 1);
  }
}

var fadeNotInvolved = function (i){
  var alldata = CONSTANTS.LOADEDDATA;
  var involvedkey = CONSTANTS.STORIES.Histoires[i]["Noeuds principaux"] ? "Noeuds principaux" : "Noeuds du réseau";
  involvedID = CONSTANTS.STORIES.Histoires[i][involvedkey];
  // On donne la couleur fade(notselected, bg, 0.3) aux noeuds non selectionnés dans involvedID
  for (var j=0; j<alldata.nodes.length; j++){
    if (involvedID.indexOf(Number(alldata.nodes[j].ID))===-1 && alldata.nodes[j].type === CONSTANTS.DATA.TYPES.NODE.LOBBY){
      canvas.select("#lobby"+alldata.nodes[j].ID).select(".circle-kernel")
        .attr("fill", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY))
        .attr("stroke", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY));
      canvas.select("#lobby"+alldata.nodes[j].ID).select(".circle-membrane")
        .attr("fill", Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, 0.5*CONSTANTS.COLORS.UNSELECTED_OPACITY));
    }
  }
  // On donne la couleur fade(notselected, bg, 0.3) aux liens reliant deux non impliqués
  for (var j=0; j<alldata.links.length; j++){
    if (involvedID.indexOf(Number(alldata.links[j].data.source.ID))===-1 || involvedID.indexOf(Number(alldata.links[j].data.target.ID))===-1){
      // On grise le lien
      canvas.selectAll(".source-"+alldata.links[j].data.source.ID).selectAll(".target-"+alldata.links[j].data.target.ID+" path")
        .attr("fill", function (){
          return Color.fade(CONSTANTS.COLORS.UNSELECTED, CONSTANTS.COLORS.BACKGROUND, CONSTANTS.COLORS.UNSELECTED_OPACITY)
        })
    }
  }
  // On efface les noms déjà écrits
  canvas.selectAll("tspan.name").attr("fill-opacity", 0);
  // On affiche les noms des voisins
  for (var j=0; j<involvedID.length; j++){
    canvas.select("#lobbytext"+involvedID[j]).select("tspan.name").attr("fill-opacity", 1);
  }
}

var resetMouseOut = function (){
  var alldata = CONSTANTS.NOTPROCESSEDDATA;
  // On reset les noeuds
  for (var i=0; i<alldata.nodes.length; i++){
    canvas.select("#lobby"+alldata.nodes[i].ID).select(".circle-kernel").attr("fill", Color.node(alldata.nodes[i])).attr("stroke", Color.node(alldata.nodes[i]));
    canvas.select("#lobby"+alldata.nodes[i].ID).select(".circle-membrane").attr("fill", nodeFill);
  }
  // On reset les liens
  canvas.selectAll(".link path").attr("fill", Color.link);
  // On reset les textes
  for (var i=0; i<alldata.nodes.length; i++){
    canvas.select("#lobbytext"+alldata.nodes[i].ID).select("tspan.name").attr("fill-opacity", opacityNotOn(alldata.nodes[i]));
  }
  for (var i=0; i<alldata.proprietaries.length; i++){
    canvas.select("#lobbytext"+alldata.proprietaries[i].ID).select("tspan.name").attr("fill-opacity",0);
  }
  canvas.selectAll(".storynodetext").selectAll("tspan.name").attr("fill-opacity", 1);
  canvas.selectAll("tspan.budget").attr("fill-opacity", 0);
} 

var drawNodes = function(nodes){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var $nodes = scene.getCanvas()
  .selectAll('.node')
  .data(nodes, function(node){ return node.ID; });

  var nodeEnter = $nodes.enter().append('g')
  .classed('node', true)
  .attr('transform', Utils.transform)
  .attr('id', function(d){ return "lobby"+d.ID; });


  nodeEnter.append('path')
  .classed('circle-membrane', true)
  .attr('id', function(d){ return d.ID; })
  .attr('stroke', 'none')
  .attr('fill', nodeFill)
  .attr('d', function(d){
    return radialLine(d.points);
  });


  var lobbyNodeEnter = nodeEnter.filter(function(d){
    return (d.type == TYPES.LOBBY || d.type == TYPES.STORY);
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

  // Les textes associés aux nodes sont ajoutés à la toute fin du canvas
  // On doit d'abord récupérer les données
  nodes.forEach(function (node){
    var coords = Utils.revtransform(canvas.select("#lobby"+node.ID).attr("transform"));
    var textelem = canvas.append("text")
    .classed("lobbytext", true)
    .attr("id", "lobbytext"+node.ID)
    .classed("storynodetext", function (){return node.type === TYPES.STORY})
    .attr("x", coords.x+CONSTANTS.CIRCLE.TEXTdx)
    .attr("y", coords.y+CONSTANTS.CIRCLE.TEXTdy)
    textelem.append("tspan")
      .classed("name", true)
      .attr("x", coords.x+CONSTANTS.CIRCLE.TEXTdx)
      .attr("y", coords.y+CONSTANTS.CIRCLE.TEXTdy)
      .attr("fill-opacity", opacityNotOn(node))
      .text(function (){
        switch (node.type){
          case TYPES.PROPRIETARY:
            return node["Nom"];
          case TYPES.LOBBY:
            return node["Nom1"];
          case TYPES.STORY:
            return node["Nom"];
        }
      })
    if (node.type===TYPES.LOBBY && node[CONSTANTS.DATA.SPENDING_KEY]!="NaN"){
      textelem.append("tspan")
        .classed("budget", true)
        .attr("x", coords.x+CONSTANTS.CIRCLE.TEXTdx)
        .attr("y", coords.y+CONSTANTS.CIRCLE.TEXTdy+CONSTANTS.CIRCLE.TEXT_PADDING)
        .attr("fill-opacity", 0)
        .text("Budget Lobby : "+node[CONSTANTS.DATA.SPENDING_KEY]+" €")
    }
  })

  // suppresion des noeuds supprimé (propriété par exemple)
  // TODO: rajouter une constante. 
  $nodes.exit().transition()
  .duration(300)
  .attrTween('opacity', function(){
    return d3.interpolateNumber(1,0); })
    .remove();

    $nodes = nodeEnter.merge($nodes);

  $nodes.on('mouseover', function(node){
    //fadeNotNeighbours(node);
    if (currentIndex>=5){
      fadeNotNeighbours(node);
    }
    // On affiche le texte
    canvas.select("#lobbytext"+node.ID).select("tspan.name").attr("fill-opacity", 1);
    canvas.select("#lobbytext"+node.ID).select("tspan.budget").attr("fill-opacity", 1);
    if(node.type === TYPES.PROPRIETARY){
      var $nodeLinks = canvas.selectAll('.link')
        .filter(function(link){
          return link.data.source.ID == node.ID;
        });
        $nodeLinks.transition().duration(200)
        .style('opacity', 1);

      $nodeLinks.classed('hidden', false);
    } else if (node.type === TYPES.LOBBY) {
      if (!clicklocknode){
        canvas.select("#lobby"+node.ID).style("cursor", "pointer");
      }
    }
  }).on('mouseout', function(node){
    // On écrase le texte
    canvas.select("#lobbytext"+node.ID).select("tspan.name").attr("fill-opacity", opacityNotOn(node));
    canvas.select("#lobbytext"+node.ID).select("tspan.budget").attr("fill-opacity", 0);
    resetMouseOut();
    if(node.type === TYPES.PROPRIETARY){
      var $nodeLinks = canvas.selectAll('.link')
        .filter(function(link){
          return link.data.source.ID == node.ID;
        });
        $nodeLinks.transition().duration(150)
        .style('opacity', 0);
        $nodeLinks.classed('hidden', true);
    } else {
      canvas.select("#lobby"+node.ID).style("cursor", "default");
    }
  }).on("click", function (node){
    if (node.type === TYPES.LOBBY && !clicklocknode){
      setUpClickFiche(node);
    }
  });

  return $nodes;
}

