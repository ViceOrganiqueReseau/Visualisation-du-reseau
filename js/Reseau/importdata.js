// Variables globales
// Données des noeuds
var dataset;
var nbloby;
// Données des liens
var affiliations;

// Thème choisi
var theme;
// Lobyist choisi
var lobyID;
var lobyist;

// Liste des thèmes
var themelist;

var nodes;
// Faux DOM d'objets graphiques (un SVG-like)
var circles;
var simulation;
// Permet de lancer une portion de code uniquement
// au tick n°1
var firstick = 1;
// IDToIndex : Name --> son index correspondant dans dataset
var IDToIndex;
// La liste des IDs utilisés
var AllIDlist;
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
var radius = 3;
// Coeficient donnant la courbure des liens
var curvecoef = 0.1;

// Cette fonction permet d'ajuster le diamètre
// des noeuds aux dépenses du lobyist
function scalablesizes (x){
	var coef = 1
	if (Number(x)){
		coef = 1 + 7*Math.pow(x/depmax,1/3);
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
		ctx.strokeStyle = linkcolor;
		ctx.lineWidth = 1;
		affiliations.forEach(function (d){
			ctx.beginPath()
			var beginindex = IDToIndex[d.source.ID];
			var endindex = IDToIndex[d.target.ID];
			var x1 = Math.round(dataset[beginindex].x);
			var x2 = Math.round(dataset[endindex].x);
			var y1 = Math.round(dataset[beginindex].y);
			var y2 = Math.round(dataset[endindex].y);
			var xmid = 0.5*(x1+x2);
			var ymid = 0.5*(y1+y2);
			var dx = x2-x1;
			var dy = y2-y1;
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(xmid + curvecoef*dy, ymid - curvecoef*dx, x2, y2);
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
			ctxhid.arc(d.x, d.y, d3.select(this).attr("r"), 0, 2*Math.PI);
			ctxhid.fill();

			// Ajout de la couleur au répertoire
			colToNode[newcol] = node;
		})

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
	console.log("subject found")
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




d3.csv("data/Noeud19juin.csv", function (data){
	// On récupère les données
	dataset=data;
	nbloby=dataset.length;

});

d3.csv("data/Affiliation19juin.csv", function (data){
	affiliations = data;

	// Récupération du choix utilisateur
	// On crée la liste des ID (c'est un intervalle discontinu)
	AllIDlist = [];
	for (var i=0; i<dataset.length; i++){
		AllIDlist.push(dataset[i].ID);
	}

	if (params["id"]){
		if (AllIDlist.indexOf(params["id"])!==-1){
			lobyID = Number(params["id"]);
		}
	} // Sinon lobyID est undefined
	

	// On récupèrer le lobyist choisi et la liste des IDs
	for (var i=0; i<dataset.length; i++){
		if (Number(dataset[i].ID) === lobyID){
			lobyist = dataset[i];
		}
	}
	setcolor();

	// On récupère la liste des thèmes 
	// et le thème choisi
	themelist = Object.keys(dataset[0]);
	themelist.splice(themelist.indexOf("ID"), 1);
	themelist.splice(themelist.indexOf("Lobby ID"), 1);
	themelist.splice(themelist.indexOf("Nom"), 1);
	themelist.splice(themelist.indexOf("Abréviation"), 1);
	themelist.splice(themelist.indexOf("Pays/Région"), 1);
	themelist.splice(themelist.indexOf("Type"), 1);
	themelist.splice(themelist.indexOf("Secteurs d’activité"), 1);
	themelist.splice(themelist.indexOf("Dépenses Lobby (€)"), 1);
	themelist.splice(themelist.indexOf("Personnes impliquées"), 1);
	themelist.splice(themelist.indexOf("Equivalent Temps plein"), 1);
	if (params["theme"]){
		var urlthemeid = Number(params["theme"])
		if ((urlthemeid>=0) && (urlthemeid<themelist.length)){
			theme = themelist[urlthemeid];
		}
	}

	// S'il n'y a pas de thème, afficher les liens
	if (!theme){
		displaylinksError();
	}

	// Si l'utilisateur n'a pas choisi de lobyist
	// Ou si le lobyist choisi ne s'est pas prononcé
	// Afficher le lien vers le questionnaire
	if ((!(lobyist)) || (!(lobyist[theme]))) {
		var lobylink = document.getElementById("backloby");
		// Un lien redirige l'utilisateur vers le questionnaire
		lobylink.style.display = "block";
	}

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
					.force("charge", d3.forceManyBody().strength(-1))
					.force("link", d3.forceLink(affiliations)
						.id(function (d){
							return d.ID;
						})
						.strength(function (d){
							return 0.4;
						})
					)
					.force("collide", d3.forceCollide().radius(function (d){
						return 2*radius + 2*scalablesizes(d["Dépenses Lobby (€)"]);
					}))
					// Permettent d'éviter le hors champ lors du drag
					.force("x", d3.forceX(width/2).strength(0.005))
					.force("y", d3.forceY(height/2).strength(0.005));		

	simulation.alphaMin(0.02);	

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
				.attr("fillStyle", function (d){return colornode(d)})
				.attr("fillHalo", function (d){return colorhalo(d)});

	console.log(circles)

	simulation.on("tick", drawCanvas);

	

});