var dataset;
var nbloby;
var affiliations;

var theme;
var nodes;
var circles;
var simulation;
var firstick = 1;
var NameToIndex;

// Création du faux DOM
// Il reçoit les éléments grphiques avec 
// en attribut ce qu'il faut pour les afficher
detachedContainer = document.createElement("custom")
var CustomDOM = d3.select(detachedContainer);

function drawCanvas (){

		clearCanvas();
		// On remplit l'annuaire
		// Dictionnaire inversé pour faciliter les liens
		if (firstick){
			var NestedData = d3.nest()
							.key(function (d){return d.Name})
							.rollup(function (v){return v[0].index})
							.entries(dataset);
			NameToIndex = {};
			console.log(NestedData)
			NestedData.forEach(function (d){
				NameToIndex[d.key] = d.value;
			})
			
			console.log(NameToIndex);
			firstick=0;	
		}

		// Traçage des liens
		ctx.strokeStyle = "red"
		ctx.lineWidth = 1;
		affiliations.forEach(function (d){
			ctx.beginPath()
			var beginindex = NameToIndex[d.source.Name];
			var endindex = NameToIndex[d.target.Name];
			ctx.moveTo(Math.round(dataset[beginindex].x), Math.round(dataset[beginindex].y));
			ctx.lineTo(Math.round(dataset[endindex].x), Math.round(dataset[endindex].y));
			ctx.closePath();
			ctx.stroke();
		});

		// Les cercles
		circles.each(function (d){
			// Affichage du cercle
			ctx.beginPath();
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctx.fillStyle = d3.select(this).attr("fillStyle");
			ctx.fill();

			// Dessin dans le canvas caché
			var newcol = genHiddenColor();
			var node = d3.select(this);
			ctxhid.fillStyle = newcol;
			ctxhid.beginPath();
			ctxhid.moveTo(d.x, d.y);
			ctxhid.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctxhid.fill();

			// Ajout de la couleur au répertoire
			colToNode[newcol] = node;
		})

	}

d3.csv("data/Noeuds-positions.csv", function (data){
	dataset=data;
	nbloby=dataset.length;
});

d3.csv("data/Affiliation.csv", function (data){
	affiliations = data;

	// Réduction des données à un thème
	//theme = "Exploitation of indigenous fossil energy";
	theme = "Emission reduction target equal or above 40%"
	theme = "Energy Efficiency target"
	theme = "Renewable Energy target"
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
	var namelist=[];
	for (var i=0; i<nbloby; i++){
		namelist.push(dataset[i].Name)
	}
	for (var i=0; i<affiliations.length; i++){
		if ((namelist.indexOf(affiliations[i].source)===-1) 
			|| (namelist.indexOf(affiliations[i].target)===-1))
			{
				affiliations[i]=0;
			}
	}
	while (affiliations.indexOf(0)!==-1){
		affiliations.splice(affiliations.indexOf(0),1);
	}

	console.log(affiliations);
	console.log(dataset);

	// On renseigne les forces
	simulation = d3.forceSimulation().nodes(dataset)
					.force("center", d3.forceCenter(width/2,height/2))
					.force("charge", d3.forceManyBody().strength(-10))
					.force("link", d3.forceLink(affiliations)
						.id(function (d){
							return d.Name;
						})
						.strength(function (d){
							return 0.1;
						})
					)
					.force("collide", d3.forceCollide().radius(function (d){
						return 5;
					}));		

	simulation.on("tick", drawCanvas);

	// Binding des data avec les noeuds
	circles = CustomDOM.selectAll("custom.circle")
				.data(dataset)
				.enter()
				.append("custom")
				.attr("class", "circle")
				.attr("r", 5)
				.attr("fillStyle", function (d){
					if (d[theme]==="SUPPORT"){
						return "blue";
					} else {
						return "orange";
					}
				})

});