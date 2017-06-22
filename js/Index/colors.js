/* Pour gérer les couleurs d'affichages,
modifier les valeurs de couleurs dans ce script. 
La couleur de fond se modifie dans le fichier styles.css*/


// Couleur d'un élément qui s'efface au survol d'un autre
var colormousenoton;

// Couleurs des diques en fonction de l'indice
function color (i){
	if (i===0){
		return "rgb(1, 95, 102)";
	} else if (i===1) {
		return "rgb(45, 241, 255)";
	} else if (i===2) {
		return "rgb(34, 86, 150)";
	} else if (i===3) {
		return "rgb(0, 132, 88)";
	} else if (i===4) {
		return "rgb(56, 255, 188)";
	} else if (i===5) {
		return "rgb(77, 168, 137)";
	} else {
		return "rgb(1, 95, 102)";
	}
}