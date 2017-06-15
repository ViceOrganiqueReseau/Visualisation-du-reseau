/* Ce script gère le rechargement de la page par l'utilisateur
via F5 ainsi que le bouton #reloadbox qui recharge la page depuis
 le début */

var returner = document.getElementById('reloadbox');

window.onbeforeunload = function(){
	window.scrollTo(0,0);
}

returner.addEventListener("click", function() {
	window.scrollTo(0,0);
	document.location.reload();
});