# Visualisation du reseau des lobbyists climatiques

Le but du projet est de représenter le réseau des lobbyists climatiques dans une interface jouant avec le scroll de l'utilisateur. Les données sur le réseau sont sous forme de fichiers .csv, seront importés à l'aide de d3js et représentés en utilisant la librairie Three.js ou Canvas 2D. 

# Etat actuel du projet au 23/06/2017

A l'intention de Skoli : dans la partie Réseau, le rôle de chaque script est indiqué. N'hésitez pas à en créer d'autres si necéssaire. Le contenu de la première partie est mis sur l'organisation pour vous montrer le déroulement plus global du projet. 

## Identification dans le réseau des lobbyists

Cette partie permet à l'utilisateur de se positionner dans le réseau. Elle est pour l'essentiel terminée (debug prévu pour plus tard)
* fichier HTML : index.html
* fichiers CSS : css/Index/
* fichiers JS : js/Index/ + d3js (librairie partagée)
* données : data/  (partagé)

## Visualisation du réseau

Dans cette partie, on propose une visualisation du réseau en fonction de ses choix précédents. 
* fichier HTML : reseau.html
* fichiers CSS : css/Reseau/
* fichiers JS : js/Reseau/ + d3js + Three.js (librairies partagées)
	* getURL.js : récupère les choix utilisateur dans l'URL
	* return.js : gère le boutton "Back to Top"
	* setupscene.js : prépare la scène d'affichage (Canvas 2D contexte, WebGL avec Three.js...)
	* importdata.js : initialise des variables et importe les données
	* displaydata.js : définit les fonctions qui affichent les données
	* animdata : gère l'interaction avec l'utilisateur
	* scroller.js : gère le scroll de la page, appel aux fonctions des scripts précédents
	* linksToLoby.js : gère les liens qui s'affichent en cas de manipulation de l'URL (arguments non pertinents, faux...)
* donnée : data/ (partagé)