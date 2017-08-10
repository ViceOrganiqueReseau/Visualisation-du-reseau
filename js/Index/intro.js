// Largeur de la plage de scroll en pixels
var scrollheight = 870;
// Durée des transitions
CONST.TIMETRANSITION = 500;
// le scrollborder de alpha
CONST.ALPHALIM = 0.025;

// Une fonction utile pour les interpolations
function abTo01(a,b,x){
  return (x-a)/(b-a);
}

// Création des données de la figure initiale
CONST.strokewidth = 8;
CONST.FIGINIT = {};
CONST.FIGINIT.textpadding = 11;
CONST.FIGINIT.RECT = {};
CONST.FIGINIT.RECT.x = 0.3*CONST.VUE.WIDTH;
CONST.FIGINIT.RECT.y = 0.15*CONST.VUE.HEIGHT;
CONST.FIGINIT.RECT.width = CONST.VUE.WIDTH;
CONST.FIGINIT.RECT.height = CONST.VUE.HEIGHT;
CONST.FIGINIT.TITRE = {
  x: function (){
         var textpos = this.getBoundingClientRect();
         return 0.4*CONST.FIGINIT.RECT.width - (textpos.right - textpos.left)/2
       }, 
  y: 0.4*CONST.FIGINIT.RECT.height, 
  class: "Initfig Titre",
  text: "Vi(c)e Organique"
}
CONST.FIGINIT.POINTS = [
  {
    x: 0.4*CONST.FIGINIT.RECT.width,
    y: 0.65*CONST.FIGINIT.RECT.height,
    dx: 30,
    dy: -20,
    text: "Lobby"
  }, 
  {
    x: 0.15*CONST.FIGINIT.RECT.width,
    y: 0.56*CONST.FIGINIT.RECT.height,
    dx: 60,
    dy: -5,
    text: "Réseau"
  }, 
  {
    x: 0.35*CONST.FIGINIT.RECT.width,
    y: 0.2*CONST.FIGINIT.RECT.height,
    dx: 0,
    dy: 10,
    text: "Climat"
  }, 
  {
    x: 0.6*CONST.FIGINIT.RECT.width,
    y: 0.59*CONST.FIGINIT.RECT.height,
    dx: -5,
    dy: -5,
    text: "Europe"
  }
];


function createInitFigure (){
  CONST.FIGINIT.D3 = svg.append("svg")
                  .attr("class", "Initfig")
                  .attr("x", 0.33*CONST.VUE.WIDTH)
                  .attr("y", 0.4*CONST.VUE.HEIGHT)
                  .attr("width", CONST.FIGINIT.RECT.width)
                  .attr("height", CONST.FIGINIT.RECT.height)
  CONST.FIGINIT.D3.append("rect")
                  .attr("class", "fond")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", CONST.FIGINIT.RECT.width)
                  .attr("height", CONST.FIGINIT.RECT.height)
                  .attr("stroke-width", CONST.strokewidth)
                  .attr("stroke", "#111627")
                  .attr("fill", "rgb(176,176,176)")//fiche intro
  for (var i=0; i<4; i++){
    for (var j=i+1; j<4; j++){
      CONST.FIGINIT.D3.append("line")
                    .attr("class", "initline")
                    .attr("x1", CONST.FIGINIT.POINTS[i].x + CONST.FIGINIT.POINTS[i].dx)
                    .attr("x2", CONST.FIGINIT.POINTS[j].x + CONST.FIGINIT.POINTS[j].dx)
                    .attr("y1", CONST.FIGINIT.POINTS[i].y + CONST.FIGINIT.POINTS[i].dy)
                    .attr("y2", CONST.FIGINIT.POINTS[j].y + CONST.FIGINIT.POINTS[j].dy)
                    .attr("stroke", "#111627")
    }
  }
  for (var i=0; i<4; i++){
    var element = CONST.FIGINIT.D3.append("text")
                    .attr("class", "texte")
                    .attr("x", CONST.FIGINIT.POINTS[i].x)
                    .attr("y", CONST.FIGINIT.POINTS[i].y)
                    .text(CONST.FIGINIT.POINTS[i].text);
    CONST.FIGINIT.D3.append("rect")
                    .attr("x", element.attr("x")-CONST.FIGINIT.textpadding)
                    .attr("y", element.attr("y")-CONST.FIGINIT.textpadding-17)
                    .attr("width", function (){
                      var textpos = element.node().getBoundingClientRect();
                      return textpos.right - textpos.left + 2*CONST.FIGINIT.textpadding;
                    })
                    .attr("height", function (){
                      var textpos = element.node().getBoundingClientRect();
                      return textpos.bottom - textpos.top + 2*CONST.FIGINIT.textpadding;
                    })
                    .attr("stroke-width", CONST.strokewidth)
                    .attr("stroke", "#111627")
                    .attr("fill", "rgba(255,255,255,0)")
  }
  CONST.FIGINIT.D3.append("text")
                  .attr("class", "titre")
                  .attr("x", CONST.FIGINIT.TITRE.x)
                  .attr("y", CONST.FIGINIT.TITRE.y)
                  .text(CONST.FIGINIT.TITRE.text)
  
}

function displayInitFigure (){
  if (currentIndex===0){
    // Rien
  } else {
    // On n'affiche pas le texte SCROLL
    d3.select(window).on("click", function (){})
  }
}

// Création du texte SCROLL
function createScrollText (){
  CONST.SCROLL = {
    text: "SCROLL !",
    x: 0.05*CONST.VUE.WIDTH,
    y: 0.85*CONST.VUE.HEIGHT
  };
  CONST.SCROLL.D3 = svg.append("text")
                      .attr("class", "scroll")
                      .text(CONST.SCROLL.text)
                      .attr("x", CONST.SCROLL.x)
                      .attr("y", CONST.SCROLL.y)
                      // 1138 est la taille de VUE sur mon navigateur en plein écran, dans ce cas -> taille 200
                      .attr("font-size", Math.round(200*CONST.VUE.WIDTH/1138)+"px")
                      .attr("opacity", 0)
  
  d3.select(window).on("click", function (){
    if (document.body.scrollTop===0){
      CONST.SCROLL.D3.attr("opacity", 1);
    }
    d3.select(window).on("click", function (){})
    d3.select(window).on("scroll.scroller", function (){
      CONST.SCROLL.D3.remove();
      position();
    })
  })
}

// Section 1 : Données sur les éléments de positionnement
// de la Fiche
CONST.FICHE = {};
CONST.FICHE.width = 0.45*CONST.VUE.WIDTH; 
CONST.FICHE.height = 0.9*CONST.VUE.HEIGHT;  // A ajuster pour la taille de la fiche
// L'écart de taille : utile pour le scroll
CONST.FICHE.TOPPOS = 20;
var deltay = CONST.FICHE.height - CONST.VUE.HEIGHT;
CONST.FICHE.COMMISSION = {};
CONST.FICHE.COMMISSION.dx = 0.5*CONST.FICHE.width;
CONST.FICHE.COMMISSION.dy = 0.23*CONST.FICHE.height;
CONST.FICHE.COMMISSION.width = 175*CONST.FICHE.height/763; // oui c'est bien height*155/763 !
CONST.FICHE.COMMISSION.height = 175*CONST.FICHE.height/763;
CONST.FICHE.CONSULTATION = {};
CONST.FICHE.CONSULTATION.dx = 0.5*CONST.FICHE.width;
CONST.FICHE.CONSULTATION.dy = 0.37*CONST.FICHE.height;
CONST.FICHE.CONSULTATION.width = CONST.FICHE.COMMISSION.width;
CONST.FICHE.CONSULTATION.height = CONST.FICHE.COMMISSION.height;
CONST.FICHE.FLECHE = {};
CONST.FICHE.FLECHE.dx = 0.5*CONST.FICHE.width;
CONST.FICHE.FLECHE.dy = 0.535*CONST.FICHE.height;
CONST.FICHE.FLECHE.width = CONST.FICHE.COMMISSION.width;
CONST.FICHE.FLECHE.height = CONST.FICHE.COMMISSION.height;
CONST.FICHE.ORGS = {};
CONST.FICHE.ORGS.dx = 0.5*CONST.FICHE.width;
CONST.FICHE.ORGS.dy = 0.685*CONST.FICHE.height;
CONST.FICHE.ORGS.width = 2*CONST.FICHE.COMMISSION.width;
CONST.FICHE.ORGS.height = 2*CONST.FICHE.COMMISSION.height;


function setupFiche(){
  CONST.FICHE.D3 = svg.append("g")
      .attr("class", "FICHE")
  CONST.FICHE.D3.append("rect")
      .attr("class", "fiche")
      .attr("x", 0.5*CONST.VUE.WIDTH - 0.5*CONST.FICHE.width)
      .attr("y", 0.9*CONST.VUE.HEIGHT)
      .attr("width", CONST.FICHE.width)
      .attr("height", CONST.FICHE.height)
      .attr("stroke-width", CONST.strokewidth)
      .attr("stroke", "#111627")
      .attr("fill", "rgb(209,213,235)")//fiche consultation
  CONST.FICHE.D3.append("image")
      .attr("class", "commission")
      .attr("x", Number(CONST.FICHE.D3.select("rect").attr("x"))+CONST.FICHE.COMMISSION.dx - 0.5*CONST.FICHE.COMMISSION.width)
      .attr("y", CONST.FICHE.COMMISSION.dy - 0.5*CONST.FICHE.COMMISSION.height)
      .attr("href", "img/Commission.svg")
      .attr("width", CONST.FICHE.COMMISSION.width)
      .attr("height", CONST.FICHE.COMMISSION.height)
      .attr("opacity", 0);
  CONST.FICHE.D3.append("image")
      .attr("class", "consultation")
      .attr("x", Number(CONST.FICHE.D3.select("rect").attr("x"))+CONST.FICHE.CONSULTATION.dx - 0.5*CONST.FICHE.CONSULTATION.width)
      .attr("y", CONST.FICHE.CONSULTATION.dy - 0.5*CONST.FICHE.CONSULTATION.height)
      .attr("href", "img/Consultation.svg")
      .attr("width", CONST.FICHE.CONSULTATION.width)
      .attr("height", CONST.FICHE.CONSULTATION.height)
      .attr("opacity", 0);
  CONST.FICHE.D3.append("image")
      .attr("class", "fleche")
      .attr("x", Number(CONST.FICHE.D3.select("rect").attr("x"))+CONST.FICHE.FLECHE.dx - 0.5*CONST.FICHE.FLECHE.width)
      .attr("y", CONST.FICHE.FLECHE.dy - 0.5*CONST.FICHE.FLECHE.height)
      .attr("href", "img/fleche.svg")
      .attr("width", CONST.FICHE.FLECHE.width)
      .attr("height", CONST.FICHE.FLECHE.height)
      .attr("opacity", 0);
  CONST.FICHE.D3.append("image")
      .attr("class", "organisation")
      .attr("x", Number(CONST.FICHE.D3.select("rect").attr("x"))+CONST.FICHE.ORGS.dx - 0.5*CONST.FICHE.ORGS.width)
      .attr("y", CONST.FICHE.ORGS.dy - 0.5*CONST.FICHE.ORGS.height)
      .attr("href", "img/Organisation.svg")
      .attr("width", CONST.FICHE.ORGS.width)
      .attr("height", CONST.FICHE.ORGS.height)
      .attr("opacity", 0);
}

// Création du badge
CONST.BADGE = {};
CONST.BADGE.width = 0.1*CONST.VUE.WIDTH;
CONST.BADGE.height = 2*CONST.BADGE.width;
CONST.BADGE.x = 0.13*CONST.VUE.WIDTH - 0.5*CONST.BADGE.width;
CONST.BADGE.y = 0*CONST.VUE.HEIGHT;  // Initialement en 1.1*CONST.VUE.HEIGHT
CONST.BADGE.TOPPOS = 80;
var deltay2 = 1.1*CONST.VUE.HEIGHT - CONST.BADGE.y;
CONST.BADGE.TEXT = {};
CONST.BADGE.TEXT.dx = 0.5*CONST.BADGE.width;
CONST.BADGE.TEXT.dy = 0.15*CONST.BADGE.height;
CONST.BADGE.TEXT.texte = ["Vous", "êtes", "lobbyiste"]
CONST.BADGE.TEXT.textpadding = 25;
CONST.BADGE.POINT = {};
CONST.BADGE.POINT.radius = 45;
CONST.BADGE.POINT.dx = 0.5*CONST.BADGE.width - CONST.BADGE.POINT.radius/2;
CONST.BADGE.POINT.dy = 0.71*CONST.BADGE.height - CONST.BADGE.POINT.radius/2;

// Initialise le badge
function setupBadge(){
  CONST.BADGE.D3 = svg.append("svg")
                      .attr("class", "BADGE")
                      .attr("x", CONST.BADGE.x)
                      .attr("y", deltay2+CONST.BADGE.y)
                      .attr("width", CONST.BADGE.width)
                      .attr("height", CONST.BADGE.height)
  CONST.BADGE.D3.append("rect")
                .attr("class", "badge")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", CONST.BADGE.width)
                .attr("height", CONST.BADGE.width)
                .attr("stroke-width", CONST.strokewidth)
                .attr("stroke", "#111627")
  var textelem = CONST.BADGE.D3.append("text")
                .attr("x", 0)
                .attr("y", CONST.BADGE.TEXT.dy)
  for (var i=0; i<CONST.BADGE.TEXT.texte.length; i++){
    textelem.append("tspan")
            .text(CONST.BADGE.TEXT.texte[i])
            .attr("x", CONST.BADGE.TEXT.dx)
            .attr("y", CONST.BADGE.TEXT.dy + i*CONST.BADGE.TEXT.textpadding)
            .attr("font-weight", "bold")
  }
  CONST.BADGE.D3.append("rect")
                .attr("class", "badge")
                .attr("x", 0)
                .attr("y", CONST.BADGE.width)
                .attr("width", CONST.BADGE.width)
                .attr("height", CONST.BADGE.width)
                .attr("stroke-width", CONST.strokewidth)
                .attr("stroke", "#111627")
  CONST.BADGE.D3.append("image")
                .attr("x", 0)
                .attr("y", CONST.BADGE.width)
                .attr("width", CONST.BADGE.width)
                .attr("height", CONST.BADGE.width)
                .attr("href", "img/silhouette.svg")
  svg.append("image")
                .attr("class", "point")
                .attr("x", CONST.BADGE.POINT.dx + Number(CONST.BADGE.D3.attr("x")))
                .attr("y", CONST.BADGE.POINT.dy + Number(CONST.BADGE.D3.attr("y")))
                .attr("width", CONST.BADGE.POINT.radius)
                .attr("height", CONST.BADGE.POINT.radius)
                .attr("href", "img/svg-24.svg");
}

CONST.QUEST = {};
CONST.QUEST.FICHE = {};
CONST.QUEST.FICHE.width = 0.9*CONST.VUE.WIDTH;
CONST.QUEST.FICHE.height = 0.9*CONST.VUE.HEIGHT;
CONST.QUEST.FICHE.y = 50;
// Destinée à accueillir les sélections vers les parts
CONST.QUEST.ARCS = [];
CONST.QUEST.TEXT = {};
CONST.QUEST.TEXT.width = 100;
CONST.QUEST.TEXT.height = 150;

// On crée la fiche pour le quesionnaire
function setupFicheQuestion (){
  CONST.QUEST.D3 = svg.append("g")
                    .attr("class", "quest");
  CONST.QUEST.D3.append("rect")
                .attr("class", "fiche")
                .attr("x", 0.5*CONST.VUE.WIDTH - 0.5*CONST.QUEST.FICHE.width)
                .attr("y", 0.95*CONST.VUE.HEIGHT)
                .attr("width", CONST.QUEST.FICHE.width)
                .attr("height", CONST.QUEST.FICHE.height)
                .attr("stroke-width", CONST.strokewidth)
                .attr("stroke", "#111627")
                .attr("fill", "rgb(189,198,206)"); // fiche questions
}
// L'appel à cette fonction se fait au cours su chargement des données dans importdata.js

function moveFiche(y){
  CONST.FICHE.D3.select(".fiche")
                  .attr("y", y);
  CONST.FICHE.D3.select(".commission")
                  .attr("y", y + CONST.FICHE.COMMISSION.dy - 0.5*CONST.FICHE.COMMISSION.height);
  CONST.FICHE.D3.select(".consultation")
                  .attr("y", y + CONST.FICHE.CONSULTATION.dy - 0.5*CONST.FICHE.CONSULTATION.height);
  CONST.FICHE.D3.select(".fleche")
                  .attr("y", y + CONST.FICHE.FLECHE.dy - 0.5*CONST.FICHE.FLECHE.height);
  CONST.FICHE.D3.select(".organisation")
                  .attr("y", y + CONST.FICHE.ORGS.dy - 0.5*CONST.FICHE.ORGS.height);
}

function setFicheOpacity(classe, e){
  CONST.FICHE.D3.select(classe).attr("opacity", e);
}

function moveBadge(y){
  CONST.BADGE.D3.attr("y", CONST.BADGE.y + y);
  svg.select(".point").attr("y", CONST.BADGE.POINT.dy + Number(CONST.BADGE.D3.attr("y")));
}

// On gère la montée de la figure
function manageFigSec0 (pos){
  var startsection = 0;
  var alpha = 3*(pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 1
  var alphasteps = [0,1]
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
    d3.select("svg.Initfig").attr("y", 0.4*CONST.VUE.HEIGHT)
  } else if (alpha<=1){
    d3.select("svg.Initfig").attr("y", 0.4*CONST.VUE.HEIGHT - alpha*(0.4*CONST.VUE.HEIGHT-CONST.FIGINIT.RECT.y))
  } else {
    d3.select("svg.Initfig").attr("y", CONST.FIGINIT.RECT.y)
  }

}

// On gère la fiche aux sections 1 et 2
function manageFicheSec1 (pos){
  var startsection = sectionPositions[0];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 1
  var alphasteps = [0,0.33,0.66,1]
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
    // On s'assure qu'il ne reste plus rien
    setFicheOpacity("image", 0);
  } else if (alpha<=alphasteps[1]){
    var beta = abTo01(0,alphasteps[1],alpha)
    // On déplace la fiche
    moveFiche((1-beta)*CONST.VUE.HEIGHT);
    setFicheOpacity("image", 1);
    // On s'assure que l'élément suivant est invisible
    setFicheOpacity("image.commission", 0);
  } else if (alpha<=alphasteps[2]){
    // On s'assure que le précédent est visible
    moveFiche(0);
    // On affiche commission Européenne
    var beta = abTo01(alphasteps[1], alphasteps[2], alpha);
    setFicheOpacity("image.commission", beta);
    // On s'assure que le suivant est invisible
    setFicheOpacity("image.consultation", 0);
  } else if (alpha<=1){
    // On s'assure que le précédent est visible
    setFicheOpacity("image.commission", 1);
    // On affiche consultation
    var beta = abTo01(alphasteps[2],1,alpha);
    setFicheOpacity("image.consultation", beta);
  } else {
    // On s'assure que le précédent est visible
    setFicheOpacity("image.consultation", 1);
  }
}

function manageFicheSec2 (pos){
  var startsection = sectionPositions[1];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 2
  var alphasteps = [0,0.1,1];
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
            
  } else if (alpha<=alphasteps[1]){
    // Utilisation de l'écart de taille deltay pour la position de la fiche
    var beta = abTo01(0,alphasteps[1],alpha);
    // On s'assure que les suivants sont invisibles
    setFicheOpacity(".fleche", 0);
    setFicheOpacity(".organisation", 0);
  } else if (alpha<=1){
    // On affiche les flèches et les cercles
    var beta = abTo01(alphasteps[1],1,alpha);
    setFicheOpacity(".fleche", beta);
    setFicheOpacity(".organisation", beta);
  } else {
    // On s'assure que les éléments de fin sont visibles
    setFicheOpacity(".fleche", 1);
    setFicheOpacity(".organisation", 1)
  }
}

// On gère la fiche et le badge aux sections 3 et 4
function manageFicheBadgeSec3 (pos){
  var startsection = sectionPositions[2];
  var alpha = (pos - startsection)/scrollheight;
  // Définir ici les alphasteps de la section 3
  var alphasteps = [0,0.8,1];
  for (var i=0; i<alphasteps.length; i++){
    if ((Math.abs(alpha-alphasteps[i])<=CONST.ALPHALIM)){
      alpha = alphasteps[i];
    }
  }
  if (alpha<=0){
    // On restaure l'état initial, position de la fiche et du badge
  } else if (alpha<=alphasteps[1]){
    // On scroll la fiche et le badge
    var beta = abTo01(0,alphasteps[1],alpha);
    moveBadge(deltay2*(1-beta));
  } else {
    // On s'assure que la fiche et le badge sont au bon endroit
    // On scroll la fiche et le badge
        // Attention, c'est l'attribut y de .badge qui sert de référence ici, pas de deltay2 partout !
    CONST.BADGE.D3
                  .attr("y", CONST.BADGE.y);
 // On ne réinitialise pas le point car ça fait foirer la section qui suit
  }
}

function moveBlackPoint (move){
    if (move===0){ // Le point est la fiche, on le ramène sur le badge
      svg.select(".point")
                  .transition()
                  .duration(CONST.TIMETRANSITION)
                  .attr("x", CONST.BADGE.POINT.dx + Number(CONST.BADGE.D3.attr("x")))
                  .attr("y", CONST.BADGE.POINT.dy + Number(CONST.BADGE.D3.attr("y")))
                  .attr("width", CONST.BADGE.POINT.radius)
                  .attr("height", CONST.BADGE.POINT.radius);
    } else if (move===1){ // Le point est sur le badge, on l'emmene sur la fiche
      svg.select(".point")
                  .transition()
                  .duration(4*CONST.TIMETRANSITION)
                  .attr("x", Number(CONST.FICHE.D3.select(".fiche").attr("x"))+0.49*CONST.FICHE.width)
                  .attr("y", Number(CONST.FICHE.D3.select(".fiche").attr("y"))+0.713*CONST.FICHE.height)
                  .attr("width", 15)
                  .attr("height", 15);
    } else {
      console.log("erreur sur l'argument r, relisez le code !")
    }
}

// Transition section 3 - 4
function manageBadgeSec4 (){
  if (prevIndex===3 && currentIndex===4){
    // On déplace le point sur la fiche
    moveBlackPoint(1);
    // On écrit la fonction
    d3.select("tr.fonction").style("display", "table-row").selectAll("th, td").style("color", colorlastanswer);
  } else if (prevIndex===4 && currentIndex===3){
    // On déplace le point sur le badge
    moveBlackPoint(0);
    // On retire le answers
    d3.select("tr.fonction").style("display", "none");
  }
}

// Appels à faire au début
createInitFigure();
setupFiche();
setupBadge();
createScrollText();