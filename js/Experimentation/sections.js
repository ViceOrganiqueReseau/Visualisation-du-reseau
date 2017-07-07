var COLLIDE_PADDING = 10;
var initClusterForce = function(clusters){
};

var getSize = function(){
  var $canvas = d3.select('canvas').node();
  return [ $canvas.width, $canvas.height ];
}

var firstSection = function(data){
  var filteredData = { nodes: data.utils.nodes.lobbies() };
 // assignation des clusters sur les nodes.
  // configuration de la section à proprement parler.
  
  var clusterForce = d3.forceCluster().centers(function(d){return d.cluster; });
  var collideForce = d3.forceCollide().radius(function(d){ return d.radius + COLLIDE_PADDING; });
  // cluster par position sur le theme choisi (support vs oppose)
  var nest = d3.nest().key(function(d){ return d[data.theme]; }); 

  var updateNodes = function(){
    var nested = nest.entries(this.data.nodes);
    var hierarchy = d3.hierarchy({ values: nested});
    var pack = d3.pack(hierarchy).size(getSize());
    // utile pour tracer les clusters par la suite.
    this.clusters = pack;
    return hierarchy.leaves();
  };

  return {
    data: filteredData,
    updateNodes: updateNodes, 
    showClustersMembrane: false,
    showLinks: false,
    forces:{
      cluster: clusterForce,
      collide: collideForce
    }
  };
}

var secondSection = function(data){
  // clusters par type de structure PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Type']; })
    .key(function(d){ return d[data.theme]; });
  
  var filteredData = {
    nodes: data.utils.nodes.lobbies()
  };

  var updateNodes = function(){
    return filteredData.nodes;
  }

  var clusterForce = d3.forceCluster().centers(function(d){ return d.cluster; });
  var collideForce = d3.forceCollide().radius(function(d){ return d.radius + COLLIDE_PADDING; });
  return {
    data: filteredData,
    updateNodes: updateNodes,
    showClustersMembrane: true,
    showLinks: false,
    forces: {
      cluster: clusterForce,
      collide: collideForce
    }
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
