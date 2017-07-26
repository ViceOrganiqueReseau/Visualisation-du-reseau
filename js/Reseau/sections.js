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
    return clusterPosition === "POUR" ? colors.SUPPORT : colors.OPPOSE;
  }
};

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
        return d.data.key == "POUR";
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
    showLinks: true
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
