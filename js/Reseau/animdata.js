// Rendre les noeuds cliquables
// Afficher le nom
var moncanvas = document.querySelector(".visible");

function removeListeners (){
	moncanvas.removeEventListener("mousemove", onmove1);
	moncanvas.removeEventListener("mousemove", onmove2);
	moncanvas.removeEventListener("mousemove", onmove3);
	moncanvas.removeEventListener("mousemove", onmove4);
	moncanvas.removeEventListener("mousemove", onmove5);
	moncanvas.removeEventListener("mousemove", onmove6);
	moncanvas.removeEventListener("mousemove", onmove7);
	moncanvas.removeEventListener("mousemove", onmove8);
}

function onmove1 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec1();
			ctx.save()
			ctx.font = "bold 20pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.key, data.x-50, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec1();
		}
}

function onmove2 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec2();
			ctx.save()
			ctx.font = "bold 13pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.key.split(",")[1], data.x-30, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec2();
		}
}

function onmove3 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec3();
			ctx.save()
			ctx.font = "bold 13pt Arial,sans-serif"
			ctx.fillStyle = "white"
			var virgule = data.key.indexOf(",");
			ctx.fillText(data.key.slice(virgule+1), data.x-30, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec3();
		}
}

function onmove4 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec4();
			ctx.save()
			ctx.font = "bold 13pt Arial,sans-serif"
			ctx.fillStyle = "white"
			var virgule = data.key.indexOf(",");
			ctx.fillText(data.key.slice(virgule+1), data.x-30, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec4();
		}
}

function onmove5 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec5();
			ctx.save()
			ctx.font = "bold 13pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.key, data.x-30, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec5();
		}
}

function onmove6 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec6();
			ctx.save()
			ctx.font = "bold 8pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.Nom, data.x-14, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec6();
		}
}

function onmove7 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec7();
			ctx.save()
			ctx.font = "bold 8pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.Nom, data.x-14, data.y-8)
			ctx.restore()
		} else {
			drawCanvasSec7();
		}
}

function onmove8 (e){
			// On repère les coordonnées du clic
		var mouseX = e.layerX;
		var mouseY = e.layerY;

		// On obtient la couleur du pixel puis le noeud
		// Click sur le canvas visible
		// Couleur dans le canvas caché
		var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
		var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
		console.log(colString)
		var node = colToNode[colString];
	
		// Si on est sur un noeud, afficher son nom
		// Sinon, redissiner pour effacer les autres noms
		if (node){
			var data = node["_groups"][0][0]["__data__"];
			console.log(data)
			drawCanvasSec8();
			ctx.save();
			ctx.font = "bold 8pt Arial,sans-serif"
			ctx.fillStyle = "white"
			ctx.fillText(data.Nom, data.x-14, data.y-8)

			if (idActlist.indexOf(data.ID)!==-1){
				// Afficher les liens d'actionnaires indirects
				// concernés par ce noeud
				actionnairesIndirect.forEach(function (d){
					if (data.ID === d.source.ID){

						// On dessine le lien
						ctx.strokeStyle = linkactcolor;
						ctx.globalAlpha = valToOpacity(d);
						var beginindex = allIDToIndex[Number(d.source.ID)];
						var endindex = allIDToIndex[Number(d.target.ID)];
						var x1 = Math.round(allActors[beginindex].x);
						var x2 = Math.round(allActors[endindex].x);
						var y1 = Math.round(allActors[beginindex].y);
						var y2 = Math.round(allActors[endindex].y);
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						ctx.lineTo(x2, y2);
						console.log([x1,y1,x2,y2])
						ctx.closePath();
						ctx.stroke();

						// On écrit le nom de target
						ctx.globalAlpha = 1;
						ctx.fillStyle = "white"
						ctx.fillText(data.Nom, data.x-14, data.y-8)
						var indice = allIDToIndex[d.target.ID];
						ctx.fillText(allActors[indice].Nom, allActors[indice].x-14, allActors[indice].y-8)

					}
				})
			}
			ctx.restore();

		} else {
			drawCanvasSec8();
		}
}



function animSec1(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove1)

}


function animSec2(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove2);

}

function animSec3(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove3);

}

function animSec4(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove4);

}

function animSec5(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove5);

}

function animSec6(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove6);

}

function animSec7(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove7);

}

function animSec8(){

	removeListeners();
	moncanvas.addEventListener("mousemove", onmove8);

}


// Ce code permet de faire du drag&slide sur les nodes
canvas
      .call(d3.drag()
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

hidden
      .call(d3.drag()
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

function dragsubject() {
    return simulation.find(d3.event.x, d3.event.y);
}

function dragstarted() {
	console.log("start")
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
	console.log("move")
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
	console.log("end")
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}