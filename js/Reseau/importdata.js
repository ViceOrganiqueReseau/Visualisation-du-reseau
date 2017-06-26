/* Comme l'import des données se fait au sein d'une fonction
appelée de manière asynchrone : d3.csv, les variables
globales sont définies ici afin qu'elles soient accessibles
à tous les scripts */ 

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

// Données regroupées pour les diffénrentes sections
// Section 1 : SUPPORT vs OPPOSE
var dataByPos;
// Section 2 : Division par type
var dataByPosType;
// Section 3 : Division par secteur
var dataByPosSecteur;
// Section 4 : Rassemblement des secteurs, déplacement
// Section 5 : Regroupement par secteur
var dataBySecteurPos;
// Section 6 : Organisations regroupées par secteur
// Utilisation de dataset
// Section 7 : Affichage des liens

var nodes;
// Faux DOM d'objets graphiques (un SVG-like)
var circles;
var circlePos;
var circlePosType;
var circlePosSecteur;
var circleSecteurPos;
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

// Cette fonction permet d'ajuster le diamètre
// des noeuds aux dépenses du lobyist
function scalablesizes (x){
	var coef = 1
	if (Number(x)){
		coef = 1 + 7*Math.pow(x/depmax,1/3);
	}
	return coef * radius;
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

	// Section 5 par secteur et position
	dataBySecteurPos = d3.nest()
					.key(function (d){
						var res = [];
						res.push(d["Secteurs d’activité"]);
						res.push(d[theme]);
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
	console.log(dataBySecteurPos);

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
					if (lobyist){
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
					if (lobyist){
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
							if (lobyist){
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
							if (lobyist){
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



	// Initialisation après l'import des données : 
	// Affichage de la section 1
	setupSec1();
	animSec1();

});