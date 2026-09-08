import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';

import { NODES, arcPairs, type NodeInfo } from '../data/nodes';
import { loadWorld, type WorldData } from '../lib/world';
import { probe } from '../lib/probe';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

import './DataGlobe.css';

interface DataGlobeProps {
  onEnter: () => void;
  /** 进入全屏地图后暂停地球渲染（首屏只跑 S0） */
  paused?: boolean;
}

const pointColor = (n: NodeInfo) => (n.tier === 'core' ? '#9df3ff' : n.tier === 'planned' ? '#7c8bf5' : '#38d9f0');
const pointAltitude = (n: NodeInfo) => (n.tier === 'core' ? 0.032 : 0.016);
const pointRadius = (n: NodeInfo) => (n.tier === 'core' ? 0.32 : n.tier === 'planned' ? 0.24 : 0.2);

const pointLabel = (n: NodeInfo) => `
  <div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;background:rgba(11,20,29,.94);border:1px solid #12333e;border-radius:4px;padding:6px 10px;color:#eafcff">
    <b style="color:#9df3ff">${n.city}</b> ${n.cc} · ${n.id}<br/>
    <span style="color:#9fc9d6">${n.tier === 'planned' ? '规划中' : `演示延迟 ${n.latency} ms`}</span><br/>
    <span style="color:#5b7f8c">点击进入全球网络 →</span>
  </div>`;

export default function DataGlobe({ onEnter, paused = false }: DataGlobeProps) {
  const reduced = usePrefersReducedMotion();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const [world, setWorld] = useState<WorldData | null>(null);
  const [ready, setReady] = useState(false);
  const resumeTimer = useRef<number | null>(null);

  // 容器尺寸（地球填满右栏）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 暂停 / 恢复渲染（被全屏地图覆盖时停止占用 GPU）
  useEffect(() => {
    if (!ready) return;
    const g = globeRef.current;
    if (!g) return;
    if (paused) g.pauseAnimation();
    else g.resumeAnimation();
  }, [paused, ready]);

  // 底图数据（与 S2 地图共用缓存）
  useEffect(() => {
    let alive = true;
    loadWorld().then((w) => alive && setWorld(w));
    return () => {
      alive = false;
    };
  }, []);

  // 就绪：自转（拖拽打断，松手恢复）
  useEffect(() => {
    if (!ready) return;
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: 24, lng: 106, altitude: 2.05 });

    const controls = g.controls() as unknown as {
      autoRotate: boolean;
      autoRotateSpeed: number;
      addEventListener(t: string, fn: () => void): void;
      removeEventListener(t: string, fn: () => void): void;
    };
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.5;
    const pause = () => {
      controls.autoRotate = false;
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
    const resume = () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      if (!reduced) resumeTimer.current = window.setTimeout(() => (controls.autoRotate = true), 2200);
    };
    controls.addEventListener('start', pause);
    controls.addEventListener('end', resume);
    probe.globeReady = true;
    return () => {
      controls.removeEventListener('start', pause);
      controls.removeEventListener('end', resume);
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
      probe.globeReady = false;
    };
  }, [ready, reduced]);

  const arcs = arcPairs.map((p, i) => ({
    startLat: p.a.lat,
    startLng: p.a.lng,
    endLat: p.b.lat,
    endLng: p.b.lng,
    color: ['#9df3ff', 'rgba(34,211,238,0.25)'],
    __i: i,
  }));

  // 球体默认材质为纯黑 MeshPhongMaterial（three-globe 内置），
  // 叠加青色大气辉光 + 低透明经纬网 + 国家多边形 = 暗色全息地球

  return (
    <div className="globe-wrap" ref={wrapRef}>
      <div className="globe-loading" aria-hidden="true" style={{ opacity: ready ? 0 : 1 } as CSSProperties}>
        <span className="globe-loading-orb" />
        节点数据同步中…
      </div>
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(4,7,13,0)"
        showGraticules
        showAtmosphere
        atmosphereColor="#22d3ee"
        atmosphereAltitude={0.11}
        polygonsData={world?.countries ?? []}
        polygonAltitude={(d: object) => {
          void d;
          return 0.006;
        }}
        polygonCapColor={() => 'rgba(14,116,144,0.38)'}
        polygonSideColor={() => 'rgba(10,80,104,0.22)'}
        polygonStrokeColor={() => 'rgba(56,217,240,0.42)'}
        polygonsTransitionDuration={0}
        pointsData={NODES}
        pointLat={(d: object) => (d as NodeInfo).lat}
        pointLng={(d: object) => (d as NodeInfo).lng}
        pointColor={(d: object) => pointColor(d as NodeInfo)}
        pointAltitude={(d: object) => pointAltitude(d as NodeInfo)}
        pointRadius={(d: object) => pointRadius(d as NodeInfo)}
        pointLabel={pointLabel as (d: object) => string}
        onPointClick={(d: object) => {
          onEnter();
          void d;
        }}
        onPointHover={(d: object | null) => {
          void d;
        }}
        arcsData={arcs}
        arcStartLat={(d: object) => (d as { startLat: number }).startLat}
        arcStartLng={(d: object) => (d as { startLng: number }).startLng}
        arcEndLat={(d: object) => (d as { endLat: number }).endLat}
        arcEndLng={(d: object) => (d as { endLng: number }).endLng}
        arcColor={(d: object) => (d as { color: string[] }).color}
        arcStroke={0.32}
        arcDashLength={0.35}
        arcDashGap={1.1}
        arcDashInitialGap={(d: object) => ((d as { __i: number }).__i % 4) * 0.4}
        arcDashAnimateTime={reduced ? 0 : 2800}
        arcAltitudeAutoScale={0.42}
        arcsTransitionDuration={0}
        onGlobeReady={() => setReady(true)}
        rendererConfig={{ antialias: true, alpha: true }}
      />
    </div>
  );
}
