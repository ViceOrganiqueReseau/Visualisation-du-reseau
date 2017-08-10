// La légende est contenue dans #answers
var answers = d3.select("#answers")
var answershow = true;
var rectcoords = document.getElementById("answers").getBoundingClientRect();
var answerwidth = rectcoords.right - rectcoords.left;

function updaterectcoords (){
  rectcoords = document.getElementById("answers").getBoundingClientRect();
}

var legend = d3.select("#legend");

legend.append("svg").attr("id", "legprop")
  .attr("width", answerwidth)
  .attr("height", CONSTANTS.LEGEND.svgheightprop)
legend.append("svg").attr("id", "legaff")
  .attr("width", answerwidth)
  .attr("height", CONSTANTS.LEGEND.svgheightaff)
legend.append("svg").attr("id", "legcolorscale")
  .attr("width", answerwidth)
  .attr("height", CONSTANTS.LEGEND.svgheightcolorscale)
legend.append("svg").attr("id", "legcolors")
  .attr("width", answerwidth)
  .attr("height", CONSTANTS.LEGEND.svgheightcolors)

function drawlegcolors (){
  var toile = d3.select("#legcolors");
  var xinit = 0.4*CONSTANTS.LEGEND.svgheightcolors;
  var yinit = 0.5*CONSTANTS.LEGEND.svgheightcolors;
  var radius = 0.3*CONSTANTS.LEGEND.svgheightcolors;
  var fontsize = Math.round(13/50 * CONSTANTS.LEGEND.svgheightcolors);
  toile.selectAll("*").remove();

  if (getUserChoice().lobbyist){
    toile.append("circle")
      .attr("cx", xinit)
      .attr("cy", yinit)
      .attr("r", radius)
      .attr("fill", CONSTANTS.COLORS.ALLY)
    toile.append("text")
      .attr("x", xinit + 1.3*radius)
      .attr("y", yinit + 0.35*fontsize)
      .attr("font-size", fontsize+"px")
      .text("Vos alliés")
    toile.append("circle")
      .attr("cx", xinit + 0.3*answerwidth)
      .attr("cy", yinit)
      .attr("r", radius)
      .attr("fill", CONSTANTS.COLORS.ENEMY)
    toile.append("text")
      .attr("x", xinit + 0.3*answerwidth + 1.3*radius)
      .attr("y", yinit + 0.35*fontsize)
      .attr("font-size", fontsize+"px")
      .text("Vos rivaux")
    toile.append("circle")
      .attr("cx", xinit + 0.6*answerwidth)
      .attr("cy", yinit)
      .attr("r", radius)
      .attr("fill", CONSTANTS.COLORS.USER)
    toile.append("text")
      .attr("x", xinit + 0.6*answerwidth + 1.3*radius)
      .attr("y", yinit + 0.35*fontsize)
      .attr("font-size", fontsize+"px")
      .text("Vous")
  } else {
    toile.append("circle")
      .attr("cx", xinit)
      .attr("cy", yinit)
      .attr("r", radius)
      .attr("fill", CONSTANTS.COLORS.SUPPORT)
    toile.append("text")
      .attr("x", xinit + 1.3*radius)
      .attr("y", yinit + 0.35*fontsize)
      .attr("font-size", fontsize+"px")
      .text("Pour")
    toile.append("circle")
      .attr("cx", xinit + 0.3*answerwidth)
      .attr("cy", yinit)
      .attr("r", radius)
      .attr("fill", CONSTANTS.COLORS.OPPOSE)
    toile.append("text")
      .attr("x", xinit + 0.3*answerwidth + 1.3*radius)
      .attr("y", yinit + 0.35*fontsize)
      .attr("font-size", fontsize+"px")
      .text("Contre")
  }
  
}