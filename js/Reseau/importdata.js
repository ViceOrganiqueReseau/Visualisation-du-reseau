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

	// Remplissage des #answers
	if (theme){
		d3.select("#answers span.theme")
			.text(theme);
	}
	if (lobyist && lobyist[theme]){
		d3.select("#answers span.nom")
			.text(lobyist["Nom"]);
		d3.select("#answers span.position")
			.text(lobyist[theme]);
		d3.select("#answers span.type")
			.text(lobyist["Type"]);
		d3.select("#answers span.secteur")
			.text(lobyist["Secteurs d’activité"]);
		d3.select("#answers span.country")
			.text(lobyist["Pays/Région"]);
	}

	// On retire les entrées non pertinentes de datset
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

	// Créer ici les éléments graphqiues (faux DOM)

});