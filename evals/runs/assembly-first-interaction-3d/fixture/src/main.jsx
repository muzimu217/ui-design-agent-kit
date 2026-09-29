import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

/**
 * assembly-first-interaction-3d 评测夹具。
 * 装配优先：@react-three/fiber + drei + three（均 MIT，与 demo/brick-workshop
 * 已验证组合同族）——OrbitControls（拖拽/滚轮交互）+ Float（漂浮）两组件装配，
 * 不自绘 WebGL 内核、不引入额外动画运行时（failCondition #4）。
 * 手绘 CSS 例外：环境动画背景（.ambient 渐变漂移）非 3D 对象，理由记录 EVIDENCE §三。
 * reduced motion：matchMedia 判断，关闭自转与漂浮。
 */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function Knob({ reduced }) {
  const ref = useRef();
  useFrame((state, delta) => { if (!reduced && ref.current) ref.current.rotation.y += delta * 0.35; });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.35, 0]} />
      <meshStandardMaterial color="#2fbf8f" flatShading roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

function Scene({ reduced }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <pointLight position={[-4, -2, -3]} intensity={0.6} color="#4d9fff" />
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={reduced ? 0 : 0.5} floatIntensity={reduced ? 0 : 0.9}>
        <Knob reduced={reduced} />
      </Float>
      <Float speed={reduced ? 0 : 1.2} position={[2.6, 0.9, -1.2]}>
        <mesh><torusGeometry args={[0.5, 0.18, 20, 40]} /><meshStandardMaterial color="#4d9fff" roughness={0.3} /></mesh>
      </Float>
      <Float speed={reduced ? 0 : 1.0} position={[-2.4, -0.7, -0.8]}>
        <mesh><dodecahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color="#8f7bf5" flatShading roughness={0.4} /></mesh>
      </Float>
      <OrbitControls enablePan={false} enableZoom autoRotate={!reduced} autoRotateSpeed={reduced ? 0 : 0.8} />
    </>
  );
}

function App() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.5]}
      aria-label="交互 3D 几何体展示（可拖拽旋转）" role="img">
      <Scene reduced={reduced} />
    </Canvas>
  );
}

createRoot(document.getElementById('three-root')).render(
  <StrictMode><App /></StrictMode>
);
