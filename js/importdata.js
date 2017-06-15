var dataset;

d3.csv("data/Noeud_positions.csv", function (data){
	dataset=data;
	console.log(dataset);
});