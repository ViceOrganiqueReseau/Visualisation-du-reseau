// Couleur des liens
var linkcolor;

// Couleur du lobbyist choisi
var usercolor;
var usercolorhalo;

// Couleur des alliés
var allycolor;
var allycolorhalo;

// Couleur des ennemis
var ennemycolor;
var ennemycolorhalo;

// Les fonctions qui renvoient les couleurs
var colornode;
var colorhalo;

function setcolor(){
	linkcolor = "red";
	usercolor = "rgb(0,255,165)";
	usercolorhalo = "rgba(0,255,165,0.3)";
	allycolor = "rgb(0,165,255)";
	allycolorhalo = "rgba(0,165,255,0.3)";
	ennemycolor = "rgb(255,165,0)";
	ennemycolorhalo = "rgba(255,165,0,0.3)";

	// La fonction qui à un noeud associe sa couleur
	colornode = function (d){
		if (d===lobyist){
			return usercolor;
		} else if (d[theme]===lobyist[theme]) {
			return allycolor;
		} else {
			return ennemycolor;
		}
	}

	// La fonction qui à un noeud associe la couleur du halo
	colorhalo = function (d){
		if (d===lobyist){
			return usercolorhalo;
		} else if (d[theme]===lobyist[theme]) {
			return allycolorhalo;
		} else {
			return ennemycolorhalo;
		}
	}
}
