import { useEffect } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ThemeProvider } from './lib/theme';
import { SearchProvider, useSearch } from './lib/searchContext';
import { ToastProvider } from './lib/toast';
import { ROUTE_ENTER, ROUTE_EXIT, VEIL_SWEEP } from './lib/motion';
import { usePrefersReducedMotion } from './lib/useMedia';
import { BackgroundLayers } from './components/background/BackgroundLayers';
import { DesktopNav } from './components/nav/DesktopNav';
import { MobileTopBar } from './components/nav/MobileTopBar';
import { TabBar } from './components/nav/TabBar';
import { SearchOverlay } from './components/SearchOverlay';
import { Footer } from './components/Footer';
import { lazy, Suspense } from 'react';
import { BrandLoader } from './components/BrandLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const EssaysPage = lazy(() => import('./pages/EssaysPage'));
const EssayDetailPage = lazy(() => import('./pages/EssayDetailPage'));
const ArchivesPage = lazy(() => import('./pages/ArchivesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** A. route-ink-veil（§8.2 A【HC-2】）：全屏薄纱扫过 z-60，pointer-events:none 永不吞点击。 */
function RouteVeil({ pathname }: { pathname: string }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          width: '160vw',
          left: '-30vw',
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, var(--color-veil) 0%, transparent 70%)',
        }}
        initial={{ x: '-100vw' }}
        animate={{ x: '100vw' }}
        transition={VEIL_SWEEP}
      />
    </AnimatePresence>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { openSearch } = useSearch();

  // 语义不等动画：路由状态即时更新 + 滚动复位
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ⌘K / Ctrl+K 全局触发
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch(document.activeElement as HTMLElement | null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch]);

  return (
    <>
      <RouteVeil pathname={location.pathname} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: reduced ? { duration: 0 } : { ...ROUTE_ENTER } }}
          exit={reduced ? undefined : { opacity: 0, y: -8, transition: { ...ROUTE_EXIT } }}
        >
          <Suspense fallback={<BrandLoader />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:slug" element={<PostDetailPage />} />
              <Route path="/essays" element={<EssaysPage />} />
              <Route path="/essays/:slug" element={<EssayDetailPage />} />
              <Route path="/archives" element={<ArchivesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function AppShell() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        跳到正文
      </a>
      {/* 背景系统（L0/L1/L2），全部 aria-hidden */}
      <BackgroundLayers />

      <DesktopNav />
      <MobileTopBar />

      <main id="main" className="relative z-10 flex flex-1 flex-col">
        <AnimatedRoutes />
      </main>

      {/* 移动端内容底部预留：64px 标签栏 + safe-area + 24px（§2.2 HC-1） */}
      <div className="relative z-10 pb-tabbar">
        <Footer />
      </div>
      <TabBar />
      <SearchOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SearchProvider>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </MotionConfig>
        </SearchProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
