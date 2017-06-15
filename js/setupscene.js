// Informations sur #vue
var vue = document.getElementById("vue");
var vuepos = vue.getBoundingClientRect();
var height = vue.offsetHeight - 2 * 5; // 5 est le padding de #vue
var width = vue.offsetWidth - 2 * 5;

// Camera setup
var view_angle = 45;
var near = 0.1
var far = 10000;

// Creation of a new WebGL renderer, camera a,d scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(45, width/height, near, far);
var scene = new THREE.Scene();

// Add camera to scene
scene.add(camera);

// Start the renderer
renderer.setSize(width, height)

// Attach the renderer-supplied DOM element. 
vue.appendChild(renderer.domElement);