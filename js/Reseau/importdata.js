/* Comme l'import des données se fait au sein d'une fonction
appelée de manière asynchrone : d3.csv, les variables
globales sont définies ici afin qu'elles soient accessibles
à tous les scripts */ 

// Variables globales
// Données des noeuds
var dataset;
var nbloby;
// Données des liens d'affiliation
var affiliations;
// Données des actionnaires indirects
var actionnaires;
// Données des liens actionnaires directs
var actionnairesDirect;
// Données des liens actionnaires indirects
var actionnairesIndirect;

// Thème choisi
var theme;
// Lobyist choisi
var lobyID;
var lobyist;

// Liste des thèmes
var themelist;

// Données regroupées pour les diffénrentes sections
// Section 1 : SUPPORT vs OPPOSE
var dataByPos;
// Section 2 : Division par type
var dataByPosType;
// Section 3 : Division par secteur
var dataByPosSecteur;
// Section 4 : Rassemblement des secteurs, déplacement
var secteurslist;
// Section 5 : Regroupement par secteur
var dataBySecteurPos;
// Section 6 : Organisations regroupées par secteur
// Utilisation de dataset
// Section 7 : Affichage des liens
// Section 8 : Les actionnaires
var allActors;

var nodes;
// Faux DOM d'objets graphiques (un SVG-like)
var circles;
var circlePos;
var circlePosType;
var circlePosSecteur;
var circleSecteurPos;
var simulation;

// IDToIndex : ID --> son index correspondant dans dataset
var IDToIndex;
// allIDToIndex : ID --> son index dans allActors
var allIDToIndex;
// La liste des IDs utilisés
var AllIDlist;
// Liste des IDs retenus
var idlist;
// Liste des ID des actionnaires
var idActlist;
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
		coef = 1 + 9*Math.pow(x/depmax,1/1.5);
	}
	return coef * radius;
}



d3.csv("data/Noeud19juin.csv", function (data){
	// On récupère les données
	dataset=data;
	nbloby=dataset.length;

});

d3.csv("data/Noeuds-ActionnairesIndirect.csv", function (data){
	// On récupère les données
	actionnaires = data;

});

d3.csv("data/liensActionnairesDirect.csv", function (data){
	// On récupère les données
	actionnairesDirect = data;

});

d3.csv("data/liensActionnairesIndirect.csv", function (data){
	// On récupère les données
	actionnairesIndirect = data;

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

	// On charge les couleurs
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

	// Créer les liens de retour vers le thème
	createlinks();

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
	if (lobyist){
		d3.select("#answers span.nom")
			.text(lobyist["Nom"]);
		d3.select("#answers span.type")
			.text(lobyist["Type"]);
		d3.select("#answers span.secteur")
			.text(lobyist["Secteurs d’activité"]);
		d3.select("#answers span.country")
			.text(lobyist["Pays/Région"]);
		if (lobyist[theme]){
			d3.select("#answers span.position")
				.text(lobyist[theme]);
		}
	}

	// On retire les acteurs non pertinents : 
	// Ceux qui ne se sont pas prononcé
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
	// ie qui relient des acteurs pertinents
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

	// On ne conserve que les liens actionnaires directs pertinents
	idActlist = [];
	for (var i=0; i<actionnaires.length; i++){
		idActlist.push(actionnaires[i].ID);
	}
	for (var i=0; i<actionnairesDirect.length; i++){
		if ((idlist.indexOf(actionnairesDirect[i].source)===-1) 
			|| (idlist.indexOf(actionnairesDirect[i].target)===-1))
			{
				actionnairesDirect[i]=0;
			}
	}
	while (actionnairesDirect.indexOf(0)!==-1){
		actionnairesDirect.splice(actionnairesDirect.indexOf(0),1);
	}

	// On ne conserve que les liens actionnaires indirects pertinents
	for (var i=0; i<actionnairesIndirect.length; i++){
		if ((idActlist.indexOf(actionnairesIndirect[i].source)===-1) 
			|| (idlist.indexOf(actionnairesIndirect[i].target)===-1))
			{
				actionnairesIndirect[i]=0;
			}
	}
	while (actionnairesIndirect.indexOf(0)!==-1){
		actionnairesIndirect.splice(actionnairesIndirect.indexOf(0),1);
	}

	// On ne conserve que les actionnaires pertinents
	// Ceux qui sont actionnaires d'un élément de dataset
	// MAJ de idActlist
	idActlist = [];
	for (var i=0; i<actionnairesIndirect.length; i++){
		if (idActlist.indexOf(actionnairesIndirect[i].source)===-1){
			idActlist.push(actionnairesIndirect[i].source);
		}
	}
	for (var i=0; i<actionnaires.length; i++){
		if (idActlist.indexOf(actionnaires[i].ID)===-1){
			actionnaires[i]=0;
		}
	}
	while (actionnaires.indexOf(0)!==-1){
		actionnaires.splice(actionnaires.indexOf(0),1);
	}

	console.log(dataset);
	console.log(affiliations);
	console.log(actionnairesDirect);
	console.log(actionnairesIndirect);

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

	// Créer ici les listes de données par regroupement
	// Section 1 par position
	dataByPos = d3.nest()
					.key(function (d){return d[theme]})
					.rollup(function (v){
						var res = {};
						var somme = 0;
						for (var i=0; i<v.length; i++){
							var depense = Number(v[i]["Dépenses Lobby (€)"]);
							if (depense){
								somme += depense;
							}
						}
						res["Dépenses Lobby (€)"] = somme;
						return res;
					})
					.entries(dataset);
	console.log(dataByPos);

	// Section 2 par type et position
	dataByPosType = d3.nest()
					.key(function (d){
						var res = [];
						res.push(d[theme]);
						res.push(d.Type);
						return res;
					})
					.rollup(function (v){
						var res = {};
						var somme = 0;
						for (var i=0; i<v.length; i++){
							var depense = Number(v[i]["Dépenses Lobby (€)"]);
							if (depense){
								somme += depense;
							}
						}
						res["Dépenses Lobby (€)"] = somme;
						return res;
					})
					.entries(dataset);
	console.log(dataByPosType);

	// Section 3 par secteur et position
	dataByPosSecteur = d3.nest()
					.key(function (d){
						var res = [];
						res.push(d[theme]);
						res.push(d["Secteurs d’activité"]);
						return res;
					})
					.rollup(function (v){
						var res = {};
						var somme = 0;
						for (var i=0; i<v.length; i++){
							var depense = Number(v[i]["Dépenses Lobby (€)"]);
							if (depense){
								somme += depense;
							}
						}
						res["Dépenses Lobby (€)"] = somme;
						return res;
					})
					.entries(dataset);
	console.log(dataByPosSecteur);

	// Section 5 : Par secteur
	dataBySecteurPos = d3.nest()
					.key(function (d){return d["Secteurs d’activité"]})
					.rollup(function (v){
						var res = {};
						var sommesup = 0;
						var sommeopp = 0;
						var somme = 0;
						for (var i=0; i<v.length; i++){
							var depense = Number(v[i]["Dépenses Lobby (€)"]);
							if (depense){
								somme += depense;
								if (v[i][theme]==="SUPPORT"){
									sommesup += depense;
								} else if (v[i][theme]==="OPPOSE") {
									sommeopp += depense;
								}
							}
						}
						res["SUPPORT"] = sommesup;
						res["OPPOSE"] = sommeopp;
						res["TOTAL"] = somme;
						return res;
					})
					.entries(dataset);
	secteurslist = [];
	for (var i=0; i<dataBySecteurPos.length; i++){
		secteurslist.push(dataBySecteurPos[i].key)
	}


	// Créer ici les éléments graphqiues (faux DOM)
	// Les noeuds qui correspondent aux organisations
	circles = CustomDOM.selectAll("custom.actor")
				.data(dataset)
				.enter()
				.append("custom")
				.attr("class", "actor")
				// Cet attribut "r" sert à adapter le
				// halo aux dépenses Lobby
				.attr("r", function (d){
					return scalablesizes(d["Dépenses Lobby (€)"]);
				})
				.attr("fillStyle", colornode)
				.attr("fillHalo", colorhalo);

	// Pour la section 1 : SUPPORT vs OPPOSE
	circlePos = CustomDOM.selectAll("custom.pos")
				.data(dataByPos)
				.enter()
				.append("custom")
				.attr("class", "pos")
				.attr("r", function (d){
					return scalablesizes(d.value["Dépenses Lobby (€)"])
				})
				.attr("fillStyle", function (d){
					if (lobyist && lobyist[theme]){
						if (lobyist[theme]===d.key){
							return allycolor;
						} else {
							return ennemycolor;
						}
					} else {
						if (d.key === "SUPPORT"){
							return supportcolor;
						} else {
							return opposecolor;
						}
					}
				})
				.attr("fillHalo", function (d){
					if (lobyist && lobyist[theme]){
						if (lobyist[theme]===d.key){
							return allycolorhalo;
						} else {
							return ennemycolorhalo;
						}
					} else {
						if (d.key === "SUPPORT"){
							return supportcolorhalo;
						} else {
							return opposecolorhalo;
						}
					}
				});

	// Pour la section 2 : Division par type
	circlePosType = CustomDOM.selectAll("custom.postype")
						.data(dataByPosType)
						.enter()
						.append("custom")
						.attr("class", "postype")
						.attr("r", function (d){
							return scalablesizes(d.value["Dépenses Lobby (€)"])
						})
						.attr("fillStyle", function (d){
							if (lobyist && lobyist[theme]){
								if (lobyist[theme]===d.key.split(",")[0]){
									return allycolor;
								} else {
									return ennemycolor;
								}
							} else {
								if (d.key.split(",")[0] === "SUPPORT"){
									return supportcolor;
								} else {
									return opposecolor;
								}
							}
						})
						.attr("fillHalo", function (d){
							if (lobyist && lobyist[theme]){
								if (lobyist[theme]===d.key.split(",")[0]){
									return allycolorhalo;
								} else {
									return ennemycolorhalo;
								}
							} else {
								if (d.key.split(",")[0] === "SUPPORT"){
									return supportcolorhalo;
								} else {
									return opposecolorhalo;
								}
							}
						});

	// Pour la section 3 : Division par secteur
	circlePosSecteur = CustomDOM.selectAll("custom.possecteur")
						.data(dataByPosSecteur)
						.enter()
						.append("custom")
						.attr("class", "possecteur")
						.attr("r", function (d){
							return scalablesizes(d.value["Dépenses Lobby (€)"])								
						})
						.attr("fillStyle", function (d){
							if (lobyist && lobyist[theme]){
								if (lobyist[theme]===d.key.split(",")[0]){
									return allycolor;
								} else {
									return ennemycolor;
								}
							} else {
								if (d.key.split(",")[0] === "SUPPORT"){
									return supportcolor;
								} else {
									return opposecolor;
								}
							}
						})
						.attr("fillHalo", function (d){
							if (lobyist && lobyist[theme]){
								if (lobyist[theme]===d.key.split(",")[0]){
									return allycolorhalo;
								} else {
									return ennemycolorhalo;
								}
							} else {
								if (d.key.split(",")[0] === "SUPPORT"){
									return supportcolorhalo;
								} else {
									return opposecolorhalo;
								}
							}
						});	

	// Section 4 : Mêmes cercles

	// Section 5 : Fusion en secteurs
	setMeanSectorColors();
	circleSecteurPos = CustomDOM.selectAll("custom.secteurpos")
						.data(dataBySecteurPos)
						.enter()
						.append("custom")
						.attr("class", "secteurpos")
						.attr("r", function (d){
							return scalablesizes(d.value["TOTAL"])
						})
						.attr("fillStyle", sectorcolor)
						.attr("fillHalo", sectorhalo);

	// Section 6 : Organisations groupées par secteur
	// Cercles des organisations : circles

	// Section 7 : Affichage du réseau d'affiliations
	// circles et affiliations

	// Section 8 : Affichage supplémentaire des actionnaires
	circleActs = CustomDOM.selectAll("custom.act")
					.data(actionnaires)
					.enter()
					.append("custom")
					.attr("class", "act")
					.attr("r", 5*radius)
					.attr("fillStyle", actcolor);
	allActors = dataset.concat(actionnaires);

	// Initialisation après l'import des données : 
	// Affichage de la section 1
	setupSec1();
	animSec1();

});