/* Ce script gère le rechargement de la page par l'utilisateur
via F5 ainsi que le bouton #reloadbox qui recharge la page depuis
 le début */

/* ATTENTION : Ce script est commun aux deux pages ! */

window.onbeforeunload = function(){
  window.scrollTo(0,0);
}

// L'affichage des crédits
var opener = document.getElementById("opencredits");
var closer = document.getElementById("closecredits");
var element = document.getElementById("credits")

function onclickOpenOpener (){
  element.style.display = "block";
  opener.removeEventListener("click", onclickOpenOpener);
  opener.addEventListener("click", onclickCloseOpener);
}
function onclickCloseOpener (){
  element.style.display = "none";
  opener.removeEventListener("click", onclickCloseOpener);
  opener.addEventListener("click", onclickOpenOpener);
}
opener.addEventListener("click", onclickOpenOpener);

closer.addEventListener("click", function (){
  element.style.display = "none";
  opener.removeEventListener("click", onclickOpenOpener);
  opener.removeEventListener("click", onclickCloseOpener);
  opener.addEventListener("click", onclickOpenOpener);
})