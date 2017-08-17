// Les constantes, noter que pour certaines, leur valeur n'est pas encore connue
var CONST = {};

CONST.VUE = {};

var vue = document.getElementById("vue");
CONST.VUE.POSITION = vue.getBoundingClientRect();
CONST.VUE.PADDING = 5;

CONST.VUE.HEIGHT = vue.offsetHeight - 2 * CONST.VUE.PADDING;
CONST.VUE.WIDTH = vue.offsetWidth - 2 * CONST.VUE.PADDING;

var svg = d3.select("#vue")
        .append("svg")
        .attr("width", CONST.VUE.WIDTH)
        .attr("height", CONST.VUE.HEIGHT);
var pie = d3.pie();
var nbthemes;
CONST.ALLTHEMELIST = [];
CONST.ALLDATAFILTRE = [];
CONST.ALLPIEZEDDATA = [];
CONST.STROKEWIDTH = 4;
var datafiltre;
var piedata;
var arc;
var arcs;
var outerRadius = CONST.VUE.WIDTH/10;
var setDefaultTheme;
// Nombre de lobbyists restants
var nbloby;
// Tableau recensant les nbloby successifs : utile pour accéder aux éléments graphiques dont la référence a été perdue
var tabnbloby;
// Tableau référençant les thèmes : utile pour la transmission au réseau par URL
var idToTheme;

function writeTextInSection (i){
  var element = d3.select("#sec"+i);
  element.select("h1").html(CONST.SCENARIO[i-1]["Titre"]);
  element.select("p.texte").html(CONST.SCENARIO[i-1]["Texte"])
  element.select("p.appel").html(CONST.SCENARIO[i-1]["Appel d’action"])
}

function getFullName(x){
  if (x["Nom2"]){
    return x["Nom2"]
  } else {
    return x["Nom1"]
  }
}

function valueNAN(x){
  if (x==="NaN" || x==="" || x===NaN){
    return "Non renseigné";
  } else {
    return x;
  }
}


d3.csv("data/Index/Scenario.csv", function (data){

  CONST.SCENARIO = data;

  // On écrit les textes des sections 1 2 3 et 4
  for (var i=1; i<6; i++){
    writeTextInSection(i);
  }

});

d3.csv("data/nomsDeploye27juillet.csv", function (data){

  CONST.NOMSDEPLOYES = {};
  for (var i=0; i<data.length; i++){
    CONST.NOMSDEPLOYES[data[i]["Par défaut"]] = data[i]["Déployé (i)"]
  }

});

d3.csv("data/Noeud27juillet.csv", function (data){
  CONST.DATASET=data;
  // Chargé de conserver des données filtrées intermédiaires, en cas de sauts successifs d'étapes
  CONST.AUXDATASET = CONST.DATASET;
  datafiltre=CONST.DATASET.slice();
  CONST.ALLDATAFILTRE.push(datafiltre.slice());
  nbloby = CONST.DATASET.length;
  tabnbloby=[nbloby];
  console.log(CONST.DATASET);

  // On doit charger ici les données pour la première étape en section 5

  // On cherche la liste des thèmes
  // Par élimination, chaque ligne correspond à 
  // l'élimination d'un attribut qui n'est pas un thème
  // climatique. 
  CONST.ALLTHEMELIST[0] = Object.keys(data[0]);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("ID"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Lobby ID"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Nom2"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Nom1"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Pays/Région"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Type"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Secteurs d’activité"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Dépenses Lobby (€)"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Personnes impliquées"), 1);
  CONST.ALLTHEMELIST[0].splice(CONST.ALLTHEMELIST[0].indexOf("Equivalent Temps plein"), 1);
  console.log(CONST.ALLTHEMELIST[0]);
  idToTheme = CONST.ALLTHEMELIST[0].slice();

  
  // On cherche le nombre d'acteurs qui se sont prononcés sur chaque thème
  nbthemes = CONST.ALLTHEMELIST[0].length;
  piedata = [];
  for (var i=0; i<nbthemes; i++){
    var somme = 0;
    for (var j=0; j<data.length; j++){
      // Utilisation du truthy falsy
      if (data[j][CONST.ALLTHEMELIST[0][i]]){
        somme++;
      }
    }
    piedata[i] = somme;
  }
  console.log(piedata);
  CONST.ALLPIEZEDDATA.push(pie(piedata));
  console.log(CONST.ALLPIEZEDDATA[0]);

  // On charge les éléments graphiques du choix 1
  setupFicheQuestion();
  // Les parts de cammenbert sont des arcs d'innerRadius 0
  arc = d3.arc()
                .innerRadius(0)
                .outerRadius(outerRadius);

  CONST.QUEST.ARCS.push(svg.selectAll("g.arc")
          .data(CONST.ALLPIEZEDDATA[0])
          .enter()
          .append("g")
          .attr("class", function (d,i){
            return "arc cercle"+i+" "+"loby"+0+" cercle"+i+"loby"+0;
          })
          .attr("transform", function (d,i){
            var angle = 0.5 * (CONST.ALLPIEZEDDATA[0][i].startAngle + CONST.ALLPIEZEDDATA[0][i].endAngle);
            if (angle>Math.PI){
              return "translate("+(0.5*CONST.VUE.WIDTH+0.2*CONST.VUE.WIDTH*Math.sin(angle))+", "+(0.5*CONST.VUE.HEIGHT+(-0.2*CONST.VUE.HEIGHT*Math.cos(angle)))+")"    
            } else {
              return "translate("+(0.5*CONST.VUE.WIDTH+0.15*CONST.VUE.WIDTH*Math.sin(angle))+", "+(0.5*CONST.VUE.HEIGHT+(-0.15*CONST.VUE.HEIGHT*Math.cos(angle)))+")"
            }
            
          })
          .attr("opacity", 0)
          );

  CONST.QUEST.ARCS[0].append("path")
    .attr("d", arc)
    .attr("d", arc.endAngle(function (d){
      return d.endAngle + 2*Math.PI;
    }))
    .attr("d", arc.outerRadius(function (d){
      return (1-0.2*(1/scalablesize(0,d.data)))*outerRadius;
    }))
    .attr("fill", function (d,i){
      return color(i);
    })
    .attr("stroke", "#111627")
    .attr("stroke-width", 4);

  CONST.QUEST.ARCS[0].append("foreignObject")
    .attr("class", "arctext")
    .attr("width", CONST.HOVERTEXT.width)
    .attr("height", CONST.HOVERTEXT.height)
    .attr("transform", function (d,i) {
          var string = "translate(";
          var angle = 0.5 * (CONST.ALLPIEZEDDATA[0][i].startAngle + CONST.ALLPIEZEDDATA[0][i].endAngle);
          var textpos = this.getBoundingClientRect();
                    // attention position                 // position initiale du dernier quart
          if ((angle>Math.PI) && (d.index>4) && (d.index===CONST.ALLPIEZEDDATA[0].length-1) && (choices.length!==0)){
            string += ((coefeloign(0,d)-0.4) * outerRadius * Math.sin(angle));
          } else if (angle>Math.PI){
            string += ((coefeloign(0,d)-0.4) * outerRadius * Math.sin(angle) - 0.6*textpos.right + 0.6*textpos.left);
          } else {
            string += ((coefeloign(0,d)-0.4) * outerRadius * Math.sin(angle));
          }
          string += ', ';
          string += (-(coefeloign(0,d)-0.4) * outerRadius * Math.cos(angle));
          string += ")";
          return string;
    })
    .html(function (d,i){
      return "<p>"+CONST.ALLTHEMELIST[0][i]+"</p><img src='img/i.svg' class='information'/>"
    });
    svg.selectAll("g.arc").style("display", "none")

});