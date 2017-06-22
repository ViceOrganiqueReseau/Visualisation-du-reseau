var vue = document.getElementById("vue");
var vuepos = vue.getBoundingClientRect();
var height = vue.offsetHeight - 2 * 5; // 5 est le padding de #vue
var width = vue.offsetWidth - 2 * 5;
var svg = d3.select("#vue").append("svg").attr("width", width).attr("height", height);
var pie = d3.pie();
var dataset;
var nbthemes;
var themelist;
var datafiltre;
var piedata;
var piezeddata;
var arc;
var arcs;
var outerRadius = width/10;
var setDefaultTheme;
// Nombre de lobbyists restants
var nbloby;
// Tableau recensant les nbloby successifs : utile pour accéder aux éléments graphiques dont la référence a été perdue
var tabnbloby;
// Tableau référençant les thèmes : utile pour la transmission au réseau par URL
var idToTheme;

d3.csv("data/Noeud19juin.csv", function (data){
	dataset=data;
	datafiltre=dataset.slice();
	nbloby = dataset.length
	tabnbloby=[nbloby];
	console.log(dataset);

	// Faire ici l'initialisation de la vue
	// Renseigner les fonctions modifiant la vue en dehors

	// On cherche la liste des thèmes
	// Par élimination, chaque ligne correspond à 
	// l'élimination d'un attribut qui n'est pas un thème
	// climatique. 
	themelist = Object.keys(data[0]);
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
	console.log(themelist);
	idToTheme = themelist.slice();

	
	// On cherche le nombre d'acteurs qui se sont prononcés sur chaque thème
	nbthemes = themelist.length;
	piedata = [];
	for (var i=0; i<nbthemes; i++){
		var somme = 0;
		for (var j=0; j<data.length; j++){
			// Utilisation du truthy falsy
			if (data[j][themelist[i]]){
				somme++;
			}
		}
		piedata[i] = somme;
	}
	console.log(piedata);

	piezeddata = pie(piedata);

	console.log(piezeddata);

	// Les parts de cammenbert sont des arcs d'innerRadius 0
	arc = d3.arc()
                .innerRadius(0)
                .outerRadius(outerRadius);

	arcs = svg.selectAll("g.arc")
					.data(piezeddata)
					.enter()
					.append("g")
					.attr("class", "arc")
					.attr("class", function (d,i){
						return "cercle"+i+" "+"loby"+0+" cercle"+i+"loby"+0;
					})
					.attr("transform", "translate("+(0.5*width)+", "+(0.5*height)+")");

	arcs.append("path")
		.attr("d", arc)
		.attr("fill", function (d,i){
			return color(i);
		})

	arcs.append("text")
		.text(function (d,i){ return themelist[i]+" ("+piezeddata[i].data+" réponses)" })
		.style("font-size", 0.45*width/height+"em")
		.attr("transform", function (d,i) {
			var string = "translate(";
			var angle = 0.5 * (piezeddata[i].startAngle + piezeddata[i].endAngle);
			var textpos = this.getBoundingClientRect();
			if (angle>Math.PI){
				string += (1.2 * outerRadius * Math.sin(angle) - textpos.right + textpos.left);
			} else {
				string += (1.2 * outerRadius * Math.sin(angle));
			}
			string += ', ';
			string += (-1.2 * outerRadius * Math.cos(angle));
			string += ")";
			return string;
		})

	// Cette fonction sert à réinitialiser la vue en cas de scroll brutal en arrière
	setDefaultTheme = function (){
		arcs.transition()
			.duration(30)
			.attr("transform", "translate("+(0.5*width)+", "+(0.5*height)+")");

		arcs.selectAll("text")
			.transition()
			.duration(30)
			.attr("opacity", 1);
	}

});