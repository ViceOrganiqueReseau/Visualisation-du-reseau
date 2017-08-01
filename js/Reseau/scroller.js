// Initialisation des variables gérant le scroll
// liste des sections
var sectionlist;
// Indice de la section active
var currentIndex = 0;
var prevIndex = 0;
// Positions des différentes sections sur la page
var sectionPositions;

// Mise à jour des positions dès le chargement de la page
majsectionspos();
// Adapte la vue à la position initiale au chargement de la page
//position();

// Met à jour les positions de toutes les sections sur la page
// Utile lors de la création de sections notamment
function majsectionspos(){
  sectionlist = d3.select("#sections").selectAll("section");

  // On obtient les positions des différentes sections
  sectionPositions = [];
  var startPos;
  sectionlist.each(function (d,i) {
    var top = this.getBoundingClientRect().top;
    if(i === 0) {
        // Calcul de la position de la section 0
      startPos = top;
    }
    // Le décalage de 350 permet d'ajuster les sections lors du scroll
    sectionPositions.push(350 + top - startPos);
  });
}


// Détermine notre position sur la page et adapte la vue. 
function position(simulation) {

  // Repérage de la position sur la page
  var pos = window.pageYOffset;
  // On détermine la section active
  var sectionIndex = d3.bisect(sectionPositions, pos);
  sectionIndex = Math.min(sectionlist.size() - 1, sectionIndex);
  // Si on change la section active
  if (currentIndex !== sectionIndex) {
    // Mise à jour de l'indice de section active
    prevIndex = currentIndex;
    currentIndex = sectionIndex;
    console.log("Section : "+currentIndex);
    // Mise en place des modifications de la vue : changement de couleur
    majvue.call(this, simulation, sectionIndex, prevIndex);
  }
  scrollAnim();
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight){
    displaylinksEnd();
  } else {
    invisiblelinks();
  }
}

// Fonction à appeler pour mettre la vue à jour
// argument index : indice de la nouvelle section
function majvue(simulation, index, preced) {
  // Modifications lors d'un changement de section
  if (preced===index-1 && index<=6){
    // On affiche la section suivante
    simulation.nextSection();
  } else if (preced===index+1 && index<=6){
    // On retourne à la section précédente
    simulation.previousSection();
  }
  if (index===7){
    d3.select("div.menu").style("display", "block");
    if (!getUserChoice().lobbyist){
      d3.select("img#bestallyworstrival").style("display", "none");
    }
  } else {
    d3.select("div.menu").style("display", "none");
  }
}

// Mettre dans cette fonction les transitions qui s"alignent sur le scroll utilisateur
// argument index : indice de la section active
// argument pos : position sur la page
// sectionPositions : liste des positions des sections (décalées pour permettre un scroll précis)
function scrollAnim(index, pos) {
  
}

// On déclenche la fonction position à chaque scroll de la page : dans le fichier experimentation pour avoir accès à simulation
