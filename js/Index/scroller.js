// Initialisation de l'indice de section active
var sectionlist;
var currentIndex = -1;
var sectionPositions;
var maxindex;

majsectionspos();
position();
console.log(sectionPositions)

function majsectionspos(){
  sectionlist = d3.select("#sections").selectAll("section");
}


// Détermine notre position sur la page et adapte la vue. 
function position() {
  // On obtient les positions des différentes sections
  sectionPositions = [];
  var startPos;
  sectionlist.each(function (d,i) {
    var top = this.getBoundingClientRect().top;
    if(i === 0) {
      startPos = top;
    }
    // Le décalage de 350 permet d'ajuster les sections lors du scroll
    sectionPositions.push(350 + top - startPos);
  });
  maxindex = sectionPositions.length-1;

  // Repérage de la position sur la page
  var pos = window.pageYOffset;
  // On détermine la section active
  var sectionIndex = d3.bisect(sectionPositions, pos);
  sectionIndex = Math.min(sectionlist.size() - 1, sectionIndex);
  // Si on change la section active
  if (currentIndex !== sectionIndex) {
    // Mise à jour de la section active
    currentIndex = sectionIndex;
    // Mise en place des modifications de la vue : changement de couleur
    majvue.call(this, sectionIndex);
  }
  scrollAnim(currentIndex, pos);
  hoverize();
  clickable();
  visiblelink();
}

// Fonction à appeler pour mettre la vue à jour
// argument index : indice de la nouvelle section
function majvue(index) {
	//displayPie();
}

function scrollAnim(index, pos) {
  if (nbloby===1){
    displayResult(pos);
  } // Index 1 thème
  else if (index===1){
    scrollAnimPie(index, pos);
  } // Index 2 transition thème - position
  else if (index===2){
    scrollTransitPie(index, pos);
  } // Index 3 position
  else if (index===3){
    scrollAnimPie(index, pos);
  } // Index 4 transition position - type
  else if (index===4){
    scrollTransitPie(index, pos);
  } // Index 5 type
  else if (index===5){
    scrollAnimPie(index, pos);
  } // Index 6 transition type - secteur
  else if (index===6){
    scrollTransitPie(index, pos);
  } // Index 7 secteur
  else if (index===7){
    scrollAnimPie(index, pos);
  } // Index 8 transition Secteur - Country
  else if (index===8){
    scrollTransitPie(index, pos);
  } // Index 9 Country
  else if (index===9){
    scrollAnimPie(index, pos);
  } // Index 10 transition Country Name
  else if (index===10){
    scrollTransitPie(index, pos);
  } // Index 11 Name
  else if (index===11){
    scrollAnimPie(index, pos);
  }
}

// On déclenche la fonction position à chaque scroll de la page
d3.select(window)
  .on("scroll.scroller", position);