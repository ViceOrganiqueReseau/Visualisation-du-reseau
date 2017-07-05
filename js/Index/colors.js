/* Pour gérer les couleurs d'affichages,
modifier les valeurs de couleurs dans ce script. 
La couleur de fond se modifie dans le fichier styles.css*/


// Couleur d'un élément qui s'efface au survol d'un autre
var colormousenoton;
var colorlastanswer = "rgb(45, 82, 252)";

// Couleurs des diques en fonction de l'indice
function color (i){
  switch (i){
    case 0: return "rgb(1, 95, 102)";
    case 1: return "rgb(45, 241, 255)";
    case 2: return "rgb(34, 86, 150)";
    case 3: return "rgb(0, 132, 88)";
    case 4: return "rgb(56, 255, 188)";
    case 5: return "rgb(77, 168, 137)";
    default: return "rgb(1, 95, 102)";
  }
}