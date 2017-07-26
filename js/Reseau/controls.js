var initControls = function(simulation){
  var onNextClicked = function(){
    simulation.nextSection();
  }

  var onPreviousClicked = function(){
    simulation.previousSection();
  }
  d3.select('.control--next').on('click', onNextClicked);
  d3.select('.control--previous').on('click', onPreviousClicked);
};
