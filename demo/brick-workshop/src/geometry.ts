import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  OrthographicCamera,
  Shape,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BRICK_TYPES, COLORS, LAYER_HEIGHT, type BrickType } from './domain';

export const STUD_HEIGHT = 0.18;
export const WORKSPACE_COLOR = '#F2F5F7';
export type PlasticFinish = 'solid' | 'valid' | 'invalid' | 'target';

export function brickDefinition(type: string): BrickType {
  const definition = BRICK_TYPES.find((entry) => entry.id === type);
  if (!definition) throw new Error('未知的积木类型');
  return definition;
}

export function brickColor(color: string): string {
  return COLORS.find((entry) => entry.id === color)?.hex
    ?? (/^#[\da-f]{6}$/i.test(color) ? color : COLORS[0].hex);
}

function roundedCylinder(radius: number, bottom: number, top: number, bevel: number) {
  return new LatheGeometry([
    new Vector2(0, bottom),
    new Vector2(radius - bevel, bottom),
    new Vector2(radius - bevel * 0.3, bottom + bevel * 0.3),
    new Vector2(radius, bottom + bevel),
    new Vector2(radius, top - bevel),
    new Vector2(radius - bevel * 0.3, top - bevel * 0.3),
    new Vector2(radius - bevel, top),
    new Vector2(0, top),
  ], 24);
}

function extrudeProfile(shape: Shape, width: number) {
  const depth = width - 0.105;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.023,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 12,
  });
  // Profile x is the finished brick's z; extrusion becomes its centered x.
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(depth / 2, 0, 0);
  return geometry;
}

function bodyGeometry(type: BrickType): BufferGeometry {
  const height = type.height * LAYER_HEIGHT;
  if (type.shape === 'cylinder') {
    return roundedCylinder(0.473, 0.023, height - 0.018, 0.032);
  }
  if (type.shape === 'slope') {
    const shape = new Shape();
    shape.moveTo(-type.depth / 2 + 0.04, 0.037);
    shape.lineTo(type.depth / 2 - 0.04, 0.037);
    shape.lineTo(type.depth / 2 - 0.04, height - 0.037);
    shape.lineTo(type.depth / 2 - 0.985, height - 0.037);
    shape.lineTo(-type.depth / 2 + 0.04, 0.19);
    shape.closePath();
    return extrudeProfile(shape, type.width);
  }
  if (type.shape === 'arch') {
    const outside = type.depth / 2 - 0.04;
    const inside = type.depth / 2 - 0.73;
    const shape = new Shape();
    shape.moveTo(-outside, 0.037);
    shape.lineTo(-outside, height - 0.037);
    shape.lineTo(outside, height - 0.037);
    shape.lineTo(outside, 0.037);
    shape.lineTo(inside, 0.037);
    shape.lineTo(inside, 0.17);
    shape.quadraticCurveTo(inside, 0.61, 0, 0.625);
    shape.quadraticCurveTo(-inside, 0.61, -inside, 0.17);
    shape.lineTo(-inside, 0.037);
    shape.closePath();
    return extrudeProfile(shape, type.width);
  }
  const geometry = new RoundedBoxGeometry(
    type.width - 0.055,
    height - 0.041,
    type.depth - 0.055,
    2,
    0.035,
  );
  geometry.translate(0, height / 2 + 0.0025, 0);
  return geometry;
}

function mergeOwned(parts: BufferGeometry[]): BufferGeometry {
  const normalized = parts.map((part) => part.index ? part.toNonIndexed() : part);
  const merged = mergeGeometries(normalized, false);
  for (const part of new Set([...parts, ...normalized])) part.dispose();
  if (!merged) throw new Error('无法生成积木几何体');
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/** An owner-scoped cache: the live scene and thumbnail renderer dispose independently. */
export class BrickGeometryLibrary {
  private readonly geometries = new Map<string, BufferGeometry>();
  private readonly materials = new Map<string, MeshPhysicalMaterial>();
  private readonly lines = new Map<string, LineBasicMaterial>();

  stud(): BufferGeometry {
    let geometry = this.geometries.get('stud');
    if (!geometry) {
      geometry = roundedCylinder(0.305, 0, STUD_HEIGHT, 0.024);
      this.geometries.set('stud', geometry);
    }
    return geometry;
  }

  brick(typeId: string): BufferGeometry {
    const key = `brick:${typeId}`;
    let geometry = this.geometries.get(key);
    if (geometry) return geometry;
    const type = brickDefinition(typeId);
    const parts = [bodyGeometry(type)];
    for (let x = 0; x < type.width; x += 1) {
      for (let z = 0; z < type.depth; z += 1) {
        if (type.shape === 'slope' && z !== type.depth - 1) continue;
        parts.push(this.stud().clone().translate(
          x + 0.5 - type.width / 2,
          type.height * LAYER_HEIGHT - 0.025,
          z + 0.5 - type.depth / 2,
        ));
      }
    }
    geometry = mergeOwned(parts);
    this.geometries.set(key, geometry);
    return geometry;
  }

  outline(typeId: string): BufferGeometry {
    const key = `outline:${typeId}`;
    let geometry = this.geometries.get(key);
    if (!geometry) {
      const type = brickDefinition(typeId);
      const height = type.height * LAYER_HEIGHT;
      const box = new BoxGeometry(type.width + 0.018, height + 0.065, type.depth + 0.018);
      box.translate(0, height / 2 + 0.018, 0);
      geometry = new EdgesGeometry(box);
      box.dispose();
      this.geometries.set(key, geometry);
    }
    return geometry;
  }

  roundedBox(key: string, width: number, height: number, depth: number, radius: number) {
    let geometry = this.geometries.get(key);
    if (!geometry) {
      geometry = new RoundedBoxGeometry(width, height, depth, 3, radius);
      this.geometries.set(key, geometry);
    }
    return geometry;
  }

  plastic(color: string, finish: PlasticFinish = 'solid') {
    const hex = brickColor(color);
    const key = `${hex}:${finish}`;
    let material = this.materials.get(key);
    if (!material) {
      const transparent = finish !== 'solid';
      const tint = finish === 'invalid' ? '#D94F58' : hex;
      material = new MeshPhysicalMaterial({
        color: new Color(tint),
        metalness: 0,
        roughness: 0.29,
        clearcoat: 0.28,
        clearcoatRoughness: 0.31,
        specularIntensity: 0.72,
        transparent,
        opacity: finish === 'target' ? 0.15 : transparent ? 0.48 : 1,
        depthWrite: !transparent,
        polygonOffset: transparent,
        polygonOffsetFactor: transparent ? -1 : 0,
      });
      this.materials.set(key, material);
    }
    return material;
  }

  line(color: string, opacity = 1, depthTest = true) {
    const key = `${color}:${opacity}:${depthTest}`;
    let material = this.lines.get(key);
    if (!material) {
      material = new LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthTest, depthWrite: false });
      this.lines.set(key, material);
    }
    return material;
  }

  dispose() {
    for (const geometry of this.geometries.values()) geometry.dispose();
    for (const material of this.materials.values()) material.dispose();
    for (const material of this.lines.values()) material.dispose();
    this.geometries.clear();
    this.materials.clear();
    this.lines.clear();
  }
}

export function fitOrthographicCamera(camera: OrthographicCamera, bounds: Box3, padding = 1.1) {
  camera.updateMatrixWorld(true);
  const corner = new Vector3();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let index = 0; index < 8; index += 1) {
    corner.set(
      index & 1 ? bounds.max.x : bounds.min.x,
      index & 2 ? bounds.max.y : bounds.min.y,
      index & 4 ? bounds.max.z : bounds.min.z,
    ).applyMatrix4(camera.matrixWorldInverse);
    minX = Math.min(minX, corner.x);
    maxX = Math.max(maxX, corner.x);
    minY = Math.min(minY, corner.y);
    maxY = Math.max(maxY, corner.y);
  }
  camera.zoom = Math.min(
    (camera.right - camera.left) / Math.max(0.001, maxX - minX),
    (camera.top - camera.bottom) / Math.max(0.001, maxY - minY),
  ) / padding;
  camera.updateProjectionMatrix();
  return camera.zoom;
}
