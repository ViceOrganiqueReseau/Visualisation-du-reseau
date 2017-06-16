var dataset;
var nbloby;
var affiliations;


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

d3.csv("data/Noeuds-positions.csv", function (data){
	dataset=data;
	nbloby=dataset.length;
});

d3.csv("data/Affiliation.csv", function (data){
	affiliations = data;
	console.log(affiliations);
	console.log(dataset);

	// On renseigne les forces
	simulation = d3.forceSimulation()
					.force("center", d3.forceCenter(width/2,height/2))
					//.force("charge", d3.forceManyBody());

	simulation.nodes(dataset).on("tick", ticked);

	// Binding des data avec les noeuds
	circles = CustomDOM.selectAll("custom.circle")
				.data(dataset)
				.enter()
				.append("custom")
				.attr("class", "circle")
				.attr("r", 5)

	function ticked (){

		ctx.clearRect(0,0,width,height);
		// On remplie l'annuaire
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
			var beginindex = NameToIndex[d.source];
			var endindex = NameToIndex[d.target];
			ctx.moveTo(Math.round(dataset[beginindex].x), Math.round(dataset[beginindex].y));
			ctx.lineTo(Math.round(dataset[endindex].x), Math.round(dataset[endindex].y));
			ctx.closePath();
			ctx.stroke();
		});
		console.log(ctx)

		// Les cercles
		ctx.beginPath();
		circles.each(function (d){
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);		
		})
		ctx.fillStyle = "green"
		ctx.fill();

	}

});
