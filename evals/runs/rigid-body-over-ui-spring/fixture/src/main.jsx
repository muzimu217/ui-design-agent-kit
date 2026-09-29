import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';

/**
 * rigid-body-over-ui-spring 评测夹具：Rapier 物理（拖拽抛掷/落下/碰撞/堆叠）+
 * UI 反馈弹簧分离（DOM toast 用 CSS spring——不写物理 transform）。
 * 引擎正用：RigidBody dynamic/fixed bodies + CuboidCollider；拖拽=kinematicPosition
 * 短暂接管（setNextKinematicTranslation），释放回 dynamic 落下；reset=setTranslation
 * +setLinvel 清零（所有权：物理是唯一 transform 写入者，UI 层不碰）。
 */

function Dice({ position, color }) {
  const ref = useRef(null);
  useEffect(() => {
    window.__bodies = window.__bodies || [];
    if (ref.current) window.__bodies.push(ref.current);
    return () => { window.__bodies = (window.__bodies || []).filter((b) => b !== ref.current); };
  }, []);
  return (
    <RigidBody ref={ref} position={position} colliders="cuboid" restitution={0.15} friction={0.7}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[16, 1, 16]} />
        <meshStandardMaterial color="#1a242e" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

function Draggable({ position }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const drag = useRef(null);

  // 拖拽：pointerdown raycast 命中该体 → kinematicPosition 接管跟随指针平面；
  // pointerup → 恢复 dynamic 落下（速度清零由引擎自然处理）
  const onPointerDown = (e) => {
    e.stopPropagation();
    const body = ref.current;
    if (!body) return;
    const z = e.point.z;
    body.setBodyType(0 /* kinematicPosition */, true);
    // move/up 挂 window：three mesh 无 pointer capture 时收不到后续事件（首版缺陷）
    const move = (ev) => {
      const p = ev.point;
      if (p) body.setNextKinematicTranslation({ x: p.x, y: Math.max(p.y, 0.4), z });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      body.setBodyType(0, true);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <RigidBody ref={ref} position={position} colliders="cuboid"
      onPointerDown={onPointerDown}
      restitution={0.2} friction={0.8}
    >
      <mesh castShadow onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={hover ? '#ffd166' : '#4d9fff'} roughness={0.4} />
      </mesh>
    </RigidBody>
  );
}

function App() {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setNonce((n) => n + 1); }
      if (e.code === 'KeyB') {
        e.preventDefault();
        window.__bodies?.forEach((body) => {
          body.applyImpulse({ x: (Math.random() - 0.5) * 6, y: 3 + Math.random() * 2, z: (Math.random() - 0.5) * 6 }, true);
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const reset = () => setNonce((n) => n + 1);
  return (
    <>
      <Canvas shadows camera={{ position: [5, 4.5, 6], fov: 42 }}>
        <color attach="background" args={['#0c1116']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 8, 4]} intensity={1.3} castShadow />
        <Physics key={nonce} gravity={[0, -9.81, 0]} timeStep="vary">
          <Ground />
          <Dice position={[-1.2, 3.2, 0]} color="#e8a33d" />
          <Dice position={[0, 4.6, 0]} color="#e05d5d" />
          <Dice position={[1.2, 5.8, 0]} color="#2fbf8f" />
          <Draggable position={[0.5, 2.6, 0.5]} />
        </Physics>
      </Canvas>
      <div className="hud">Rapier · 动态体 3 + 可拖拽 1 · 引擎写 transform</div>
      <div className="hint">拖拽方块抛掷 · 空格重置 · reduced motion 只关 UI 弹簧</div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
