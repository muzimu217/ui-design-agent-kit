/** Three.js 环境：渲染器/相机/光照/雾/天空/轨道循环装饰/障碍与金币池。
 * 世界映射：engine 的 (x 车道, z 前距) → three (x*LANE, y, -z*LANE)，LANE=2.2。 */
import * as THREE from "three";
import type { Game } from "./engine";

export const LANE = 2.2;

function stripeTexture(a: string, b: string, w = 128, h = 64): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = a; g.fillRect(0, 0, w, h);
  g.fillStyle = b;
  for (let i = -1; i < w / 24 + 1; i++) {
    g.beginPath();
    g.moveTo(i * 24, h); g.lineTo(i * 24 + 12, 0); g.lineTo(i * 24 + 21, 0); g.lineTo(i * 24 + 9, h);
    g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function graffitiTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#a8654f"; g.fillRect(0, 0, 256, 128);
  const tags = ["#7d97bd", "#d9b45a", "#bd7f9e"];
  for (let i = 0; i < 5; i++) {
    g.globalAlpha = 0.25;
    g.fillStyle = tags[i % 3];
    g.fillRect(20 + i * 48, 30 + (i % 2) * 26, 34, 42);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(10, 1);
  return t;
}

function skyDome(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(90, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { top: { value: new THREE.Color(0x7cc4ee) }, bottom: { value: new THREE.Color(0xffe3b3) } },
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y / 90.0 * 1.6 + 0.25, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }",
  });
  return new THREE.Mesh(geo, mat);
}

interface ObstacleView { group: THREE.Group; trainBody?: THREE.MeshStandardMaterial }

export class ThreeEnv {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(62, 1, 0.1, 120);
  private ties: THREE.InstancedMesh;
  private pillars: THREE.Group[] = [];
  private trainPool: ObstacleView[] = [];
  private barrierPool: ObstacleView[] = [];
  private gatePool: ObstacleView[] = [];
  private coinPool: THREE.Mesh[] = [];
  private reduced: boolean;
  private t = 0;

  constructor(canvas: HTMLCanvasElement, reduced: boolean) {
    this.reduced = reduced;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.fog = new THREE.Fog(0xc4ddf0, 20, 46);
    this.scene.add(skyDome());
    // 光照：半球环境光 + 带阴影的方向光（暖阳）
    this.scene.add(new THREE.HemisphereLight(0xbfdcf5, 0x8b7f72, 1.05));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.7);
    sun.position.set(7, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -8;
    this.scene.add(sun);
    this.camera.position.set(0, 3.4, 6.4);
    this.camera.lookAt(0, 1.15, -6);

    // 道床 + 三车道
    const bed = new THREE.Mesh(
      new THREE.PlaneGeometry(3 * LANE + 1.4, 90),
      new THREE.MeshStandardMaterial({ color: 0x8b7f72, roughness: 1 }),
    );
    bed.rotation.x = -Math.PI / 2;
    bed.position.z = -30;
    bed.receiveShadow = true;
    this.scene.add(bed);
    for (const lane of [-1, 0, 1]) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(LANE * 0.92, 90),
        new THREE.MeshStandardMaterial({ color: 0x7c7165, roughness: 1 }),
      );
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(lane * LANE, 0.005, -30);
      strip.receiveShadow = true;
      this.scene.add(strip);
      for (const off of [-0.3, 0.3]) { // 钢轨
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.1, 90),
          new THREE.MeshStandardMaterial({ color: 0x584e44, metalness: 0.4, roughness: 0.5 }),
        );
        rail.position.set(lane * LANE + off * LANE, 0.06, -30);
        this.scene.add(rail);
      }
    }
    // 枕木（实例化 + 循环重定位）
    const tieGeo = new THREE.BoxGeometry(LANE * 0.84, 0.07, 0.3);
    this.ties = new THREE.InstancedMesh(tieGeo, new THREE.MeshStandardMaterial({ color: 0x5b4a3a }), 48);
    this.ties.receiveShadow = true;
    this.scene.add(this.ties);
    // 左墙（涂鸦贴图）+ 右站台 + 黄线 + 立柱
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 2.6, 90),
      new THREE.MeshStandardMaterial({ map: graffitiTexture(), roughness: 1 }),
    );
    wall.position.set(-(1.58 * LANE + 0.2), 1.3, -30);
    this.scene.add(wall);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 90), new THREE.MeshStandardMaterial({ color: 0x8d513f }));
    cap.position.set(-(1.58 * LANE + 0.2), 2.62, -30);
    this.scene.add(cap);
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.75, 90),
      new THREE.MeshStandardMaterial({ color: 0xc2ccd1, roughness: 1 }),
    );
    platform.position.set(1.58 * LANE + 1.1, 0.375, -30);
    platform.receiveShadow = true;
    this.scene.add(platform);
    const safety = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.02, 90),
      new THREE.MeshStandardMaterial({ color: 0xf2c144 }),
    );
    safety.position.set(1.58 * LANE - 0.5, 0.76, -30);
    this.scene.add(safety);
    for (let i = 0; i < 10; i++) { // 立柱+灯（循环组）
      const g = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 2.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x8d99a3 }),
      );
      pole.position.y = 1.45 + 0.75;
      pole.castShadow = true;
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xffe9c2, emissive: 0xffdf9e, emissiveIntensity: 1.4 }),
      );
      lamp.position.set(-0.35, 3.6, 0);
      g.add(pole, lamp);
      g.position.x = 1.58 * LANE + 0.75;
      this.pillars.push(g);
      this.scene.add(g);
    }
    // 障碍池
    for (let i = 0; i < 3; i++) this.trainPool.push(this.makeTrain());
    for (let i = 0; i < 4; i++) this.barrierPool.push(this.makeBarrier());
    for (let i = 0; i < 4; i++) this.gatePool.push(this.makeGate());
    // 金币池
    const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 20);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffc63c, metalness: 0.65, roughness: 0.3, emissive: 0x7a5a10, emissiveIntensity: 0.5,
    });
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(coinGeo, coinMat);
      m.visible = false;
      this.coinPool.push(m);
      this.scene.add(m);
    }
  }

  private makeTrain(): ObstacleView {
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0x2f8fa8, roughness: 0.6 });
    const w = 1.76, h = 2.7, len = 4.84;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), body);
    hull.position.y = h / 2 + 0.25;
    hull.castShadow = true;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.18, len), new THREE.MeshStandardMaterial({ color: 0x3ba7c2 }));
    roof.position.y = h + 0.25;
    const face = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.8, 0.06), new THREE.MeshStandardMaterial({ color: 0x173042 }));
    face.position.set(0, h * 0.72 + 0.25, len / 2 + 0.01);
    const lights = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffd9a0, emissiveIntensity: 1.2 });
    for (const sx of [-1, 1]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), lights);
      l.position.set(sx * w * 0.3, h * 0.3 + 0.25, len / 2 + 0.05);
      g.add(l);
    }
    g.add(hull, roof, face);
    g.visible = false;
    this.scene.add(g);
    return { group: g, trainBody: body };
  }

  private makeBarrier(): ObstacleView {
    const g = new THREE.Group();
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.5, 0.12),
      new THREE.MeshStandardMaterial({ map: stripeTexture("#f2f0e9", "#f28c28") }),
    );
    board.position.y = 0.95;
    board.castShadow = true;
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.95, 0.09), new THREE.MeshStandardMaterial({ color: 0x5a5248 }));
      leg.position.set(sx * 0.8, 0.475, 0);
      g.add(leg);
    }
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xff783c, emissive: 0xff5a24, emissiveIntensity: 1.6 }),
    );
    lamp.position.y = 1.28;
    lamp.name = "lamp";
    g.add(board, lamp);
    g.visible = false;
    this.scene.add(g);
    return { group: g };
  }

  private makeGate(): ObstacleView {
    const g = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.36, 0.16),
      new THREE.MeshStandardMaterial({ map: stripeTexture("#f2c144", "#2b2b2b", 128, 32) }),
    );
    beam.position.y = 2.0;
    for (const sx of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.0, 0.14), new THREE.MeshStandardMaterial({ color: 0x6a7580 }));
      post.position.set(sx * 0.93, 1.0, 0);
      post.castShadow = true;
      g.add(post);
    }
    g.add(beam);
    g.visible = false;
    this.scene.add(g);
    return { group: g };
  }

  resize(w: number, h: number): void {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** 每帧同步：循环装饰、障碍/金币池、相机。 */
  sync(game: Game, dt: number): void {
    this.t += dt;
    const m = new THREE.Matrix4();
    const per = 16, gap = 0.8 * LANE;
    for (let lane = 0; lane < 3; lane++) {
      for (let i = 0; i < per; i++) {
        const z = -(((game.scroll * LANE + i * gap) % (per * gap)));
        m.makeTranslation((lane - 1) * LANE, 0.035, z);
        this.ties.setMatrixAt(lane * per + i, m);
      }
    }
    this.ties.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < this.pillars.length; i++) {
      const gapP = 1.7 * LANE, span = this.pillars.length * gapP;
      this.pillars[i].position.z = -(((game.scroll * LANE + i * gapP) % span));
    }
    // 障碍池同步
    let ti = 0, bi = 0, gi = 0;
    for (const o of game.obstacles) {
      if (o.z > 10.5 || (o.kind === "train" && o.z < -0.9)) continue;
      const x = o.lane * LANE, z = -o.z * LANE;
      if (o.kind === "train") {
        if (ti >= this.trainPool.length) continue;
        const v = this.trainPool[ti++];
        v.group.position.set(x, 0, z - (o.len * LANE) / 2);
        v.group.visible = true;
        v.trainBody!.color.set(o.moving ? 0xd9483b : 0x2f8fa8);
        if (o.moving) v.trainBody!.emissive.setScalar(0.06 + 0.05 * Math.sin(this.t * 9));
        else v.trainBody!.emissive.setScalar(0);
      } else if (o.kind === "barrier") {
        if (bi >= this.barrierPool.length) continue;
        const v = this.barrierPool[bi++];
        v.group.position.set(x, 0, z);
        v.group.visible = true;
        const lamp = v.group.getObjectByName("lamp") as THREE.Mesh | undefined;
        const mat = lamp?.material as THREE.MeshStandardMaterial | undefined;
        if (mat) mat.emissiveIntensity = 0.8 + Math.max(0, Math.sin(this.t * 6)) * 1.4;
      } else {
        if (gi >= this.gatePool.length) continue;
        const v = this.gatePool[gi++];
        v.group.position.set(x, 0, z);
        v.group.visible = true;
      }
    }
    for (; ti < this.trainPool.length; ti++) this.trainPool[ti].group.visible = false;
    for (; bi < this.barrierPool.length; bi++) this.barrierPool[bi].group.visible = false;
    for (; gi < this.gatePool.length; gi++) this.gatePool[gi].group.visible = false;
    // 金币池
    let ci = 0;
    for (const c of game.coins) {
      if (ci >= this.coinPool.length || c.z > 9.5 || c.z < -1.0) continue;
      const mcoin = this.coinPool[ci++];
      mcoin.visible = true;
      mcoin.position.set(c.lane * LANE, (c.lift + 0.35) * 1.9, -c.z * LANE);
      mcoin.rotation.y = this.t * 3 + c.z;
    }
    for (; ci < this.coinPool.length; ci++) this.coinPool[ci].visible = false;
    // 相机：轻微跟随主角车道；danger/速度感（reduced 关闭）
    const p = game.player;
    this.camera.position.x += (p.x * LANE * 0.3 - this.camera.position.x) * Math.min(1, dt * 4);
    if (!this.reduced) {
      const targetY = 3.4 - game.danger * 0.35;
      this.camera.position.y += (targetY - this.camera.position.y) * Math.min(1, dt * 3);
      const fov = 62 + (game.speed / 6.5) * 3;
      if (Math.abs(this.camera.fov - fov) > 0.05) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
