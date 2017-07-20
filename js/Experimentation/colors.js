var nodeColor = function(d){
  var colors = CONSTANTS.COLORS;
  var userChoice = getUserChoice(); 
  if(userChoice.lobbyID == d.ID){
    return colors.ALLY;
  }
  if(userChoice.enemyID == d.ID){
    return colors.ENMEMY;
  }
  return d[userChoice.theme] === userChoice.position ? colors.SAME_POSITION : colors.DIFFERENT_POSITION;
};

var linkColor = function(link){
  return nodeColor(link.data.source);
}


var fade = function(color, bgColor, a){
  // inspiré de https://gist.github.com/tqc/2564280
  var c = chroma(color).rgb();
  var bg = chroma(bgColor).rgb();
  return chroma([
    Math.round((1-a)*bg[0]) + a*c[0],
    Math.round((1-a)*bg[1]) + a*c[1],
    Math.round((1-a)*bg[2]) + a*c[2]
  ]);
};


var Color = {
  fade: fade,
  node: nodeColor,
  link: linkColor,
}
