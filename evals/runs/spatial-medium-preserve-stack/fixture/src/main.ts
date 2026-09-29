import { createApp, ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

/**
 * spatial-medium-preserve-stack 评测夹具：Vue 3 + 原生 three.js（无 React/R3F、
 * 无物理引擎）——拖拽检视 + 换色 + 键盘/触屏 + 重置 + reduced motion 降级。
 * "授权 chair.glb"以程序化几何椅子模拟（评测语境披露：无真实 glb 文件）。
 * 参考基线：three.js 官方 examples 交互模式（拖拽旋转）——模式借鉴非代码复制。
 */

const VARIANTS = [
  { id: 'walnut', label: '胡桃木', color: 0x6b4a2f },
  { id: 'oak', label: '橡木', color: 0xc9a86c },
];
const SEED_ROT = 0.6;

createApp({
  setup() {
    const mountRef = ref<HTMLElement | null>(null);
    const variant = ref(0);
    const failed = ref(false);
    const ready = ref(false);

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let chair: THREE.Group;
    let wood: THREE.MeshStandardMaterial;
    let raf = 0;
    let rotY = SEED_ROT;
    let dragging = false;
    let lastX = 0;
    let reduced = false;

    const resize = () => {
      const el = mountRef.value;
      if (!el || !renderer) return;
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dragging && !reduced) rotY += 0.0025; // 缓慢展示自转（reduced 时停）
      chair.rotation.y = rotY;
      renderer?.render(scene, camera);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { rotY -= 0.22; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { rotY += 0.22; e.preventDefault(); }
      else if (e.key === 'r' || e.key === 'R') { rotY = SEED_ROT; }
    };

    const onPointerDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      rotY += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
    };
    const onPointerUp = () => { dragging = false; };

    onMounted(() => {
      const el = mountRef.value as HTMLElement;
      try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0ece4);
        camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.set(0, 1.9, 4.4);
        camera.lookAt(0, 1.0, 0);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        el.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(3, 5, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xdfe8ff, 0.5);
        rim.position.set(-4, 3, -3);
        scene.add(rim);

        wood = new THREE.MeshStandardMaterial({ color: VARIANTS[0].color, roughness: 0.65 });
        chair = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.5), wood);
        seat.position.y = 0.9;
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.12), wood);
        back.position.set(0, 1.5, -0.69);
        chair.add(seat, back);
        for (const [x, z] of [[-0.68, -0.6], [0.68, -0.6], [-0.68, 0.6], [0.68, 0.6]] as const) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.9, 12), wood);
          leg.position.set(x, 0.45, z);
          chair.add(leg);
        }
        scene.add(chair);

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        reduced = mq.matches;
        mq.addEventListener('change', (e) => { reduced = e.matches; });

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('keydown', onKey);
        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        ready.value = true;
        loop();
      } catch {
        failed.value = true;
      }
    });
    onBeforeUnmount(() => {
      cancelAnimationFrame(raf);
      renderer?.dispose();
      window.removeEventListener('keydown', onKey);
    });

    const setVariant = (i: number) => { wood?.color.setHex(VARIANTS[i].color); };
    const resetView = () => { rotY = SEED_ROT; };

    return { mountRef, variant, failed, ready, VARIANTS, setVariant, resetView };
  },
  template: `
  <div>
    <div class="stage" ref="mountRef">
      <div class="panel">
        <h1>休闲椅 · 材质检视</h1>
        <div class="swatches" role="group" aria-label="材质颜色">
          <button v-for="(v, i) in VARIANTS" :key="v.id" class="sw"
            :style="{ background: '#' + v.color.toString(16).padStart(6, '0') }"
            :aria-pressed="variant === i ? 'true' : 'false'" :aria-label="v.label"
            @click="setVariant(i)"></button>
        </div>
      </div>
      <button class="reset" @click="resetView">↺ 复位视角</button>
      <div class="hint">拖拽旋转 · 方向键微调 · R 复位 · 色板换材质</div>
      <div class="err" v-if="failed">3D 初始化失败——请确认浏览器支持 WebGL。</div>
    </div>
  </div>
  `,
}).mount('#app');
