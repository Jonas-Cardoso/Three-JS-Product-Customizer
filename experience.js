import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let canvas;
let controls;
let camera;
let scene;
let renderer;
let light;
let model;
let boundingBox;
let center;
let materialWood;
let materialWicker;
let partLists = [
  "Tampo",
  "Tampo_2",
  "Pés",
  "Gaveta_L",
  "Gaveta_R",
  "Nicho",
  "Porta_R",
  "Porta_L",
];
let partObjects = [];
let action;
let animationStates = [];
let animations;
let mixer;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
var clock = new THREE.Clock();

const MODEL_PATH = "model/vintageDesk.glb";
const MATERIAL_WOOD_COLOR = "materials/Wood_Color.png";
const MATERIAL_WOOD_NORMAL = "materials/Wood_Normal.png";
const MATERIAL_WICKER_COLOR = "materials/Wicker_Color.png";
const MATERIAL_WICKER_NORMAL = "materials/Wicker_Normal.png";
const MIN_ZOOM_DISTANCE = 3.5;
const MAX_ZOOM_DISTANCE = 5;
const FIELD_OF_VIEW = 30;
const MIN_DRAW_DISTANCE = 0.25;
const MAX_DRAW_DISTANCE = 20;

init();
animate();

function init() {
  canvas = document.getElementById("experience");
  createScene();
  createCamera();
  createControls();
  createModel();
  createLight();
  createMaterials();
  gltfRender();
  canvas.addEventListener("click", onCanvasMouseClick, false);
  window.addEventListener("resize", onWindowResize, false);
  document
    .getElementById("defaultMaterial")
    .addEventListener("click", setDefaultMaterial, false);
  document
    .getElementById("newMaterial")
    .addEventListener("click", setNewMaterial, false);
  document
    .getElementById("front")
    .addEventListener("click", animateCameraFront, false);
  document
    .getElementById("left")
    .addEventListener("click", animateCameraLeft, false);
  document
    .getElementById("right")
    .addEventListener("click", animateCameraRight, false);
  document
    .getElementById("back")
    .addEventListener("click", animateCameraBack, false);
  document
    .getElementById("top")
    .addEventListener("click", animateCameraTop, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function gltfRender() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    depth: true,
    precision: "highp",
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.appendChild(renderer.domElement);
}

function createModel() {
  new GLTFLoader().load(MODEL_PATH, function (gltf) {
    model = gltf.scene;
    animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    model.position.set(0, 0, 0);
    scene.add(model);
    boundingBox = new THREE.Box3().setFromObject(model);
    center = boundingBox.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    controls.update();
    gltf.scene.traverse(function (child) {
      if (partLists.includes(child.name)) {
        if (child.name === "Porta_R" || child.name === "Porta_L") {
          partObjects.push({
            mesh: child.name,
            material: [
              child.children[0].material,
              child.children[1].material,
              child.children[2].material,
            ],
          });
        } else if (
          child.name === "Gaveta_L" ||
          child.name === "Gaveta_R" ||
          child.name === "Nicho"
        ) {
          partObjects.push({
            mesh: child.name,
            material: [child.children[0].material, child.children[1].material],
          });
        } else {
          partObjects.push({
            mesh: child.name,
            material: child.material,
          });
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.material.roughness = 0.8;
        child.material.metalness = 0.4;
      }
      console.log(partObjects);
    });
  });
}

function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(1, 1, 1);
  var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshLambertMaterial()
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
}

function createLight() {
  light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 1, 1.1);
  light.intensity = 0.15;
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 10, 5);
  light.intensity = 0.35;
  light.castShadow = true;
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 15, 10);
  light.intensity = 0.85;
  light.castShadow = true;
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 5, -20);
  light.intensity = 1;
  light.castShadow = true;
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(20, 0, 0);
  light.intensity = 0.25;
  light.castShadow = true;
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-20, 0, 0);
  light.intensity = 0.25;
  light.castShadow = true;
  scene.add(light);
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    FIELD_OF_VIEW,
    canvas.clientWidth / canvas.clientHeight,
    MIN_DRAW_DISTANCE,
    MAX_DRAW_DISTANCE
  );
  camera.position.set(0, 0, 1);
}

function createControls() {
  controls = new OrbitControls(camera, canvas);
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minDistance = MIN_ZOOM_DISTANCE;
  controls.maxDistance = MAX_ZOOM_DISTANCE;
}

function createMaterials() {
  var textureLoader = new THREE.TextureLoader();
  var materialWoodColor = textureLoader.load(MATERIAL_WOOD_COLOR);
  var materialWoodNormal = textureLoader.load(MATERIAL_WOOD_NORMAL);
  var materialWickerColor = textureLoader.load(MATERIAL_WICKER_COLOR);
  var materialWickerNormal = textureLoader.load(MATERIAL_WICKER_NORMAL);
  materialWickerColor.wrapS = THREE.RepeatWrapping;
  materialWickerColor.wrapT = THREE.RepeatWrapping;
  materialWickerColor.repeat.set(1, 1);
  materialWickerNormal.wrapS = THREE.RepeatWrapping;
  materialWickerNormal.wrapT = THREE.RepeatWrapping;
  materialWickerNormal.repeat.set(1, 1);

  materialWood = new THREE.MeshStandardMaterial({
    map: materialWoodColor,
    normalMap: materialWoodNormal,
  });

  materialWicker = new THREE.MeshStandardMaterial({
    map: materialWickerColor,
    normalMap: materialWickerNormal,
  });
}

function setNewMaterial() {
  model.getObjectByName("Tampo").material = materialWood;
  model.getObjectByName("Tampo_2").material = materialWood;
  model.getObjectByName("Pés").material = materialWood;
  model.getObjectByName("Gaveta_L").children[0].material = materialWood;
  model.getObjectByName("Gaveta_L").children[1].material = materialWood;
  model.getObjectByName("Gaveta_R").children[0].material = materialWood;
  model.getObjectByName("Gaveta_R").children[1].material = materialWood;
  model.getObjectByName("Nicho").children[0].material = materialWood;
  model.getObjectByName("Nicho").children[1].material = materialWood;
  model.getObjectByName("Porta_R").children[0].material = materialWood;
  model.getObjectByName("Porta_R").children[1].material = materialWicker;
  model.getObjectByName("Porta_R").children[2].material = materialWood;
  model.getObjectByName("Porta_L").children[0].material = materialWood;
  model.getObjectByName("Porta_L").children[1].material = materialWicker;
  model.getObjectByName("Porta_L").children[2].material = materialWood;
}

function setDefaultMaterial() {
  partObjects.forEach((part) => {
    if (part.mesh === "Porta_R" || part.mesh === "Porta_L") {
      model.getObjectByName(part.mesh).children[0].material = part.material[0];
      model.getObjectByName(part.mesh).children[1].material = part.material[1];
      model.getObjectByName(part.mesh).children[2].material = part.material[2];
    } else if (
      part.mesh === "Gaveta_L" ||
      part.mesh === "Gaveta_R" ||
      part.mesh === "Nicho"
    ) {
      model.getObjectByName(part.mesh).children[0].material = part.material[0];
      model.getObjectByName(part.mesh).children[1].material = part.material[1];
    } else {
      model.getObjectByName(part.mesh).material = part.material;
    }
  });
}

function onCanvasMouseClick(event) {
  const holder = renderer.domElement;
  const rect = holder.getBoundingClientRect();
  mouse.x =
    ((event.pageX - rect.left - window.scrollX) / holder.clientWidth) * 2 - 1;
  mouse.y =
    -((event.pageY - rect.top - window.scrollY) / holder.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(model.children, true);
  if (intersects.length > 0) {
    let animation = animations.find(
      (animation) => animation.name === intersects[0].object.parent.name
    );
    if (animation && !animationStates.includes(animation.name)) {
      animateModelForward(animation);
      animationStates.push(animation.name);
    } else if (animationStates.includes(animation.name)) {
      animateModelReverse(animation);
      animationStates = animationStates.filter(
        (item) => item !== animation.name
      );
    }
  }
}

function animateCameraFront() {
  camera.position.set(0, 0, 1);
  controls.update();
}

function animateCameraLeft() {
  camera.position.set(-1, 0, 0);
  controls.update();
}

function animateCameraRight() {
  camera.position.set(1, 0, 0);
  controls.update();
}

function animateCameraBack() {
  camera.position.set(0, 0, -1);
  controls.update();
}

function animateCameraTop() {
  camera.position.set(0, 1, 0);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  var delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }
  renderer.render(scene, camera);
}

function animateModelForward(animation) {
  action = mixer.clipAction(animation);
  action.reset();
  action.clampWhenFinished = true;
  action.timeScale = 1;
  action.setLoop(THREE.LoopOnce, 1);
  action.play();
}

function animateModelReverse(animation) {
  action = mixer.existingAction(animation);
  action.timeScale = -1;
  action.paused = false;
}
