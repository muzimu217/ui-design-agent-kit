import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { NODES, arcPairs, type NodeInfo } from '../data/nodes';
import { geometryRings, loadWorld, type WorldData } from '../lib/world';
import { probe } from '../lib/probe';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

import './NetworkMap.css';

// ============================================================
// S2 世界网络地图
// · 等距圆柱投影（equirectangular），世界坐标 2000×1000
// · 平移（拖拽）/ 缩放（滚轮 + 双指 + 按钮，0.6-3×，时间常数确定性插值）
// · 方形像素光点三层：核心（9px 白心 + 青晕 + 2.4s ping）/ 边缘（6px）/ 规划中（紫虚线环）
// · 光弧 + 流动光点（canvas）；视口内标签 DOM 虚拟化（上限 60）
// · roving tabindex：方向键遍历节点，回车打开面板
// ============================================================

const W = 2000;
const H = 1000;
const wx = (lng: number) => ((lng + 180) / 360) * W;
const wy = (lat: number) => ((90 - lat) / 180) * H;
const K_MIN = 0.6;
const K_MAX = 3;

interface ViewState {
  cx: number;
  cy: number;
  k: number;
}

export interface NetworkMapHandle {
  focusNode(id: string): void;
  fitNodes(ids: string[]): void;
  zoomBy(factor: number): void;
}

export interface NetworkMapProps {
  active: boolean;
  mobile: boolean;
  /** 绘制用全量节点（非匹配项压暗） */
  nodes: NodeInfo[];
  /** 交互节点（筛选结果：roving 与标签仅限这些） */
  focusNodes: NodeInfo[];
  matchSet: Set<string>;
  selectedId: string | null;
  rovingId: string | null;
  handleRef: React.RefObject<NetworkMapHandle | null>;
  onRoving(id: string): void;
  onSelect(node: NodeInfo): void;
  onVisibleChange(count: number): void;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export default function NetworkMap({
  active,
  mobile,
  nodes,
  focusNodes,
  matchSet,
  selectedId,
  rovingId,
  handleRef,
  onRoving,
  onSelect,
  onVisibleChange,
}: NetworkMapProps) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef(new Map<string, HTMLButtonElement>());

  const [world, setWorld] = useState<WorldData | null>(null);
  const [ready, setReady] = useState(false);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  // 视口与视图（rAF 内部持有，避免 React 重渲染）
  const sizeRef = useRef({ w: 800, h: 600 });
  const cur = useRef<ViewState>({ cx: wx(105), cy: wy(24), k: 1.1 });
  const tgt = useRef<ViewState>({ cx: wx(105), cy: wy(24), k: 1.1 });
  const dirty = useRef(true);
  const hoverId = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const matchRef = useRef(matchSet);
  const nodesRef = useRef(nodes);
  const focusRef = useRef(focusNodes);
  const activeRef = useRef(active);
  const reducedRef = useRef(reduced);
  const mobileRef = useRef(mobile);
  const readyRef = useRef(false);
  const visibleKey = useRef('');

  selectedRef.current = selectedId;
  matchRef.current = matchSet;
  nodesRef.current = nodes;
  focusRef.current = focusNodes;
  activeRef.current = active;
  reducedRef.current = reduced;
  mobileRef.current = mobile;
  readyRef.current = ready;

  // —— 预投影数据 ——
  const nodeXY = useMemo(() => new Map(NODES.map((n) => [n.id, { x: wx(n.lng), y: wy(n.lat) }])), []);
  const paths = useMemo(() => {
    if (!world) return null;
    const borderLines: Float32Array[] = world.borders.map((line) => {
      const arr = new Float32Array(line.length * 2);
      line.forEach((p, i) => {
        arr[i * 2] = wx(p[0]);
        arr[i * 2 + 1] = wy(p[1]);
      });
      return arr;
    });
    const fills: Float32Array[] = [];
    for (const f of world.countries) {
      for (const rings of geometryRings(f.geometry)) {
        for (const ring of rings) {
          const arr = new Float32Array(ring.length * 2);
          ring.forEach((p, i) => {
            arr[i * 2] = wx(p[0]);
            arr[i * 2 + 1] = wy(p[1]);
          });
          fills.push(arr);
        }
      }
    }
    return { borderLines, fills };
  }, [world]);

  const arcsXY = useMemo(
    () =>
      arcPairs.map((p, i) => {
        const a = nodeXY.get(p.a.id)!;
        const b = nodeXY.get(p.b.id)!;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        // 垂直方向弯出光弧
        const nx = -dy / len;
        const ny = dx / len;
        const bow = len * 0.16;
        return { ax: a.x, ay: a.y, cx: mx + nx * bow, cy: my + ny * bow, bx: b.x, by: b.y, i };
      }),
    [nodeXY],
  );

  useEffect(() => {
    let alive = true;
    loadWorld().then((w) => {
      if (!alive) return;
      setWorld(w);
      setReady(true);
      probe.mapReady = true;
    });
    return () => {
      alive = false;
    };
  }, []);

  // —— 尺寸 ——
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { w, h };
      const c = canvasRef.current;
      if (c) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      }
      dirty.current = true;
    };
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      apply(r.width, r.height);
    });
    ro.observe(el);
    apply(el.clientWidth, el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // —— 视图收敛（进入视口时按容器适配初始 k）——
  useEffect(() => {
    if (!active || mobile) return;
    const { w } = sizeRef.current;
    const k0 = clamp(w / 1500, 0.75, 1.6);
    tgt.current = { cx: wx(112), cy: wy(26), k: k0 };
    cur.current = { ...tgt.current };
    dirty.current = true;
  }, [active, mobile]);

  const clampView = useCallback((v: ViewState): ViewState => {
    const { w, h } = sizeRef.current;
    const mx = Math.min(w / (2 * v.k), W / 2);
    const my = Math.min(h / (2 * v.k), H / 2);
    return {
      k: clamp(v.k, K_MIN, K_MAX),
      cx: clamp(v.cx, mx, W - mx),
      cy: clamp(v.cy, my, H - my),
    };
  }, []);

  const zoomAt = useCallback(
    (factor: number, anchorX?: number, anchorY?: number) => {
      const { w, h } = sizeRef.current;
      const v = tgt.current;
      const k2 = clamp(v.k * factor, K_MIN, K_MAX);
      const ax = anchorX ?? w / 2;
      const ay = anchorY ?? h / 2;
      // 锚点世界坐标保持不动
      const wxpt = v.cx + (ax - w / 2) / v.k;
      const wypt = v.cy + (ay - h / 2) / v.k;
      tgt.current = clampView({ k: k2, cx: wxpt - (ax - w / 2) / k2, cy: wypt - (ay - h / 2) / k2 });
      dirty.current = true;
    },
    [clampView],
  );

  // —— 指针交互：拖拽平移 + 双指捏合 ——
  useEffect(() => {
    if (mobile) return;
    const el = wrapRef.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;
    /** 已认为开始拖拽（超过阈值才捕获，避免吞掉点击） */
    let dragging = false;
    const DRAG_THRESHOLD = 5;

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      }
      dragging = false;
    };
    const startDrag = (e: PointerEvent) => {
      if (dragging) return;
      dragging = true;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) startDrag(e);
        tgt.current = clampView({
          ...tgt.current,
          cx: tgt.current.cx - dx / tgt.current.k,
          cy: tgt.current.cy - dy / tgt.current.k,
        });
        // 直接吸住，避免拖拽跟手延迟
        cur.current.cx -= dx / cur.current.k;
        cur.current.cy -= dy / cur.current.k;
        dirty.current = true;
      } else if (pointers.size === 2) {
        startDrag(e);
        const [p1, p2] = [...pointers.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (pinchDist > 0 && d > 0) {
          const rect = el.getBoundingClientRect();
          zoomAt(d / pinchDist, (p1.x + p2.x) / 2 - rect.left, (p1.y + p2.y) / 2 - rect.top);
        }
        pinchDist = d;
      }
    };
    const up = (e: PointerEvent) => {
      // 拖拽结束后释放捕获（若有），避免残留吞掉后续点击
      if (dragging && el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
      dragging = false;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0014), e.clientX - rect.left, e.clientY - rect.top);
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [mobile, clampView, zoomAt]);

  // —— 绘制主循环 ——
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const drawGraticule = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = 'rgba(34,211,238,0.06)';
      ctx.lineWidth = 1 / cur.current.k;
      ctx.beginPath();
      for (let lng = -160; lng <= 160; lng += 20) {
        const x = wx(lng);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let lat = -60; lat <= 60; lat += 20) {
        const y = wy(lat);
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    };

    const strokeLines = (ctx: CanvasRenderingContext2D, lines: Float32Array[]) => {
      ctx.beginPath();
      for (const arr of lines) {
        ctx.moveTo(arr[0], arr[1]);
        for (let i = 2; i < arr.length; i += 2) ctx.lineTo(arr[i], arr[i + 1]);
      }
      ctx.stroke();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!activeRef.current || !readyRef.current || !paths) return;

      // 确定性插值：时间常数收敛（与帧率无关）
      const s = 1 - Math.exp(-dt * 11);
      const c = cur.current;
      const t = tgt.current;
      if (Math.abs(t.k - c.k) > 1e-4 || Math.abs(t.cx - c.cx) > 0.01 || Math.abs(t.cy - c.cy) > 0.01) {
        c.k += (t.k - c.k) * s;
        c.cx += (t.cx - c.cx) * s;
        c.cy += (t.cy - c.cy) * s;
        // 收敛到阈值后精确对齐，避免渐近逼近导致空闲时每帧整幅重绘
        //（reduced 下必须真正静止，否则 ping/流点虽跳过但底图仍按 60fps 重绘）
        if (Math.abs(t.k - c.k) < 1e-4 && Math.abs(t.cx - c.cx) < 0.01 && Math.abs(t.cy - c.cy) < 0.01) {
          c.k = t.k;
          c.cx = t.cx;
          c.cy = t.cy;
        }
        dirty.current = true;
      }
      if (reducedRef.current && !dirty.current) return;
      dirty.current = false;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const dpr = canvas.width / Math.max(1, sizeRef.current.w);
      const { w: vw, h: vh } = sizeRef.current;
      const time = now / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      // —— 世界空间 ——
      ctx.save();
      ctx.translate(vw / 2, vh / 2);
      ctx.scale(c.k, c.k);
      ctx.translate(-c.cx, -c.cy);

      drawGraticule(ctx);

      // 国家填充
      ctx.fillStyle = 'rgba(56,217,240,0.05)';
      ctx.beginPath();
      for (const arr of paths.fills) {
        ctx.moveTo(arr[0], arr[1]);
        for (let i = 2; i < arr.length; i += 2) ctx.lineTo(arr[i], arr[i + 1]);
        ctx.closePath();
      }
      ctx.fill();

      // 全息轮廓（青色低透明描边，屏幕等宽）
      ctx.strokeStyle = 'rgba(34,211,238,0.34)';
      ctx.lineWidth = 1 / c.k;
      strokeLines(ctx, paths.borderLines);

      // 光弧
      ctx.strokeStyle = 'rgba(34,211,238,0.20)';
      ctx.lineWidth = 1.1 / c.k;
      ctx.beginPath();
      for (const a of arcsXY) {
        ctx.moveTo(a.ax, a.ay);
        ctx.quadraticCurveTo(a.cx, a.cy, a.bx, a.by);
      }
      ctx.stroke();
      ctx.restore();

      const toScreen = (x: number, y: number) => ({
        sx: (x - c.cx) * c.k + vw / 2,
        sy: (y - c.cy) * c.k + vh / 2,
      });

      // —— 屏幕空间：光弧流动光点 ——
      if (!reducedRef.current) {
        for (const a of arcsXY) {
          const dots = 2;
          for (let j = 0; j < dots; j++) {
            const p = (time * 0.11 + a.i * 0.17 + j * 0.5) % 1;
            const q = 1 - p;
            const x = q * q * a.ax + 2 * q * p * a.cx + p * p * a.bx;
            const y = q * q * a.ay + 2 * q * p * a.cy + p * p * a.by;
            const { sx, sy } = toScreen(x, y);
            if (sx < -10 || sx > vw + 10 || sy < -10 || sy > vh + 10) continue;
            ctx.save();
            ctx.shadowColor = 'rgba(157,243,255,0.9)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(223,251,255,0.95)';
            ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
            ctx.restore();
          }
        }
      }

      // —— 屏幕空间：像素光点节点 ——
      const visibleNow: string[] = [];
      for (const n of nodesRef.current) {
        const p = nodeXY.get(n.id)!;
        const { sx, sy } = toScreen(p.x, p.y);
        const inView = sx > -48 && sx < vw + 48 && sy > -48 && sy < vh + 48;
        if (inView && matchRef.current.has(n.id) && visibleNow.length < 60) visibleNow.push(n.id);
        if (!inView) {
          const el = labelRefs.current.get(n.id);
          if (el) el.style.transform = 'translate(-9999px,-9999px) translate(-50%,-50%)';
          continue;
        }
        const el = labelRefs.current.get(n.id);
        if (el) el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%)`;
        if (n.id === selectedRef.current) {
          // 选中节点信息由 DOM 面板承载
        }
        const matched = matchRef.current.has(n.id);
        const alpha = matched ? 1 : 0.16;
        ctx.save();
        ctx.globalAlpha = alpha;

        if (n.tier === 'planned') {
          // 规划中：紫色虚线环
          ctx.strokeStyle = 'rgba(124,139,245,0.85)';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(sx - 8.5, sy - 8.5, 17, 17);
          ctx.setLineDash([]);
          ctx.shadowColor = 'rgba(124,139,245,0.8)';
          ctx.shadowBlur = 7;
          ctx.fillStyle = '#7c8bf5';
          ctx.fillRect(sx - 3, sy - 3, 6, 6);
        } else if (n.tier === 'core') {
          // 核心：9px 白心 + 青晕 + 2.4s ping 环
          ctx.shadowColor = 'rgba(34,211,238,0.95)';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 4.5, sy - 4.5, 9, 9);
          if (!reducedRef.current) {
            const phase = (time / 2.4 + (n.lat + 90) / 180) % 1;
            const r = 9 + phase * 20;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(34,211,238,${(1 - phase) * 0.55})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx - r, sy - r, r * 2, r * 2);
          }
        } else {
          // 边缘：6px 稳定亮点
          ctx.shadowColor = 'rgba(157,243,255,0.85)';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#9df3ff';
          ctx.fillRect(sx - 3, sy - 3, 6, 6);
        }
        ctx.restore();

        // hover / 选中高亮环
        if (n.id === hoverId.current || n.id === selectedRef.current) {
          ctx.save();
          ctx.strokeStyle = 'rgba(157,243,255,0.9)';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(sx - 13, sy - 13, 26, 26);
          ctx.restore();
        }
      }
      const key = visibleNow.join(',');
      if (key !== visibleKey.current) {
        visibleKey.current = key;
        setVisibleIds(visibleNow);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paths, nodeXY, arcsXY]);

  useEffect(() => {
    onVisibleChange(visibleIds.length);
  }, [visibleIds, onVisibleChange]);

  // —— 对外句柄 ——
  const focusNode = useCallback((id: string) => {
    const p = nodeXY.get(id);
    if (!p) return;
    const k = Math.max(tgt.current.k, 1.4);
    tgt.current = clampView({ cx: p.x, cy: p.y, k });
    dirty.current = true;
  }, [nodeXY, clampView]);

  const fitNodes = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const xs = ids.map((id) => nodeXY.get(id)?.x).filter((v): v is number => v != null);
    const ys = ids.map((id) => nodeXY.get(id)?.y).filter((v): v is number => v != null);
    if (!xs.length) return;
    const { w, h } = sizeRef.current;
    const bw = Math.max(240, Math.max(...xs) - Math.min(...xs));
    const bh = Math.max(160, Math.max(...ys) - Math.min(...ys));
    const k = clamp(Math.min(w / bw, h / bh) * 0.82, K_MIN, K_MAX);
    tgt.current = clampView({
      cx: (Math.max(...xs) + Math.min(...xs)) / 2,
      cy: (Math.max(...ys) + Math.min(...ys)) / 2,
      k,
    });
    dirty.current = true;
  }, [nodeXY, clampView]);

  const zoomBy = useCallback((factor: number) => zoomAt(factor), [zoomAt]);

  useImperativeHandle(handleRef, () => ({ focusNode, fitNodes, zoomBy }), [handleRef, focusNode, fitNodes, zoomBy]);

  // —— 键盘 roving tabindex（沿筛选结果遍历）——
  const onKeyDown = (e: React.KeyboardEvent) => {
    const list = focusRef.current;
    if (!list.length) return;
    const idx = list.findIndex((n) => n.id === rovingId);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % list.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const n = list[next];
    onRoving(n.id);
    requestAnimationFrame(() => labelRefs.current.get(n.id)?.focus());
    // 聚焦节点滚入视口
    const p = nodeXY.get(n.id)!;
    const { w, h } = sizeRef.current;
    const sx = (p.x - cur.current.cx) * cur.current.k + w / 2;
    const sy = (p.y - cur.current.cy) * cur.current.k + h / 2;
    if (sx < 60 || sx > w - 60 || sy < 60 || sy > h - 60) focusNode(n.id);
  };

  // 渲染的标签 = 视口内筛选结果（上限 60）；roving / 选中节点强制渲染保证可聚焦
  const renderedIds = useMemo(() => {
    const set = new Set(visibleIds);
    if (rovingId) set.add(rovingId);
    if (selectedId) set.add(selectedId);
    return focusNodes.filter((n) => set.has(n.id));
  }, [visibleIds, rovingId, selectedId, focusNodes]);

  return (
    <div className={`netmap${mobile ? ' netmap-mobile' : ''}`} ref={wrapRef} role="group" aria-label="网络节点地图（方向键切换节点，回车查看详情）" onKeyDown={onKeyDown}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {!ready && <div className="netmap-loading mono">底图加载中…</div>}
      <div className="netmap-labels" aria-hidden={false}>
        {renderedIds.map((n) => (
          <button
            key={n.id}
            type="button"
            ref={(el) => {
              if (el) labelRefs.current.set(n.id, el);
              else labelRefs.current.delete(n.id);
            }}
            className={`netnode${n.tier === 'planned' ? ' is-plan' : ''}${n.tier === 'core' ? ' is-core' : ''}${
              !matchSet.has(n.id) ? ' is-dim' : ''
            }${n.id === selectedId ? ' is-selected' : ''}`}
            style={{ transform: 'translate(-9999px,-9999px) translate(-50%,-50%)' }}
            tabIndex={rovingId === n.id ? 0 : -1}
            aria-label={`${n.city} ${n.cc} ${n.id}，${n.tier === 'planned' ? '规划中节点' : `延迟 ${n.latency} 毫秒`}，按回车查看详情`}
            aria-pressed={n.id === selectedId}
            onMouseEnter={() => (hoverId.current = n.id)}
            onMouseLeave={() => (hoverId.current = null)}
            onFocus={() => onRoving(n.id)}
            onClick={() => onSelect(n)}
          >
            <span className="netnode-chip mono">
              {n.city}
              {n.tier === 'planned' ? ' ·规划' : ''}
            </span>
          </button>
        ))}
      </div>
      <div className="netmap-zoom" role="group" aria-label="地图缩放控制">
        <button type="button" className="netmap-zbtn" onClick={() => zoomBy(1.3)} aria-label="放大">
          +
        </button>
        <button type="button" className="netmap-zbtn" onClick={() => zoomBy(1 / 1.3)} aria-label="缩小">
          −
        </button>
      </div>
    </div>
  );
}
