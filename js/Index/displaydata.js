/* 

Attention, les fonctions utilisées dans ce script
sont prévues pour s'exécuter après chargement
total de la page et des données dans dataset
(appel à d3.csv asynchrone)

Ces fonctions seront appelées dans le scroller
au cours du scroll utilisateur

NE DEFINIR QUE DES VARIABLES ET DES FONCTIONS
NE RIEN EXECUTER ICI

*/

// Largeur de la plage de scroll en pixels
var scrollheight = 870;
// Durée des transitions
var timetransition = 500;
// Tableau qui recence les choix utilisateurs
var choices = [];
// Pas vertical d'affichage du résultat
var pas = 45;

// Cette fonction ajuste la taille des disques en fonction de la donnée
function scalablesize (d){
	var max = tabnbloby[tabnbloby.length-1];
	return d/max+0.2
}

// Cette fonction est appelée pour positionner le texte
// Elle permet d'éviter les recoupements entre les dernières
// tranches de la pie. 
function coefeloign (d){
	if ((d.index>3) && (d.index!==piezeddata.length-1)){
		return 1.5 - 0.3*(d.index%2);
	} else {
		return 1.2;
	}
}

// Associée aux sections dont les données sont traitées

function scrollAnimPie (index, pos){
	var startsection = sectionPositions[index-1];
	var alpha = (pos - startsection)/scrollheight;
	var cercles = d3.selectAll("g.loby"+choices.length+" path")
	var textes = d3.selectAll("g.loby"+choices.length+" text")
	if ((alpha>=0) && (alpha<=1)){
		// Facilite les transitions en cas de scroll brutal
		if (alpha>=0.975){
			alpha=1;
		}
		if (alpha<=0.025){
			alpha=0;
		}
		if (alpha>=0.475 && alpha <=0.525){
			alpha=0.5
		}
		// Animations
		if (alpha<=0.5){
			arcs.transition()
				.duration(30)
				.attr("transform", function (d,i){
					var angle = 0.5 * (piezeddata[i].startAngle + piezeddata[i].endAngle);
					if (angle>Math.PI){
						return "translate("+(0.5*width+2*alpha*0.25*width*Math.sin(angle))+", "+(0.5*height+(-2*alpha*0.3*height*Math.cos(angle)))+")"		
					} else {
						return "translate("+(0.5*width+2*alpha*0.15*width*Math.sin(angle))+", "+(0.5*height+(-2*alpha*0.2*height*Math.cos(angle)))+")"
					}
					
				});

			cercles.transition()
					.duration(30)
					.attr("d", arc.endAngle(function (d){
						return d.endAngle;
					}))
					.attr("d", arc.outerRadius(function (d){
					return outerRadius;
				}))
		} else {
			cercles.transition()
				.duration(30)
				.attr("d", arc.endAngle(function (d){
					return d.endAngle + 2*Math.PI*(2*alpha-1);
				}))
				.attr("d", arc.outerRadius(function (d){
					return (1-0.2*(2*alpha-1)*(1/scalablesize(d.data)))*outerRadius;
				}))
			textes.transition()
				.duration(30)
				.attr("transform", function (d,i) {
					var string = "translate(";
					var angle = 0.5 * (piezeddata[i].startAngle + piezeddata[i].endAngle);
					var textpos = this.getBoundingClientRect();
										// attention position 								// position initiale du dernier quart
					if ((angle>Math.PI) && (d.index>4) && (d.index===piezeddata.length-1) && (choices.length!==0)){
						string += ((coefeloign(d)-0.4*(2*alpha-1)) * outerRadius * Math.sin(angle));
					} else if (angle>Math.PI){
						string += ((coefeloign(d)-0.4*(2*alpha-1)) * outerRadius * Math.sin(angle) - textpos.right + textpos.left);
					} else {
						string += ((coefeloign(d)-0.4*(2*alpha-1)) * outerRadius * Math.sin(angle));
					}
					string += ', ';
					string += (-(coefeloign(d)-0.4*(2*alpha-1)) * outerRadius * Math.cos(angle));
					string += ")";
					return string;
				})
		}
	}
}

// Associée aux sections de transition

function scrollTransitPie (index, pos){
	var startsection = sectionPositions[index-1];
	var alpha = (pos - startsection)/scrollheight;
	if ((alpha>=0) && (alpha<=1)){
		// Facilite les transitions en cas de scroll brutal
		if (alpha>=0.9){
			alpha=1;
		}
		if (alpha<=0.1){
			alpha=0;
		}
		// Animations
		var old = d3.selectAll("g.loby"+(choices.length-1));
		var newer = d3.selectAll("g.loby"+choices.length);
		if (1-alpha <= 0.1){
			old.transition()
			.duration(30)
			.attr("opacity", 0);
		} else {
			old.transition()
			.duration(30)
			.attr("opacity", 1-alpha);
		}
		newer.transition()
			.duration(30)
			.attr("opacity", alpha);
	}
}

// Gestion du survol
function hoverize (){
	var cercles = d3.selectAll("g.loby"+choices.length+" path");
	if ((window.innerHeight + window.scrollY) + 15 >= document.body.offsetHeight){

		cercles.on("mouseover", function (d,i){
			var avirer = d3.selectAll("g:not(.cercle"+i+").loby"+choices.length);
			avirer.transition()
				.duration(0.5*timetransition)
				.attr("opacity", 0.3)

			avirer.select("path")
				.transition()
				.duration(0.5*timetransition)
				.attr("fill", "gray");
		})

		cercles.on("mouseout", function (d,i){
			var avirer = d3.selectAll("g:not(.cercle"+i+").loby"+choices.length);
			avirer.transition()
				.duration(0.5*timetransition)
				.attr("opacity", 1)

			avirer.select("path")
				.transition()
				.duration(0.5*timetransition)
				.attr("fill", function (d,j){
					if (j<i){
						return color(j);
					} else {
						return color(j+1);
					}
				});

		})

	} else {
		cercles.on("mouseover", function(){});
		cercles.on("mouseout", function(){});
	}
}

// Gestion du choix utilisateur : click
function clickable (){
	if ((window.innerHeight + window.scrollY) + 15 >= document.body.offsetHeight){
		var cercles = d3.selectAll("g.loby"+choices.length+" path")
						.style("cursor", "pointer");
		cercles.on("click", function (d,i){
			// On supprime l'écoute de l'événement
			cercles.on("mouseover", function (){});
			cercles.on("mouseout", function (){});
			cercles.on("click", function (){});

			// On vire les cercles non selectionnés
			var avirer = d3.selectAll("g:not(.cercle"+i+"loby"+choices.length+")")
			avirer.transition()
					.duration(timetransition)
					.attr("transform", "translate("+(-2500)+", "+2500+")");

			// Traitement de l'élément cliqué
			var selected = d3.select("g.cercle"+i+"loby"+choices.length);
			selected.transition()
					.duration(timetransition)
					.attr("transform", "translate("+(0.5*width)+", "+(0.5*height)+")")
			selected.select("path")
					.transition()
					.duration(timetransition)
					.attr("d", arc.outerRadius(function (){
						return outerRadius;
					}))
			selected.select("text")
					.transition()
					.duration(timetransition)
					.attr("transform", function (){
						var textpos = this.getBoundingClientRect();
						var string="translate(";
						string += (-textpos.right + textpos.left)/2;
						string += ", ";
						string += (-0.3*height);
						string += ")";
						return string;
					})

			// Mémorisation du choix utilisateur
			var indice = Number(selected.attr("class")[6]);
			choices.push(themelist[indice]);
			nbloby = piedata[indice];
			console.log("nbloby = "+nbloby);
			tabnbloby.push(nbloby);
			console.log(tabnbloby);

			// Affichage du choix utilisateur dans #answers
			var nbchoix = choices.length;
			if (nbchoix===1){
				var element = d3.select("span.theme");
				element.text(choices[0]);
			} else if (nbchoix===2){
				var element = d3.select("span.position");
				element.text(choices[1]);
			} else if (nbchoix===3){
				var element = d3.select("span.type");
				element.text(choices[2]);
			} else if (nbchoix===4){
				var element = d3.select("span.secteur");
				element.text(choices[3]);
			} else if (nbchoix===5){
				var element = d3.select("span.country");
				element.text(choices[4]);
			}

			// Création des nouvelles sections	
			d3.select("#sections")
				.append("section")
				.attr("id", "sec"+(currentIndex+1))
				.append("p")
				.text(function (){
					return "Chargement de nouvelles données"
				})
			// Si nbloby = 1, une section suffit pour afficher le résultat
			if (nbloby!==1){
				d3.select("#sections")
					.append("section")
					.attr("id", "sec"+(currentIndex+2))
					.append("p")
					.text(function (){
						return "Ceci est un test"
					})
			}

			// MAJ des coordonnées des sections
			majsectionspos();

			// On charge les données pour le choix suivant
			loadNewData();
			if (nbloby===1){
				setlinkURL();
				generateResult();
			} else {
				generatePie();
			}
		})
	} else {
		var cercles = d3.selectAll("path")
						.style("cursor", "default");
		cercles.on("click", function (){});
	}
}

// On charge les nouvelles données
function loadNewData (){
	if (nbloby===1){
		// On filtre les données pour ne garder que le résultat
		var nbchoix = choices.length;
		for (var i=0; i<datafiltre.length; i++){
			if (nbchoix>=2){
				if (datafiltre[i][choices[0]]!==choices[1]){
					datafiltre[i]=0
				}
			}
			if (nbchoix>=3){
				if (datafiltre[i]["Type"]!==choices[2]){
					datafiltre[i]=0
				}
			}
			if (nbchoix>=4){
				if (datafiltre[i]["Secteurs d’activité"]!==choices[3]){
					datafiltre[i]=0
				}
			}
			if (nbchoix>=5){
				if (datafiltre[i]["Pays/Région"]!==choices[4]){
					datafiltre[i]=0
				}
			}
			if (nbchoix>=6){
				if (datafiltre[i]["Nom"]!==choices[5]){
					datafiltre[i]=0
				}
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// nbloby=1, On génère le résultat dans generateResult

	} else if (choices.length===1) {
		/* Seul le thème a été choisi, 
		charger la position SUPPORTS/OPPOSES 
		du thème choisi */

		// On filtre les données selon le thème choisi
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i][choices[0]]){
				//console.log("On garde !")
			} else {
				datafiltre[i]=0;
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// On génère le jeu de variable pour les éléments graphiques
		piedata = [0,0]; // SUPPORTS, OPPOSES
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i][choices[0]]==="SUPPORT"){
				piedata[0]++;
			} else if (datafiltre[i][choices[0]]==="OPPOSE"){
				piedata[1]++;
			}
		}
		piezeddata = pie(piedata);
		themelist = ["SUPPORT", "OPPOSE"];
	} else if (choices.length===2) {
		/* L'utilisateur a choisi son thème
		ainsi que sa position par rapport à ce thème. 
		Charger maintenant la catégorie de lobbyist */

		// On filtre les données selon la position choisie
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i][choices[0]]===choices[1]){
				//console.log("On garde !")
			} else {
				datafiltre[i]=0;
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// On génère le jeu de variables graphiques
		themelist=[];
		piedata=[];
		for (var i=0; i<datafiltre.length; i++){
			var donnee = datafiltre[i]["Type"]
			var indice = themelist.indexOf(donnee);
			if (indice===-1){
				themelist.push(donnee);
				piedata.push(1);
			} else {
				piedata[indice]++;
			}
		}
		piezeddata = pie(piedata);
	} else if (choices.length===3) {
		/* L'utilisateur a choisi son thème
		ainsi que sa position par rapport à ce thème. 
		Il vient de choisir le type de structure qui lui convient. 
		Charger maintenant le secteur de lobby */

		// On filtre les données selon le type choisi
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i]["Type"]===choices[2]){
				//console.log("On garde !")
			} else {
				datafiltre[i]=0;
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// On génère le jeu de variables graphiques
		themelist=[];
		piedata=[];
		for (var i=0; i<datafiltre.length; i++){
			var donnee = datafiltre[i]["Secteurs d’activité"]
			var indice = themelist.indexOf(donnee);
			if (indice===-1){
				themelist.push(donnee);
				piedata.push(1);
			} else {
				piedata[indice]++;
			}
		}
		piezeddata = pie(piedata);
	} else if (choices.length===4) {
		/* L'utilisateur a choisi son thème
		ainsi que sa position par rapport à ce thème. 
		Il a choisi le type de structure qui lui convient. 
		Il vient de choisir le secteur qui lui convient. 
		Charger maintenant le pays de lobby */

		// On filtre les données selon le secteur choisi
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i]["Secteurs d’activité"]===choices[3]){
				//console.log("On garde !")
			} else {
				datafiltre[i]=0;
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// On génère le jeu de variables graphiques
		themelist=[];
		piedata=[];
		for (var i=0; i<datafiltre.length; i++){
			var donnee = datafiltre[i]["Pays/Région"]
			var indice = themelist.indexOf(donnee);
			if (indice===-1){
				themelist.push(donnee);
				piedata.push(1);
			} else {
				piedata[indice]++;
			}
		}
		piezeddata = pie(piedata);
	} else if (choices.length===5) {
		/* L'utilisateur a choisi son thème,
		sa position par rapport à ce thème ainsi que 
		le type de structure qui lui convient et son secteur. 
		Il vient de choisir son pays de prédilection. 
		On prop */

		// On filtre les données selon le type choisi
		for (var i=0; i<datafiltre.length; i++){
			if (datafiltre[i]["Pays/Région"]===choices[4]){
				//console.log("On garde !")
			} else {
				datafiltre[i]=0;
			}
		} 
		while (datafiltre.indexOf(0)!==-1){
			datafiltre.splice(datafiltre.indexOf(0), 1);
		}

		// On génère le jeu de variables graphiques
		themelist=[];
		piedata=[];
		for (var i=0; i<datafiltre.length; i++){
			var donnee = datafiltre[i]["Nom"]
			var indice = themelist.indexOf(donnee);
			if (indice===-1){
				themelist.push(donnee);
				piedata.push(1);
			} else {
				piedata[indice]++;
			}
		}
		piezeddata = pie(piedata);
	}
}

// Affichage d'une nouvelle pie à partir de themelist et piezeddata
function generatePie (){
	console.log(piezeddata);
	arc = d3.arc()
                .innerRadius(0)
                .outerRadius(outerRadius);

	arcs = svg.selectAll("g.xxx")
					.data(piezeddata)
					.enter()
					.append("g")
					.attr("class", "arc")
					.attr("class", function (d,i){
						return "cercle"+i+" "+"loby"+choices.length+" cercle"+i+"loby"+choices.length;
					})
					.attr("transform", "translate("+(0.5*width)+", "+(0.5*height)+")")
					.attr("opacity", 0);

	arcs.append("path")
		.attr("d", arc)
		.attr("fill", function (d,i){
			return color(i);
		})

	arcs.append("text")
		.text(function (d,i){ return themelist[i]+" ("+piezeddata[i].data+")" })
		.style("font-size", function (d){
			return 0.6*width/height+"em"
		})
		.attr("transform", function (d,i) {
			var string = "translate(";
			var angle = 0.5 * (piezeddata[i].startAngle + piezeddata[i].endAngle);
			var textpos = this.getBoundingClientRect();
								// attention position
			if ((angle>Math.PI) && (d.index>4) && (d.index===piezeddata.length-1)){
				string += (coefeloign(d) * outerRadius * Math.sin(angle));
			} else if (angle>Math.PI){
				string += (coefeloign(d) * outerRadius * Math.sin(angle) - textpos.right + textpos.left);
			} else {
				string += (coefeloign(d) * outerRadius * Math.sin(angle));
			}
			string += ', ';
			string += (-coefeloign(d) * outerRadius * Math.cos(angle));
			string += ")";
			return string;
		})
}

function generateResult (){
	// nbloby === 1

	// Création des éléments graphiques
	svg.append("text")
		.attr("class", "result abr")
		.attr("opacity", 0)
		.text(datafiltre[0]["Abréviation"])

	svg.append("text")
		.attr("class", "result nom")
		.attr("opacity", 0)
		.text(datafiltre[0]["Nom"]);

	svg.append("text")
		.attr("class", "result secteur")
		.attr("opacity", 0)
		.text(datafiltre[0]["Secteurs d’activité"]);

	svg.append("text")
		.attr("class", "result country")
		.attr("opacity", 0)
		.text(datafiltre[0]["Pays/Région"]);

	var deploby = Number(datafiltre[0]["Dépenses Lobby (€)"]);
	svg.append("text")
		.attr("class", "result costs")
		.attr("opacity", 0)
		.text("Dépenses Lobby : "+ (deploby ? (deploby+" €") : "Non renseigné") );

	svg.select("text.abr")
		.attr("x", function(){
			var textpos = this.getBoundingClientRect();
			return width/2 - (textpos.right - textpos.left)/2;
		})
		.attr("y", function(){
			return height/3;
		});

	svg.select("text.nom")
		.attr("x", function(){
			var textpos = this.getBoundingClientRect();
			return width/2 - (textpos.right - textpos.left)/2;
		})
		.attr("y", function(){
			return height/3 + 1.5*pas;
		});

	svg.select("text.secteur")
		.attr("x", function(){
			var textpos = this.getBoundingClientRect();
			return width/2 - (textpos.right - textpos.left)/2;
		})
		.attr("y", function(){
			return height/3 + 1.5*pas + 1*pas;
		});

	svg.select("text.country")
		.attr("x", function(){
			var textpos = this.getBoundingClientRect();
			return width/2 - (textpos.right - textpos.left)/2;
		})
		.attr("y", function(){
			return height/3 + 1.5*pas + 2*pas;
		});

	svg.select("text.costs")
		.attr("x", function(){
			var textpos = this.getBoundingClientRect();
			return width/2 - (textpos.right - textpos.left)/2;
		})
		.attr("y", function(){
			return height/3 + 1.5*pas + 3*pas;
		});

	// MAJ des données de answers
	d3.select("span.type").text(datafiltre[0]["Type"]);
	d3.select("span.secteur").text(datafiltre[0]["Secteurs d’activité"]);
	d3.select("span.country").text(datafiltre[0]["Pays/Région"]);

}

function displayResult (pos){
	var startsection = sectionPositions[currentIndex-1];
	var alpha = (pos - startsection)/scrollheight;
	if ((alpha>=0) && (alpha<=1)){
		// Facilite les transitions en cas de scroll brutal
		if (alpha>=0.9){
			alpha=1;
		}
		if (alpha<=0.1){
			alpha=0;
		}
		// Animations
		var disques = d3.selectAll("g");
		var res = d3.selectAll("text.result");
		disques.attr("opacity", 1-alpha);
		res.attr("opacity", alpha);
	}
}

/* Les fonctions qui suivent permettent d'assurer 
les retour en arrière lorsque l'utilisateur scroll */

function displayPie(){

	// Suppression des sections
	if ((currentIndex%2===1) && ((maxindex-currentIndex)>1)){
		console.log("Remove"+currentIndex)
		d3.selectAll("#sec"+(currentIndex+1)).remove();
		d3.selectAll("#sec"+(currentIndex+2)).remove();
		majsectionspos();
	}
}