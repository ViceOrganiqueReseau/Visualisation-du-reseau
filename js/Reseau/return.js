/* Ce script gère le rechargement de la page par l'utilisateur
via F5 ainsi que le bouton #reloadbox qui recharge la page depuis
 le début */

window.onbeforeunload = function(){
  window.scrollTo(0,0);
}