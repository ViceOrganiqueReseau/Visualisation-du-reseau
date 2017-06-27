// L'élément lien vers le réseau
var link = document.getElementById("network");

function setlinkURL (){
	if (nbloby===1){
		var ID = datafiltre[0]["ID"];
		var themeid = idToTheme.indexOf(choices[0]);
		link.setAttribute("href", "reseau.html?theme="+themeid+"&id="+ID);
	}
}

function visiblelink (){
	if (nbloby===1){
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight){
			link.style.display = "block";
		} else {
			link.style.display = "none";
		}
	}
}