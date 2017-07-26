var nodeColor = function(d){
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
      color = d[userChoice.theme] === "POUR" ? colors.SUPPORT : colors.OPPOSE;
    }
  } else {
    color = colors.PROPRIETARY;
  }
  return chroma(color);
};

var linkColor = function(link){
  var TYPES = CONSTANTS.DATA.TYPES.LINK;
  var color = chroma(CONSTANTS.LINK.PROPRIETARY_COLOR);
  if(link.type === TYPES.AFFILIATION){
    color = nodeColor(link.data.source);
  }
  return color;
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
