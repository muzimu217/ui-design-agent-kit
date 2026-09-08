import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { animate } from 'motion/react';
import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  MOUSE,
  OrthographicCamera,
  PCFShadowMap,
  Plane,
  Raycaster,
  TOUCH,
  Vector2,
  Vector3,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BOARD_SIZE, LAYER_HEIGHT, dimensions, getBrickType, type Brick } from './domain';
import { BrickGeometryLibrary, STUD_HEIGHT, WORKSPACE_COLOR, fitOrthographicCamera } from './geometry';

export type GridPoint = { x: number; z: number; level: number };
export type CameraCommand = { id: number; type: 'reset' | 'zoomIn' | 'zoomOut' | 'left' | 'right' | 'top' };
export type SceneHandle = { capture: () => Promise<Blob> };

export interface SceneProps {
  bricks: Brick[];
  preview: Brick | null;
  previewValid: boolean;
  selectedId: string | null;
  tool: 'build' | 'select' | 'erase';
  targetBricks: Brick[];
  reducedMotion: boolean;
  cameraCommand: CameraCommand;
  sceneKey: string;
  framing?: 'board' | 'subject';
  onHover: (point: GridPoint | null) => void;
  onActivate: (point: GridPoint, brickId: string | null, pointerType: string) => void;
  onReady?: (ready: boolean) => void;
}

const HALF_BOARD = BOARD_SIZE / 2;
const DEFAULT_DIRECTION = new Vector3(1, 1.04, -1.3).normalize();
const Y_AXIS = new Vector3(0, 1, 0);
const NO_RAYCAST = () => undefined;

function useLibrary() {
  const [library] = useState(() => new BrickGeometryLibrary());
  const retained = useRef(0);
  useEffect(() => {
    retained.current += 1;
    return () => {
      retained.current -= 1;
      queueMicrotask(() => { if (retained.current === 0) library.dispose(); });
    };
  }, [library]);
  return library;
}

function Board({ library }: { library: BrickGeometryLibrary }) {
  const studs = useRef<InstancedMesh>(null);
  const lines = useMemo(() => {
    const points: number[] = [];
    for (let cell = 0; cell <= BOARD_SIZE; cell += 4) {
      const offset = cell - HALF_BOARD;
      points.push(offset, -0.039, -HALF_BOARD, offset, -0.039, HALF_BOARD);
      points.push(-HALF_BOARD, -0.039, offset, HALF_BOARD, -0.039, offset);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    return geometry;
  }, []);
  useLayoutEffect(() => {
    if (!studs.current) return;
    const instance = studs.current;
    const matrix = new Matrix4();
    const scale = new Vector3(1, 0.78, 1);
    let index = 0;
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      for (let z = 0; z < BOARD_SIZE; z += 1) {
        matrix.makeTranslation(x + 0.5 - HALF_BOARD, -0.052, z + 0.5 - HALF_BOARD);
        matrix.scale(scale);
        instance.setMatrixAt(index, matrix);
        index += 1;
      }
    }
    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
    return () => instance.dispose();
  }, []);
  useEffect(() => () => lines.dispose(), [lines]);
  return <group dispose={null}>
    <mesh
      geometry={library.roundedBox('baseplate', BOARD_SIZE + 0.3, 0.35, BOARD_SIZE + 0.3, 0.12)}
      material={library.plastic('#C6D5DD')}
      position={[0, -0.221, 0]}
      castShadow
      receiveShadow
    />
    <instancedMesh
      ref={studs}
      args={[library.stud(), library.plastic('#CFDCE3'), BOARD_SIZE * BOARD_SIZE]}
      castShadow
      receiveShadow
    />
    <lineSegments geometry={lines} material={library.line('#91A8B5', 0.37)} raycast={NO_RAYCAST} />
  </group>;
}

function BrickModel({
  brick,
  library,
  animatePlacement,
  reducedMotion,
}: { brick: Brick; library: BrickGeometryLibrary; animatePlacement: boolean; reducedMotion: boolean }) {
  const display = useRef<Group>(null);
  const played = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const { width, depth } = dimensions(brick.type, brick.rotation);
  useLayoutEffect(() => {
    const group = display.current;
    if (!group) return;
    group.position.y = 0;
    group.scale.setScalar(1);
    if (!animatePlacement || reducedMotion || document.hidden) {
      played.current = true;
      return;
    }
    if (played.current) return;
    group.position.y = 0.48;
    group.scale.setScalar(0.94);
    const animation = animate(0, 1, {
      type: 'spring',
      stiffness: 280,
      damping: 18,
      mass: 1.2,
      restDelta: 0.001,
      restSpeed: 0.001,
      onUpdate: (value) => {
        group.position.y = (1 - value) * 0.48;
        group.scale.setScalar(0.94 + value * 0.06);
        invalidate();
      },
      onComplete: () => {
        played.current = true;
        group.position.y = 0;
        group.scale.setScalar(1);
        invalidate();
      },
    });
    const settle = () => {
      if (!document.hidden) return;
      animation.stop();
      played.current = true;
      group.position.y = 0;
      group.scale.setScalar(1);
    };
    document.addEventListener('visibilitychange', settle);
    return () => {
      animation.stop();
      document.removeEventListener('visibilitychange', settle);
      group.position.y = 0;
      group.scale.setScalar(1);
    };
  }, [animatePlacement, reducedMotion, invalidate]);
  return <group
    position={[brick.x + width / 2 - HALF_BOARD, brick.y * LAYER_HEIGHT, brick.z + depth / 2 - HALF_BOARD]}
    rotation={[0, brick.rotation * Math.PI / 2, 0]}
    dispose={null}
  >
    <group ref={display} userData={{ placementDisplay: true }}>
      <mesh
        geometry={library.brick(brick.type)}
        material={library.plastic(brick.color)}
        userData={{ brickId: brick.id }}
        castShadow
        receiveShadow
      />
    </group>
  </group>;
}

function BrickHelper({ brick, library, mode }: {
  brick: Brick;
  library: BrickGeometryLibrary;
  mode: 'selected' | 'valid' | 'invalid' | 'target';
}) {
  const { width, depth } = dimensions(brick.type, brick.rotation);
  return <group
    position={[brick.x + width / 2 - HALF_BOARD, brick.y * LAYER_HEIGHT, brick.z + depth / 2 - HALF_BOARD]}
    rotation={[0, brick.rotation * Math.PI / 2, 0]}
    dispose={null}
  >
    {mode !== 'selected' && <mesh
      geometry={library.brick(brick.type)}
      material={library.plastic(brick.color, mode)}
      raycast={NO_RAYCAST}
      renderOrder={mode === 'target' ? 1 : 3}
    />}
    <lineSegments
      geometry={library.outline(brick.type)}
      material={library.line(
        mode === 'invalid' ? '#BA293B' : mode === 'valid' ? '#167450' : mode === 'target' ? '#7C9BA9' : '#26343D',
        mode === 'target' ? 0.32 : 1,
        mode === 'target',
      )}
      raycast={NO_RAYCAST}
      renderOrder={10}
    />
    {mode === 'selected' && <mesh
      geometry={library.roundedBox('selection-tab', 0.2, 0.075, 0.2, 0.025)}
      material={library.plastic('#FAFCFD')}
      position={[-getBrickType(brick.type).width / 2, 0.02, -getBrickType(brick.type).depth / 2]}
      raycast={NO_RAYCAST}
      renderOrder={12}
    />}
  </group>;
}

interface Gesture {
  id: number;
  x: number;
  y: number;
  moved: boolean;
  cancelled: boolean;
  pointerType: string;
}

interface RuntimeProps extends SceneProps {
  captureRef: MutableRefObject<(() => Promise<Blob>) | null>;
  onFailure: () => void;
}

function SceneRuntime(props: RuntimeProps) {
  const { camera, gl, scene, size, invalidate, setFrameloop } = useThree();
  const library = useLibrary();
  const controls = useRef<OrbitControlsImpl>(null);
  const solids = useRef<Group>(null);
  const helpers = useRef<Group>(null);
  const current = useRef(props);
  current.current = props;
  const ready = useRef(false);
  const alive = useRef(true);
  const capturing = useRef(false);
  const baseZoom = useRef(1);
  const initialIds = useRef({ key: props.sceneKey, ids: new Set(props.bricks.map((brick) => brick.id)) });
  if (initialIds.current.key !== props.sceneKey) {
    initialIds.current = { key: props.sceneKey, ids: new Set(props.bricks.map((brick) => brick.id)) };
  }

  const subjectBounds = useCallback((includeTargets = true) => {
    let top = 0.8;
    const { bricks, targetBricks, framing } = current.current;
    const subject = includeTargets ? [...bricks, ...targetBricks] : bricks;
    if (framing === 'subject' && subject.length) {
      const bounds = new Box3();
      for (const brick of subject) {
        const { width, depth, height } = dimensions(brick.type, brick.rotation);
        bounds.expandByPoint(new Vector3(brick.x - HALF_BOARD - 0.15, brick.y * LAYER_HEIGHT - 0.1, brick.z - HALF_BOARD - 0.15));
        // Reserve the placement spring's initial lift as well as the studs.
        bounds.expandByPoint(new Vector3(brick.x + width - HALF_BOARD + 0.15, (brick.y + height) * LAYER_HEIGHT + STUD_HEIGHT + 0.6, brick.z + depth - HALF_BOARD + 0.15));
      }
      return bounds;
    }
    for (const brick of subject) {
      top = Math.max(top, (brick.y + getBrickType(brick.type).height) * LAYER_HEIGHT + STUD_HEIGHT + 0.1);
    }
    return new Box3(new Vector3(-HALF_BOARD - 0.3, -0.43, -HALF_BOARD - 0.3), new Vector3(HALF_BOARD + 0.3, top, HALF_BOARD + 0.3));
  }, []);

  const fit = useCallback((resetDirection = false, includeTargets = true) => {
    if (!(camera instanceof OrthographicCamera) || !controls.current || size.width < 1 || size.height < 1) return;
    const bounds = subjectBounds(includeTargets);
    const target = bounds.getCenter(new Vector3());
    const direction = resetDirection ? DEFAULT_DIRECTION.clone() : camera.position.clone().sub(controls.current.target).normalize();
    if (direction.lengthSq() < 0.5) direction.copy(DEFAULT_DIRECTION);
    camera.position.copy(target).addScaledVector(direction, 65);
    camera.near = 0.1;
    camera.far = 180;
    camera.lookAt(target);
    controls.current.target.copy(target);
    const damping = controls.current.enableDamping;
    controls.current.enableDamping = false;
    controls.current.update();
    controls.current.enableDamping = damping;
    baseZoom.current = fitOrthographicCamera(camera, bounds, size.width < 600 ? 1.13 : 1.1);
    controls.current.minZoom = baseZoom.current * 0.5;
    controls.current.maxZoom = baseZoom.current * 5;
    controls.current.update();
    invalidate();
  }, [camera, invalidate, size.width, size.height, subjectBounds]);

  const previousScene = useRef<string | null>(null);
  useLayoutEffect(() => {
    const reset = previousScene.current !== props.sceneKey;
    previousScene.current = props.sceneKey;
    fit(reset);
  }, [fit, props.sceneKey, props.framing]);

  const previousCommand = useRef<number | null>(null);
  useEffect(() => {
    if (!(camera instanceof OrthographicCamera) || !controls.current) return;
    if (previousCommand.current === props.cameraCommand.id) return;
    previousCommand.current = props.cameraCommand.id;
    const command = props.cameraCommand.type;
    if (command === 'reset') fit(true);
    else if (command === 'zoomIn' || command === 'zoomOut') {
      camera.zoom = Math.max(baseZoom.current * 0.5, Math.min(baseZoom.current * 5, camera.zoom * (command === 'zoomIn' ? 1.2 : 1 / 1.2)));
      camera.updateProjectionMatrix();
      controls.current.update();
      invalidate();
    } else {
      const offset = camera.position.clone().sub(controls.current.target);
      if (command === 'top') offset.set(0, 65, 0.015);
      else offset.applyAxisAngle(Y_AXIS, command === 'left' ? -Math.PI / 4 : Math.PI / 4);
      camera.position.copy(controls.current.target).add(offset);
      camera.lookAt(controls.current.target);
      controls.current.update();
      fit(false);
    }
  }, [props.cameraCommand.id, props.cameraCommand.type, camera, fit, invalidate]);

  useFrame(() => {
    if (!ready.current && !gl.getContext().isContextLost()) {
      ready.current = true;
      queueMicrotask(() => { if (alive.current) current.current.onReady?.(true); });
    }
  });

  useEffect(() => {
    alive.current = true;
    const canvas = gl.domElement;
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const boardPlane = new Plane(Y_AXIS, 0);
    const boardPoint = new Vector3();
    const activePointers = new Set<number>();
    let gesture: Gesture | null = null;
    let lastHover = '';

    const publishHover = (point: GridPoint | null) => {
      const key = point ? `${point.x}:${point.z}:${point.level}` : '';
      if (key === lastHover) return;
      lastHover = key;
      current.current.onHover(point);
    };
    const pick = (event: PointerEvent): { point: GridPoint; brickId: string | null } | null => {
      if (!ready.current || !solids.current) return null;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return null;
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(solids.current.children, true);
      const hit = hits[0];
      if (hit) {
        const brickId = hit.object.userData.brickId as string | undefined;
        const brick = current.current.bricks.find((entry) => entry.id === brickId);
        if (brick) return {
          point: { x: Math.floor(hit.point.x + HALF_BOARD), z: Math.floor(hit.point.z + HALF_BOARD), level: brick.y + getBrickType(brick.type).height },
          brickId: brick.id,
        };
      }
      if (!raycaster.ray.intersectPlane(boardPlane, boardPoint)) return null;
      const x = Math.floor(boardPoint.x + HALF_BOARD);
      const z = Math.floor(boardPoint.z + HALF_BOARD);
      return x >= 0 && x < BOARD_SIZE && z >= 0 && z < BOARD_SIZE ? { point: { x, z, level: 0 }, brickId: null } : null;
    };
    const down = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
      if (activePointers.size > 1) {
        if (gesture) gesture.cancelled = true;
        return;
      }
      if (event.button !== 0) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, cancelled: false, pointerType: event.pointerType || 'mouse' };
      try { canvas.setPointerCapture(event.pointerId); } catch { gesture.cancelled = true; }
    };
    const move = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6) {
        if (!gesture.moved) publishHover(null);
        gesture.moved = true;
      }
      if (event.pointerType !== 'touch' && event.buttons === 0 && activePointers.size === 0) publishHover(pick(event)?.point ?? null);
    };
    const up = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      const ended = gesture;
      if (ended?.id !== event.pointerId) return;
      gesture = null;
      if (ended.cancelled || ended.moved || event.button !== 0 || activePointers.size || Math.hypot(event.clientX - ended.x, event.clientY - ended.y) > 6) return;
      const result = pick(event);
      if (result) {
        publishHover(result.point);
        current.current.onActivate(result.point, result.brickId, ended.pointerType);
      }
    };
    const cancel = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      if (gesture?.id === event.pointerId) gesture = null;
    };
    const leave = () => {
      if (gesture) gesture.cancelled = true;
      publishHover(null);
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      ready.current = false;
      gesture = null;
      activePointers.clear();
      current.current.onReady?.(false);
      current.current.onFailure();
    };
    const visibility = () => {
      if (document.hidden) {
        gesture = null;
        activePointers.clear();
        setFrameloop('never');
      } else {
        setFrameloop('demand');
        invalidate();
      }
    };
    const contextMenu = (event: Event) => event.preventDefault();
    canvas.addEventListener('pointerdown', down, true);
    canvas.addEventListener('pointermove', move, true);
    canvas.addEventListener('pointerup', up, true);
    canvas.addEventListener('pointercancel', cancel, true);
    canvas.addEventListener('lostpointercapture', cancel, true);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('contextmenu', contextMenu);
    canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      alive.current = false;
      ready.current = false;
      canvas.removeEventListener('pointerdown', down, true);
      canvas.removeEventListener('pointermove', move, true);
      canvas.removeEventListener('pointerup', up, true);
      canvas.removeEventListener('pointercancel', cancel, true);
      canvas.removeEventListener('lostpointercapture', cancel, true);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('contextmenu', contextMenu);
      canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [camera, gl, invalidate, setFrameloop]);

  useEffect(() => {
    const capture = async () => {
      if (!ready.current || !(camera instanceof OrthographicCamera) || !controls.current || gl.getContext().isContextLost()) throw new Error('3D 画布尚未就绪，暂时无法截图');
      if (capturing.current) throw new Error('正在生成截图，请稍后再试');
      capturing.current = true;
      const controller = controls.current;
      const previous = {
        position: camera.position.clone(), quaternion: camera.quaternion.clone(), zoom: camera.zoom,
        near: camera.near, far: camera.far, target: controller.target.clone(), enabled: controller.enabled,
        minZoom: controller.minZoom, maxZoom: controller.maxZoom, baseZoom: baseZoom.current,
        helperVisible: helpers.current?.visible ?? true,
      };
      const displays: { group: Group; y: number; scale: Vector3 }[] = [];
      let snapshot: Promise<Blob>;
      try {
        controller.enabled = false;
        if (helpers.current) helpers.current.visible = false;
        solids.current?.traverse((object) => {
          if (object instanceof Group && object.userData.placementDisplay) {
            displays.push({ group: object, y: object.position.y, scale: object.scale.clone() });
            object.position.y = 0;
            object.scale.setScalar(1);
          }
        });
        fit(true, false);
        gl.render(scene, camera);
        snapshot = new Promise<Blob>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('截图生成超时，请重试')), 8000);
          try {
            gl.domElement.toBlob((blob) => {
              window.clearTimeout(timeout);
              if (!blob || !blob.size) reject(new Error('无法生成截图，请重试'));
              else resolve(blob);
            }, 'image/png');
          } catch (error) {
            window.clearTimeout(timeout);
            reject(error);
          }
        });
      } catch (error) {
        capturing.current = false;
        throw error;
      } finally {
        camera.position.copy(previous.position);
        camera.quaternion.copy(previous.quaternion);
        camera.zoom = previous.zoom;
        camera.near = previous.near;
        camera.far = previous.far;
        camera.updateProjectionMatrix();
        controller.target.copy(previous.target);
        controller.enabled = previous.enabled;
        controller.minZoom = previous.minZoom;
        controller.maxZoom = previous.maxZoom;
        baseZoom.current = previous.baseZoom;
        if (helpers.current) helpers.current.visible = previous.helperVisible;
        for (const display of displays) {
          display.group.position.y = display.y;
          display.group.scale.copy(display.scale);
        }
        camera.updateMatrixWorld(true);
        invalidate();
      }
      try { return await snapshot; } finally { capturing.current = false; }
    };
    props.captureRef.current = capture;
    return () => { props.captureRef.current = null; };
  }, [camera, fit, gl, invalidate, scene, props.captureRef]);

  const selected = props.bricks.find((brick) => brick.id === props.selectedId);
  return <>
    <color attach="background" args={[WORKSPACE_COLOR]} />
    <ambientLight intensity={0.65} />
    <hemisphereLight args={['#FFFFFF', '#8DABBC', 2.2]} />
    <directionalLight
      position={[-12, 23, 15]}
      color="#FFF7E8"
      intensity={3.2}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-23}
      shadow-camera-right={23}
      shadow-camera-top={23}
      shadow-camera-bottom={-23}
      shadow-camera-near={1}
      shadow-camera-far={65}
      shadow-bias={-0.00015}
      shadow-normalBias={0.035}
      shadow-radius={3}
    />
    <directionalLight position={[12, 12, -14]} color="#DCEEFF" intensity={1.3} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.407, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color={WORKSPACE_COLOR} roughness={1} />
    </mesh>
    <Board library={library} />
    <group ref={solids}>
      {props.bricks.map((brick) => <BrickModel
        key={`${props.sceneKey}:${brick.id}`}
        brick={brick}
        library={library}
        animatePlacement={!initialIds.current.ids.has(brick.id)}
        reducedMotion={props.reducedMotion}
      />)}
    </group>
    <group ref={helpers}>
      {props.targetBricks.map((brick) => <BrickHelper key={`target:${brick.id}`} brick={brick} library={library} mode="target" />)}
      {selected && <BrickHelper brick={selected} library={library} mode="selected" />}
      {props.preview && <BrickHelper brick={props.preview} library={library} mode={props.previewValid ? 'valid' : 'invalid'} />}
    </group>
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={!props.reducedMotion}
      dampingFactor={0.16}
      rotateSpeed={0.72}
      zoomSpeed={0.82}
      minPolarAngle={0.001}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={16}
      maxDistance={110}
      mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
    />
  </>;
}

const Scene = forwardRef<SceneHandle, SceneProps>(function Scene(props, ref) {
  const captureRef = useRef<(() => Promise<Blob>) | null>(null);
  const readyCallback = useRef(props.onReady);
  readyCallback.current = props.onReady;
  const [webglSupport, setWebglSupport] = useState<'checking' | 'supported' | 'unavailable'>('checking');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let context: WebGL2RenderingContext | null = null;
    let supported = false;
    try {
      const probe = document.createElement('canvas');
      context = probe.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
      supported = context !== null && !context.isContextLost();
    } catch {
      supported = false;
    } finally {
      // Release the capability probe before the actual canvas acquires its context.
      try { context?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* Optional cleanup extension. */ }
    }
    readyCallback.current?.(false);
    setWebglSupport(supported ? 'supported' : 'unavailable');
  }, []);
  useImperativeHandle(ref, () => ({
    capture: () => captureRef.current?.() ?? Promise.reject(new Error('3D 画布尚未就绪，暂时无法截图')),
  }), []);
  if (webglSupport === 'unavailable') throw new Error('此设备无法初始化 WebGL 2，作品仍保留，请重试');
  if (failed) throw new Error('3D 画布连接已中断，作品仍保留，请重试');
  return <div
    className="brick-scene"
    data-tool={props.tool}
    style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, position: 'relative', touchAction: 'none', cursor: props.tool === 'erase' ? 'crosshair' : props.tool === 'select' ? 'default' : 'crosshair' }}
  >
    {webglSupport === 'supported' && <Canvas
      orthographic
      camera={{ position: [30, 31, -39], zoom: 18, near: 0.1, far: 180 }}
      dpr={[1, 1.5]}
      shadows={{ type: PCFShadowMap }}
      frameloop="demand"
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      resize={{ debounce: 0 }}
      fallback={<div role="status">此设备暂时无法显示 3D 画布，作品数据仍保留。</div>}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute('aria-label', '积木搭建画布');
        gl.domElement.style.touchAction = 'none';
      }}
    >
      <SceneRuntime {...props} captureRef={captureRef} onFailure={() => setFailed(true)} />
    </Canvas>}
  </div>;
});

export default Scene;
