/* 
 * Sections
 *
 * Permet de configurer les différentes sections de l'appliction.
 * chaque section est représentée par une fonction retournant 
 * un objet doté de la forme suivante:
 * {
 *  id: '' // optionnel. permet juste de s'y retrouver plus simplement. 
 *  clusters: [{x:0,y:0, nodeIDS:[0,1]], // tableau de clusters permettant de grouper les noeuds.
 *  data: {
 *    nodes: [], // les noeuds à utiliser pour cette section
 *    links: [], // les liens à utiliser
 *  },
 *  showMembranes:true|false, // montre ou cache les membranes d'aggrégats.
 *  showLinks:true,false // permet de plus facilement deviner les transitions entre les sections.
 * }
 */
'use strict';

var getSize = function(){
  var $canvas = d3.select('.experimentation');
  return [
    parseInt($canvas.attr('width')), parseInt($canvas.attr('height')) 
  ];
}

var packLayout = d3.pack()
  .padding(CONSTANTS.FORCES.PACK_PADDING)
  .radius(function(node){ return node.value; });


var getClusterColor = function(data, cluster){
  var colors = CONSTANTS.COLORS;
  var clusterPosition = cluster.data.key;
  if (data.userChoice.position){
    var userPosition = data.userChoice.position;
    return clusterPosition === userPosition ? colors.ALLY : colors.ENEMY;
  } else {
    return clusterPosition === "Pour" ? colors.SUPPORT : colors.OPPOSE;
  }
};

var contactCollide = function(d){
  var kernelRadius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
  return (d.radius > kernelRadius ? d.radius : kernelRadius) 
    + CONSTANTS.FORCES.COLLIDE_PADDING;
}

var spaceCollide =  function(d){
  var kernelRadius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
  return (d.radius > kernelRadius ? d.radius : kernelRadius) 
    + CONSTANTS.FORCES.COLLIDE_PADDING + CONSTANTS.FORCES.SPACE_PADDING;
}

var firstSection = function(data){
  var clusters = [];
  var nodes = data.utils.nodes.lobbies();
  
  // cluster par position sur le theme choisi (support vs oppose)
  var nest = d3.nest().key(function(d){ return d[data.userChoice.theme]; }); 
  var hierarchy = d3.hierarchy({
      values: nest.entries(nodes)
    }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; });

  
  // applique le layout de placement.  
  packLayout(hierarchy);
  // utile pour tracer les clusters par la suite.
  hierarchy.children.forEach(function(c){
    var color = getClusterColor(data, c); 
    var cluster = {
      key: c.data.key+'',
      color: color,
      x: c.x,
      y: c.y,
      nodeIDS: c.children.map(function(node){ return node.data['ID']; })
    };
    clusters.push(cluster);
  });

  return {
    id: 0,
    clusters: clusters,
    data: { nodes: nodes, links: [] },
    showMembranes: true,
    showLinks: false,
    collideRadius: contactCollide,
    nodepadding: CONSTANTS.VUE.AGREG_PADDING,
    legend: {
      active: ["#legcolors"],
      inactive: ["#legcolorscale", "#legaff", "#legprop", "#legstory"],
    },
  };
}
/* 
 * Deuxième section 
 * Agrégat par type de scruture (ONG, think tank, etc.) et par position. 
 */ 
var secondSection = function(data){
  var clusters = [];
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };
  // clusters par type de structure PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Type']; })
    .key(function(d){ return d[data.userChoice.theme]; });
  // les données nous intéressant pour cette section
  var nodes = data.utils.nodes.lobbies();
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; }); 
  var packed = packLayout(hierarchy);
  var position = data.userChoice.position;
  // creation des clusters 
  hierarchy.children.forEach(function(c){
    c.children.forEach(function(d){
      var color = getClusterColor(data, d);
      clusters.push({
        color: color,
        key: clusterKey(d),
        x: 0+d.x,
        y: 0+d.y,
        nodeIDS: d.children.map(function(node){ return node.data['ID']; })
      });
    });
  });

  return {
    id: 1,
    clusters: clusters, 
    data: { nodes: nodes, links: []},
    showMembranes: true,
    showLinks: false,
    collideRadius: contactCollide,
    nodepadding: CONSTANTS.VUE.AGREG_PADDING,
    legend: {
      active: ["#legcolors"],
      inactive: ["#legcolorscale", "#legaff", "#legprop", "#legstory"],
    },
  }
};

/* 
 * Troisième section 
 * Agrégat par secteur d'activité et par position. 
 */
var thirdSection = function(data){
  var clusters = [];
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };
  // clusters par secteurs d'activité PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Secteurs d’activité']; })
    .key(function(d){ return d[data.userChoice.theme]; });
  // les données nous intéressant pour cette section
  var nodes = data.utils.nodes.lobbies();
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; }); 
  var packed = packLayout(hierarchy);
  // creation des clusters 
  hierarchy.children.forEach(function(c){
    c.children.forEach(function(d){
      var color = getClusterColor(data, d);
      clusters.push({
        color: color,
        key: clusterKey(d),
        x: 0+d.x,
        y: 0+d.y,
        nodeIDS: d.children.map(function(node){ return node.data['ID']; })
      });
    });
  });

  return {
    id: 2,
    clusters: clusters, 
    data: { nodes: nodes, links: []},
    showMembranes: true,
    showLinks: false,
    collideRadius: contactCollide,
    nodepadding: CONSTANTS.VUE.AGREG_PADDING,
    legend: {
      active: ["#legcolors"],
      inactive: ["#legcolorscale", "#legaff", "#legprop", "#legstory"],
    },
  }
};

/* 
 * Quatrième section 
 * Agrégat par secteurs (avec comme couleur la "moyenne" des position). 
 */ 
var fourthSection = function(data){
  var colors = CONSTANTS.COLORS;
  var valueScale = d3.scaleLinear().range([0.0,1.0]);
  if (data.userChoice.position){
    var colorScale = chroma.scale([colors.ENEMY, colors.ALLY]);
  } else {
    var colorScale = chroma.scale([colors.OPPOSE, colors.SUPPORT]);
  }
  var clusters = [];
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };
  // clusters par secteurs d'activité PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Secteurs d’activité']; })
    .key(function(d){ return d[data.userChoice.theme]; });

  // les données nous intéressant pour cette section
  var nodes = data.utils.nodes.lobbies();
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; });

  var packed = packLayout(hierarchy);
  // creation des clusters 
  hierarchy.children.forEach(function(c){
    // montant total pour ce cluster
    var total = d3.sum(c.children, function(d){
      d.data.total = d3.sum(d.children, function(e){ return e.data.spending; });
      return d.data.total;
    });

    // couleur moyenne
    var samePositionCluster = c.children.find(function(d){
      if (data.userChoice.position){
        return d.data.key == data.userChoice.position;
      } else {
        return d.data.key == "Pour";
      }
      
    });
    var samePositionTotal = samePositionCluster ? samePositionCluster.data.total : 0; 
    var clusterNodes = c.children
      .map(function(d){ return d.children; })
      .reduce(function(a,b){ return a.concat(b); });

    var ratio = samePositionTotal / total;
    
    var clusterColor = colorScale(ratio);
    clusters.push({
      key: c.data.key,
      color: clusterColor,
      nodeIDS: clusterNodes.map(function(d){ return d.data.ID; }),
      x: 0+c.x,
      y: 0+c.y
    });
  });
  return {
    id: 4,
    clusters: clusters, 
    data: { nodes: nodes, links: []},
    showMembranes: true,
    showLinks: false,
    collideRadius: contactCollide,
    nodepadding: CONSTANTS.VUE.AGREG_PADDING,
    legend: {
      active: ["#legcolors", "#legcolorscale"],
      inactive: ["#legaff", "#legprop", "#legstory"],
    },
  }
};

/*
 * Cinquième section
 * Agrégat par secteur (pas de membranes)
 */
var fifthSection = function(data){
  var clusters = [];
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };
  // clusters par secteurs d'activité PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Secteurs d’activité']; });

  // les données nous intéressant pour cette section
  var nodes = data.utils.nodes.lobbies();
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; });

  var packed = packLayout(hierarchy);
  // creation des clusters 
  hierarchy.children.forEach(function(c){
    clusters.push({
      key: c.data.key,
      nodeIDS: c.children.map(function(d){ return d.data.ID; }),
      x: 0+c.x,
      y: 0+c.y
    });
  });
  return {
    id: 4,
    clusters: clusters, 
    data: { nodes: nodes, links: []},
    showMembranes: false,
    showLinks: false,
    collideRadius: contactCollide,
    nodepadding: CONSTANTS.VUE.NODE_PADDING,
    legend: {
      active: ["#legcolors"],
      inactive: ["#legcolorscale", "#legaff", "#legprop", "#legstory"],
    },
  }
};
/* 
 * Sixième section 
 */
var sixthSection = function(data){
  return {
    id: 5,
    clusters: [],
    data: {
      nodes:data.utils.nodes.lobbies(), 
      links:data.utils.links.affiliations()
    },
    showMembranes: false,
    showLinks: true,
    collideRadius: spaceCollide,
    nodepadding: CONSTANTS.VUE.NODE_PADDING,
    legend: {
      active: ["#legcolors", "#legaff"],
      inactive: ["#legcolorscale", "#legprop", "#legstory"],
    },
  };
};
var seventhSection = function(data){
  return {
    id: 6,
    clusters: [],
    data: {
      nodes: data.utils.nodes.all(),
      links: data.utils.links.all()
    },
    showMembranes: false,
    showLinks: true,
    collideRadius: spaceCollide,
    nodepadding: CONSTANTS.VUE.NODE_PADDING,
    legend: {
      active: ["#legcolors", "#legaff", "#legprop"],
      inactive: ["#legcolorscale", "#legstory"],
    },
  };
};

CONSTANTS.STORY_SECTION = {
    id: 7,
    clusters: [],
    /*data: {
      nodes: nodes,
      links: links,
      storynodes: storynodes,
    }, On ne connait pas encore les data */
    showMembranes: false,
    showLinks: true,
    collideRadius: spaceCollide,
    nodepadding: CONSTANTS.VUE.NODE_PADDING,
    legend: {
      active: ["#legcolors", "#legaff", "#legprop"],
      inactive: ["#legcolorscale"],
    },
  };
var eighthSection = function(data){
  return CONSTANTS.STORY_SECTION;
};

// Etant donné qu'on ajoute que les noeuds story, ne pas tenir de compte de absentinnides, 
// Au cas ou, le premier paragraphe de code permet d'éviter les doublons de noeuds. 
function addstorynodes (i, nodes, nodesindexor, key, spendingScale){
  for (var j=0; j<CONSTANTS.STORIES.Histoires[i][key].length; j++){
    var absentinnodes = true;
    for (var k=0; k<nodes.length; k++){
      if (Number(nodes[k].ID) === Number(CONSTANTS.STORIES.Histoires[i][key][j])){
        absentinnodes = false;
        break;
      }
    }
                         // On vérifie que le noeud existe
    if (absentinnodes && CONSTANTS.NOTPROCESSEDDATA.indexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])]){
      nodes.push(CONSTANTS.NOTPROCESSEDDATA.nodes[CONSTANTS.NOTPROCESSEDDATA.indexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])]]);
      nodesindexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])] = nodes.length-1;
      // On rentre les points, calcule le radius etc...
      var node = nodes[nodes.length-1]
      var spending = parseInt(node[CONSTANTS.DATA.SPENDING_KEY])||0;
      if(spending > 0){
        node.radius = spendingScale(spending);
        node.points = circlePoints(node.radius);
      } else {
        node.radius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
        node.points = [];
      }
      node.spending = spending;
      node.kernelPoints = circlePoints(CONSTANTS.CIRCLE.KERNEL_RADIUS);
      node.type = CONSTANTS.DATA.TYPES.NODE.LOBBY;
    } else if (absentinnodes && CONSTANTS.NOTPROCESSEDDATA.propindexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])]){
      nodes.push(CONSTANTS.NOTPROCESSEDDATA.proprietaries[CONSTANTS.NOTPROCESSEDDATA.propindexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])]]);
      nodesindexor[Number(CONSTANTS.STORIES.Histoires[i][key][j])] = nodes.length-1;
      // On rentre les points, calcule le radius etc...
      var node = nodes[nodes.length-1];
      node.kernelPoints = circlePoints(CONSTANTS.CIRCLE.KERNEL_RADIUS);
      node.type = CONSTANTS.DATA.TYPES.NODE.PROPRIETARY;
      // Les updates de node.link et node.radius seront réalisés plus tard, qd on saura les liens
      node.links = 0;
    }
  }
}

var updateEighthSection = function (i){

  var SPENDING_KEY = CONSTANTS.DATA.SPENDING_KEY;
  var nodes = [];
  var nodesindexor = {};
  var links = [];

  var spendingDomain = [1, d3.max(CONSTANTS.NOTPROCESSEDDATA.nodes, function(d){
    return parseInt(d[CONSTANTS.DATA.SPENDING_KEY])||0; 
  })];
  var spendingScale = CONSTANTS.CIRCLE.SCALE().domain(spendingDomain).range(CONSTANTS.CIRCLE.RADIUS_RANGE);

  // Construction de nodesindexor
  /*for (var j=0; j<nodes.length; j++){
    nodesindexor[Number(nodes[j].ID)] = j;
  }*/

  // Ajout des "noeuds du réseau" sans position sur le thème
  addstorynodes(i,nodes,nodesindexor,"Noeuds du réseau", spendingScale);
  // Ajout des "noeuds principaux" sans position sur le thème
  if (CONSTANTS.STORIES.Histoires[i]["Noeuds principaux"]){
    addstorynodes(i,nodes,nodesindexor,"Noeuds principaux", spendingScale);
  }
  var idlist = Object.keys(nodesindexor).map(Number);
  console.log(idlist);
  for (var j=0; j<CONSTANTS.NOTPROCESSEDDATA.linksaffiliation.length; j++){
    var sourceid = Number(CONSTANTS.NOTPROCESSEDDATA.linksaffiliation[j].data.source.ID);
    var targetid = Number(CONSTANTS.NOTPROCESSEDDATA.linksaffiliation[j].data.target.ID);
    if ((idlist.indexOf(sourceid)!==-1) && (idlist.indexOf(targetid)!==-1)){
      links.push(CONSTANTS.NOTPROCESSEDDATA.linksaffiliation[j])
    }
  }
  for (var j=0; j<CONSTANTS.NOTPROCESSEDDATA.linksproprietary.length; j++){
    var sourceid = Number(CONSTANTS.NOTPROCESSEDDATA.linksproprietary[j].data.source.ID);
    var targetid = Number(CONSTANTS.NOTPROCESSEDDATA.linksproprietary[j].data.target.ID);
    if ((idlist.indexOf(sourceid)!==-1) && (idlist.indexOf(targetid)!==-1)){
      links.push(CONSTANTS.NOTPROCESSEDDATA.linksproprietary[j])
    }
  }
  for (var j=0; j<CONSTANTS.NOTPROCESSEDDATA.undirectlinks.length; j++){
    var sourceid = Number(CONSTANTS.NOTPROCESSEDDATA.undirectlinks[j].data.source.ID);
    var targetid = Number(CONSTANTS.NOTPROCESSEDDATA.undirectlinks[j].data.target.ID);
    if ((idlist.indexOf(sourceid)!==-1) && (idlist.indexOf(targetid)!==-1)){
      links.push(CONSTANTS.NOTPROCESSEDDATA.undirectlinks[j])
      links[links.length-1].data.source = nodes[nodesindexor[sourceid]];
      links[links.length-1].data.target = nodes[nodesindexor[targetid]];
      // On incrémente le nombre de liens de source
      nodes[nodesindexor[sourceid]].links++;
    }
  }

    // échelle de calcul du radius du noeud.
  var proprietaryScale = d3.scaleLinear()
    .range(CONSTANTS.CIRCLE.RADIUS_RANGE)
    .domain(
      // récupère le [ min, max ] du tableau passé en paramètre.
      d3.extent(
        // récupère uniquement le nombre de liens des noeuds.
        nodes.map(function(node){ return node.links||2; })
      )
    );
  // On ajoute les radius et points aux proprietaries
  for (var j=0; j<nodes.length; j++){
    if (nodes[j].type === CONSTANTS.DATA.TYPES.NODE.PROPRIETARY){
      nodes[j].radius = proprietaryScale(nodes[j].links);
      nodes[j].points = circlePoints(nodes[j].radius);
    }
  }
  
  // Ajout des nouveaux noeuds
  var newsID = [];
  if (CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"]){
  for (var j=0; j<CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"].length; j++){
    // On ajoute à la liste des IDs
    newsID.push(String(CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"][j].id))
    // on traite le nouveau noeud
    var node = {};
    node.ID = String(CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"][j].id);
    node.Nom = CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"][j].nom;
    node.type = CONSTANTS.DATA.TYPES.NODE.STORY;
    node[SPENDING_KEY] = CONSTANTS.STORIES.Histoires[i]["Nouveau noeud"][j][SPENDING_KEY] || 0;
    if (node[SPENDING_KEY] > 0){
      node.radius = spendingScale(node[SPENDING_KEY])
      node.points = circlePoints(node.radius)
    } else {
      node.radius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
      node.points = [];
    }
    node.kernelPoints = circlePoints(CONSTANTS.CIRCLE.KERNEL_RADIUS);
    nodes.push(node);
    nodesindexor[Number(node.ID)] = nodes.length-1;
  }
  }
  // Ajout des liens spécifiques
  if (CONSTANTS.STORIES.Histoires[i]["Liens"]){
  var jsonlinks = CONSTANTS.STORIES.Histoires[i]["Liens"];
  var linktypes = Object.keys(jsonlinks);
  for (var j=0; j<linktypes.length; j++){
    // On parcourt les liens de type j
    for (var k=0; k<jsonlinks[linktypes[j]].length; k++){
      // source et target doivent être des noeuds reconnus
      if ((idlist.indexOf(Number(jsonlinks[linktypes[j]][k].source))!==-1) || newsID.indexOf(String(jsonlinks[linktypes[j]][k].source))!==-1){
      if ((idlist.indexOf(Number(jsonlinks[linktypes[j]][k].target))!==-1) || newsID.indexOf(String(jsonlinks[linktypes[j]][k].target))!==-1){
        var link = {};
        link.source = String(jsonlinks[linktypes[j]][k].source);
        link.target = String(jsonlinks[linktypes[j]][k].target);
        link.data = {
          source: nodes[nodesindexor[Number(jsonlinks[linktypes[j]][k].source)]],
          target: nodes[nodesindexor[Number(jsonlinks[linktypes[j]][k].target)]],
        };
        link.type = linktypes[j];
        links.push(link);
      }
      }
    }
  }
  }
  console.log("nodes : ",nodes)
  console.log("links : ",links)

  sections[7] = {
    id: 7,
    clusters: [],
    data: {
      nodes: nodes,
      links: links,
    },
    showMembranes: false,
    showLinks: true,
    collideRadius: spaceCollide,
    nodepadding: CONSTANTS.VUE.NODE_PADDING,
    legend: {
      active: ["#legcolors", "#legaff", "#legprop", "#legstory"],
      inactive: ["legcolorscale"],
    },
  };
}

var configureSections = function(data){
  packLayout = packLayout.size(getSize());
  var allSections = [];

  // voir Experimentation/sections/first.js
  allSections.push(firstSection(data));
  // voir Experimentation/sections/second.js
  allSections.push(secondSection(data));
  // voir Experimentation/sections/third.js
  allSections.push(thirdSection(data));
  // voir Experimentation/sections/fourth.js
  allSections.push(fourthSection(data));
  // voir Experimentation/sections/fifth.js
  allSections.push(fifthSection(data));
  // voir Experimentation/sections/sixth.js
  allSections.push(sixthSection(data));
  // voir Experimentation/sections/seventh.js
  allSections.push(seventhSection(data));
  // voir Experimentation/sections/eighth.js
  allSections.push(eighthSection(data));
  // création d'un objet pour chaque cluster de section
  // afin d'alléger encore un peu la tache lors du tracé
  // de la membrane.
  allSections.forEach(function(section){
    section.clusters.forEach(function(cluster){
      cluster.objIDS = {};

      cluster.nodeIDS.forEach(function(id){
        cluster.objIDS[id] = true;
      });

      cluster.hasNode = function(node){
        var test = cluster.objIDS[node.ID]; 
        return test != null && test;
      };
    });
  });
  return allSections;
}

// Mise en place de la dernière section
function onclickBestAlly (){
  eraseLastSectionContent();
  clicklocknode = true;
  writeBestAllyEnnemyTextInLastSection();
  displayBesties();
  d3.select("img#bestallyworstrival").on("click", function (){
    eraseLastSectionContent();
    writeBaseTextInLastSection();
    d3.select("img#bestallyworstrival").on("click", onclickBestAlly);
  })
  // On remet en place les events des autres
  d3.select("img#themes").on("click", onclickNewTheme);
}
d3.select("img#bestallyworstrival").on("click", onclickBestAlly);



var storyactive = false;
var storyonread = false;

function updateTypesLinks (i){
  if (CONSTANTS.STORIES.Histoires[i].Liens){
    var linktypes = Object.keys(CONSTANTS.STORIES.Histoires[i].Liens);
    CONSTANTS.DATA.TYPES.LINK.STORY.LINK1 = linktypes[0]
    if (linktypes[1]){
      CONSTANTS.DATA.TYPES.LINK.STORY.LINK1 = linktypes[1]
    }
  }
}

// L'appel à emphacize se situe dans resetMouseOut : nodes.js
function emphacizeMainNodes (i){
  if (i !== false){
  var mainnodes = CONSTANTS.STORIES.Histoires[i]["Noeuds principaux"];
  console.log(mainnodes)
  if (mainnodes){
    for (var j=0; j<mainnodes.length; j++){
      if (CONSTANTS.NOTPROCESSEDDATA.indexor[Number(mainnodes[j])]!==undefined){
        d3.select("#lobby"+mainnodes[j]).select(".circle-membrane")
          .attr("fill", function (){
            var node = CONSTANTS.NOTPROCESSEDDATA.nodes[CONSTANTS.NOTPROCESSEDDATA.indexor[Number(mainnodes[j])]];
            console.log(node)
            return fade(Color.node(node), CONSTANTS.COLORS.BACKGROUND, 0.9)
          })
      }
    }
  }
  }
}

function onclickStory (i){
  storyonread = i;
  updateTypesLinks(i);
  drawlegstory(i);
  eraseLastSectionContent();
  writeStory(i);
  stopeventsStoriesCircles();
  updateEighthSection(i);
  simulation.nextSection();
  resetMouseOut(); // Et emphacize
  CONSTANTS.STORIES.colors[i] = CONSTANTS.COLORS.STORY_VISITED;
  d3.select("#bestallyworstrival").style("display", "none");
  d3.select("#themes").style("display", "none");
  d3.select("svg#closestory")
    .on("click", function (){
      storyonread = false;
      simulation.previousSection();
      resetMouseOut();
      eraseLastSectionContent();
      writeStoriesTextInLastSection();
      eventsStoriesCircles();
      d3.select("#bestallyworstrival").style("display", "inline-block");
      d3.select("#themes").style("display", "inline-block");
    })
    .style("display", "inline-block");
}

function addStoriesCircles (){
  var alldata = CONSTANTS.LOADEDDATA;
  for (var i=0; i<alldata.nodes.length; i++){
    var involvedstories = CONSTANTS.STORIES.NODESTORY[alldata.nodes[i].ID];
    var node = d3.select("#lobby"+alldata.nodes[i].ID)
    var coords = Utils.revtransform(node.attr("transform"));
    for (var j=0; j<involvedstories.length; j++){
      var xind = j%CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE;
      var yind = Math.floor(j/CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE);
      d3.select("svg.experimentation").append("circle")
        .attr("id", "storycircle"+xind+"_"+yind+"_"+alldata.nodes[i].ID)
        .classed("storycircle", true)
        .classed("storycircle"+involvedstories[j], true)
        .attr("cx", coords.x + CONSTANTS.CIRCLE.STORY_CIRCLE_dx + (CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT[xind]-1)*(-2*CONSTANTS.CIRCLE.STORY_CIRCLE_dx/CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE))
        .attr("cy", coords.y + CONSTANTS.CIRCLE.STORY_CIRCLE_dy + yind*2.5*CONSTANTS.CIRCLE.STORY_CIRCLE_RADIUS)
        .attr("r", CONSTANTS.CIRCLE.STORY_CIRCLE_RADIUS)
        .attr("fill", CONSTANTS.STORIES.colors[involvedstories[j]])
    }
  }
}

// A appeler dans onTick pour update les cercles : noter que les selections seront vides si les cercles ne sont pas créés
function updateStoriesCircles (){
  var alldata = CONSTANTS.LOADEDDATA;
  for (var i=0; i<alldata.nodes.length; i++){
    var involvedstories = CONSTANTS.STORIES.NODESTORY[alldata.nodes[i].ID];
    var node = d3.select("#lobby"+alldata.nodes[i].ID)
    var coords = Utils.revtransform(node.attr("transform"));
    for (var j=0; j<involvedstories.length; j++){
      var xind = j%CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE;
      var yind = Math.floor(j/CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE);
      d3.select("svg.experimentation").select("circle#storycircle"+xind+"_"+yind+"_"+alldata.nodes[i].ID)
        .attr("cx", coords.x + CONSTANTS.CIRCLE.STORY_CIRCLE_dx + (CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT[xind]-1)*(-2*CONSTANTS.CIRCLE.STORY_CIRCLE_dx/CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE))
        .attr("cy", coords.y + CONSTANTS.CIRCLE.STORY_CIRCLE_dy + yind*2.5*CONSTANTS.CIRCLE.STORY_CIRCLE_RADIUS)
        .attr("r", CONSTANTS.CIRCLE.STORY_CIRCLE_RADIUS)
    }
  }
}

function eventsStoriesCircles (){
  d3.select("svg.experimentation").selectAll("circle.storycircle")
    .on("mouseover", function (){
      d3.select(this).style("cursor", "pointer");
      var numid = Number(d3.select(this).attr("class").slice(23));
      d3.selectAll(".storyitem:not(#listory"+numid+")")
        .style("color", CONSTANTS.COLORS.STORY_VISITED);
      fadeNotInvolved(numid);
      d3.selectAll("circle.storycircle:not(.storycircle"+numid+")").attr("fill", CONSTANTS.COLORS.STORY_VISITED);
    })
    .on("mouseout", function (){
      d3.select(this).style("cursor", "default");
      var numid = Number(d3.select(this).attr("class").slice(23));
      d3.selectAll(".storyitem:not(#listory"+numid+")")
        .style("color", function (){
          var numid2 = Number(d3.select(this).attr("id").slice(7));
          return CONSTANTS.STORIES.colors[numid2];
        });
      resetMouseOut();
      d3.selectAll("circle.storycircle:not(.storycircle"+numid+")").attr("fill", function (){
        var numid2 = Number(d3.select(this).attr("class").slice(23));
        return CONSTANTS.STORIES.colors[numid2];
      });
    })
    .on("click", function (){
      var numid = Number(d3.select(this).attr("class").slice(23));
      onclickStory(numid);
    })
    .attr("opacity", 1)
}

function stopeventsStoriesCircles (){
  d3.select("svg.experimentation").selectAll("circle.storycircle")
    .on("mouseover", null)
    .on("click", null)
    .attr("opacity", 0)
}

function onclickStories (){
  eraseLastSectionContent();
  writeStoriesTextInLastSection();
  addStoriesCircles();
  eventsStoriesCircles();
  storyactive = true;
  d3.select("img#stories").on("click", function (){
    eraseLastSectionContent();
    writeBaseTextInLastSection();
    storyactive = false;
    if (storyonread!==false){
      storyonread = false;
      simulation.previousSection();
    }
    d3.select("svg.experimentation").selectAll(".storycircle").remove();
    d3.select("img#stories").on("click", onclickStories);
    d3.select("img#bestallyworstrival").on("click", onclickBestAlly).style("display", "inline-block");
    d3.select("img#themes").style("display", "inline-block");
  });
  d3.select("img#bestallyworstrival").on("click", onclickBestAlly);
}
d3.select("img#stories").on("click", onclickStories);



function anonymizeUser (){
  // On redéfinit les couleurs et on les applique. 
  nodeColor = function(d){
    var TYPES = CONSTANTS.DATA.TYPES.NODE;
    var colors = CONSTANTS.COLORS;
    var color;
    if(d.type === TYPES.LOBBY){
      if (d[userChoice.theme]){
        color = d[userChoice.theme] === "Pour" ? colors.SUPPORT : colors.OPPOSE;
      } else {
        color = colors.UNSELECTED;
      }
    } else {
      color = colors.PROPRIETARY;
    }
    return chroma(color);
  };
  Color.node = nodeColor;

  d3.selectAll(".circle-kernel").attr("fill", function (d){
    var color = Color.node(d);
    return chroma(color);
  }).attr("stroke", function (d){
    var color = Color.node(d);
    return chroma(color);
  })
  d3.selectAll(".circle-membrane").attr("fill", nodeFill)
  d3.selectAll(".link path").attr("fill", Color.link)

  // On supprime le boutton meilleur allié pire adversaire
  d3.select("img#bestallyworstrival").style("display", "none");

  // On retire les #answers
  d3.select("#answers").select("table").remove();

  // On écrit un unique answer
  d3.select("#answers").insert("p", "p.small")
    .classed("sujet", true)
    .html("<span class='sujets'>Sujets d'intervention : </span><span class='allthemes'></span>")
  d3.select("#answers").select("span.allthemes")
  for (var i=0; i<CONSTANTS.THEMELIST.length; i++){
    d3.select("#answers").select("span.allthemes")
      .append("a")
      .attr("href", "reseau.html?theme="+i)
      .text(CONSTANTS.THEMELIST[i])
    d3.select("#answers").select("span.allthemes")
      .append("br")
  }
  drawlegcolors(false);
  drawlegcolorscale(false);
  drawlegaff(false);
  drawlegprop(false);
  updaterectcoords();
  if (!answershow){
    d3.select("#answers")
      .style("bottom", -rectcoords.height+63)
  }
}

function rebornUser (){
  // On redéfinit les couleurs et on les applique. 
  nodeColor = function(d){
    var TYPES = CONSTANTS.DATA.TYPES.NODE;
    var colors = CONSTANTS.COLORS;
    var color;
    if(d.type === TYPES.LOBBY){
      var userChoice = getUserChoice(); 
      if(userChoice.lobbyID == d.ID){
        return chroma(colors.USER);
      }
      if (userChoice.position){
        if (d[userChoice.theme]){
          color = d[userChoice.theme] === userChoice.position ? colors.ALLY : colors.ENEMY;
        } else {
          color = colors.UNSELECTED;
        }
      } else {
        if (d[userChoice.theme]){
          color = d[userChoice.theme] === "Pour" ? colors.SUPPORT : colors.OPPOSE;
        } else {
          color = colors.UNSELECTED;
        }
      }
    } else if (d.type === TYPES.PROPRIETARY) {
      color = colors.PROPRIETARY;
    } else {
      color = colors.STORYNODE;
    }
    return chroma(color);
  };
  Color.node = nodeColor;

  d3.selectAll(".circle-kernel").attr("fill", function (d){
    var color = Color.node(d);
    return chroma(color);
  }).attr("stroke", function (d){
    var color = Color.node(d);
    return chroma(color);
  })
  d3.selectAll(".circle-membrane").attr("fill", nodeFill)
  d3.selectAll(".link path").attr("fill", Color.link)

  // On retire les #answers liés au choix du prochain thème
  d3.select("#answers").selectAll("p.sujet").remove();

  // On réécrit les #answers
  var table = d3.select("#answers").insert("table", "p.small").classed("useranswers", true)
  table.append("tr").classed("item", true).html('<th>ID</th><td class="nom"></td>');
  table.append("tr").classed("item", true).html('<th>Région</th><td class="country"></td>');
  table.append("tr").classed("item", true).html('<th>Secteur</th><td class="secteur"></td>');
  table.append("tr").classed("item", true).html('<th>Type</th><td class="type"></td>');
  table.append("tr").classed("item", true).html('<th>Position</th><td class="position"></td>');
  table.append("tr").classed("item", true).html('<th>Sujet</th><td class="theme"></td>');
  table.append("tr").classed("item", true).html('<th>Fonction</th><td class="fonction">Lobbyiste</td>');
  if (getUserChoice().theme){
    d3.select("#answers td.theme")
      .text(getUserChoice().theme);
  }
  if (getUserChoice().lobbyist){
    d3.select("#answers td.nom")
      .text(getUserChoice().lobbyist["Nom1"]);
    d3.select("#answers td.type")
      .text(getUserChoice().lobbyist["Type"]);
    d3.select("#answers td.secteur")
      .text(getUserChoice().lobbyist["Secteurs d’activité"]);
    d3.select("#answers td.country")
      .text(getUserChoice().lobbyist["Pays/Région"]);
    if (getUserChoice().lobbyist[getUserChoice().theme]){
      d3.select("#answers td.position")
        .text(getUserChoice().lobbyist[getUserChoice().theme]);
    }
    // On remet le boutton meilleur allié pire adversaire
    d3.select("img#bestallyworstrival").style("display", "inline-block");
  }
  drawlegcolors(true);
  drawlegcolorscale(true);
  drawlegaff(true);
  drawlegprop(true);
  updaterectcoords();
  if (!answershow){
    d3.select("#answers")
      .style("bottom", -rectcoords.height+63)
  }
}

function onclickNewTheme (){
  eraseLastSectionContent();
  writeNewThemeTextInLastSection();
  anonymizeUser();
  d3.select("img#themes").on("click", function (){
    eraseLastSectionContent();
    writeBaseTextInLastSection();
    rebornUser();
    d3.select("img#themes").on("click", onclickNewTheme);
  })
  // On remet en place les events des autres
  d3.select("img#bestallyworstrival").on("click", onclickBestAlly);
}
d3.select("img#themes").on("click", onclickNewTheme);