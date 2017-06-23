/*

Ce script reçoit les fonctions qui permettent 
de représenter les données. 

Il s'agit notamment des fonctions 
qui dessinent le Canvas pour chacune des sections

Il y a aussi les fonctions qui gèrent l'échelle. 

Ces fonctions seront appelées dans des appels du type
simulation.on("tick", drawCanvasSec1)

Ces appels précédents seront effectués dans le script
scroller.js 
(appel de setupSecX() dans la fonction majvue
qui marque une séparation entre 2 sections)

*/

// Permet de lancer une portion de code uniquement
// au tick n°1
var firstick = 1;


// Cette fonction permet d'ajuster le diamètre
// des noeuds aux dépenses du lobyist
function scalablesizes (x){
	var coef = 1
	if (Number(x)){
		coef = 1 + 7*Math.pow(x/depmax,1/3);
	}
	return coef * radius;
}

function drawCanvasSec1 (){

		clearCanvas();
		// On remplit l'annuaire
		// Dictionnaire inversé pour faciliter les liens
		if (firstick){
			var NestedData = d3.nest()
							.key(function (d){return d.ID})
							.rollup(function (v){return v[0].index})
							.entries(dataset);
			IDToIndex = {};
			console.log(NestedData)
			NestedData.forEach(function (d){
				console.log([d.key, d.value])
				IDToIndex[d.key] = d.value;
			})
			firstick=0;	
		}		
}

function setupSec1 (){

	// Renseigner ici les paramètres de la simulation
	// forces, faux liens s'il en faut pour manipuler le graphe

	// Appel de la simulation	

}
