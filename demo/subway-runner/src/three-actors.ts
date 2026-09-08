/** 角色：Kenney CC0 FBX 模型（门B 已拍板）加载、换肤、动画混合、追捕者与狗。
 * 素材：Animated Characters Protagonists（skaterMaleA=主角 / criminalMaleA=警卫）
 * + Cube Pets animal-dog。动画 clip：idle/run/jump；滑铲/绊倒用姿态近似。 */
import * as THREE from "three";
import { clone as skeletonClone } from "three/addons/utils/SkeletonUtils.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./engine";
import { LANE } from "./three-env";

const PLAYER_HEIGHT = 1.8;

function reskin(root: THREE.Object3D, skinUrl: string): void {
  const tex = new THREE.TextureLoader().load(skinUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    // FBX 自带 Phong 材质（高 specular）在场景光照下会泛灰：整体换成 Standard
    const next = mats.map(() => new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0,
    }));
    mesh.material = Array.isArray(mesh.material) ? next : next[0];
    mesh.castShadow = true;
  });
}

function normalizeHeight(root: THREE.Object3D, target: number): void {
  const box = new THREE.Box3().setFromObject(root);
  const h = Math.max(0.001, box.max.y - box.min.y);
  const s = target / h;
  root.scale.setScalar(s);
  root.position.y -= box.min.y * s;
}

interface Runner {
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Record<"idle" | "run" | "jump", THREE.AnimationAction>;
  current: "idle" | "run" | "jump";
}

export class Actors {
  private player: Runner | null = null;
  private guard: Runner | null = null;
  private dog: THREE.Group | null = null;
  private dogBobT = 0;
  private slideDuck = 0;
  ready = false;

  constructor(private reduced: boolean) {}

  async load(): Promise<void> {
    const loader = new FBXLoader();
    const load = (url: string) => loader.loadAsync(url);
    const [model, idleFbx, runFbx, jumpFbx, dogGltf] = await Promise.all([
      load("/models/characterMedium.fbx"),
      load("/models/idle.fbx"),
      load("/models/run.fbx"),
      load("/models/jump.fbx"),
      new GLTFLoader().loadAsync("/models/animal-dog.glb"),
    ]);
    const clips = {
      idle: idleFbx.animations[0],
      run: runFbx.animations[0],
      jump: jumpFbx.animations[0],
    };
    // 主角：滑板少年皮肤
    const playerRoot = new THREE.Group();
    model.rotation.y = Math.PI; // 面朝 -z（前进方向）
    reskin(model, "/models/skins/skaterMaleA.png");
    normalizeHeight(model, PLAYER_HEIGHT);
    model.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
    playerRoot.add(model);
    this.player = this.makeRunner(playerRoot, clips);
    // 警卫：同骨架克隆 + 罪犯皮肤充当深色制服
    const guardModel = skeletonClone(model);
    reskin(guardModel, "/models/skins/criminalMaleA.png");
    const guardRoot = new THREE.Group();
    guardRoot.add(guardModel);
    this.guard = this.makeRunner(guardRoot, clips);
    // 狗：Cube Pets GLB（贴图内嵌，无外部依赖）
    const dogRoot = new THREE.Group();
    const dogModel = dogGltf.scene;
    dogModel.rotation.y = Math.PI;
    normalizeHeight(dogModel, 0.95);
    dogModel.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
    dogRoot.add(dogModel);
    this.dog = dogRoot;
    if (this.sceneParent) this.sceneParent.add(this.player.root, this.guard.root, this.dog);
    this.ready = true;
  }

  private sceneParent: THREE.Object3D | null = null;

  attach(parent: THREE.Object3D): void {
    this.sceneParent = parent;
    if (this.ready) parent.add(this.player!.root, this.guard!.root, this.dog!);
  }

  private makeRunner(root: THREE.Group, clips: Record<"idle" | "run" | "jump", THREE.AnimationClip>): Runner {
    const mixer = new THREE.AnimationMixer(root);
    const actions = {
      idle: mixer.clipAction(clips.idle),
      run: mixer.clipAction(clips.run),
      jump: mixer.clipAction(clips.jump),
    };
    actions.idle.play();
    return { root, mixer, actions, current: "idle" };
  }

  private switchTo(r: Runner, next: "idle" | "run" | "jump"): void {
    if (r.current === next) return;
    const from = r.actions[r.current];
    const to = r.actions[next];
    to.reset().play();
    to.crossFadeFrom(from, 0.18, false);
    r.current = next;
  }

  sync(game: Game, dt: number): void {
    if (!this.ready || !this.player || !this.guard || !this.dog) return;
    const p = game.player;
    // 主角：位置 + 姿态（贴地 bob 增强跑动感，reduced 关闭）
    const bob = this.reduced || !p.onGround || p.sliding > 0 ? 0 : Math.abs(Math.sin(p.runPhase)) * 0.05;
    this.player.root.position.set(p.x * LANE, p.y * 2.0 + bob, 0);
    if (p.onGround) this.switchTo(this.player, p.sliding > 0 ? "idle" : "run");
    else this.switchTo(this.player, "jump");
    this.player.actions.run.timeScale = this.reduced ? 1 : 0.85 + (game.speed / 6.5) * 0.7;
    // 滑铲近似：压低 + 前倾（向 jump/idle 过渡时回弹）
    const duckTarget = p.sliding > 0 ? 1 : 0;
    this.slideDuck += (duckTarget - this.slideDuck) * Math.min(1, dt * 14);
    const duck = this.slideDuck;
    this.player.root.scale.set(1, 1 - duck * 0.4, 1);
    this.player.root.rotation.x = duck * 0.5 + (p.stumbleT > 0 ? -0.25 : 0);
    this.player.mixer.update(dt);
    // 追捕者：两翼包抄（不占车道中心线），danger/被抓演出时向中路收拢
    const gz = game.chaserZ;
    const closing = game.caughtT >= 0 ? 1 : game.danger;
    const guardX = -0.34 + closing * 0.18;
    const dogX = 0.34 - closing * 0.15;
    this.guard.root.position.set(guardX * LANE, 0, -gz * LANE);
    this.switchTo(this.guard, "run");
    this.guard.actions.run.timeScale = 1.05;
    this.guard.root.scale.setScalar(0.98);
    this.guard.mixer.update(dt);
    // 狗：程序 bob + 俯仰（模型无动画）
    this.dogBobT += dt * 10;
    this.dog.position.set(dogX * LANE, this.reduced ? 0 : Math.abs(Math.sin(this.dogBobT)) * 0.08, -(gz - 0.06) * LANE);
    this.dog.rotation.z = this.reduced ? 0 : Math.sin(this.dogBobT * 0.9) * 0.06;
  }
}
