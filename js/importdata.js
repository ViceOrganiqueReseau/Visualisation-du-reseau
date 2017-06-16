var dataset;
var nbloby;
var affiliations;


var nodes;
var circles;
var simulation;

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
	
	circles = CustomDOM.selectAll("custom.circle")
				.data(dataset)
				.enter()
				.append("custom")
				.attr("class", "circle")
				.attr("r", 5)

	simulation = d3.forceSimulation()
					.force("center", d3.forceCenter(width/2,height/2))
					//.force("charge", d3.forceManyBody());

	simulation.nodes(dataset).on("tick", ticked);

	function ticked (){
		ctx.clearRect(0,0,width,height);
		ctx.beginPath();
		circles.each(function (d){
			ctx.moveTo(d.x, d.y);
			ctx.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);		
		})
		ctx.fillStyle = "green"
		ctx.fill();
	}

});
