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
}

function getNodeFromPosition(e){
  // On repère les coordonnées du clic
  var mouseX = e.offsetX || e.layerX;
  var mouseY = e.offsetY || e.layerY;

  // On obtient la couleur du pixel puis le noeud
  // Click sur le canvas visible
  // Couleur dans le canvas caché
  var col = ctxhid.getImageData(mouseX, mouseY, 1, 1).data;
  var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
  return colToNode[colString];
}

function drawText (text, x, y, fontSize){
  if(!fontSize){
    fontSize = 13;
  }
  ctx.save();
  ctx.font = "bold "+fontSize+"pt Arial,sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function nodeToData(node){ return node["_groups"][0][0]["__data__"]; }

function onmove1 (e){
  var node = getNodeFromPosition(e);

  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec1();
    drawText(data.key, data.x-50, data.y-8, 20);
  } else {
    drawCanvasSec1();
  }
}

function onmove2 (e){
  var node = getNodeFromPosition(e);
  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    drawCanvasSec2();
    var data = nodeToData(node);
    drawText(data.key.split(",")[1], data.x-30, data.y-8);
  } else {
    drawCanvasSec2();
  }
}

function onmove3 (e){
  var node = getNodeFromPosition(e);

  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec3();
    var virgule = data.key.indexOf(",");
    drawText(data.key.slice(virgule+1), data.x-30, data.y-8)
  } else {
    drawCanvasSec3();
  }
}

function onmove4 (e){
  var node = getNodeFromPosition(e);
  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec4();
    drawText(data.key, data.x-30, data.y-8)
  } else {
    drawCanvasSec4();
  }
}

function onmove5 (e){
  var node = getNodeFromPosition(e);

  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec5();
    drawText(getFullName(data), data.x-14, data.y-8, 8);
  } else {
    drawCanvasSec5();
  }
}

function onmove6 (e){
  var node = getNodeFromPosition(e);

  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec6();
    drawText(getFullName(data), data.x-14, data.y-8, 8)
  } else {
    drawCanvasSec6();
  }
}

function onmove7 (e){
  var node = getNodeFromPosition(e);

  // Si on est sur un noeud, afficher son nom
  // Sinon, redissiner pour effacer les autres noms
  if (node){
    var data = nodeToData(node);
    drawCanvasSec7();
    drawText(getFullName(data), data.x-14, data.y-8, 8);
    // ce code devrait plutôt être dans drawCanvasSec8 à mon avis.
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
          var indice = allIDToIndex[d.target.ID];
          ctx.fillText(getFullName(allActors[indice]), allActors[indice].x-14, allActors[indice].y-8)

        }
      });
    }
    ctx.restore();
  } else {
    drawCanvasSec7();
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