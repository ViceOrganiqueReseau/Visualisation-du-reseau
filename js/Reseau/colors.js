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

// Si aucun lobyist choisi
var supportcolor;
var opposecolor;
var supportcolorhalo;
var opposecolorhalo;

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
	supportcolor = "rgb(0,255,0)";
	opposecolor = "rgb(165,165,165)";
	supportcolorhalo = "rgba(0,255,0,0.3)";
	opposecolorhalo = "rgba(165,165,165,0.3)";

	// La fonction qui à un noeud associe sa couleur
	colornode = function (d){
		if (lobyist && lobyist[theme]){
			// Si un lobyist est choisi par l'utilisateur
			// On représente selon alliés/ennemis
			if (d===lobyist){
				return usercolor;
			} else if (d[theme]===lobyist[theme]) {
				return allycolor;
			} else {
				return ennemycolor;
			}
		} else {
			// Sinon, SUPPORT en vert OPPOSE en gris
			if (d[theme]==="SUPPORT"){
				return supportcolor;
			} else {
				return opposecolor;
			}
		}
		
	}

	// La fonction qui à un noeud associe la couleur du halo
	colorhalo = function (d){
		if (lobyist && lobyist[theme]){
			// Si un lobyist est choisi par l'utilisateur
			// On représente selon alliés/ennemis
			if (d===lobyist){
				return usercolorhalo;
			} else if (d[theme]===lobyist[theme]) {
				return allycolorhalo;
			} else {
				return ennemycolorhalo;
			}
		} else {
			// Sinon, SUPPORT en vert OPPOSE en gris
			if (d[theme]==="SUPPORT"){
				return supportcolorhalo;
			} else {
				return opposecolorhalo;
			}
		}
	}
}
