import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import Hero from './components/Hero';
import Pricing from './components/Pricing';
import Trust from './components/Trust';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

// S2 全屏地图懒加载（首屏只跑 S0 地球与 logo；空闲时预热分块）
const NetworkStage = lazy(() => import('./components/NetworkStage'));

type View = 'home' | 'network';

const TRANSITION_MS = 600;

export default function App() {
  const reduced = usePrefersReducedMotion();
  const [view, setView] = useState<View>(() =>
    typeof window !== 'undefined' && window.location.hash === '#network' ? 'network' : 'home',
  );
  const [stageMounted, setStageMounted] = useState(view === 'network');
  const [flash, setFlash] = useState(false);
  const [entering, setEntering] = useState(false); // 非 VT 降级：zoom-through-in
  const [heroOut, setHeroOut] = useState(false); // 非 VT 降级：zoom-through-out
  const [toast, setToast] = useState<string | null>(null);
  const [autoFocusStage, setAutoFocusStage] = useState(false);
  /** 换场期间哪个舞台元素参与 View Transitions 命名（'hero' | 'network' | null） */
  const [vtName, setVtName] = useState<'hero' | 'network' | null>(null);

  const viewRef = useRef(view);
  const reducedRef = useRef(reduced);
  const enterBtnRef = useRef<HTMLButtonElement | null>(null);
  const timers = useRef<number[]>([]);
  const vtRef = useRef<ViewTransition | null>(null);
  const transSeq = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const bootedRef = useRef(view === 'network');
  viewRef.current = view;
  reducedRef.current = reduced;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const onDeployToast = useCallback(() => showToast('演示环境：部署流程未接入'), [showToast]);

  /** 滚动到定价（主 CTA） */
  const onDeployScroll = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({
      behavior: reducedRef.current ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  const focusAfterEnter = useCallback(() => {
    if (!bootedRef.current) setAutoFocusStage(true);
  }, []);

  const focusAfterExit = useCallback(() => {
    if (bootedRef.current) {
      bootedRef.current = false;
      return;
    }
    enterBtnRef.current?.focus();
  }, []);

  /** 换场核心：View Transitions 可用则用，否则 transform 等效；reduced-motion 直接切换 */
  const runTransition = useCallback((next: View) => {
    // 反向中断：跳过进行中的换场，立即反转
    const vt = vtRef.current;
    if (vt) {
      vt.skipTransition?.();
      vtRef.current = null;
    }
    clearTimers();
    const mySeq = ++transSeq.current;
    const isCurrent = () => transSeq.current === mySeq;

    if (reducedRef.current) {
      flushSync(() => {
        setView(next);
        setStageMounted(true);
        setFlash(false);
        setEntering(false);
        setHeroOut(false);
        setVtName(null);
      });
      setEntering(true); // CSS 在 reduced 下映射为 150ms 淡入
      timers.current.push(
        window.setTimeout(() => {
          if (!isCurrent()) return;
          setEntering(false);
          next === 'network' ? focusAfterEnter() : focusAfterExit();
        }, 170),
      );
      return;
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // 旧态命名当前舞台 → 回调内切换视图并命名新舞台（隐藏元素不常驻命名）
      flushSync(() => setVtName(viewRef.current === 'network' ? 'network' : 'hero'));
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setView(next);
          setStageMounted(true);
          setVtName(next === 'network' ? 'network' : 'hero');
        });
        setFlash(true);
        timers.current.push(
          window.setTimeout(() => {
            if (isCurrent()) setFlash(false);
          }, 660),
        );
      });
      vtRef.current = transition;
      transition.finished
        .catch(() => undefined)
        .finally(() => {
          if (!isCurrent()) return;
          vtRef.current = null;
          setVtName(null);
          next === 'network' ? focusAfterEnter() : focusAfterExit();
        });
      return;
    }

    const apply = () => {
      flushSync(() => {
        setView(next);
        setStageMounted(true);
      });
      setFlash(true);
      timers.current.push(
        window.setTimeout(() => {
          if (isCurrent()) setFlash(false);
        }, 660),
      );
    };

    // transform + opacity 等效实现
    setHeroOut(true);
    timers.current.push(
      window.setTimeout(() => {
        setHeroOut(false);
        apply();
        setEntering(true);
        timers.current.push(
          window.setTimeout(() => {
            setEntering(false);
            next === 'network' ? focusAfterEnter() : focusAfterExit();
          }, TRANSITION_MS + 20),
        );
      }, TRANSITION_MS - 10),
    );
  }, [focusAfterEnter, focusAfterExit]);

  /** URL hash 驱动：#network ↔ 首页（支持浏览器后退） */
  const goTo = useCallback(
    (next: View) => {
      if (viewRef.current === next) return;
      const targetHash = next === 'network' ? '#network' : '';
      if (window.location.hash !== targetHash && window.location.hash !== (targetHash || '#')) {
        window.location.hash = targetHash;
        return; // hashchange → runTransition
      }
      runTransition(next);
    },
    [runTransition],
  );

  useEffect(() => {
    const onHash = () => {
      const want: View = window.location.hash === '#network' ? 'network' : 'home';
      if (want !== viewRef.current) runTransition(want);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [runTransition]);

  useEffect(() => () => clearTimers(), []);

  // 空闲预热 S2 分块（首次换场零等待）
  useEffect(() => {
    const t = window.setTimeout(() => {
      void import('./components/NetworkStage');
    }, 1600);
    return () => window.clearTimeout(t);
  }, []);

  const enterNetwork = useCallback(() => goTo('network'), [goTo]);
  const exitNetwork = useCallback(() => goTo('home'), [goTo]);

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <div className={`app-page${heroOut ? ' vt-out' : ''}`} inert={view === 'network'}>
        <Hero
          onEnterNetwork={enterNetwork}
          onDeploy={onDeployScroll}
          enterBtnRef={enterBtnRef}
          vtNamed={vtName === 'hero'}
          paused={view === 'network'}
        />
        <Pricing onDeploy={onDeployToast} />
        <Trust />
        <Footer onEnterNetwork={enterNetwork} onDeploy={onDeployScroll} />
      </div>
      {stageMounted && (
        <Suspense fallback={null}>
          <NetworkStage
            active={view === 'network'}
            entering={entering}
            flash={flash}
            autoFocus={autoFocusStage}
            vtNamed={vtName === 'network'}
            onExit={exitNetwork}
            onDeploy={onDeployToast}
          />
        </Suspense>
      )}
      <Toast message={toast} />
    </>
  );
}
