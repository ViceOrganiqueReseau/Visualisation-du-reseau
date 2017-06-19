// Informations sur #vue
var vue = document.getElementById("vue");
var vuepos = vue.getBoundingClientRect();
var height = vue.offsetHeight - 2 * 5; // 5 est le padding de #vue
var width = vue.offsetWidth - 2 * 5;

vue = d3.select("#vue");
var canvas = vue.append("canvas")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "visible");
var hidden = vue.append("canvas")
      .attr("width", width)
      .attr("height", height)
      .style("display", "none");
var colToNode = {};

var ctx = canvas.node().getContext("2d");
var ctxhid = hidden.node().getContext("2d");

function clearCanvas (){
  ctx.clearRect(0,0,width,height);
  ctxhid.clearRect(0,0,width,height);
  colToNode = {};
  nextCol = 1;
}

var nextCol=1;
function genHiddenColor(){
  var ret = [];
    // via http://stackoverflow.com/a/15804183
    if(nextCol < 16777215){
      ret.push(nextCol & 0xff); // R
      ret.push((nextCol & 0xff00) >> 8); // G 
      ret.push((nextCol & 0xff0000) >> 16); // B

      nextCol += 1;
    } else {
      console.log("Stock de couleurs épuisé")
      return "error"
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
var camera = new THREE.PerspectiveCamera(45, width/height, near, far);
var scene = new THREE.Scene();

// Add camera to scene
scene.add(camera);

// Start the renderer
renderer.setSize(width, height)
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