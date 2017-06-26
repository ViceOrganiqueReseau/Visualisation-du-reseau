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

function defIDToIndex(){
	// On remplit l'annuaire
		// Dictionnaire inversé pour faciliter les liens
		// Il faut placer ce code ici à cause des appels asynchrones. 
		if (firstick){
			var NestedData = d3.nest()
							.key(function (d){return d.ID})
							.rollup(function (v){return v[0].index})
							.entries(dataset);
			IDToIndex = {};
			console.log(NestedData)
			NestedData.forEach(function (d){
				console.log(d)
				console.log([d.key, d.value])
				IDToIndex[d.key] = d.value;
			})
			firstick=0;	
		}
}

function drawCanvasSec1 (){

		clearCanvas();


		// Traçage des halos
		// Le halo proportionnel aux dépenses
		circlePos.each(function (d){
			// Affichage du halo
			ctx.beginPath();
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctx.fillStyle = d3.select(this).attr("fillHalo");
			ctx.fill();
		})

		// Traçage des cercles
		circlePos.each(function (d){
			var node = d3.select(this);
			// Affichage du cercle
			ctx.beginPath();
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, radius, 0, 2*Math.PI);
			ctx.fillStyle = node.attr("fillStyle");
			ctx.fill();

			// Dessin dans le canvas caché
			var newcol = genHiddenColor();
			ctxhid.fillStyle = newcol;
			ctxhid.beginPath();
			ctxhid.moveTo(d.x, d.y);
			ctxhid.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctxhid.fill();

			// Ajout de la couleur au répertoire
			colToNode[newcol] = node;

		})

}

function setupSec1 (){

	// Renseigner ici les paramètres de la simulation
	// forces, faux liens s'il en faut pour manipuler le graphe
	simulation = d3.forceSimulation().nodes(dataByPos)
					.force("center", d3.forceCenter(width/2,height/2))
					.force("charge", d3.forceManyBody().strength(-1))
					.force("collide", d3.forceCollide().radius(function (d){
						return 2*radius + 2*scalablesizes(d.value["Dépenses Lobby (€)"]);
					}))
					// Permettent d'éviter le hors champ lors du drag
					.force("x", d3.forceX(width/2).strength(0.4))
					.force("y", d3.forceY(height/2).strength(0.4));

	simulation.alphaMin(0.02);
	// Appel de la simulation
	simulation.on("tick", drawCanvasSec1);

}
