// Ce script gère les liens vers la plateforme

var linksloby = d3.select("#links");

function createlinks (){
	// Création des liens vers les thèmes
	for (var i=0; i<themelist.length; i++){
		linksloby.select("#boxes-container")
				.append("a")
				.text(themelist[i])
				.attr("href", "reseau.html?theme="+i);
	}

	linksloby.select("#boxes-container")
				.append("a")
				.text("Identifiez-vous !")
				.attr("href", "index.html");
}

function displaylinksError (){

	// Afficher le texte d'erreur
	linksloby.select("p")
			.text("Désolé, il y a eu une erreur !")

	linksloby.style("display", "block");
	d3.select("#backloby").style("display", "block");

}

function displaylinksEnd (){

	// Afficher le texte d'erreur
	linksloby.select("p")
			.text("Et voilà, c'est fini !")

	linksloby.style("display", "block");

}

function invisiblelinks (){
	linksloby.style("display", "none");
}