import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import './styles.css';

const App = lazy(() => import('./App'));
const Presentation = lazy(() => import('./Presentation'));
const isPresentation = new URLSearchParams(window.location.search).get('presentation') === '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div role="status">作品加载中</div>}>
        {isPresentation ? <Presentation /> : <App />}
      </Suspense>
    </MotionConfig>
  </StrictMode>,
);
