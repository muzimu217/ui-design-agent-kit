/** 入口：装配 Three.js 渲染、输入、状态与帧循环（P-subway-2：渲染层 3D 化，逻辑层复用）。 */
import { Game } from "./engine";
import { createInput } from "./input";
import { initUI, syncUI, fillOver } from "./ui";
import { ThreeEnv } from "./three-env";
import { Actors } from "./three-actors";
import "./styles.css";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const game = new Game();
const env = new ThreeEnv(canvas, REDUCED);
const actors = new Actors(REDUCED);
actors.attach(env.scene);
actors.load().catch((err: unknown) => console.error("模型加载失败", err));

function resize(): void {
  env.resize(innerWidth, innerHeight);
}
addEventListener("resize", resize);
resize();

const uiRefs = initUI({
  start: () => { game.start(); flashHint(); },
  retry: () => { game.start(); flashHint(); },
  toTitle: () => game.toTitle(),
  pause: () => game.togglePause(),
  resume: () => game.togglePause(),
});

let hintTimer: ReturnType<typeof setTimeout> | undefined;
function flashHint(): void {
  uiRefs.hint.classList.remove("fade");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => uiRefs.hint.classList.add("fade"), 3200);
}

createInput((a) => {
  if (a === "pause") { game.togglePause(); return; }
  if (game.phase !== "running") return;
  if (a === "left") game.steer(-1);
  else if (a === "right") game.steer(1);
  else if (a === "up") game.jump();
  else if (a === "down") game.duck();
}, document.body);

const vignette = document.getElementById("vignette") as HTMLElement;

let lastPhase = game.phase;
function phaseChanged(): void {
  if (game.phase === lastPhase) return;
  lastPhase = game.phase;
  const focusEl = (id: string) => document.getElementById(id)?.focus();
  if (game.phase === "over") fillOver(game, uiRefs);
  if (game.phase === "over") focusEl("btn-retry");
  else if (game.phase === "title") focusEl("btn-start");
  else if (game.phase === "paused") focusEl("btn-resume");
}

let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  game.update(dt);
  actors.sync(game, dt);
  env.sync(game, dt);
  env.render();
  syncUI(game, uiRefs);
  const v = Math.min(1, (game.danger * 0.35 + (game.player.stumbleT > 0 ? 0.18 : 0)) * 2);
  vignette.style.opacity = String(v);
  phaseChanged();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/** 验收探针：Playwright 只读状态，不参与逻辑。 */
Object.defineProperty(window, "__subway", {
  value: {
    get phase() { return game.phase; },
    get score() { return Math.floor(game.score); },
    get coins() { return game.coinCount; },
    get lane() { return game.player.targetLane; },
    get laneX() { return Number(game.player.x.toFixed(3)); },
    get danger() { return Number(game.danger.toFixed(3)); },
    get air() { return !game.player.onGround; },
    get sliding() { return game.player.sliding > 0; },
    get speed() { return Number(game.speed.toFixed(2)); },
    get actorsReady() { return actors.ready; },
    debug: {
      stumble: () => game.debugStumble(),
      caught: (r?: string) => game.debugCaught(r),
    },
  },
});
(window as unknown as { __three: unknown }).__three = {
  env,
  actors,
  game,
};
