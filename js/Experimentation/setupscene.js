var setupScene = function(){
  
  var scene = null;
  // on ajoute une classe de debug au contoles si nécessaire pour pouvoir cliquer dessus. 
  d3.select('.controls').classed('controls--debug', CONSTANTS.DEBUG);
  if(CONSTANTS.DEBUG){
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
  }
  scene = d3.select("body").append("canvas")
    .classed('experimentation', true)
    .attr("width", CONSTANTS.WIDTH)
    .attr("height", CONSTANTS.HEIGHT);

  return {
    getCanvas: function(){ return scene; },
    getSize: function(){ return [ scene.attr('width'), scene.attr('height') ]; }
  };
};

