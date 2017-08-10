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
  toile.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", answerwidth)
    .attr("y2", 0)
    .attr("stroke", "rgb(45,82,252)")

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

function editdoubletext (toile, fontsize, anchor, xpos, ypos, text1, text2){
  toile.append("text")
      .attr("font-size", fontsize)
      .attr("text-anchor", anchor)
      .attr("x", xpos)
      .attr("y", ypos-1.3*(fontsize+2))
      .text(text1)
  toile.append("text")
      .attr("font-size", fontsize)
      .attr("text-anchor", anchor)
      .attr("x", xpos)
      .attr("y", ypos-0.3*(fontsize+2))
      .text(text2)
}

function drawlegcolorscale (){
  var toile = d3.select("#legcolorscale");
  var fontsize = Math.round(13/70 * CONSTANTS.LEGEND.svgheightcolorscale);
  toile.selectAll("*").remove();
  toile.append("defs");
  toile.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", answerwidth)
    .attr("y2", 0)
    .attr("stroke", "rgb(45,82,252)")

  if (getUserChoice().lobbyist){
    var gradient = toile.select("defs").append("linearGradient")
      .attr("id", "colorscale");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", CONSTANTS.COLORS.ALLY)
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", CONSTANTS.COLORS.ENEMY)
    toile.append("rect")
      .attr("x", 0.05*answerwidth)
      .attr("y", 0.55*CONSTANTS.LEGEND.svgheightcolorscale)
      .attr("width", 0.9*answerwidth)
      .attr("height", 0.25*CONSTANTS.LEGEND.svgheightcolorscale)
      .attr("fill", "url(#colorscale)")
    editdoubletext(toile, fontsize, "start", 0.05*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "100% alliés", "0% rivaux");
    editdoubletext(toile, fontsize, "middle", 0.5*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "50% alliés", "50% rivaux");
    editdoubletext(toile, fontsize, "end", 0.95*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "0% alliés", "100% rivaux");
  } else {
    var gradient = toile.select("defs").append("linearGradient")
      .attr("id", "colorscale");
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", CONSTANTS.COLORS.SUPPORT)
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", CONSTANTS.COLORS.OPPOSE)
    toile.append("rect")
      .attr("x", 0.05*answerwidth)
      .attr("y", 0.55*CONSTANTS.LEGEND.svgheightcolorscale)
      .attr("width", 0.9*answerwidth)
      .attr("height", 0.25*CONSTANTS.LEGEND.svgheightcolorscale)
      .attr("fill", "url(#colorscale)")
    editdoubletext(toile, fontsize, "start", 0.05*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "100% Pour", "0% Contre");
    editdoubletext(toile, fontsize, "middle", 0.5*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "50% Pour", "50% Contre");
    editdoubletext(toile, fontsize, "end", 0.95*answerwidth, 0.55*CONSTANTS.LEGEND.svgheightcolorscale, "0% Pour", "100% Contre");
  }
}