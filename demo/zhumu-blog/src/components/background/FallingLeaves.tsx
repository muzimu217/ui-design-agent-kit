/**
 * L1 飘叶 Canvas（§9.1 / §8.2 D leaf-fall-ambient / F parallax-drift）。
 *
 * - 精灵预渲染：2 种叶形 × 3 种尺寸，离屏 canvas；逐帧只 drawImage。
 * - DPR ≤ 2；桌面 ≤12 片、视口 ≤768px ≤8 片。
 * - alpha 0.10–0.25；进入内容列（羽化 24px）衰减到 ≤0.08。
 * - visibilitychange 隐藏 / IntersectionObserver 离屏 → 停渲染；恢复以 dt 续播。
 * - 视差：滚动位移由父级（BackgroundLayers）的 passive scroll listener 写入
 *   scrollRef，本组件在自身 rAF 内读取——无独立 scroll 处理器。
 * - reduced-motion：完全不生成（静态落叶由 L0 的 .reduced-static 承担）。
 */
import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

interface LeafSprite {
  canvas: HTMLCanvasElement;
  len: number;
}

interface Leaf {
  x: number;
  worldY: number;
  speed: number; // 24–48 px/s
  swayAmp: number; // 20–40px
  swayPeriod: number; // 3–5s
  rotTotal: number; // 90–270°
  len: number; // 14–28px
  alpha: number; // 0.10–0.25
  phase: number;
  sprite: LeafSprite;
}

const LEAF_LENGTHS = [14, 20, 28];

function makeSprite(len: number, vertical: boolean, dpr: number, inkColor: string): LeafSprite {
  const c = document.createElement('canvas');
  const pad = Math.ceil(len * 0.3);
  c.width = Math.ceil((len + pad * 2) * dpr);
  c.height = Math.ceil((len * 0.4 + pad * 2) * dpr);
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.translate(len / 2 + pad, len * 0.2 + pad);
  if (vertical) ctx.rotate(Math.PI / 2);
  const w = len * 0.17;
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  ctx.bezierCurveTo(-len * 0.18, -w, len * 0.2, -w * 0.9, len / 2, 0);
  ctx.bezierCurveTo(len * 0.2, w * 0.9, -len * 0.18, w, -len / 2, 0);
  ctx.closePath();
  ctx.fillStyle = inkColor;
  ctx.fill();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = 'rgba(250,247,240,0.9)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-len * 0.38, 0);
  ctx.lineTo(len * 0.38, 0);
  ctx.stroke();
  return { canvas: c, len };
}

export function FallingLeaves({
  reduced,
  theme,
  scrollRef,
}: {
  reduced: boolean;
  theme: string;
  scrollRef: MutableRefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const inkColor =
      getComputedStyle(document.documentElement).getPropertyValue('--z-ink').trim() || '#1F2421';

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let leaves: Leaf[] = [];
    let sprites: LeafSprite[] = [];
    let raf = 0;
    let running = true;
    let visible = true;
    let inViewport = true;
    let lastT = 0;

    const buildSprites = () => {
      sprites = [];
      for (const vertical of [false, true]) {
        for (const len of LEAF_LENGTHS) {
          sprites.push(makeSprite(len, vertical, dpr, inkColor));
        }
      }
    };

    const spawn = (anywhere: boolean): Leaf => {
      const len = 14 + Math.random() * 14;
      const sprite = sprites.reduce((best, s) =>
        Math.abs(s.len - len) < Math.abs(best.len - len) ? s : best,
      );
      return {
        x: Math.random() * window.innerWidth,
        worldY: anywhere ? Math.random() * window.innerHeight * 1.4 - window.innerHeight * 0.2 : -40,
        speed: 24 + Math.random() * 24,
        swayAmp: 20 + Math.random() * 20,
        swayPeriod: 3 + Math.random() * 2,
        rotTotal: ((90 + Math.random() * 180) * Math.PI) / 180,
        len,
        alpha: 0.1 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        sprite,
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // DPR ≤ 2（§9.3）
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.ceil(W * dpr);
      canvas.height = Math.ceil(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = W <= 768 ? 8 : 12;
      if (leaves.length > target) leaves = leaves.slice(0, target);
      while (leaves.length < target) leaves.push(spawn(leaves.length > 0));
    };

    const frame = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!visible || !inViewport) {
        lastT = t;
        return;
      }
      const dt = lastT === 0 ? 16 : Math.min(t - lastT, 50); // dt 续播不堆积
      lastT = t;
      const scroll = scrollRef.current;
      ctx.clearRect(0, 0, W, H);
      const half = Math.min(W, 720) / 2 + 24; // 内容列几何 ±24
      const feather = 24;
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.worldY += leaf.speed * (dt / 1000);
        leaf.phase += ((dt / 1000) * Math.PI * 2) / leaf.swayPeriod;
        // 视差系数 0.3：叶层以 0.3× 内容速度随滚动移动
        const span = H + 80;
        let sy = (((leaf.worldY - scroll * 0.3) % span) + span) % span - 40;
        const sx = leaf.x + Math.sin(leaf.phase) * leaf.swayAmp;
        if (leaf.worldY - scroll * 0.3 > span - 40 || Number.isNaN(sy)) {
          leaves[i] = spawn(false);
          continue;
        }
        // 内容列 alpha 衰减 ≤0.08（§9.2）
        const dist = Math.abs(sx - W / 2);
        let alpha = leaf.alpha;
        if (dist < half - feather) alpha = Math.min(alpha, 0.08);
        else if (dist < half) {
          const k = (dist - (half - feather)) / feather;
          alpha = Math.min(alpha, 0.08 + k * (leaf.alpha - 0.08));
        }
        const rot = leaf.rotTotal * Math.min(1, Math.max(0, (leaf.worldY + 200) / (H + 400)));
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(sx, sy);
        ctx.rotate(rot);
        const s = leaf.len / leaf.sprite.len;
        ctx.scale(s, s);
        ctx.drawImage(
          leaf.sprite.canvas,
          -leaf.sprite.canvas.width / (2 * dpr),
          -leaf.sprite.canvas.height / (2 * dpr),
          leaf.sprite.canvas.width / dpr,
          leaf.sprite.canvas.height / dpr,
        );
        ctx.restore();
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      lastT = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        lastT = 0;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    buildSprites();
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced, theme, scrollRef]);

  return (
    <canvas
      ref={canvasRef}
      className="bg-layer z-[1]"
      style={{ display: reduced ? 'none' : undefined }}
      aria-hidden="true"
    />
  );
}
