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

var firstSection = function(data){
  var clusters = [];
  var nodes = data.utils.nodes.lobbies();
 // assignation des clusters sur les nodes.
  // configuration de la section à proprement parler.
  var canvasSize = getSize();
  var pack = packLayout.size(getSize());
  
  // cluster par position sur le theme choisi (support vs oppose)
  var nest = d3.nest().key(function(d){ return d[data.theme]; }); 
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested}, function(d){ return d.values; })
    .sum(function(node){ return node.radius; });

  // applique le layout de placement.  
  pack(hierarchy);
  console.log(hierarchy);
  // utile pour tracer les clusters par la suite.
  hierarchy.children.forEach(function(c){
    var cluster = {
      key: c.data.key+'',
      x: c.x,
      y: c.y,
      nodeIDS: c.children.map(function(node){ return node.data['ID']; })
    };
    console.log('cluster', cluster);
    clusters.push(cluster);
  });
  console.log('clusters created:', clusters);

  return {
    id: 0,
    clusters: clusters,
    data: { nodes: nodes, links: [] },
    showMembranes: true,
    showLinks: false,
  };
}

var secondSection = function(data){
  var clusters = [];
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };
  // clusters par type de structure PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Type']; })
    .key(function(d){ return d[data.theme]; });
  // les données nous intéressant pour cette section
  var nodes = data.utils.nodes.lobbies();
  var nested = nest.entries(nodes);
  var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
    .sum(function(node){ return node.radius; }); 
  var pack = packLayout.size(getSize());
  var packed = pack(hierarchy);
  // creation des clusters 
  hierarchy.children.forEach(function(c){
    c.children.forEach(function(d){
      clusters.push({
        key: clusterKey(d),
        x: 0+c.x,
        y: 0+c.y,
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
var thirdSection = function(data){};
var fourthSection = function(data){};
var fifthSection = function(data){};
var sixthSection = function(data){};
var seventhSection = function(data){};
var eighthSection = function(data){};

var configureSections = function(data){
  var allSections = [];

  // voir Experimentation/sections/first.js
  allSections.push(firstSection(data));
  // voir Experimentation/sections/second.js
  allSections.push(secondSection(data));
  // voir Experimentation/sections/third.js
  allSections.push(thirdSection());
  // voir Experimentation/sections/fourth.js
  allSections.push(fourthSection());
  // voir Experimentation/sections/fifth.js
  allSections.push(fifthSection());
  // voir Experimentation/sections/sixth.js
  allSections.push(sixthSection());
  // voir Experimentation/sections/seventh.js
  allSections.push(seventhSection());
  // voir Experimentation/sections/eighth.js
  allSections.push(eighthSection());
  return allSections;
}
