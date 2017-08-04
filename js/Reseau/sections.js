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
  };
};
var eighthSection = function(data){};

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
  // allSections.push(eighthSection(data));
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

function onclickStory (i){
  eraseLastSectionContent();
  writeStory(i);
  CONSTANTS.STORIES.colors[i] = CONSTANTS.COLORS.STORY_VISITED;
  d3.select("svg#closestory")
    .on("click", function (){
      eraseLastSectionContent();
      writeStoriesTextInLastSection();
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
        .attr("fill", CONSTANTS.STORIES.colors[involvedstories[j]])
    }
  }
}

function onclickStories (){
  eraseLastSectionContent();
  writeStoriesTextInLastSection();
  addStoriesCircles();
  storyactive = true;
  d3.select("img#stories").on("click", function (){
    eraseLastSectionContent();
    writeBaseTextInLastSection();
    storyactive = false;
    d3.select("svg.experimentation").selectAll(".storycircle").remove();
    d3.select("img#stories").on("click", onclickStories);
    d3.select("img#bestallyworstrival").on("click", onclickBestAlly);
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
      color = d[userChoice.theme] === "Pour" ? colors.SUPPORT : colors.OPPOSE;
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
  d3.select("#answers").selectAll("p.item").remove();

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
        color = d[userChoice.theme] === userChoice.position ? colors.ALLY : colors.ENEMY;
      } else {
        color = d[userChoice.theme] === "Pour" ? colors.SUPPORT : colors.OPPOSE;
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

  // On retire les #answers liés au choix du prochain thème
  d3.select("#answers").selectAll("p.sujet").remove();

  // On réécrit les #answers
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Identification : <span class="nom"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Pays/Région : <span class="country"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Secteur d&apos;activité : <span class="secteur"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Type d&apos;organisation : <span class="type"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Position : <span class="position"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Sujet d&apos;intervention : <span class="theme"></span>');
  d3.select("#answers").insert("p", "p.small").classed("item", true).html('Fonction : <span class="fonction">Lobbyiste</span>');
  if (getUserChoice().theme){
    d3.select("#answers span.theme")
      .text(getUserChoice().theme);
  }
  if (getUserChoice().lobbyist){
    d3.select("#answers span.nom")
      .text(getUserChoice().lobbyist["Nom1"]);
    d3.select("#answers span.type")
      .text(getUserChoice().lobbyist["Type"]);
    d3.select("#answers span.secteur")
      .text(getUserChoice().lobbyist["Secteurs d’activité"]);
    d3.select("#answers span.country")
      .text(getUserChoice().lobbyist["Pays/Région"]);
    if (getUserChoice().lobbyist[getUserChoice().theme]){
      d3.select("#answers span.position")
        .text(getUserChoice().lobbyist[getUserChoice().theme]);
    }
    // On remet le boutton meilleur allié pire adversaire
    d3.select("img#bestallyworstrival").style("display", "inline-block");
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