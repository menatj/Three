import {
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Vector3,
  Vector4,
  Line,
  LineLoop,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
  MOUSE,
  Clock,
  MeshLambertMaterial,
  DirectionalLight,
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  GridHelper,
  WireframeGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  AxesHelper,
  BufferGeometry,
  BufferAttribute,
  TrianglesDrawMode,
  TriangleStripDrawMode,
  Triangle,
  Object3D,
  Uint32BufferAttribute,
  Uint16BufferAttribute,
  Float32BufferAttribute,
  Float64BufferAttribute,
  ShaderMaterial,
  BufferGeometryLoader,
  LoadingManager,
} from "three";

import CameraControls from "camera-controls";

const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

import { cross, index, norm, typeOf } from "mathjs";
CameraControls.install({ THREE: subsetOfTHREE });
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { panelsr, pointsSorted, indexesSorted } from "./src/custom_mesh";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";


const container = document.querySelector(".main-container");
const header = document.createElement("div");
header.className = "header";

const appcontainer = document.createElement("div");
appcontainer.className = "appcontainer";

const rightbar = document.createElement("div");
rightbar.className = "rightbar";

const viewer = document.createElement("div");
const totalHeight = window.innerHeight || document.body.clientHeight;

const totalWidth = window.screen.width;

viewer.className = "viewer";
viewer.style.height = `${totalHeight} + px`;
document.scr
const divs = [appcontainer];
const appelements = [viewer];

for (let element of divs) {
  container.appendChild(element);
}

for (let element of appelements) {
  appcontainer.appendChild(element);
}

const title = document.createElement("h1");
title.textContent = "GEOMETRY VIEWER 🔍";

const canvas = document.createElement("canvas");
canvas.id = "three-canvas";

const guiElement = document.createElement("div");

//  Spaces titles

const rightbarTitle = document.createElement("h3");
rightbarTitle.textContent = "Element Information";

const viewertitle = document.createElement("h3");
viewertitle.textContent = "Geometry Analisis";

//viewer.appendChild(viewertitle);
viewer.appendChild(canvas);
viewer.appendChild(guiElement);

guiElement.id = "three-gui";


  // Scene

const scene = new Scene();
scene.background = null;

const edgesMaterial = new LineBasicMaterial({
  color: 0x000000,
});

//  Reading from JSON

const flatcoord = [].concat(...pointsSorted["points"]);
const flatcoordsc = [];

for (let v of flatcoord) {
  const sclcrd = v * 0.0001;
  flatcoordsc.push(sclcrd);
}

const indexes = indexesSorted["indexes"];

const colorArray = [];

for (let c in indexes) {
  const color = [85, 213, 83];
  colorArray.push(color);
}

// Arrays

const flatColorArr = new Float32Array([].concat(...colorArray));

const vertices = new Float32Array(flatcoordsc);

// Geometry

const geometry = new BufferGeometry();

geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
geometry.setAttribute("color", new Float32BufferAttribute(flatColorArr, 3));


// the materials

const material = new MeshBasicMaterial({
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
  side: 2,
  vertexColors: true,
});


const wireTriangle = new WireframeGeometry(geometry);
const wireframe = new LineSegments(wireTriangle, edgesMaterial);
const mesh =  new Mesh(geometry, material);
scene.add(mesh);
scene.add(wireframe);

// Helpers

const axes = new AxesHelper(1);
axes.material.depthTest = true;
const grid = new GridHelper();
grid.material.depthTest = true;
grid.renderOrder = 2;
scene.add(axes);
scene.add(grid);

// GUI

const gui = new GUI({ autoPlace: false });
const min = -3;
const max = 3;
const step = 0.001;
gui.width = 800;
gui.domElement.id = "three-gui";
guiElement.append(gui.domElement);

const colorParam = {
  color: 0xff0000,
};

gui.add(mesh.position, "x", min, max, step);
gui.addColor(colorParam, "color").onChange(() => {
  mesh.material.color.set(colorParam.color);
});

// lights

const light = new DirectionalLight();
light.position.set(3, 2, 1).normalize();
scene.add(light);

const light2 = new AmbientLight(0xffffff, 0.3);
light.position.set(-3, 2, -1).normalize();

scene.add(light2);

// camera;

const camera = new PerspectiveCamera(
  50,
  canvas.clientWith / canvas.clientHeight
);
camera.position.z = 3;
camera.position.y = 3;
camera.position.x = 3;
camera.lookAt(new Vector3(0, 0, 0));
scene.add(camera);

// Raycaster picking

const rayCaster = new Raycaster();
const mouse = new Vector2();

const previousSelection = {
  index: null,
  face: null,
  location: null,
};

let firstCollision;

const collision = [];
const lableArray = [];

canvas.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
  rayCaster.setFromCamera(mouse, camera);

  const intersects = rayCaster.intersectObject(mesh);
  const hasCollided = intersects.length !== 0;

  const label = document.createElement("p");
  label.className = "label";
  const labelObject = new CSS2DObject(label);
  lableArray.push(labelObject);

  if (!hasCollided) {
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(flatColorArr, 3)
    );
    labelObject.removeFromParent;
    label.id = "hidden-label";
    for (let l of lableArray) {
      l.removeFromParent();
    }
    lableArray.length = 0;
    return;
  }

  firstCollision = intersects[0].faceIndex;
  collision.push(firstCollision);

  if (collision.length > 1) {
    const isPrevious = firstCollision in collision;

    for (let l of lableArray) {
      l.removeFromParent();
    }
    if (!isPrevious) {
      geometry.setAttribute(
        "color",
        new Float32BufferAttribute(flatColorArr, 3)
      );
    }
    collision.length = 0;
  }

  previousSelection.location = intersects[0].point;
  previousSelection.index = intersects[0].faceIndex;
  previousSelection.face = intersects[0].face;
  const face = previousSelection.face;
  const x = face.a;
  const y = face.b;
  const z = face.c;
  const collorAttribute = geometry.getAttribute("color");
  collorAttribute.setXYZ(x, 250, 0, 0);
  collorAttribute.setXYZ(y, 250, 0, 0);
  collorAttribute.setXYZ(z, 250, 0, 0);
  collorAttribute.needsUpdate = true;

  // //debugger;
  
  label.textContent = `this is panel ${firstCollision}`;
  const location = previousSelection.location;

  if (lableArray.length > 1) {
    labelObject.position.copy(location);
    const previousLabel = lableArray[lableArray.length - 2];
    const currentLabel = lableArray[lableArray.length - 1];
    currentLabel.position.copy(location);
    scene.add(currentLabel);
    previousLabel.removeFromParent();
  }
});

//the renderer

const renderer = new WebGLRenderer({ canvas: canvas });

renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 1);


//controls

const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);

cameraControls.dollyToCursor = true;

const labelRenderer = new CSS2DRenderer();

labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "0";

document.body.appendChild(labelRenderer.domElement);

//animtation

function animate(){
  requestAnimationFrame(animate);
  const detla = clock.getDelta();
  cameraControls.update(detla);
  labelRenderer.render(scene, camera);
  renderer.render(scene,camera);
  console.log('im animated')
  console.log(renderer.info.render.calls);
};

renderer.render(scene, camera);

animate();

debugger;
window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
});
  



// const canvasSel= document.getElementById('three-canvas');
// canvasSel.height=totalHeight;