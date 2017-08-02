/* Pour gérer les couleurs d'affichages,
modifier les valeurs de couleurs dans ce script. 
La couleur de fond se modifie dans le fichier styles.css*/


// Couleur d'un élément qui s'efface au survol d'un autre
var colormousenoton;
var colorlastanswer = "rgb(45, 82, 252)";

// Couleurs des diques en fonction de l'indice
function color (i){
  switch (i){
    case 0: return "rgb(31, 113, 184)";
    case 1: return "rgb(32, 150, 200)";
    case 2: return "rgb(135, 179, 220)";
    case 3: return "rgb(55, 184, 227)";
    case 4: return "rgb(56, 174, 188)";
    case 5: return "rgb(99, 150, 200)";
    default: return "rgb(56, 116, 252)";
  }
}