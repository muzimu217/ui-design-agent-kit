import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {C, rng} from '../theme';

const CameraRig: React.FC<{z: number; y: number; roll: number}> = ({z, y, roll}) => {
  const {camera} = useThree();
  camera.position.set(Math.sin(z * 0.18) * 0.35, y, z);
  camera.lookAt(Math.sin(z * 0.12) * 0.5, 0.15, z - 8);
  camera.rotation.z = roll;
  return null;
};

const Particles: React.FC = () => {
  const positions = React.useMemo(() => {
    const r = rng(20261020);
    const arr = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      arr[i * 3] = (r() - 0.5) * 16;
      arr[i * 3 + 1] = (r() - 0.5) * 9;
      arr[i * 3 + 2] = -r() * 40 + 6;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#8f8fb0" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

const Gate: React.FC<{index: number; z: number; camZ: number; letter: string}> = ({
  index,
  z,
  camZ,
  letter,
}) => {
  const active = Math.max(0, Math.min(1, (camZ - z + 6) / 3));
  const color = active > 0.5 ? C.cyan : C.violet;
  const w = 2.4;
  const h = 3.2;
  const t = 0.05;

  const texture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);
    ctx.font = 'bold 160px "PingFang SC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 128, 138);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [letter]);

  return (
    <group position={[0, 0, z]}>
      {[
        [0, h / 2, w, t],
        [0, -h / 2, w, t],
        [-w / 2, 0, t, h],
        [w / 2, 0, t, h],
      ].map(([x, y, bw, bh], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[bw, bh, t]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35 + active * 2.2}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, h / 2 + 0.42, 0]}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial map={texture} transparent opacity={0.55 + active * 0.45} />
      </mesh>
    </group>
  );
};

export const ThreeTest: React.FC = () => {
  const frame = useCurrentFrame();
  const camZ = 3 - (frame / 90) * 22;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <ThreeCanvas
        width={1920}
        height={1080}
        camera={{position: [0, 0.4, camZ], fov: 58, near: 0.1, far: 80}}
        gl={{antialias: true}}
      >
        <color attach="background" args={[C.bg]} />
        <fog attach="fog" args={[C.bg, 9, 34]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[2, 3, -4]} intensity={18} color={C.violet} distance={20} />
        <pointLight position={[-3, -1, -14]} intensity={14} color={C.cyan} distance={22} />
        <CameraRig z={camZ} y={0.35 + Math.sin(frame * 0.03) * 0.06} roll={Math.sin(frame * 0.02) * 0.01} />
        <Particles />
        <gridHelper args={[70, 70, '#1d1d2b', '#111119']} position={[0, -1.85, -12]} />
        {['A', 'B', 'C', 'D', 'E', 'F'].map((l, i) => (
          <Gate key={l} index={i} z={-1 - i * 4.2} camZ={camZ} letter={l} />
        ))}
        <mesh position={[0, 0.2, -30]}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshBasicMaterial color={C.violet} wireframe transparent opacity={0.35} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
