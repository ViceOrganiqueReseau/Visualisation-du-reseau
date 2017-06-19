// Rendre les noeuds cliquables
// Afficher le nom

var moncanvas = document.querySelector(".visible")
moncanvas.addEventListener("click", function (e){

	// On repère les coordonnées du clic
	var mouseX = e.layerX;
	var mouseY = e.layerY;
	console.log([mouseX, mouseY]);

	// On obtient la couleur du pixel puis le noeud
	var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
	var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
	console.log(colString)
	var node = colToNode[colString];

	if (node){
		var data = node["_groups"][0][0]["__data__"];
		console.log(data)
		drawCanvas();
		ctx.save()
		ctx.font = "bold 7pt Arial,sans-serif"
		ctx.fillStyle = "white"
		ctx.fillText(data.Name, data.x-14, data.y-8)
		ctx.restore()
	}

})