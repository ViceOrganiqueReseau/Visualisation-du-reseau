// Initialisation des variables gérant le scroll
// liste des sections
var sectionlist;
// Indice de la section active
var currentIndex = -1;
// Positions des différentes sections sur la page
var sectionPositions;

// Mise à jour des positions dès le chargement de la page
majsectionspos();
// Adapte la vue à la position initiale au chargement de la page
position();

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
function position() {

  // Repérage de la position sur la page
  var pos = window.pageYOffset;
  // On détermine la section active
  var sectionIndex = d3.bisect(sectionPositions, pos);
  sectionIndex = Math.min(sectionlist.size() - 1, sectionIndex);
  // Si on change la section active
  if (currentIndex !== sectionIndex) {
    // Mise à jour de l'indice de section active
    currentIndex = sectionIndex;
    // Mise en place des modifications de la vue : changement de couleur
    majvue.call(this, sectionIndex);
  }
  scrollAnim();
}

// Fonction à appeler pour mettre la vue à jour
// argument index : indice de la nouvelle section
function majvue(index) {
  // Modifications lors d'un changement de section
  // Changement de la couleur de fond pour la demo et pour aider au dev
    if (index%2===0){
        d3.select("#vue").style("background-color", "rgb(0, 6, 35)");
    } else {
        d3.select("#vue").style("background-color", "rgb(0, 10, 61)");
    }
}

// Mettre dans cette fonction les transitions qui s"alignent sur le scroll utilisateur
// argument index : indice de la section active
// argument pos : position sur la page
// sectionPositions : liste des positions des sections (décalées pour permettre un scroll précis)
function scrollAnim(index, pos) {
  
}

// On déclenche la fonction position à chaque scroll de la page
d3.select(window)
  .on("scroll.scroller", position);