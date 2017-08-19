var nodeColor = function(d){
  var TYPES = CONSTANTS.DATA.TYPES.NODE;
  var colors = CONSTANTS.COLORS;
  var color;
  if(d.type === TYPES.LOBBY){
    var userChoice = getUserChoice();
    if(userChoice.lobbyID == d.ID){
      return chroma(colors.USER);
    }
    if (userChoice.position === "Pour" || userChoice.position === "Contre"){
      if (d[userChoice.theme]){
        if (d[userChoice.theme]===userChoice.position){
          color = colors.ALLY;
        } else if (d[userChoice.theme]==="Pour" || d[userChoice.theme]==="Contre"){
          color = colors.ENEMY;
        } else {
          color = colors.NSPP_CONTROV;
        }
      } else {
        color = colors.NSPP_CONTROV;
      }
    } else {
      if (d[userChoice.theme]){
        if (d[userChoice.theme]==="Pour"){
          color = colors.SUPPORT;
        } else if (d[userChoice.theme]==="Contre"){
          color = colors.OPPOSE;
        } else {
          color = colors.NSPP_CONTROV;
        }
      } else {
        color = colors.NSPP_CONTROV;
      }
    }
  } else if (d.type === TYPES.PROPRIETARY) {
    color = colors.PROPRIETARY;
  } else {
    color = colors.STORYNODE;
  }
  return chroma(color);
};

var linkColor = function(link){
  var TYPES = CONSTANTS.DATA.TYPES.LINK;
  var color = chroma(CONSTANTS.LINK.PROPRIETARY_COLOR);
  if (link.type === TYPES.AFFILIATION){
    color = nodeColor(link.data.source);
  } else if (link.type === TYPES.PROPRIETARY.DIRECT || link.type === TYPES.PROPRIETARY.INDIRECT){
    return color;
  } else if (link.type === TYPES.STORY.LINK1) {
    return chroma(CONSTANTS.COLORS.STORYNODE);
  } else {
    return chroma(CONSTANTS.COLORS.STORYLINK2);
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
