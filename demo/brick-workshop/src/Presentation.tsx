import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Castle, House, Pause, Play, RotateCcw, Rocket } from 'lucide-react';
import Scene from './Scene';
import type { CameraCommand } from './Scene';
import { CHALLENGES, LAYER_HEIGHT } from './domain';
import type { Challenge } from './domain';
import poster from '../screenshots/house.webp';
import './presentation.css';

const SNAPPY = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 } as const;
const ICONS = { house: House, rocket: Rocket, castle: Castle };
const NO_ACTION = () => undefined;
const MESSAGE_TYPE = 'brick-workshop:presentation';

class PresentationBoundary extends Component<{ children: ReactNode; onRetry: () => void; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="presentation-fallback" role="alert">
      <img src={poster} alt="彩顶小屋的工坊截图" />
      <div><p>3D 展示暂时不可用</p><button type="button" onClick={this.props.onRetry}><RotateCcw size={18} />重新加载</button></div>
    </div>;
  }
}

function usePresentationVisibility() {
  const [visible, setVisible] = useState(!document.hidden);
  const [parentState, setParentState] = useState({ visible: window.parent === window, reducedMotion: false });
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    const receive = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data;
      if (!data || typeof data !== 'object' || !('type' in data) || data.type !== MESSAGE_TYPE
        || !('visible' in data) || typeof data.visible !== 'boolean'
        || !('reducedMotion' in data) || typeof data.reducedMotion !== 'boolean') return;
      setParentState({ visible: data.visible, reducedMotion: data.reducedMotion });
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('message', receive);
    if (window.parent !== window) window.parent.postMessage({ type: 'brick-workshop:ready' }, window.location.origin);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('message', receive);
    };
  }, []);
  return { visible: visible && parentState.visible, reducedMotion: parentState.reducedMotion };
}

function Assembly({ challenge, reducedMotion, visible }: { challenge: Challenge; reducedMotion: boolean; visible: boolean }) {
  const ordered = useMemo(() => [...challenge.bricks].sort((a, b) => a.y * LAYER_HEIGHT - b.y * LAYER_HEIGHT), [challenge]);
  const [count, setCount] = useState(reducedMotion ? ordered.length : 0);
  const [paused, setPaused] = useState(false);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({ id: 0, type: 'reset' });
  const completed = reducedMotion || count >= ordered.length;
  const playing = !paused && !completed && visible && ready && !reducedMotion;
  const shown = useMemo(() => reducedMotion ? ordered : ordered.slice(0, count), [ordered, count, reducedMotion]);
  const missing = useMemo(() => reducedMotion ? [] : ordered.slice(count), [ordered, count, reducedMotion]);
  const onReady = useCallback((value: boolean) => setReady(value), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setCount((value) => Math.min(value + 1, ordered.length)), count === 0 ? 650 : 280);
    return () => window.clearTimeout(timer);
  }, [playing, count, ordered.length]);

  const replay = () => {
    setCount(reducedMotion ? ordered.length : 0);
    setPaused(false);
    setRevision((value) => value + 1);
  };
  return <>
    <div className="presentation-model" data-brick-count={shown.length} data-playing={playing}>
      <PresentationBoundary key={`boundary:${revision}`} onFailure={onFailure} onRetry={() => { setFailed(false); setReady(false); setRevision((value) => value + 1); }}>
        <Scene
          bricks={shown}
          preview={null}
          previewValid={false}
          selectedId={null}
          tool="select"
          targetBricks={missing}
          reducedMotion={reducedMotion || !visible || paused}
          cameraCommand={cameraCommand}
          sceneKey={`presentation:${challenge.id}:${revision}`}
          framing="subject"
          onHover={NO_ACTION}
          onActivate={NO_ACTION}
          onReady={onReady}
        />
      </PresentationBoundary>
      {!ready && !failed && <span className="presentation-loading" role="status">作品加载中</span>}
    </div>
    <div className="presentation-playback">
      <span className="presentation-count" aria-label={`${shown.length} 块积木，共 ${ordered.length} 块`}>
        <span>{String(shown.length).padStart(2, '0')}</span><span className="presentation-count-divider">/</span>{String(ordered.length).padStart(2, '0')}
      </span>
      <progress value={shown.length} max={ordered.length} aria-label="拼搭进度" />
      <motion.button type="button" className="presentation-icon" aria-label={completed ? '重新播放拼搭' : paused ? '继续拼搭' : '暂停拼搭'}
        title={completed ? '重新播放拼搭' : paused ? '继续拼搭' : '暂停拼搭'} disabled={reducedMotion || failed}
        onClick={completed ? replay : () => setPaused((value) => !value)} whileTap={reducedMotion ? undefined : { scale: 0.96 }} transition={SNAPPY}>
        {completed ? <RotateCcw size={18} /> : paused ? <Play size={18} /> : <Pause size={18} />}
      </motion.button>
      <motion.button type="button" className="presentation-icon" title="重置作品视角" aria-label="重置作品视角" onClick={() => setCameraCommand((command) => ({ id: command.id + 1, type: 'reset' }))}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }} transition={SNAPPY}><RotateCcw size={18} /></motion.button>
    </div>
  </>;
}

export default function Presentation() {
  const [selected, setSelected] = useState(CHALLENGES[0]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { initial: true, amount: 0.05 });
  const page = usePresentationVisibility();
  const preference = useReducedMotion() ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedMotion = preference || page.reducedMotion;
  return <main className="presentation" ref={rootRef} aria-label="积木小工坊作品展示">
    <div className="presentation-models" role="group" aria-label="选择积木作品">
      {CHALLENGES.map((challenge) => {
        const Icon = ICONS[challenge.id];
        return <motion.button key={challenge.id} type="button" aria-pressed={selected.id === challenge.id}
          className={selected.id === challenge.id ? 'is-selected' : ''} onClick={() => setSelected(challenge)}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={SNAPPY}>
          <Icon size={17} /><span>{challenge.title}</span>
          {selected.id === challenge.id && <motion.span className="presentation-selection" layoutId="presentation-model-selection" transition={reducedMotion ? { duration: 0 } : SNAPPY} />}
        </motion.button>;
      })}
    </div>
    <Assembly key={selected.id} challenge={selected} reducedMotion={reducedMotion} visible={page.visible && inView} />
  </main>;
}
