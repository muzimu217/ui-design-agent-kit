/** 游戏模型：状态机、弹簧换道、跳跃/滑铲、生成不变量、碰撞与判死、追捕者距离。 */

export type Phase = "title" | "running" | "paused" | "over";

export interface Obstacle {
  kind: "barrier" | "gate" | "train";
  lane: number;
  z: number;
  len: number;
  moving: boolean;
}

export interface Coin { lane: number; z: number; lift: number; taken?: boolean }

export type GameEvent =
  | { type: "coin"; coin: Coin }
  | { type: "stumble" }
  | { type: "caught"; reason: string };

const BEST_KEY = "subway-runner-best";
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class Game {
  phase: Phase = "title";
  player = {
    targetLane: 0, x: 0, v: 0,
    y: 0, vy: 0, onGround: true,
    sliding: 0, stumbleT: 0, jumpBuffer: 0, landSlide: false,
    runPhase: 0,
  };
  obstacles: Obstacle[] = [];
  coins: Coin[] = [];
  events: GameEvent[] = [];
  scroll = 0;
  speed = 2.6;
  time = 0;
  score = 0;
  coinCount = 0;
  danger = 0;
  chaserZ = -0.62;
  caughtT = -1;
  overReason = "";
  best = 0;
  private nextSpawn = 2.2;

  constructor() {
    try {
      this.best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      /* 本地存储不可用时静默降级，仅失去最佳纪录 */
    }
  }

  start(): void {
    const p = this.player;
    p.targetLane = 0; p.x = 0; p.v = 0; p.y = 0; p.vy = 0; p.onGround = true;
    p.sliding = 0; p.stumbleT = 0; p.jumpBuffer = 0; p.landSlide = false; p.runPhase = 0;
    this.obstacles = [];
    this.coins = [];
    this.events = [];
    this.scroll = 0;
    this.speed = 2.6;
    this.time = 0;
    this.score = 0;
    this.coinCount = 0;
    this.danger = 0;
    this.chaserZ = -0.75;
    this.caughtT = -1;
    this.overReason = "";
    this.nextSpawn = 2.2;
    this.phase = "running";
  }

  toTitle(): void {
    this.phase = "title";
    this.obstacles = [];
    this.coins = [];
    this.speed = 2.6;
    this.danger = 0;
    this.chaserZ = -0.75;
    this.caughtT = -1;
  }

  togglePause(): void {
    if (this.phase === "running") this.phase = "paused";
    else if (this.phase === "paused") this.phase = "running";
  }

  /** 验收探针专用：确定性地触发失误/终局，不参与正常游戏流程。 */
  debugStumble(): void {
    if (this.phase === "running") this.stumble();
  }

  debugCaught(reason = "验收探针：强制终局"): void {
    if (this.phase === "running") this.caught(reason);
  }

  steer(dir: -1 | 1): void {
    this.player.targetLane = clamp(this.player.targetLane + dir, -1, 1);
  }

  jump(): void {
    const p = this.player;
    if (p.onGround) {
      p.vy = 5.3;
      p.onGround = false;
      p.sliding = 0;
    } else {
      p.jumpBuffer = 0.12;
    }
  }

  duck(): void {
    const p = this.player;
    if (!p.onGround) {
      p.vy = Math.min(p.vy, -9); // 空中下压 = 快速落地接铲
      p.landSlide = true;
    } else {
      p.sliding = 0.75;
    }
  }

  update(dt: number): void {
    if (this.phase === "title") {
      this.time += dt;
      this.scroll += 1.4 * dt;
      return;
    }
    if (this.phase !== "running") return;
    if (this.caughtT >= 0) {
      // 被抓演出：慢动作 + 追捕者冲到身前
      this.caughtT += dt;
      this.chaserZ += (-0.3 - this.chaserZ) * Math.min(1, dt * 6);
      if (this.caughtT > 0.7) this.finishOver();
      return;
    }
    this.time += dt;
    this.speed = Math.min(6.5, this.speed + 0.045 * dt);
    const step = this.speed * dt;
    this.scroll += step;
    this.score += step * 2;
    const p = this.player;
    // 换道弹簧：可中途反悔、保留横向速度
    const a = 120 * (p.targetLane - p.x) - 16 * p.v;
    p.v += a * dt;
    p.x += p.v * dt;
    p.x = clamp(p.x, -1.25, 1.25);
    if (!p.onGround) {
      p.vy -= 16 * dt;
      p.y += p.vy * dt;
      if (p.y <= 0) {
        p.y = 0; p.vy = 0; p.onGround = true;
        if (p.landSlide) { p.sliding = 0.6; p.landSlide = false; }
      }
    } else if (p.jumpBuffer > 0) {
      p.jumpBuffer = 0;
      this.jump();
    }
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.sliding = Math.max(0, p.sliding - dt);
    p.stumbleT = Math.max(0, p.stumbleT - dt);
    p.runPhase += dt * (6 + this.speed * 1.7);
    // 追捕者距离：danger 高 → 逼近（纵向上前，横向由渲染层收拢）
    this.danger = Math.max(0, this.danger - dt * 0.16);
    const targetZ = -0.75 + this.danger * 0.33;
    this.chaserZ += (targetZ - this.chaserZ) * Math.min(1, dt * 3);
    // 生成
    this.nextSpawn -= step;
    if (this.nextSpawn <= 0) {
      this.spawnRow();
      this.nextSpawn = 2.5 + this.speed * 0.3 + Math.random() * 0.6;
    }
    for (const o of this.obstacles) o.z -= step + (o.moving ? 4 * dt : 0);
    for (const c of this.coins) c.z -= step;
    this.obstacles = this.obstacles.filter((o) => o.z + o.len > -1.0);
    this.coins = this.coins.filter((c) => c.z > -1.0 && !c.taken);
    this.collide();
  }

  private collide(): void {
    const p = this.player;
    const occupied = (lane: number) => Math.abs(p.x - lane) < 0.55;
    for (const o of this.obstacles) {
      if (o.kind === "train") {
        if (o.z < 0.45 && o.z + o.len > -0.35 && occupied(o.lane)) {
          this.caught(o.moving ? "被迎面列车撞上" : "正面撞上列车");
          return;
        }
      } else if (o.kind === "barrier") {
        if (Math.abs(o.z) < 0.35 && occupied(o.lane) && p.y < 0.38) {
          this.stumble();
          o.z = -2; // 绊过即失效，避免同帧重复判定
        }
      } else if (o.kind === "gate") {
        if (Math.abs(o.z) < 0.3 && occupied(o.lane) && p.sliding <= 0) {
          this.stumble();
          o.z = -2;
        }
      }
    }
    for (const c of this.coins) {
      if (c.taken) continue;
      if (Math.abs(c.z) < 0.45 && occupied(c.lane) && Math.abs(p.y + 0.27 - c.lift) < 0.5) {
        c.taken = true;
        this.coinCount++;
        this.events.push({ type: "coin", coin: c });
      }
    }
  }

  private stumble(): void {
    const p = this.player;
    if (this.danger > 0.5) {
      this.caught("失误时被追捕者抓个正着");
      return;
    }
    this.danger = 1;
    p.stumbleT = 0.5;
    p.sliding = 0;
    this.speed = Math.max(2.2, this.speed * 0.55);
    this.events.push({ type: "stumble" });
  }

  private caught(reason: string): void {
    this.overReason = reason;
    this.caughtT = 0;
    this.events.push({ type: "caught", reason });
  }

  private finishOver(): void {
    this.phase = "over";
    this.score = Math.floor(this.score);
    if (this.score > this.best) {
      this.best = this.score;
      try {
        localStorage.setItem(BEST_KEY, String(this.best));
      } catch {
        /* 同上：本地存储不可用时只丢最佳纪录 */
      }
    }
  }

  /** 生成不变量：每行最多堵 2 条道（至少 1 条可通行）；迎面列车单行独占；金币不落在障碍里。 */
  private spawnRow(): void {
    const z = 9;
    const lanes = [-1, 0, 1];
    const pick = () => lanes.splice(Math.floor(Math.random() * lanes.length), 1)[0];
    const r = Math.random();
    if (this.time < 6 || r < 0.14) {
      this.coinLine(pick(), z, 6);
      if (Math.random() < 0.5) this.coinLine(pick(), z + 0.8, 5);
      return;
    }
    if (r < 0.32) {
      const l = pick();
      this.obstacles.push({ kind: "barrier", lane: l, z, len: 0.5, moving: false });
      this.coinArc(l, z);
    } else if (r < 0.48) {
      const l = pick();
      this.obstacles.push({ kind: "gate", lane: l, z, len: 0.4, moving: false });
      this.coinLine(l, z - 1.4, 3, 0.2);
      this.coinLine(pick(), z + 1, 4);
    } else if (r < 0.66) {
      const l = pick();
      this.obstacles.push({ kind: "train", lane: l, z, len: 2.2, moving: false });
      this.coinLine(pick(), z + 0.4, 5);
    } else if (r < 0.78 && this.time > 10) {
      const l = pick();
      this.obstacles.push({ kind: "train", lane: l, z, len: 2.2, moving: true });
      this.nextSpawn += 1.4;
      this.coinLine(pick(), z + 0.6, 5);
    } else {
      const a = pick(), b = pick();
      const ka: Obstacle["kind"] = Math.random() < 0.5 ? "barrier" : "gate";
      const kb: Obstacle["kind"] = ka === "barrier" ? "gate" : "barrier";
      this.obstacles.push({ kind: ka, lane: a, z, len: 0.5, moving: false });
      this.obstacles.push({ kind: kb, lane: b, z, len: 0.5, moving: false });
      if (ka === "barrier") this.coinArc(a, z);
      else this.coinLine(pick(), z + 0.5, 5);
    }
  }

  private coinLine(lane: number, z: number, n: number, lift = 0.24): void {
    for (let i = 0; i < n; i++) this.coins.push({ lane, z: z + i * 0.55, lift });
  }

  private coinArc(lane: number, z: number): void {
    for (let i = 0; i < 5; i++) {
      this.coins.push({ lane, z: z - 0.5 + i * 0.45, lift: 0.28 + Math.sin((i / 4) * Math.PI) * 0.62 });
    }
  }
}
