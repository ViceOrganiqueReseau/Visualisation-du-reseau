var setupScene = function(){
  var shouldUseCanvas = CONSTANTS.USE_CANVAS;
  var tagName = shouldUseCanvas ? 'canvas' : 'svg';
  var scene = null;
  // on ajoute une classe de debug au contoles si nécessaire pour pouvoir cliquer dessus. 
  d3.select('.controls').classed('controls--debug', CONSTANTS.DEBUG);
  if(CONSTANTS.DEBUG){
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
  }
  scene = d3.select("body").append(tagName)
    .classed('experimentation', true)
    .attr("width", CONSTANTS.WIDTH)
    .attr("height", CONSTANTS.HEIGHT)
    .canvas(shouldUseCanvas);
  
  var defs = scene.append('defs');
  var gradient = defs.append('radialGradient')
    .attr('id', 'radialGradient');
 
  var stopColor = function(opacity){
    var propColor = chroma(CONSTANTS.COLORS.PROPRIETARY);
    var c = propColor.alpha(opacity).rgba();
    return 'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')';
  }
  gradient.append('stop')
    .attr('stop-color', stopColor(0.7))
    .attr('offset', '0%');
  /*
  gradient.append('stop')
    .attr('offset', '60%')
    .attr('stop-color', stopColor(0.5));
  */
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', stopColor(0)); 
  return {
    updateSize: function(){ this.size = this._getSize();},
    getCanvas: function(){ return scene; },
    getSize: function(){
      if(!this.size){
        this.updateSize();
      }
      return this.size;
    },
    _getSize: function(){ return [ parseInt(scene.attr('width')), parseInt(scene.attr('height')) ]; }
  };
};

