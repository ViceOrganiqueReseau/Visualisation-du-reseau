/* Fonctions utilitaires */
// tire aléatoirement un nombre entre `min` et `max`
var rand  = function(min , max){ return Math.random()*max + min; };
// tire aléatoirement un élément du tableau `arr`. 
var randPick = function(arr){ return arr[Math.round(rand(0, arr.length-1))]; };
// retourne aléatoirement 1 ou -1
var randSign = function(){ return Math.random()>0.5 ? 1:-1 };

var flattenArray = function(arrays){
  return arrays.reduce(function(a,b){ return a.concat(b); });
};

var transform = function(pt, scale){
  scale = scale || 1.0;
  var scaleStr = scale !== 1.0 ? ' scale('+scale+')':'';
  return 'translate('+pt.x+','+pt.y+')'+scaleStr;
};

var Utils = {
  rand: {
    number: rand,
    pick: randPick,
    sign: randSign,
  },
  flattenArray: flattenArray,
  fade: fade
};
