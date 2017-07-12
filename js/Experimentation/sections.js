var COLLIDE_PADDING = 2;
var PACK_PADDING = 15;
var getSize = function(){
  var $canvas = d3.select('canvas.experimentation').node();
  return [ $canvas.width, $canvas.height ];
}

var packLayout = d3.pack().padding(PACK_PADDING).radius(function(node){ return node.value; });

var firstSection = function(data){
  var clusters = {};
  var filteredData = { nodes: data.utils.nodes.lobbies() };
 // assignation des clusters sur les nodes.
  // configuration de la section à proprement parler.
  var canvasSize = getSize();
  var pack = packLayout.size(getSize());
  
  var clusterForce = d3.forceCluster().centers(function(d){ 
    return clusters[d.parent.data.key];
  });

  var collideForce = d3.forceCollide().radius(function(d){ return (d.radius||d.value||0) + COLLIDE_PADDING; });
  // cluster par position sur le theme choisi (support vs oppose)
  var nest = d3.nest().key(function(d){ return d[data.theme]; }); 

  var updateNodes = function(){
    console.log('updateNodes');
    var self = this;
    var nested = nest.entries(this.data.nodes);
    var hierarchy = d3.hierarchy({ values: nested}, function(d){ return d.values; })
      .sum(function(node){ return node.radius; });

    // applique le layout de placement.  
    pack(hierarchy);
    // utile pour tracer les clusters par la suite.
    hierarchy.children.forEach(function(c){
      clusters[c.data.key] = {
        key: c.data.key+'',
        x: 0+c.x,
        y: 0+c.y,
        children: c.children
      };
    });
    var leaves = hierarchy.leaves();
    leaves.forEach(function(l){ l.radius = l.value; });
    this.data.nodes = leaves;
    this.forces.cluster.initialize(leaves);
    return leaves;
  };

  return {
    clusters: clusters,
    data: filteredData,
    updateNodes: updateNodes, 
    showClustersMembrane: true,
    showLinks: false,
    forces:{
      cluster: clusterForce,
      collide: collideForce
    }
  };
}

var secondSection = function(data){
  var clusters = {};
  // clusters par type de structure PUIS par position.
  var nest = d3.nest()
    .key(function(d){ return d['Type']; })
    .key(function(d){ return d[data.theme]; });


  var filteredData = {
    nodes: data.utils.nodes.lobbies()
  };
  
  var clusterKey = function(c){
    var parent = c.parent;
    return parent.data.key + "-" + c.data.key;
  };

  var updateNodes = function(){
    console.log('2nd Section.updateNodes')
    var nested = nest.entries(filteredData.nodes);
    var hierarchy = d3.hierarchy({ values: nested }, function(d){ return d.values; })
      .sum(function(node){ return node.radius; }); 
    var pack = packLayout.size(getSize());
    var packed = pack(hierarchy);
    debugger;
    this.data.nodes = hierarchy.leaves();
    hierarchy.children.forEach(function(c){
      c.children.forEach(function(d){
        clusters[clusterKey(d)] = {
          x: 0+c.x,
          y: 0+c.y,
          children: d.children
        };

      });
    });
  };

  var clusterForce = d3.forceCluster().centers(function(d){
    var cluster = clusters[clusterKey(d.parent)];
    console.log('cluster found', cluster);
    return cluster;  
  });

  var collideForce = d3.forceCollide().radius(function(d){ return d.radius + COLLIDE_PADDING; });
  return {
    clusters: clusters, 
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
