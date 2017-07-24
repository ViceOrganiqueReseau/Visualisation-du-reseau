// Transitions de backgroung-color
var CONST = {};
CONST.TIMETRANSITION = 1000;
d3.select("body").transition().duration(2*CONST.TIMETRANSITION).style("background-color", "rgb(0,5,15)");
d3.select("#answers").transition().duration(2*CONST.TIMETRANSITION).style("background-color", "rgb(0,5,15)");

// Informations sur #vue
var vue = document.getElementById("vue");

CONST.VUE = {};
CONST.VUE.POSITION = vue.getBoundingClientRect();
CONST.VUE.PADDING = 5;
CONST.VUE.HEIGHT = vue.offsetHeight - 2 * CONST.VUE.PADDING;
CONST.VUE.WIDTH = vue.offsetWidth - 2 * CONST.VUE.PADDING;

vue = d3.select("#vue");
// Dessin affiché dans la vue
var canvas = vue.append("canvas")
      .attr("width", CONST.VUE.WIDTH)
      .attr("height", CONST.VUE.HEIGHT)
      .attr("class", "visible");
// Canvas caché qui diférencie les noeuds, 
// pour gérer les animation
var hidden = vue.append("canvas")
      .attr("class", "cache")
      .attr("width", CONST.VUE.WIDTH)
      .attr("height", CONST.VUE.HEIGHT)
      .style("display", "none");
// colToNode : couleur sur canvas caché --> noeud
var colToNode = {};

// Les contextes des 2 canvas pour déssiner
var ctx = canvas.node().getContext("2d");
var ctxhid = hidden.node().getContext("2d");

// Efface le canvas
function clearCanvas (){
  ctx.clearRect(0,0,CONST.VUE.WIDTH,CONST.VUE.HEIGHT);
  ctxhid.clearRect(0,0,CONST.VUE.WIDTH,CONST.VUE.HEIGHT);
  colToNode = {};
  nextCol = 1;
  // Sans cette ligne, problème au survol en section 8
  // Tout le canvas peut devenir quasi transparent
  ctx.globalAlpha = 1;
}

// Gestion des couleurs du canvas caché
var nextCol=1;
function genHiddenColor(){
  var ret = [];
    // via http://stackoverflow.com/a/15804183
    if(nextCol < 16777215){
      ret.push(nextCol & 0xff); // R
      ret.push((nextCol & 0xff00) >> 8); // G 
      ret.push((nextCol & 0xff0000) >> 16); // B

      nextCol += 100;
      // On limite le daltonisme de l'ordinateur
      // Toutefois, nombre de noeuds max : 16777215/increment
      // Surveiller l'affichage d'erreur sur la console. 
    } else {
      throw new Error("Stock de couleurs épuisés, cf setupscene.js : function getHiddenColor")
    }
    var col = "rgb(" + ret.join(',') + ")";
    return col;
}

/* Mise en place de la scène WebGL
// Camera setup
var view_angle = 45;
var near = 0.1
var far = 10000;

// Creation of a new WebGL renderer, camera a,d scene
var renderer = new THREE.WebGLRenderer({alpha: true});
var camera = new THREE.PerspectiveCamera(45, CONST.VUE.WIDTH/CONST.VUE.HEIGHT, near, far);
var scene = new THREE.Scene();

// Add camera to scene
scene.add(camera);

// Start the renderer
renderer.setSize(CONST.VUE.WIDTH, CONST.VUE.HEIGHT)
renderer.setClearColor( 0x000000, 0 );

// Attach the renderer-supplied DOM element. 
vue.appendChild(renderer.domElement);



/*
// Test d'affichage d'une sphère 3D

// create the sphere's material
const sphereMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0x0000CC
    });

const RADIUS = 50;
const SEGMENTS = 16;
const RINGS = 16;

// Create a new mesh with
// sphere geometry - we will cover
// the sphereMaterial next!
const sphere = new THREE.Mesh(

  new THREE.SphereGeometry(
    RADIUS,
    SEGMENTS,
    RINGS),

  sphereMaterial);

// Move the Sphere back in Z so we
// can see it.
sphere.position.z = -300;

// Finally, add the sphere to the scene.
scene.add(sphere);

const pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

// Draw!
renderer.render(scene, camera);
*/