// Variables globales
// Données des noeuds
var dataset;
var nbloby;
// Données des liens
var affiliations;

// Thème choisi
var theme;
var nodes;
// Faux DOM d'objets graphiques (un SVG-like)
var circles;
var simulation;
// Permet de lancer une portion de code uniquement
// au tick n°1
var firstick = 1;
// IDToIndex : Name --> son index correspondant dans dataset
var IDToIndex;
// Liste des IDs retenus
var idlist;
// Dépense max
var depmax=0;

// Création du faux DOM
// Il reçoit les éléments grphiques avec 
// en attribut ce qu'il faut pour les afficher
detachedContainer = document.createElement("custom")
var CustomDOM = d3.select(detachedContainer);
// Rayon des noyaux
var radius = 5;

// Cette fonction permet d'ajuster le diamètre
// des noeuds aux dépenses du lobyist
function scalablesizes (x){
	var coef = 1
	if (Number(x)){
		coef = 1 + 4*Math.pow(x/depmax,1/3);
	}
	return coef * radius;
}

function drawCanvas (){

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

		// Traçage des liens
		ctx.strokeStyle = "red"
		ctx.lineWidth = 1;
		affiliations.forEach(function (d){
			ctx.beginPath()
			var beginindex = IDToIndex[d.source.ID];
			var endindex = IDToIndex[d.target.ID];
			ctx.moveTo(Math.round(dataset[beginindex].x), Math.round(dataset[beginindex].y));
			ctx.lineTo(Math.round(dataset[endindex].x), Math.round(dataset[endindex].y));
			ctx.closePath();
			ctx.stroke();
		});

		// Les cercles

		// Le halo proportionnel aux dépenses
		circles.each(function (d){
			// Affichage du halo
			ctx.beginPath();
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctx.fillStyle = d3.select(this).attr("fillHalo");
			ctx.fill();
		})

		// Le noyau
		circles.each(function (d){
			// Affichage du cercle
			ctx.beginPath();
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, radius, 0, 2*Math.PI);
			ctx.fillStyle = d3.select(this).attr("fillStyle");
			ctx.fill();

			// Dessin dans le canvas caché
			var newcol = genHiddenColor();
			var node = d3.select(this);
			ctxhid.fillStyle = newcol;
			ctxhid.beginPath();
			ctxhid.moveTo(d.x, d.y);
			ctxhid.arc(d.x, d.y, radius, 0, 2*Math.PI);
			ctxhid.fill();

			// Ajout de la couleur au répertoire
			colToNode[newcol] = node;
		})

	}

d3.csv("data/Noeud19juin.csv", function (data){
	// On récupère les données
	dataset=data;
	nbloby=dataset.length;
});

d3.csv("data/Affiliation19juin.csv", function (data){
	affiliations = data;

	// Réduction des données à un thème
	//theme = "Gaz de schiste";
	//theme = "Réduction 40%"
	//theme = "Efficacité énergétique"
	theme = "Energies renouvelables"
	// Si l'acteur i ne s'est pas prononcé sur le thème, 
	// on l'enlève !
	for (var i=0; i<nbloby; i++){
		if (dataset[i][theme]){} else {
			dataset[i]=0;
		}
	}
	while (dataset.indexOf(0)!==-1){
		dataset.splice(dataset.indexOf(0),1);
	}
	nbloby=dataset.length;

	// Idem, on ne conserve que les liens pertinents
	idlist=[];
	for (var i=0; i<nbloby; i++){
		idlist.push(dataset[i].ID)
	}
	for (var i=0; i<affiliations.length; i++){
		if ((idlist.indexOf(affiliations[i].source)===-1) 
			|| (idlist.indexOf(affiliations[i].target)===-1))
			{
				affiliations[i]=0;
			}
	}
	while (affiliations.indexOf(0)!==-1){
		affiliations.splice(affiliations.indexOf(0),1);
	}

	console.log(affiliations);
	console.log(dataset);

	// On calcule la dépense maximale
	// Utile pour adapter les halos aux dépenses
	for (var i=0; i<nbloby; i++){
		var depense = Number(dataset[i]["Dépenses Lobby (€)"]);
		if (depense){
			if (depense>depmax){
				depmax = depense;
			}	
		}
	}
	console.log(depmax)

	// On renseigne les forces
	simulation = d3.forceSimulation().nodes(dataset)
					.force("center", d3.forceCenter(width/2,height/2))
					.force("charge", d3.forceManyBody().strength(-2))
					.force("link", d3.forceLink(affiliations)
						.id(function (d){
							return d.ID;
						})
						.strength(function (d){
							return 0.4;
						})
					)
					.force("collide", d3.forceCollide().radius(function (d){
						return 5*radius;
					}));		
	
	simulation.alphaMin(0.05)
	simulation.on("tick", drawCanvas);

	// Binding des data avec les noeuds
	circles = CustomDOM.selectAll("custom.circle")
				.data(dataset)
				.enter()
				.append("custom")
				.attr("class", "circle")
				// Cet attribut "r" sert à adapter le
				// halo aux dépenses Lobby
				.attr("r", function (d){
					return scalablesizes(d["Dépenses Lobby (€)"]);
				})
				.attr("fillStyle", function (d){
					if (d[theme]==="SUPPORT"){
						return "rgb(0,0,255)";
					} else {
						return "rgb(255,165,0)";
					}
				})
				.attr("fillHalo", function (d){
					if (d[theme]==="SUPPORT"){
						return "rgba(0,0,255,0.2)";
					} else {
						return "rgba(255,165,0,0.2)";
					}
				})

});