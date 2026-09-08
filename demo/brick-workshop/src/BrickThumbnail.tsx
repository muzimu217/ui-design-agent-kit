import { useEffect, useState } from 'react';
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  OrthographicCamera,
  PCFShadowMap,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { BrickGeometryLibrary, brickDefinition, fitOrthographicCamera } from './geometry';

export interface BrickThumbnailProps {
  type: string;
  color: string;
  size?: number;
}

interface ThumbnailRenderer {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  library: BrickGeometryLibrary;
  floor: Mesh<PlaneGeometry, ShadowMaterial>;
}

const cache = new Map<string, string>();
let shared: ThumbnailRenderer | null = null;
let clients = 0;
let unavailable = false;

function getRenderer(): ThumbnailRenderer | null {
  if (shared) return shared;
  if (unavailable || typeof document === 'undefined') return null;
  try {
    const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
    scene.add(new AmbientLight('#ffffff', 0.6));
    scene.add(new HemisphereLight('#ffffff', '#8296A2', 2.1));
    const key = new DirectionalLight('#fff9ee', 3.1);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 25;
    key.shadow.normalBias = 0.018;
    key.shadow.bias = -0.0001;
    scene.add(key);
    const fill = new DirectionalLight('#dcefff', 1);
    fill.position.set(4, 3, -4);
    scene.add(fill);
    const floor = new Mesh(new PlaneGeometry(30, 30), new ShadowMaterial({ opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);
    shared = { renderer, scene, camera, library: new BrickGeometryLibrary(), floor };
    return shared;
  } catch {
    unavailable = true;
    return null;
  }
}

function releaseRenderer() {
  clients -= 1;
  queueMicrotask(() => {
    if (clients !== 0) return;
    if (shared) {
      shared.library.dispose();
      shared.floor.geometry.dispose();
      shared.floor.material.dispose();
      shared.scene.traverse((object) => {
        if (object instanceof DirectionalLight) object.shadow.dispose();
      });
      shared.renderer.dispose();
      shared.renderer.forceContextLoss();
      shared = null;
    }
    unavailable = false;
  });
}

function renderThumbnail(type: string, color: string, size: number): string | null {
  const resolution = Math.min(256, Math.max(96, Math.ceil(size * 2)));
  const key = `${type}:${color}:${resolution}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const context = getRenderer();
  if (!context) return null;
  const { renderer, scene, camera, library } = context;
  let mesh: Mesh | null = null;
  try {
    mesh = new Mesh(library.brick(type), library.plastic(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.y = -0.26;
    scene.add(mesh);
    mesh.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(mesh);
    const center = bounds.getCenter(camera.position);
    camera.position.set(center.x + 6.4, center.y + 5.4, center.z + 7.7);
    camera.lookAt(bounds.getCenter(mesh.position.clone()));
    fitOrthographicCamera(camera, bounds, 1.22);
    renderer.setSize(resolution, resolution, false);
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    if (!url.startsWith('data:image/png')) return null;
    cache.set(key, url);
    if (cache.size > 192) cache.delete(cache.keys().next().value as string);
    return url;
  } catch {
    return null;
  } finally {
    if (mesh) scene.remove(mesh);
  }
}

export function BrickThumbnail({ type, color, size = 64 }: BrickThumbnailProps) {
  const displaySize = Number.isFinite(size) ? Math.min(256, Math.max(24, size)) : 64;
  const [image, setImage] = useState<{ key: string; src: string | null } | null>(null);
  const key = `${type}:${color}:${displaySize}`;
  useEffect(() => {
    clients += 1;
    let active = true;
    queueMicrotask(() => {
      if (active) setImage({ key, src: renderThumbnail(type, color, displaySize) });
    });
    return () => {
      active = false;
      releaseRenderer();
    };
  }, [type, color, displaySize, key]);
  const src = image?.key === key ? image.src : null;
  const label = brickDefinition(type).label;
  if (!src) {
    return <span
      className="brick-thumbnail brick-thumbnail--fallback"
      aria-label={`${label}预览${image?.key === key ? '不可用' : '加载中'}`}
      style={{ display: 'inline-block', width: displaySize, height: displaySize, flexShrink: 0 }}
    />;
  }
  return <img
    className="brick-thumbnail"
    src={src}
    alt={label}
    width={displaySize}
    height={displaySize}
    draggable={false}
    style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
  />;
}

export default BrickThumbnail;
