var initClusterForce = function(clusters){
  return d3.forceCollide().centers(function(d){
    return clusters[d.cluster];
  });
}

var firstSection = function(data){
  // 2 clusters de nodes, OPPOSE / SUPPORT.
  var clusters = [];
  // assignation des clusters sur les nodes.
  // configuration de la section à proprement parler.
  
  var clusterForce = initClusterForce(clusters);
  var collideForce = d3.forceCollide().radius(function(d){ return d.r + COLLIDE_PADDING; });
  return {
    showClusterMembrane: false,
    forces:{
      cluster: clusterForce,
    }
  };
}

var secondSection = function(data){
  var clusters = [];
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
  allSections.push(firstSection());
  // voir Experimentation/sections/second.js
  allSections.push(secondSection());
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
