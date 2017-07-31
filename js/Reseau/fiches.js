function setUpClickFiche (node){

  d3.select(".clickfiche").remove();

  d3.select("svg").append("foreignObject")
    .classed("clickfiche", true)
    .attr("id", "fiche"+node.ID)
    .attr("x", CONSTANTS.CLICK_FICHE.x)
    .attr("y", CONSTANTS.CLICK_FICHE.y)
    .attr("width", CONSTANTS.CLICK_FICHE.width)
    .attr("height", CONSTANTS.CLICK_FICHE.height)
    .html("<div class='foreigncontainer'></div>")

  var fiche = d3.select(".clickfiche").select(".foreigncontainer").style("color", Color.node(node));
  fiche.append("h1").classed("fullname", true).text(node["Nom1"]);
  if (node["Nom2"]){
  	fiche.append("h1").classed("smallname", true).text(node["Nom2"]);
  	fiche.select(".fullname").style("margin-bottom", "1px");
  }
  fiche.append("h2").text("STRUCTURE");
  fiche.append("p").text("Type : "+node["Type"])
  fiche.append("p").text("Secteur : "+node["Secteurs d’activité"])
  fiche.append("p").text("Pays/Région : "+node["Pays/Région"])
  fiche.append("h2").text("LOBBYING");
  fiche.append("p").text(function (){
    var string = "Dépenses de lobbying estimées : ";
    if (node["Dépenses Lobby (€)"]==="NaN"){
      string += "Inconnu";
    } else {
      string += node["Dépenses Lobby (€)"]+" €";
    }
    return string;
  })
  fiche.append("p").text(function (){
    var string = "Personnes impliquées : ";
    if (node["Personnes impliquées"]==="NaN"){
      string += "Inconnu";
    } else {
      string += node["Personnes impliquées"];
    }
    return string;
  })
  fiche.append("p").text(function (){
    var string = "Equivalent temps plein : ";
    if (node["Equivalent Temps plein"]==="NaN"){
      string += "Inconnu";
    } else {
      string += node["Equivalent Temps plein"];
    }
    return string;
  })
  fiche.append("h2").text("POSITION");
  for (var i=0; i<CONSTANTS.THEMELIST.length; i++){
    fiche.append("p").text(function (){
      if (node[CONSTANTS.THEMELIST[i]]){
        return CONSTANTS.THEMELIST[i]+" : "+node[CONSTANTS.THEMELIST[i]];
      }
    })
  }

  d3.select("svg").on("mouseleave", function (){
    d3.select("#fiche"+node.ID).remove();
    d3.select("svg").on("mouseleave", null);
  })
}