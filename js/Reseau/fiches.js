function setUpClickFiche (node){
  d3.select(".clickfiche").remove();
  d3.selectAll(".bestiesfiche").remove();

  d3.select("svg.experimentation").append("foreignObject")
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
    if (node[CONSTANTS.DATA.SPENDING_KEY]==="NaN"){
      string += "Inconnu";
    } else {
      string += node[CONSTANTS.DATA.SPENDING_KEY]+" €";
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

  d3.select("svg.experimentation").on("mouseleave", function (){
    d3.select("#fiche"+node.ID).remove();
    d3.select("svg.experimentation").on("mouseleave", null);
  })
}

// On calcule le meilleur allié et le pire adversaire !
// Ces calculs sont réalisés dans des fonctions

function computeBesties (){
  var IDToIndex = {};
  var alldata = CONSTANTS.LOADEDDATA;
  var scoresdata = [];
  for (var i=0; i<alldata.nodes.length; i++){
    if (alldata.nodes[i].type === CONSTANTS.DATA.TYPES.NODE.LOBBY){
      // On initialise l'objet associé au score de i
      var obj = {
        ID: alldata.nodes[i].ID,
        position: alldata.nodes[i][alldata.userChoice.theme],
        Nom1: alldata.nodes[i].Nom1,
        Nom2: alldata.nodes[i].Nom2,
        budget: alldata.nodes[i][CONSTANTS.DATA.SPENDING_KEY],
        allydirectlinks: 0,
        allydirectbudget: 0,
        ennemydirectlinks: 0,
        ennemydirectbudget: 0,
        allyundirectlinks: 0,
        allyundirectbudget: 0,
        ennemyundirectlinks: 0,
        ennemyundirectbudget: 0,
        score: 0,
      };
      // On range l'objet dans la structure apropriée et on mémorise son emplacement
      scoresdata.push(obj);
      IDToIndex[alldata.nodes[i].ID] = i;
      // On incrémente ou décrémente le score de son budget
      if (alldata.userChoice.position === obj.position){
        obj.score += Number(obj.budget);
      } else {
        obj.score -= Number(obj.budget);
      }
    }
  }
  // On calcule les scores finaux et on compte les liens
  for (var i=0; i<alldata.links.length; i++){
    // On incrémente les scores de source et target du lien i si le lien n'est pas actionnaire indirect
    if (alldata.links[i].type === CONSTANTS.DATA.TYPES.LINK.AFFILIATION || alldata.links[i].type === CONSTANTS.DATA.TYPES.LINK.PROPRIETARY.DIRECT){
      sourceobj = scoresdata[IDToIndex[alldata.links[i].data.source.ID]];
      targetobj = scoresdata[IDToIndex[alldata.links[i].data.target.ID]];
      // On traite target vis-à-vis de source
      if (sourceobj.position === alldata.userChoice.position){
        switch (alldata.links[i].type){
        case CONSTANTS.DATA.TYPES.LINK.AFFILIATION:
          targetobj.allydirectlinks++;
          targetobj.allydirectbudget += Number(sourceobj.budget);
          targetobj.score += 0.5*Number(sourceobj.budget);
          break;
        case CONSTANTS.DATA.TYPES.LINK.PROPRIETARY.DIRECT:
          targetobj.allyundirectlinks++;
          targetobj.allyundirectbudget += Number(sourceobj.budget);
          targetobj.score += 0.25*Number(sourceobj.budget);
          break;
        }
      } else {
        switch (alldata.links[i].type){
        case CONSTANTS.DATA.TYPES.LINK.AFFILIATION:
          targetobj.ennemydirectlinks++;
          targetobj.ennemydirectbudget += Number(sourceobj.budget);
          targetobj.score -= 0.5*Number(sourceobj.budget);
          break;
        case CONSTANTS.DATA.TYPES.LINK.PROPRIETARY.DIRECT:
          targetobj.ennemyundirectlinks++;
          targetobj.ennemyundirectbudget += Number(sourceobj.budget);
          targetobj.score -= 0.25*Number(sourceobj.budget);
          break;
        }
      }
      // On traite source vis-à-vis de target
      if (targetobj.position === alldata.userChoice.position){
        switch (alldata.links[i].type){
        case CONSTANTS.DATA.TYPES.LINK.AFFILIATION:
          sourceobj.allydirectlinks++;
          sourceobj.allydirectbudget += Number(targetobj.budget);
          sourceobj.score += 0.5*Number(targetobj.budget);
          break;
        case CONSTANTS.DATA.TYPES.LINK.PROPRIETARY.DIRECT:
          sourceobj.allyundirectlinks++;
          sourceobj.allyundirectbudget += Number(targetobj.budget);
          sourceobj.score += 0.25*Number(targetobj.budget);
          break;
        }
      } else {
        switch (alldata.links[i].type){
        case CONSTANTS.DATA.TYPES.LINK.AFFILIATION:
          sourceobj.ennemydirectlinks++;
          sourceobj.ennemydirectbudget += Number(targetobj.budget);
          sourceobj.score -= 0.5*Number(targetobj.budget);
          break;
        case CONSTANTS.DATA.TYPES.LINK.PROPRIETARY.DIRECT:
          sourceobj.ennemyundirectlinks++;
          sourceobj.ennemyundirectbudget += Number(targetobj.budget);
          sourceobj.score -= 0.25*Number(targetobj.budget);
          break;
        }
      }
    }
  } // end for link
  CONSTANTS.BESTIES = {};
  CONSTANTS.BESTIES.INDEXOR = IDToIndex;
  CONSTANTS.BESTIES.SCORESDATA = scoresdata;
  // Maintenant qu'on a parcouru les données, on cherche le meilleur allié et le pire adversaire
  var scoremax = -Infinity;
  var bestally;
  var scoremin = +Infinity;
  var worstrival;
  for (var i=0; i<scoresdata.length; i++){
    if (scoresdata[i].position === alldata.userChoice.position){
      // On regarde si on a un meilleur allié
      if (scoresdata[i].score > scoremax && Number(scoresdata[i].ID) !== alldata.userChoice.lobbyID){
        scoremax = scoresdata[i].score;
        bestally = scoresdata[i];
      }
    } else {
      // On regarde si on a un pire adversaire
      if (scoresdata[i].score < scoremin && Number(scoresdata[i].ID) !== alldata.userChoice.lobbyID){
        scoremin = scoresdata[i].score;
        worstrival = scoresdata[i];
      }
    }
  }
  CONSTANTS.BESTIES.BESTALLY = bestally;
  CONSTANTS.BESTIES.WORSTRIVAL = worstrival;
}

// Cette variable vaut true si la sortie bestallyworstrival est active. Elle sert à bloquer les clicks events sur les nodes. 
var clicklocknode = false;

function displayBesties (){
  d3.select(".clickfiche").remove();
  d3.selectAll(".bestiesfiche").remove();

  // Meilleur allié
  d3.select("svg").append("foreignObject")
    .classed("bestiesfiche", true)
    .attr("id", "bestally")
    .attr("x", CONSTANTS.BESTIES_FICHES.x)
    .attr("y", CONSTANTS.BESTIES_FICHES.y1)
    .attr("width", CONSTANTS.BESTIES_FICHES.width)
    .attr("height", CONSTANTS.BESTIES_FICHES.height)
    .html("<div class='foreigncontainer'></div>")

  var fiche = d3.select("#bestally").select(".foreigncontainer").style("color", CONSTANTS.COLORS.ALLY);
  fiche.append("p").text("Votre meilleur allié est : ")
  fiche.append("h1").classed("fullname", true).text(CONSTANTS.BESTIES.BESTALLY["Nom1"]);
  if (CONSTANTS.BESTIES.BESTALLY["Nom2"]){
    fiche.append("h1").classed("smallname", true).text(CONSTANTS.BESTIES.BESTALLY["Nom2"]);
    fiche.select(".fullname").style("margin-bottom", "1px");
  }
  fiche.append("h2").text("Budget de lobbying en nom propre");
  fiche.append("p").text(CONSTANTS.BESTIES.BESTALLY.budget+" €/an");
  fiche.append("h2").text("Liens directs avec vos alliés");
  fiche.append("p").text(CONSTANTS.BESTIES.BESTALLY.allydirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.BESTALLY.allydirectbudget+" €/an");
  fiche.append("h2").text("Liens indirects avec vos alliés");
  fiche.append("p").text(CONSTANTS.BESTIES.BESTALLY.allyundirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.BESTALLY.allyundirectbudget+" €/an");
  fiche.append("h2").text("Liens directs avec vos opposants");
  fiche.append("p").text(CONSTANTS.BESTIES.BESTALLY.ennemydirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.BESTALLY.ennemydirectbudget+" €/an");
  fiche.append("h2").text("Liens indirects avec vos opposants");
  fiche.append("p").text(CONSTANTS.BESTIES.BESTALLY.ennemyundirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.BESTALLY.ennemyundirectbudget+" €/an");

  // Pire opposant
  d3.select("svg").append("foreignObject")
    .classed("bestiesfiche", true)
    .attr("id", "worstrival")
    .attr("x", CONSTANTS.BESTIES_FICHES.x)
    .attr("y", CONSTANTS.BESTIES_FICHES.y2)
    .attr("width", CONSTANTS.BESTIES_FICHES.width)
    .attr("height", CONSTANTS.BESTIES_FICHES.height)
    .html("<div class='foreigncontainer'></div>")

  var fiche = d3.select("#worstrival").select(".foreigncontainer").style("color", CONSTANTS.COLORS.ENEMY);
  fiche.append("p").text("Votre pire adversaire est : ")
  fiche.append("h1").classed("fullname", true).text(CONSTANTS.BESTIES.WORSTRIVAL["Nom1"]);
  if (CONSTANTS.BESTIES.WORSTRIVAL["Nom2"]){
    fiche.append("h1").classed("smallname", true).text(CONSTANTS.BESTIES.WORSTRIVAL["Nom2"]);
    fiche.select(".fullname").style("margin-bottom", "1px");
  }
  fiche.append("h2").text("Budget de lobbying en nom propre");
  fiche.append("p").text(CONSTANTS.BESTIES.WORSTRIVAL.budget+" €/an");
  fiche.append("h2").text("Liens directs avec vos opposants");
  fiche.append("p").text(CONSTANTS.BESTIES.WORSTRIVAL.ennemydirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.WORSTRIVAL.ennemydirectbudget+" €/an");
  fiche.append("h2").text("Liens indirects avec vos opposants");
  fiche.append("p").text(CONSTANTS.BESTIES.WORSTRIVAL.ennemyundirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.WORSTRIVAL.ennemyundirectbudget+" €/an");
  fiche.append("h2").text("Liens directs avec vos alliés");
  fiche.append("p").text(CONSTANTS.BESTIES.WORSTRIVAL.allydirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.WORSTRIVAL.allydirectbudget+" €/an");
  fiche.append("h2").text("Liens indirects avec vos alliés");
  fiche.append("p").text(CONSTANTS.BESTIES.WORSTRIVAL.allyundirectlinks+" organisations");
  fiche.append("p").text("Budget total cumulé de lobbying : "+CONSTANTS.BESTIES.WORSTRIVAL.allyundirectbudget+" €/an");
}