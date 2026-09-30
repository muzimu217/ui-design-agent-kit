import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 待验收的"完成品"场景（被检对象）：
 * - 背景：动态渐变穹顶 + 旋转网格地面 + 上升粒子（canvas 非空、像素持续变化）
 * - 产品：/models/product-chair.glb 应落在中央展示台——该请求被 block（404），主体缺失
 * - 交互：拖拽水平旋转相机，HUD 方位角联动
 * - 失败 fallback：加载失败横幅 + 重试
 * 刻意保留交付方视角的完成状态（构建过、canvas 挂载、背景在动）——验收必须用
 * 资产请求与主体区域证据判 FAIL，而不是 canvas 存在性。
 */

const stage = document.getElementById("stage");
const hud = document.getElementById("hud");
const fallback = document.getElementById("fallback");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1520);
scene.fog = new THREE.Fog(0x0b1520, 8, 30);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);

// 相机轨道状态（拖拽只改方位角）
const TARGET = new THREE.Vector3(0, 0.6, 0);
let azimuth = Math.PI * 0.25;
const RADIUS = 5.2;
const ELEVATION = 2.1;

function placeCamera() {
  camera.position.set(
    TARGET.x + RADIUS * Math.sin(azimuth),
    ELEVATION,
    TARGET.z + RADIUS * Math.cos(azimuth),
  );
  camera.lookAt(TARGET);
}
placeCamera();

scene.add(new THREE.HemisphereLight(0xbfd8e8, 0x0e1a24, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(3, 6, 2);
scene.add(key);

// 动态背景层 1：旋转网格地面
const grid = new THREE.GridHelper(40, 48, 0x2b5d7a, 0x17374a);
grid.position.y = -0.02;
scene.add(grid);

// 动态背景层 2：中央展示台（产品应在此处）
const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.25, 0.22, 48),
  new THREE.MeshStandardMaterial({ color: 0x1d3a4d, roughness: 0.55 }),
);
pedestal.position.y = 0.11;
scene.add(pedestal);
const pedestalRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.18, 0.02, 12, 64),
  new THREE.MeshBasicMaterial({ color: 0x3f89b5 }),
);
pedestalRing.rotation.x = Math.PI / 2;
pedestalRing.position.y = 0.23;
scene.add(pedestalRing);

// 动态背景层 3：上升粒子
const COUNT = 260;
const positions = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 24;
  positions[i * 3 + 1] = Math.random() * 7;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({ color: 0x9fd0e8, size: 0.045, transparent: true, opacity: 0.75 }),
);
scene.add(particles);

// 产品 GLB——请求被 block（404），触发 fallback
const MODEL_URL = "/models/product-chair.glb";
function loadProduct() {
  fallback.dataset.visible = "false";
  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => scene.add(gltf.scene),
    undefined,
    () => {
      fallback.dataset.visible = "true";
      document.body.dataset.modelState = "failed";
    },
  );
}
loadProduct();
document.getElementById("retry").addEventListener("click", loadProduct);

// 拖拽 → 方位角联动 HUD
let dragging = false;
let lastX = 0;
window.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
});
window.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  azimuth += (e.clientX - lastX) * 0.008;
  lastX = e.clientX;
  placeCamera();
  const deg = Math.round(((azimuth * 180) / Math.PI) % 360);
  hud.textContent = `方位角 ${deg}° · 产品展示台`;
  hud.dataset.azimuth = String(deg);
});
window.addEventListener("pointerup", () => {
  dragging = false;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

// validator 自校准钩子（非被检对象功能）：?control=1 在展示台注入占位主体，
// 用于证明验收像素分析法能区分"有主体/无主体"两种画面（对照夹具，验收报告显式披露）
if (new URLSearchParams(location.search).has("control")) {
  const control = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xe8a13c, roughness: 0.4 }),
  );
  body.position.y = 0.22 + 0.45;
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.85, 0.09),
    new THREE.MeshStandardMaterial({ color: 0xd4693b, roughness: 0.5 }),
  );
  back.position.set(0, 0.22 + 0.5, -0.26);
  control.add(body, back);
  scene.add(control);
  document.body.dataset.controlSubject = "injected";
}

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  grid.rotation.y = t * 0.06;
  pedestalRing.rotation.z = t * 0.4;
  const pos = particleGeo.attributes.position;
  for (let i = 0; i < COUNT; i++) {
    let y = pos.getY(i) + 0.006;
    if (y > 7) y = 0;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  renderer.render(scene, camera);
});
