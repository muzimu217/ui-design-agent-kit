import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {C, FONT, MONO, clamp, rng} from '../theme';
import {makeTextTexture} from '../three/textTexture';

/**
 * SCENE 3 — the 3D section.
 * Six gate frames stand in a zig-zag corridor receding down -Z. The camera
 * dollies forward through them; each gate lights as it passes. Real perspective,
 * depth fog, floor-grid parallax and a wireframe lattice drifting behind.
 * 2D typography stays in the left third so the frame never fights the geometry.
 */

const GATE_DATA = [
  {id: 'A', name: '方向确认', note: '确认需求摘要与范围'},
  {id: 'B', name: '参考素材', note: '确认参考来源与授权'},
  {id: 'C', name: '设计契约', note: 'token 与动效参数钉版'},
  {id: 'D', name: '修订', note: '按实测问题决定改什么'},
  {id: 'E', name: '验收', note: '看六维实测回执'},
  {id: 'F', name: '留痕', note: '记录版本与证据路径'},
];

const GATE_SPACING = 5.6;
const gateZ = (i: number) => -2 - i * GATE_SPACING;
const gateX = (i: number) => (i % 2 === 0 ? -2.0 : 2.0);

const CameraRig: React.FC<{camZ: number; camY: number; roll: number}> = ({camZ, camY, roll}) => {
  const {camera} = useThree();
  camera.position.set(Math.sin(camZ * 0.14) * 0.3, camY, camZ);
  camera.lookAt(0, 0.1, camZ - 10);
  camera.rotation.z = roll;
  return null;
};

const StarField: React.FC = () => {
  const positions = React.useMemo(() => {
    const r = rng(773311);
    const arr = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      arr[i * 3] = (r() - 0.5) * 24;
      arr[i * 3 + 1] = (r() - 0.5) * 13;
      arr[i * 3 + 2] = -r() * 52 + 10;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color="#9b9bc4" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const Lattice: React.FC<{shift: number}> = ({shift}) => (
  <group position={[0, 0.3, -34]} rotation={[0, shift * 0.045, 0]}>
    <mesh>
      <icosahedronGeometry args={[5.2, 1]} />
      <meshBasicMaterial color={C.violet} wireframe transparent opacity={0.1} />
    </mesh>
    <mesh rotation={[0.6, 0.4, 0]}>
      <torusGeometry args={[7.4, 0.012, 8, 110]} />
      <meshBasicMaterial color={C.cyan} transparent opacity={0.18} />
    </mesh>
    <mesh rotation={[1.15, -0.3, 0.4]}>
      <torusGeometry args={[8.8, 0.008, 8, 110]} />
      <meshBasicMaterial color={C.violet} transparent opacity={0.12} />
    </mesh>
  </group>
);

const Gate: React.FC<{index: number; lit: number}> = ({index, lit}) => {
  const w = 3.6;
  const h = 4.6;
  const t = 0.07;
  const g = GATE_DATA[index];
  const accent = lit > 0.4 ? C.cyan : C.violet;

  const letterTex = React.useMemo(
    () => makeTextTexture([{text: g.id, size: 250, color: '#ffffff', weight: 700, mono: true}], {width: 512, height: 512}),
    [g.id]
  );

  return (
    <group position={[gateX(index), 0, gateZ(index)]} rotation={[0, index % 2 === 0 ? 0.2 : -0.2, 0]}>
      {(
        [
          [0, h / 2, w, t],
          [0, -h / 2, w, t],
          [-w / 2, 0, t, h],
          [w / 2, 0, t, h],
        ] as const
      ).map(([px, py, bw, bh], i) => (
        <mesh key={i} position={[px, py, 0]}>
          <boxGeometry args={[bw, bh, t]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.12 + lit * 2.8}
            metalness={0.5}
            roughness={0.32}
          />
        </mesh>
      ))}
      {(
        [
          [-w / 2, h / 2],
          [w / 2, h / 2],
          [-w / 2, -h / 2],
          [w / 2, -h / 2],
        ] as const
      ).map(([px, py], i) => (
        <mesh key={`c${i}`} position={[px, py, 0.06]}>
          <boxGeometry args={[0.34, 0.34, 0.02]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5 + lit * 0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={letterTex} transparent opacity={0.22 + lit * 0.7} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[w - t * 2, h - t * 2]} />
        <meshBasicMaterial color={accent} transparent opacity={0.015 + lit * 0.09} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const GatesScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const progress = frame / durationInFrames;

  // Dolly from in front of gate A to just past gate F.
  const camZ = interpolate(progress, [0, 1], [5.0, gateZ(5) - 2.4], {
    ...clamp,
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
  const camY = 0.2 + Math.sin(frame * 0.05) * 0.06;
  const roll = Math.sin(frame * 0.035) * 0.011;

  // ahead > 0 means the gate is still in front of the camera; it hits 0 as we pass it.
  const ahead = GATE_DATA.map((_, i) => camZ - gateZ(i));
  const passed = ahead.map((d) => clamp01((1.2 - d) / 2.4));

  // The "current" gate is the nearest one still in front of the camera.
  let current = GATE_DATA.length - 1;
  let best = Infinity;
  for (let i = 0; i < ahead.length; i++) {
    if (ahead[i] > 0.4 && ahead[i] < best) {
      best = ahead[i];
      current = i;
    }
  }

  const overlayIn = interpolate(frame, [0, 18], [0, 1], clamp);
  const cur = GATE_DATA[current];

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <ThreeCanvas
        width={1920}
        height={1080}
        camera={{position: [0, 0.2, camZ], fov: 52, near: 0.1, far: 110}}
        gl={{antialias: true, alpha: false}}
        style={{position: 'absolute', inset: 0}}
      >
        <color attach="background" args={[C.bg]} />
        <fog attach="fog" args={[C.bg, 10, 44]} />
        <ambientLight intensity={0.42} />
        <pointLight position={[3, 4, -4]} intensity={26} color={C.violet} distance={28} />
        <pointLight position={[-3.5, -2, -18]} intensity={18} color={C.cyan} distance={30} />
        <CameraRig camZ={camZ} camY={camY} roll={roll} />
        <StarField />
        <Lattice shift={frame} />
        <gridHelper args={[110, 110, '#1b1b2a', '#0e0e16']} position={[0, -2.5, -18]} />
        {GATE_DATA.map((g, i) => (
          <Gate key={g.id} index={i} lit={passed[i]} />
        ))}
      </ThreeCanvas>

      {/* 2D typographic overlay — left third, always legible */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: overlayIn}}>
        <div style={{position: 'absolute', left: 120, top: 286, width: 640}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 17,
              letterSpacing: '0.3em',
              color: C.cyan,
              marginBottom: 20,
            }}
          >
            六道门 · {String(current + 1).padStart(2, '0')} / 06
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 130,
                lineHeight: 0.88,
                fontWeight: 700,
                color: '#ffffff',
                textShadow: `0 0 70px ${C.cyan}70`,
              }}
            >
              {cur.id}
            </div>
            <div style={{fontFamily: FONT, fontSize: 54, fontWeight: 700, color: C.text, letterSpacing: '-0.01em'}}>
              {cur.name}
            </div>
          </div>
          <div style={{marginTop: 22, fontFamily: FONT, fontSize: 25, color: C.dim, letterSpacing: '0.02em'}}>
            {cur.note}
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 36, alignItems: 'center'}}>
            {GATE_DATA.map((g, i) => (
              <div
                key={g.id}
                style={{
                  width: i === current ? 54 : 28,
                  height: 3,
                  borderRadius: 2,
                  background: i < current ? C.violet : i === current ? C.cyan : C.line,
                  opacity: i <= current ? 1 : 0.55,
                }}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
