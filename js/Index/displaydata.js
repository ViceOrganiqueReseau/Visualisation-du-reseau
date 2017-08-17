/* 

Attention, les fonctions utilisées dans ce script
sont prévues pour s'exécuter après chargement
total de la page et des données dans CONST.DATASET
(appel à d3.csv asynchrone)

Ces fonctions seront appelées dans le scroller
au cours du scroll utilisateur

NE DEFINIR QUE DES VARIABLES ET DES FONCTIONS
NE RIEN EXECUTER ICI

*/
var datafiltre;
// Tableau qui recence les choix utilisateurs
var choices = [];
// Pas vertical d'affichage du résultat
var pas = 45;
var resultindex;

// Cette fonction ajuste la taille des disques en fonction de la donnée
function scalablesize (intselect,d){
  var max = tabnbloby[intselect];
  return d/max+0.2
}

// Cette fonction est appelée pour positionner le texte
// Elle permet d'éviter les recoupements entre les dernières
// tranches de la pie. 
function coefeloign (intselect, d){
  if ((d.index>3) && (d.index!==CONST.ALLPIEZEDDATA[intselect].length-1)){
    return 1.5 - 0.3*(d.index%2);
  } else {
    return 1.3;
  }
}

CONST.HOVERTEXT = {};
CONST.HOVERTEXT.singulier = [];
CONST.HOVERTEXT.singulier[0] = "organisation a pris position sur ce sujet parmi celles dont le rapport a été analysé jusque-là (voir \"A propos\")";
CONST.HOVERTEXT.singulier[1] = "organisation a pris cette position sur le sujet sélectionné";
CONST.HOVERTEXT.singulier[2] = "organisation qui a la même position que vous sur le sujet sélectionné est de ce type";
CONST.HOVERTEXT.singulier[3] = "organisation qui est de même type et a la même position que vous provient de ce secteur d'activité";
CONST.HOVERTEXT.singulier[4] = "organisation qui est du même secteur, même type et même position que vous provient de cette région";
CONST.HOVERTEXT.pluriel = [];
CONST.HOVERTEXT.pluriel[0] = "organisations ont pris position sur ce sujet parmi celles dont le rapport a été analysé jusque-là (voir \"A propos\")";
CONST.HOVERTEXT.pluriel[1] = "organisations ont pris cette position sur le sujet sélectionné";
CONST.HOVERTEXT.pluriel[2] = "organisations qui ont la même position que vous sur le sujet sélectionné sont de ce type";
CONST.HOVERTEXT.pluriel[3] = "organisations qui sont de même type et ont la même position que vous proviennent de ce secteur d'activité";
CONST.HOVERTEXT.pluriel[4] = "organisations qui sont du même secteur, même type et même position que vous proviennent de cette région";
CONST.HOVERTEXT.width = 170;
CONST.HOVERTEXT.height = 135;
function createHoverCircleText(intselect,d,i,x,y){
  // Condition 1 pour ne pas avoir de cartouche à la section des noms
  // Condition 2 pour éviter des affichages de cartouches parasites
  if (intselect<5 && intselect===currentIndex-5){
  var cartouche = svg.append("foreignObject")
      .attr("class", "cartouche")
      .attr("width", CONST.HOVERTEXT.width)
      .attr("height", CONST.HOVERTEXT.height)
      .attr("x", x)
      .attr("y", y)
      .attr("opacity", 0)
      .html("<div class='foreigncontainer'></div>")
  var foreign = svg.select("foreignObject.cartouche").select("div.foreigncontainer");
  if (CONST.ALLPIEZEDDATA[intselect][i].data===1){
    foreign.html("<h1>"+ CONST.ALLPIEZEDDATA[intselect][i].data +"</h1><p>"+ CONST.HOVERTEXT.singulier[intselect] +"</p>");
  } else {
    foreign.html("<h1>"+ CONST.ALLPIEZEDDATA[intselect][i].data +"</h1><p>"+ CONST.HOVERTEXT.pluriel[intselect] +"</p>");
  }
  cartouche.transition().duration(0.5*CONST.TIMETRANSITION).attr("opacity", 1);
  }
}

function createHoverIlabelText(intselect,group,x,y){
  var foreign = svg.append("foreignObject")
      .attr("class", "cartouche")
      .attr("width", CONST.HOVERTEXT.width)
      .attr("height", CONST.HOVERTEXT.height)
      .attr("x", x)
      .attr("y", y)
      .attr("opacity", 0)
      .html(function (){
        var string = "<div class='foreigncontainer'>";
        if (CONST.NOMSDEPLOYES[group.select("p").text()]){
          string += "<p>"+CONST.NOMSDEPLOYES[group.select("p").text()]+"</p>";
        } else {
          string += "";
        }
        string += "</div>"
        return string;
      })
  foreign.transition().duration(0.5*CONST.TIMETRANSITION).attr("opacity", 1);
}

function removeUselessIlabel (group){
  if (CONST.NOMSDEPLOYES[group.select("p").text()]){
    // On ne fait rien
  } else {
    group.select("img.information").style("display", "none");
  }
}

function removeHoverText(){
  d3.selectAll("foreignObject.cartouche").remove()
  //setTimeout(function(){d3.selectAll("foreignObject").remove()}, 0.51*CONST.TIMETRANSITION);
}

// Gestion du survol
// intselect correspond au numéro des cercles auxquels appliquer l'effet hoverize
function hoverize (intselect, alpha){
  var cercles = d3.selectAll("g.loby"+intselect+" path");
  // On s'assure que les autres éléments n'ont pas d'hoverize
  d3.selectAll("g.arc").on("mouseover", function(){});
  d3.selectAll("g.arc").on("mouseout", function(){});
  d3.selectAll("img.information").on("mouseover", function(){});
  d3.selectAll("img.information").on("mouseout", function(){});
  if (alpha>=1){

    cercles.on("mouseover", function (d,i){
      var selected = d3.select("g.cercle"+i+"loby"+intselect);
      var x=Number(selected.attr("transform").split("(")[1].split(")")[0].split(",")[0])-15;
      var y=Number(selected.attr("transform").split("(")[1].split(")")[0].split(",")[1])-15;
      var avirer = d3.selectAll("g.arc:not(.cercle"+i+").loby"+intselect);
      avirer.transition()
        .duration(0.5*CONST.TIMETRANSITION)
        .attr("opacity", 0.3)

      avirer.select("path")
        .transition()
        .duration(0.5*CONST.TIMETRANSITION)
        .attr("fill", "gray");

      createHoverCircleText(intselect,d,i,x,y);

      cercles.on("mouseout", function (d,i){
        var avirer = d3.selectAll("g.arc:not(.cercle"+i+").loby"+intselect);
        avirer.transition()
          .duration(0.5*CONST.TIMETRANSITION)
          .attr("opacity", 1)
  
        avirer.select("path")
          .transition()
          .duration(0.5*CONST.TIMETRANSITION)
          .attr("fill", function (d,j){
            if (j<i){
              return color(j);
            } else {
              return color(j+1);
            }
          });
        removeHoverText();
        // Suppression de l'événement
        cercles.on("mouseout", null)

      })

    })

    if (intselect===0 || intselect===2 || intselect===3){
        var groups = d3.selectAll("g.loby"+intselect)
        groups.each(function (group){
          var group = d3.select(this);
          var itag = group.select("img.information");
          itag.on("mouseover", function (){
            var x = d3.mouse(svg.node())[0];
            var y = d3.mouse(svg.node())[1];
            createHoverIlabelText(intselect,group,x,y);
            itag.on("mouseout", function (){
              removeHoverText();
            })
          })
        })
    }



  } else {
    cercles.on("mouseover", function(){});
    cercles.on("mouseout", function(){});
  }
}

// On gère la couleur des #answers au choix utilisateur
function resetcolors (){
  d3.select("tr.nom").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.country").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.secteur").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.type").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.theme").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.position").selectAll("th, td").style("color", "rgb(186, 186, 186)");
  d3.select("tr.fonction").selectAll("th, td").style("color", "rgb(186, 186, 186)");
}

// Animation du cercle cliqué
// Mémorisation du choix utilisateur
function circleonclick (intselect,i){
  // On vire les cercles non selectionnés
    var avirer = d3.selectAll("g.arc:not(.cercle"+i+"loby"+intselect+")")
    avirer.transition()
        .duration(CONST.TIMETRANSITION)
        .attr("transform", "translate("+(-2500)+", "+2500+")");
    avirer.transition()
          .duration(0)
          .delay(CONST.TIMETRANSITION)
          .attr("opacity", 0)

    // Traitement de l'élément cliqué
    var selected = d3.select("g.cercle"+i+"loby"+intselect);
    selected.transition()
        .duration(CONST.TIMETRANSITION)
        .attr("transform", "translate("+(0.5*CONST.VUE.WIDTH)+", "+(0.5*CONST.VUE.HEIGHT)+")")
    selected.select("path")
        .transition()
        .duration(CONST.TIMETRANSITION)
        .attr("d", arc.outerRadius(function (){
          return outerRadius;
        }))
    selected.select("foreignObject.arctext")
        .transition()
        .duration(CONST.TIMETRANSITION)
        .attr("transform", function (){
          var textpos = this.getBoundingClientRect();
          var string="translate(";
          string += -0.4*CONST.VUE.WIDTH;
          string += ", ";
          string += 0.25*CONST.VUE.HEIGHT;
          string += ")";
          return string;
        })
        .select("p").style("font-size", "20px");

    // Si l'élément est le dernier cercle, on lui donne la couleur user
    if (CONST.ALLPIEZEDDATA[CONST.ALLPIEZEDDATA.length-1][i].data===1){
      selected.select("path").transition().duration(CONST.TIMETRANSITION).attr("fill", "rgb(0,255,165)")
        .attr("d", arc.outerRadius(function (){
          return outerRadius;
        }))
    } else {
      selected.select("path").transition().duration(CONST.TIMETRANSITION).attr("fill", colorlastanswer)
        .attr("d", arc.outerRadius(function (){
          return outerRadius;
        }))
    }

    // Mémorisation du choix utilisateur
      var indice = Number(selected.attr("class")[10]);
      choices.push(CONST.ALLTHEMELIST[intselect][indice]);
      nbloby = CONST.ALLPIEZEDDATA[CONST.ALLPIEZEDDATA.length-1][indice].data;
      console.log("nbloby = "+nbloby);
      tabnbloby.push(nbloby);
      console.log(tabnbloby);
}

// Fonction qui crée les nouvelles sections
function createsection (inttosee){
  var sections = d3.select("#sections");
  for (var i=currentIndex+1; i<currentIndex+6; i++){
    sections.select("#sec"+(i+CONST.SECTIONSJUMPED.length)).remove()
  }
  var section = sections
                  .append("section")
                  .attr("id", "sec"+(inttosee+5))
  section.append("h1");
  section.append("p").attr("class", "texte");
  section.append("p").attr("class", "appel");
  writeTextInSection(inttosee+5);
}

// Contient les sections ou on a sauté une étape de choix
CONST.SECTIONSJUMPED = [];
// On saute une étape de choix
function jumpsection (inttosee, selector){
  CONST.AUXDATASET = CONST.ALLDATAFILTRE[inttosee];
  choices[inttosee+CONST.SECTIONSJUMPED.length]=CONST.ALLTHEMELIST[inttosee][0];
  d3.select("#answers").select("td."+selector).text(choices[inttosee+CONST.SECTIONSJUMPED.length]);
  d3.select("#answers").select("tr."+selector).selectAll("th, td").style("color", colorlastanswer);
  CONST.SECTIONSJUMPED.push(inttosee+5+CONST.SECTIONSJUMPED.length)
}

// On charge des données : remplissage des variables graphiques utiles
function filterAndLoad (filter, value, nextissue, inttosee){
  CONST.ALLDATAFILTRE[inttosee]=[]
  // On filtre les données selon la position choisie
  for (var i=0; i<CONST.AUXDATASET.length; i++){
    if (CONST.AUXDATASET[i][filter]===value){
      CONST.ALLDATAFILTRE[inttosee].push(CONST.AUXDATASET[i])
    } else {
      // On enlève
    }
  }
  CONST.AUXDATASET = CONST.ALLDATAFILTRE[inttosee]

  // On génère le jeu de variables graphiques
  datafiltre=CONST.ALLDATAFILTRE[inttosee].slice();
  CONST.ALLTHEMELIST[inttosee]=[];
  piedata=[];
  for (var i=0; i<datafiltre.length; i++){
    var donnee = datafiltre[i][nextissue]
    var indice = CONST.ALLTHEMELIST[inttosee].indexOf(donnee);
    if (indice===-1){
      CONST.ALLTHEMELIST[inttosee].push(donnee);
      piedata.push(1);
    } else {
      piedata[indice]++;
    }
  }
  CONST.ALLPIEZEDDATA[inttosee] = pie(piedata);
}


// On charge les nouvelles données
function loadNewData (inttosee){
  if (nbloby===1){
    CONST.ALLDATAFILTRE[inttosee]=CONST.ALLDATAFILTRE[inttosee-1].slice();
    // On filtre les données pour ne garder que le résultat
    var nbchoix = choices.length;
    for (var i=0; i<CONST.ALLDATAFILTRE[inttosee-1].length; i++){
      if (nbchoix>=2){
        if (CONST.ALLDATAFILTRE[inttosee-1][i][choices[0]]!==choices[1]){
          CONST.ALLDATAFILTRE[inttosee][i]=0
        }
      }
      if (nbchoix>=3){
        if (CONST.ALLDATAFILTRE[inttosee-1][i]["Type"]!==choices[2]){
          CONST.ALLDATAFILTRE[inttosee][i]=0
        }
      }
      if (nbchoix>=4){
        if (CONST.ALLDATAFILTRE[inttosee-1][i]["Secteurs d’activité"]!==choices[3]){
          CONST.ALLDATAFILTRE[inttosee][i]=0
        }
      }
      if (nbchoix>=5){
        if (CONST.ALLDATAFILTRE[inttosee-1][i]["Pays/Région"]!==choices[4]){
          CONST.ALLDATAFILTRE[inttosee][i]=0
        }
      }
      if (nbchoix>=6){
        if (CONST.ALLDATAFILTRE[inttosee-1][i]["Nom1"]!==choices[5]){
          CONST.ALLDATAFILTRE[inttosee][i]=0
        }
      }
    } 
    while (CONST.ALLDATAFILTRE[inttosee].indexOf(0)!==-1){
      CONST.ALLDATAFILTRE[inttosee].splice(CONST.ALLDATAFILTRE[inttosee].indexOf(0), 1);
    }

    // nbloby=1, On génère le résultat dans generateResult

  } else 
  switch (inttosee+CONST.SECTIONSJUMPED.length) {
  case 1:
    /* Seul le thème a été choisi, 
    charger la position POURS/CONTRES 
    du thème choisi */

          // On ne peux pas appeler filterAndLoad ici, on le fait manuellement 
    // On filtre les données selon le thème choisi
    CONST.ALLDATAFILTRE[inttosee]=[];
    for (var i=0; i<CONST.AUXDATASET.length; i++){
      if (CONST.AUXDATASET[i][choices[0]]){
        CONST.ALLDATAFILTRE[inttosee].push(CONST.AUXDATASET[i])
      } else {
        // On enlève
      }
    }
    CONST.AUXDATASET = CONST.ALLDATAFILTRE[CONST.ALLDATAFILTRE.length-1];

    // On génère le jeu de variable pour les éléments graphiques
    datafiltre = CONST.ALLDATAFILTRE[inttosee].slice();
    piedata = [0,0]; // POURS, CONTRES
    for (var i=0; i<datafiltre.length; i++){
      if (datafiltre[i][choices[0]]==="Pour"){
        piedata[0]++;
      } else if (datafiltre[i][choices[0]]==="Contre"){
        piedata[1]++;
      }
    }
    CONST.ALLPIEZEDDATA[inttosee] = pie(piedata);
    CONST.ALLTHEMELIST[inttosee] = ["Pour", "Contre"];

    if (piedata[0]===0){
      // On choisit contre et on charge la suite des données
      choices[1]="Contre"
      d3.select("#answers").select("td.position").text(choices[1]);
      d3.select("#answers").select("tr.position").selectAll("th, td").style("color", colorlastanswer);
      CONST.SECTIONSJUMPED.push(inttosee+5);
      loadNewData(inttosee);
    } else if (piedata[1]===0){
      // On choisit pour et on charge la suite des données
      choices[1]="Pour"
      d3.select("#answers").select("td.position").text(choices[1]);
      d3.select("#answers").select("tr.position").selectAll("th, td").style("color", colorlastanswer);
      CONST.SECTIONSJUMPED.push(inttosee+5);
      loadNewData(inttosee);
    }
    break;

  case 2:
    /* L'utilisateur a choisi son thème
    ainsi que sa position par rapport à ce thème. 
    Charger maintenant la catégorie de lobbyist */

    filterAndLoad(choices[0], choices[1], "Type", inttosee);
    if (CONST.ALLTHEMELIST[inttosee].length===1){
      jumpsection(inttosee, "type");
      loadNewData(inttosee);
    }
    break;

  case 3:
    /* L'utilisateur a choisi son thème
    ainsi que sa position par rapport à ce thème. 
    Il vient de choisir le type de structure qui lui convient. 
    Charger maintenant le secteur de lobby */

    filterAndLoad("Type", choices[2], "Secteurs d’activité", inttosee);
    if (CONST.ALLTHEMELIST[inttosee].length===1){
      jumpsection(inttosee, "secteur");
      loadNewData(inttosee);
    }
    break;

  case 4:
    /* L'utilisateur a choisi son thème
    ainsi que sa position par rapport à ce thème. 
    Il a choisi le type de structure qui lui convient. 
    Il vient de choisir le secteur qui lui convient. 
    Charger maintenant le pays de lobby */

    filterAndLoad("Secteurs d’activité", choices[3], "Pays/Région", inttosee);
    if (CONST.ALLTHEMELIST[inttosee].length===1){
      jumpsection(inttosee, "country");
      loadNewData(inttosee);
    }
    break;

  case 5:
    /* L'utilisateur a choisi son thème,
    sa position par rapport à ce thème ainsi que 
    le type de structure qui lui convient et son secteur. 
    Il vient de choisir son pays de prédilection. 
    On prop */

    filterAndLoad("Pays/Région", choices[4], "Nom1", inttosee);
    break;

  } 
}

function generatePie (inttosee){
  console.log(CONST.ALLPIEZEDDATA[inttosee]);
  arc = d3.arc()
                .innerRadius(0)
                .outerRadius(outerRadius);

  CONST.QUEST.ARCS[inttosee] = svg.selectAll("g.xxx")
          .data(CONST.ALLPIEZEDDATA[inttosee])
          .enter()
          .append("g")
          .attr("class", function (d,i){
            return "arc cercle"+i+" "+"loby"+inttosee+" cercle"+i+"loby"+inttosee;
          })
          .attr("transform", "translate("+(0.5*CONST.VUE.WIDTH)+", "+(0.5*CONST.VUE.HEIGHT)+")")
          .attr("opacity", 0);

  CONST.QUEST.ARCS[inttosee].append("path")
    .attr("d", arc)
    .attr("fill", function (d,i){
      return color(i);
    })
    .attr("stroke", "#111627")
    .attr("stroke-width", CONST.STROKEWIDTH)

  CONST.QUEST.ARCS[inttosee].append("foreignObject")
    .attr("class", "arctext")
    .attr("width", CONST.QUEST.TEXT.width)
    .attr("height", CONST.QUEST.TEXT.height)
    .attr("transform", function (d,i) {
      var string = "translate(";
      var angle = 0.5 * (CONST.ALLPIEZEDDATA[inttosee][i].startAngle + CONST.ALLPIEZEDDATA[inttosee][i].endAngle);
      var textpos = this.getBoundingClientRect();
                // attention position
      if ((angle>Math.PI) && (d.index>4) && (d.index===CONST.ALLPIEZEDDATA[inttosee].length-1)){
        string += (coefeloign(inttosee,d) * outerRadius * Math.sin(angle));
      } else if (angle>Math.PI){
        string += (coefeloign(inttosee,d) * outerRadius * Math.sin(angle) - 0.6*textpos.right + 0.6*textpos.left);
      } else {
        string += (coefeloign(inttosee,d) * outerRadius * Math.sin(angle));
      }
      string += ', ';
      string += (-coefeloign(inttosee,d) * outerRadius * Math.cos(angle));
      string += ")";
      return string;
    })
    .html(function (d,i){
      if (inttosee===2 || inttosee===3){
        return "<p>"+CONST.ALLTHEMELIST[inttosee][i]+"</p><img src='img/i.svg' class='information loby"+inttosee+"'/>"
      } else {
        return "<p>"+CONST.ALLTHEMELIST[inttosee][i]+"</p>"
      }     
    })

    var groups = d3.selectAll("g.loby"+(inttosee));
    groups.each(function (){
      group = d3.select(this);
      removeUselessIlabel(group);
    })

}

CONST.RESULT = {};
CONST.RESULT.width = 0.45*CONST.VUE.WIDTH;
CONST.RESULT.height = 1.3*CONST.RESULT.width;
CONST.RESULT.x = 0.5*CONST.VUE.WIDTH - 0.5*CONST.RESULT.width;
CONST.RESULT.y = 0.07*CONST.VUE.HEIGHT;
CONST.RESULT.titlepos = {x: 0.5*CONST.VUE.WIDTH,y: 0.41*CONST.VUE.HEIGHT};
CONST.RESULT.parag1pos = {x: 0.38*CONST.VUE.WIDTH,y: 0.27*CONST.VUE.HEIGHT};
CONST.RESULT.parag2pos = {x: 0.38*CONST.VUE.WIDTH,y: 0.52*CONST.VUE.HEIGHT};
CONST.RESULT.parag3pos = {x: 0.38*CONST.VUE.WIDTH,y: 0.63*CONST.VUE.HEIGHT};
CONST.RESULT.pastitle = 31;
CONST.RESULT.pasfulltitle = 26;
CONST.RESULT.pas = 20;
CONST.RESULT.tabulation = 20;
CONST.RESULT.LINK = {};
CONST.RESULT.LINK.x = 0.8*CONST.VUE.WIDTH;
CONST.RESULT.LINK.y = 0.6*CONST.VUE.HEIGHT;
CONST.RESULT.LINK.width = 0.1*CONST.VUE.WIDTH;
CONST.RESULT.LINK.height = 2*CONST.RESULT.LINK.width;
CONST.RESULT.LINK.texte = ["Entrer", "dans le", "réseau"];
CONST.RESULT.LINK.textdx = 0.5*CONST.RESULT.LINK.width;
CONST.RESULT.LINK.textdy = 0.3*CONST.RESULT.LINK.height;
CONST.RESULT.LINK.textpadding = 25;
// Génération du résultat final s'il est connu
function generateResult (){
  // nbloby === 1

  // Création des éléments graphiques
  var user = CONST.ALLDATAFILTRE[CONST.ALLDATAFILTRE.length-1][0]
  CONST.RESULT.D3 = svg.append("g").attr("class", "result").attr("opacity", 0).style("display", "none");

  var title = CONST.RESULT.D3.append("text")
                  .attr("class", "title")
                  .attr("x", CONST.RESULT.titlepos.x)
                  .attr("y", CONST.RESULT.titlepos.y)
  var titrecoupe = [];
  titrecoupe[0] = user["Nom1"].split(" ").slice(0,2).join(" ");
  titrecoupe[1] = user["Nom1"].split(" ").slice(2).join(" ");

  title.append("tspan")
        .attr("class", "mainname")
        .attr("x", Number(d3.select("text.title").attr("x")))
        .attr("y", Number(d3.select("text.title").attr("y")))
        .text(titrecoupe[0])
  title.append("tspan")
        .attr("class", "mainname")
        .attr("x", Number(d3.select("text.title").attr("x")))
        .attr("y", Number(d3.select("text.title").attr("y"))+CONST.RESULT.pastitle)
        .text(titrecoupe[1])
  if (titrecoupe[1]){
    title.append("tspan")
        .attr("class", "fullname")
        .attr("x", Number(d3.select("text.title").attr("x")))
        .attr("y", Number(d3.select("text.title").attr("y"))+CONST.RESULT.pastitle+CONST.RESULT.pasfulltitle)
        .text(user["Nom2"])
  } else {
    title.append("tspan")
        .attr("class", "fullname")
        .attr("x", Number(d3.select("text.title").attr("x")))
        .attr("y", Number(d3.select("text.title").attr("y"))+CONST.RESULT.pasfulltitle)
        .text(user["Nom2"])
  } 
  

  var parag1 = CONST.RESULT.D3.append("text")
                  .attr("class", "parag1")
                  .attr("x", CONST.RESULT.parag1pos.x)
                  .attr("y", CONST.RESULT.parag1pos.y)
  parag1.append("tspan")
        .attr("class", "paragtitle")
        .attr("x", Number(d3.select("text.parag1").attr("x")))
        .attr("y", Number(d3.select("text.parag1").attr("y")))
        .text("STRUCTURE")
  parag1.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag1").attr("x")))
        .attr("y", Number(d3.select("text.parag1").attr("y"))+CONST.RESULT.pas)
        .text("Type : "+user["Type"])
  parag1.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag1").attr("x")))
        .attr("y", Number(d3.select("text.parag1").attr("y"))+2*CONST.RESULT.pas)
        .text("Secteur : "+user["Secteurs d’activité"])
  parag1.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag1").attr("x")))
        .attr("y", Number(d3.select("text.parag1").attr("y"))+3*CONST.RESULT.pas)
        .text("Pays/Région : "+user["Pays/Région"])

  var parag2 = CONST.RESULT.D3.append("text")
                  .attr("class", "parag2")
                  .attr("x", CONST.RESULT.parag2pos.x)
                  .attr("y", CONST.RESULT.parag2pos.y)
  parag2.append("tspan")
        .attr("class", "paragtitle")
        .attr("x", Number(d3.select("text.parag2").attr("x")))
        .attr("y", Number(d3.select("text.parag2").attr("y")))
        .text("LOBBYING")
  parag2.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag2").attr("x")))
        .attr("y", Number(d3.select("text.parag2").attr("y"))+CONST.RESULT.pas)
        .text("Dépenses de lobbying estimées (€) : "+user["Dépenses Lobby (€)"])
  parag2.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag2").attr("x")))
        .attr("y", Number(d3.select("text.parag2").attr("y"))+2*CONST.RESULT.pas)
        .text("Personnes impliquées : "+valueNAN(user["Personnes impliquées"]))
  parag2.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag2").attr("x")))
        .attr("y", Number(d3.select("text.parag2").attr("y"))+3*CONST.RESULT.pas)
        .text("Equivalent temps plein : "+valueNAN(user["Equivalent Temps plein"]))

  var parag3 = CONST.RESULT.D3.append("text")
                  .attr("class", "parag3")
                  .attr("x", CONST.RESULT.parag3pos.x)
                  .attr("y", CONST.RESULT.parag3pos.y)
  parag3.append("tspan")
        .attr("class", "paragtitle")
        .attr("x", Number(d3.select("text.parag3").attr("x")))
        .attr("y", Number(d3.select("text.parag3").attr("y")))
        .text("POSITION")
  for (var i=0; i<CONST.ALLTHEMELIST[0].length; i++){
    parag3.append("tspan")
        .attr("class", "item")
        .attr("x", Number(d3.select("text.parag3").attr("x")))
        .attr("y", Number(d3.select("text.parag3").attr("y"))+(i+1)*CONST.RESULT.pas)
        .text(CONST.ALLTHEMELIST[0][i]+" : "+valueNAN(user[CONST.ALLTHEMELIST[0][i]]))
  }


  // MAJ des données de answers
  d3.select("td.type").text(user["Type"]);
  d3.select("td.secteur").text(user["Secteurs d’activité"]);
  d3.select("td.country").text(user["Pays/Région"]);
  d3.select("td.nom").text(user["Nom1"]);
  resetcolors();
  d3.select("tr.nom").selectAll("th, td").style("color", colorlastanswer);
  if (choices.length<=5){
    d3.select("tr.country").selectAll("th, td").style("color", colorlastanswer);
  }
  if (choices.length<=4){
    d3.select("tr.secteur").selectAll("th, td").style("color", colorlastanswer);
  }
  if (choices.length<=3){
    d3.select("tr.type").selectAll("th, td").style("color", colorlastanswer);
  }
  d3.select("tr.secteur").style("display", "table-row");
  d3.select("tr.country").style("display", "table-row");
  d3.select("tr.nom").style("display", "table-row");

  // Création du lien vers le réseau
  var link = CONST.RESULT.D3.append("svg:a")
              .attr("class", "link")
              .attr("display", "none")
              .attr("href", "")
  link.append("rect")
        .attr("x", CONST.RESULT.LINK.x)
        .attr("y", CONST.RESULT.LINK.y)
        .attr("width", CONST.RESULT.LINK.width)
        .attr("height", CONST.RESULT.LINK.width) // Oui c'est bien width !
        .attr("stroke-width", CONST.strokewidth)
        .attr("stroke", "#111627");
  var textelem = link.append("text")
                  .attr("x", 0)
                  .attr("y", CONST.RESULT.LINK.textdy)
  for (var i=0; i<CONST.RESULT.LINK.texte.length; i++){
    textelem.append("tspan")
            .attr("class", "linktext")
            .attr("x", CONST.RESULT.LINK.x + 0.5*CONST.RESULT.LINK.width)
            .attr("y", CONST.RESULT.LINK.y + (i+1.5)*CONST.RESULT.LINK.textpadding)
            .text(CONST.RESULT.LINK.texte[i])
  }
  link.append("rect")
        .attr("x", CONST.RESULT.LINK.x)
        .attr("y", CONST.RESULT.LINK.y+CONST.RESULT.LINK.width)
        .attr("width", CONST.RESULT.LINK.width)
        .attr("height", CONST.RESULT.LINK.width) // Oui c'est bien width !
        .attr("stroke-width", CONST.strokewidth)
        .attr("stroke", "#111627");
  link.append("image")
        .attr("x", CONST.RESULT.LINK.x+CONST.RESULT.LINK.width/4)
        .attr("y", CONST.RESULT.LINK.y + CONST.RESULT.LINK.width+CONST.RESULT.LINK.width/4)
        .attr("width", CONST.RESULT.LINK.width/2)
        .attr("height", CONST.RESULT.LINK.width/2) // oui c'est bien width !
        .attr("href", "img/pointIdentification.svg");
}

function eraseResult(){
  svg.select("g.result").remove();
}

function resetEvents(){
  d3.selectAll("g.arc path").on("click", null);
  d3.selectAll("g.arc path").on("mouseover", null);
  d3.selectAll("g.arc path").on("mouseout", null);
  d3.selectAll("g.arc path").style("cursor", "default");
}

// Gestion du choix utilisateur : click
function clickable (intselect,alpha){
  if (alpha>=1){
    var cercles = d3.selectAll("g.loby"+intselect+" path")
            .style("cursor", "pointer");
    cercles.on("click", function (d,i){
      // On supprime l'écoute de l'événement et les cartouches foreignObject
      cercles.on("mouseover", function (){});
      cercles.on("mouseout", function (){});
      cercles.on("click", function (){});
      removeHoverText();
      // On mémorise l'élément cliqué
      CONST.LASTCIRCLE = d3.select("g.cercle"+i+"loby"+intselect);

      // On bouge les cercles
      circleonclick(intselect,i);

      // Affichage du choix utilisateur dans #answers
      var nbchoix = choices.length;

      switch (nbchoix){
        case 1:
          var element = d3.select("td.theme");
          element.text(choices[0]);
          resetcolors();
          d3.select("tr.theme").selectAll("th, td").style("color", colorlastanswer);
          d3.select("tr.position").style("display", "table-row");
          break;
        case 2:
          var element = d3.select("td.position");
          element.text(choices[1]);
          resetcolors();
          d3.select("tr.position").selectAll("th, td").style("color", colorlastanswer);
          d3.select("tr.type").style("display", "table-row");
          break;
        case 3:
          var element = d3.select("td.type");
          element.text(choices[2]);
          resetcolors();
          d3.select("tr.type").selectAll("th, td").style("color", colorlastanswer);
          d3.select("tr.secteur").style("display", "table-row");
          break;
        case 4:
          var element = d3.select("td.secteur");
          element.text(choices[3]);
          resetcolors();
          d3.select("tr.secteur").selectAll("th, td").style("color", colorlastanswer);
          d3.select("tr.country").style("display", "table-row");
          break;
        case 5:
          var element = d3.select("td.country");
          element.text(choices[4]);
          resetcolors();
          d3.select("tr.country").selectAll("th, td").style("color", colorlastanswer);
          d3.select("tr.nom").style("display", "table-row");
          break;  
      } 

      // On charge les données pour le choix suivant s'il y en a un
      loadNewData(intselect+1);
      if (nbloby===1){
        // Création des nouvelles sections  
        createsection(6);
        majsectionspos();
        generateResult();
        resultindex=intselect+6;
        setlinkURL();
        resetEvents();
      } else {
        // Création des nouvelles sections  
        createsection(intselect+1+CONST.SECTIONSJUMPED.length);
        majsectionspos();
        generatePie(intselect+1);
      }
    })
  } else {
    var cercles = d3.selectAll("path")
            .style("cursor", "default");
    cercles.on("click", function (){});
  }
}

function manageSec5 (pos){
  var startsection = sectionPositions[4];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 5
  var alphasteps = [0,0.6,1];
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
    // On s'assure que la fiche est invisible
    CONST.QUEST.D3.select("rect").attr("y", 0.95*CONST.VUE.HEIGHT);

    // Le point suit la fiche
  } else if (alpha<=alphasteps[1]){
    // On déplace la fiche
    var beta = abTo01(0,alphasteps[1],alpha);
    CONST.QUEST.D3.select("rect").attr("y", 0.95*CONST.VUE.HEIGHT+beta*(CONST.QUEST.FICHE.y-0.95*CONST.VUE.HEIGHT));
    // On rend invisible l'#answer p.theme
    d3.select("tr.theme").style("display", "none");
    // On s'assure que les cercles sont invisibles
    CONST.QUEST.ARCS[0].style("display", "none");
    CONST.QUEST.ARCS[0].attr("opacity", 0);
  } else if (alpha<=1){
    // On s'assure que la fiche est à sa place
    CONST.QUEST.D3.select("rect").attr("y", CONST.QUEST.FICHE.y);
    // On rend visible les cercles de l'étape thème
    var beta = abTo01(alphasteps[1],1,alpha)
    CONST.QUEST.ARCS[0].style("display", "block");
    CONST.QUEST.ARCS[0].attr("opacity", beta);
    // On rend visible l'#answers p.theme
    d3.select("tr.theme").style("display", "table-row");
  } else {
    // On s'assure que les cercles sont bien visibles
    CONST.QUEST.ARCS[0].attr("opacity", 1);
  }
  // On rend les cercles cliquables si alpha>=1
  // On annule le clickable sinon
  hoverize(0,alpha);
  clickable(0,alpha);
}

// Transition d'opacité
function transitOpacity (old, newer, beta){
  old.attr("opacity", 1-beta);
  newer.attr("opacity", beta);
}

// Eclatement des pie
function pieSplash (intselect, beta){
  CONST.QUEST.ARCS[intselect]
        .attr("transform", function (d,i){
          var angle = 0.5 * (CONST.ALLPIEZEDDATA[intselect][i].startAngle + CONST.ALLPIEZEDDATA[intselect][i].endAngle);
          if (angle>Math.PI){
            return "translate("+(0.5*CONST.VUE.WIDTH+beta*0.2*CONST.VUE.WIDTH*Math.sin(angle))+", "+(0.5*CONST.VUE.HEIGHT+(-beta*0.2*CONST.VUE.HEIGHT*Math.cos(angle)))+")"    
          } else {
            return "translate("+(0.5*CONST.VUE.WIDTH+beta*0.15*CONST.VUE.WIDTH*Math.sin(angle))+", "+(0.5*CONST.VUE.HEIGHT+(-beta*0.15*CONST.VUE.HEIGHT*Math.cos(angle)))+")"
          }   
        });
}

// Fermeture d'une part de pie en une nouvelle pie
function pieToCircles (intselect, beta){
  var cercles = d3.selectAll("g.loby"+intselect+" path");
  var textes = d3.selectAll("g.loby"+intselect+" foreignObject.arctext");
  cercles
        .attr("d", arc.endAngle(function (d){
          return d.endAngle + 2*Math.PI*beta;
        }))
        .attr("d", arc.outerRadius(function (d){
          return (1-0.2*beta*(1/scalablesize(intselect,d.data)))*outerRadius;
        }))
  textes
        .attr("transform", function (d,i) {
          var string = "translate(";
          var angle = 0.5 * (CONST.ALLPIEZEDDATA[intselect][i].startAngle + CONST.ALLPIEZEDDATA[intselect][i].endAngle);
          var textpos = this.getBoundingClientRect();
                    // attention position                 // position initiale du dernier quart
          if ((angle>Math.PI) && (d.index>4) && (d.index===CONST.ALLPIEZEDDATA[intselect].length-1) && (choices.length!==0)){
            string += ((coefeloign(intselect,d)-0.4*beta) * outerRadius * Math.sin(angle));
          } else if (angle>Math.PI){
            string += ((coefeloign(intselect,d)-0.4*beta) * outerRadius * Math.sin(angle) - 0.6*textpos.right + 0.6*textpos.left);
          } else {
            string += ((coefeloign(intselect,d)-0.4*beta) * outerRadius * Math.sin(angle));
          }
          string += ', ';
          string += (-(coefeloign(intselect,d)-0.4*beta) * outerRadius * Math.cos(angle));
          string += ")";
          return string;
        })
}

// Gestion de la section .loby${intselect}
function manageSecX (intselect,pos){
  var startsection = sectionPositions[4+intselect];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 5
  var alphasteps = [0,0.2,0.6,1];
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
    // On s'assure que beta=0
    var old = d3.selectAll("g.loby"+(intselect-1));
    var newer = d3.selectAll("g.loby"+intselect);
    transitOpacity(old, newer, 0);
  } else if (alpha<=alphasteps[1]){
    // On gère la transparence en fonction du scroll
    var old = d3.selectAll("g.loby"+(intselect-1));
    var newer = d3.selectAll("g.loby"+intselect);
    var beta = abTo01(0,alphasteps[1],alpha);
    transitOpacity(old, newer, beta);
    // On s'assure que les parts sont positionnées en pie
    pieSplash(intselect,0);
  } else if (alpha<=alphasteps[2]){
    // On s'assure que les bons cercles sont visibles et les anciens invisibles
    var old = d3.selectAll("g.loby"+(intselect-1));
    var newer = d3.selectAll("g.loby"+intselect);
    transitOpacity(old,newer,1);
    // Position des parts
    var beta = abTo01(alphasteps[1],alphasteps[2],alpha);
    pieSplash(intselect, beta);
    // On s'assure que les parts ne sont pas éclatées  
    pieToCircles(intselect, 0);
  } else if (alpha<=1){
    // On s'assure les parts sont bien éclatées
    pieSplash(intselect,1);
    // On referme les parts 
    var beta = abTo01(alphasteps[2],1,alpha);
    pieToCircles(intselect, beta);
  } else {
    // On s'assure que les parts sont bien refermées mais on ne s'assure pas que le rayon est correct
    // car celui ci sera par clickable au moment du clic
    var cercles = d3.selectAll("g.loby"+intselect+" path");
    cercles
        .attr("d", arc.endAngle(function (d){
          return d.endAngle + 2*Math.PI;
        }))
  }
  // On rend ces cercles cliquables si alpha>=1
  // On annule le cliquable sinon
  hoverize(intselect,alpha);
  clickable(intselect,alpha);
  if (nbloby===1){
    resetEvents();
  }
}

function displayResult(intselect,pos){
  var startsection = sectionPositions[4+intselect];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section
  var alphasteps = [0,0.5,1];
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  var old = d3.selectAll("g.loby"+(intselect-1));
  var newer = d3.select("g.result");
  if (alpha<=0){
    // On s'assure que le cercle est normal et le label visible
    CONST.LASTCIRCLE.select("path").attr("d", arc.outerRadius(function (){
      return outerRadius
    }))
    CONST.LASTCIRCLE.select("foreignObject").attr("opacity", 1);
    CONST.LASTCIRCLE.attr("transform", "translate("+(0.5*CONST.VUE.WIDTH)+","+(0.5*CONST.VUE.HEIGHT)+")");
  } else if (alpha<=alphasteps[1]){
    // On déploie le cercle et efface le label
    var beta = abTo01(0,alphasteps[1],alpha);
    CONST.LASTCIRCLE.select("path").attr("d", arc.outerRadius(function (){
      return (1+1.5*beta)*outerRadius
    }))
    CONST.LASTCIRCLE.select("foreignObject").attr("opacity", 1-beta);
    CONST.LASTCIRCLE.attr("transform", "translate("+(0.5*CONST.VUE.WIDTH)+","+(0.5*CONST.VUE.HEIGHT)+")");
    // On s'assure que le texte est invisible
    d3.select("g.result").attr("opacity", 0).style("display", "none");
  } else if (alpha<=1) {
    // On s'assure que le cercle est à la bonne taille et le label effacé
    CONST.LASTCIRCLE.select("path").attr("d", arc.outerRadius(function (){
      return 2.5*outerRadius
    }))
    CONST.LASTCIRCLE.select("foreignObject").attr("opacity", 0);
    // On rend le texte visible
    var beta = abTo01(alphasteps[1],1,alpha);
    d3.select("g.result").attr("opacity", beta).style("display", "block");
  } else {
    // On s'assure que le texte est visible
    d3.select("g.result").attr("opacity", 1);
  }
}

// Pour le retour en arrière

// Fonction qui supprime les sections en trop
function removelastsection (intselect){
  var sections = d3.select("#sections").selectAll("section");
  var nbsections = sections["_groups"][0].length
  // Sécurité : on ne supprime pas les sections 0, 1, 2, 3, 4 et 5
  if (nbsections>6){
      // La dernière section a l'id #sec${nbsections-1}
    var avirer = d3.select("#sec"+(intselect+6));
    avirer.select("h1").html("");
    avirer.select("p.texte").html("");
    avirer.select("p.appel").html("Retournez plus haut !");
    // On supprime le dernier élément de CONST.ALLDATAFILTRE
    CONST.ALLDATAFILTRE.splice(intselect+1,1);
    CONST.AUXDATASET = CONST.ALLDATAFILTRE[CONST.ALLDATAFILTRE.length-1];
    // On supprime les cercles associés à cette section
    if (CONST.QUEST.ARCS[intselect+1]){
      CONST.QUEST.ARCS[intselect+1].remove();
      CONST.QUEST.ARCS.splice(intselect+1,1);
    }
    // On supprime la dernière entrée de tabnbloby et on remet nbloby à jour
    tabnbloby.splice(intselect+1,1);
    nbloby = tabnbloby[tabnbloby.length-1];
    // On supprime la liste des thèmes associée
    CONST.ALLTHEMELIST.splice(intselect+1,1);
    // On supprime la piezeddata associée
    CONST.ALLPIEZEDDATA.splice(intselect+1,1);
    // On supprime le dernier choix
    choices.splice(intselect,1);
    d3.select("#sec11").remove();
  }
}

// Après le clic, des cercles sont virés, et le cercle choisi est aggrandi au centre
// Cette fonction remet tout le monde à sa place
function resetcircles (intselect){
  var cercles = d3.selectAll("g.loby"+intselect+" path");
  var textes = d3.selectAll("g.loby"+intselect+" foreignObject.arctext");
  // On remet les cercles à leur place
  pieSplash(intselect, 1);
  pieToCircles(intselect, 1);
  // Couleur des cercles
  cercles.attr("fill", function (d,i){
    return color(i);
  })
  // On affiche les cercles et leurs textes avec une animation
  CONST.QUEST.ARCS[intselect].transition()
                  .duration(CONST.TIMETRANSITION)
                  .attr("opacity", 1);
  // Taille des textes : valeur définie dans svgstyles.css à récupérer
  textes.attr("opacity", 1);
  textes.select("p").style("font-size", "12px");
}

function cancelChoiceAnswer(intselect){
  resetcolors();
  var cancelclass;
  var removeclass;
  switch (intselect){
    case 0:
      cancelclass = ["td.theme","td.position","td.type","td.secteur","td.country","td.nom"];
      removeclass = ["tr.position","tr.type","tr.secteur","tr.country","tr.nom"];
      break;
    case 1:
      cancelclass = ["td.position","td.type","td.secteur","td.country","td.nom"];
      removeclass = ["tr.type","tr.secteur","tr.country","tr.nom"];
      break;
    case 2:
      cancelclass = ["td.type","td.secteur","td.country","td.nom"];
      removeclass = ["tr.secteur","tr.country","tr.nom"];
      break;
    case 3:
      cancelclass = ["td.secteur","td.country","td.nom"];
      removeclass = ["tr.country","tr.nom"];
      break;
    case 4:
      cancelclass = ["td.country","td.nom"];
      removeclass = ["tr.nom"];
      break;
    case 5:
      cancelclass = ["td.nom"];
      removeclass = [];
      break;
  }
  cancelclass.forEach(function (selector){
    // On supprime le texte écrit
    d3.select("#answers").select(selector).text("");
  })
  removeclass.forEach(function (selector){
    // On rend l'élément invisible
    d3.select("#answers").select(selector).style("display", "none");
  })
}