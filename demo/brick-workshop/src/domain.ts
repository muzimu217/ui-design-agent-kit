export const BOARD_SIZE = 24;
export const MAX_HEIGHT = 36;
export const MAX_BRICKS = 400;
export const LAYER_HEIGHT = 0.32;

export type Rotation = 0 | 1 | 2 | 3;
export type BrickTypeId =
  | 'brick-1x1'
  | 'brick-1x2'
  | 'brick-1x3'
  | 'brick-1x4'
  | 'brick-2x2'
  | 'brick-2x4'
  | 'plate-1x4'
  | 'plate-2x4'
  | 'slope-1x2'
  | 'slope-2x2'
  | 'cylinder-1x1'
  | 'arch-1x4';

export interface Brick {
  id: string;
  type: BrickTypeId;
  color: string;
  x: number;
  y: number;
  z: number;
  rotation: Rotation;
}

export interface BrickType {
  id: BrickTypeId;
  label: string;
  width: number;
  depth: number;
  height: number;
  shape: 'brick' | 'plate' | 'slope' | 'cylinder' | 'arch';
}

export const BRICK_TYPES: readonly BrickType[] = [
  { id: 'brick-1x1', label: '1 x 1 方砖', width: 1, depth: 1, height: 3, shape: 'brick' },
  { id: 'brick-1x2', label: '1 x 2 方砖', width: 1, depth: 2, height: 3, shape: 'brick' },
  { id: 'brick-1x3', label: '1 x 3 长砖', width: 1, depth: 3, height: 3, shape: 'brick' },
  { id: 'brick-1x4', label: '1 x 4 长砖', width: 1, depth: 4, height: 3, shape: 'brick' },
  { id: 'brick-2x2', label: '2 x 2 方砖', width: 2, depth: 2, height: 3, shape: 'brick' },
  { id: 'brick-2x4', label: '2 x 4 大砖', width: 2, depth: 4, height: 3, shape: 'brick' },
  { id: 'plate-1x4', label: '1 x 4 薄板', width: 1, depth: 4, height: 1, shape: 'plate' },
  { id: 'plate-2x4', label: '2 x 4 薄板', width: 2, depth: 4, height: 1, shape: 'plate' },
  { id: 'slope-1x2', label: '1 x 2 斜坡', width: 1, depth: 2, height: 3, shape: 'slope' },
  { id: 'slope-2x2', label: '2 x 2 斜坡', width: 2, depth: 2, height: 3, shape: 'slope' },
  { id: 'cylinder-1x1', label: '1 x 1 圆柱', width: 1, depth: 1, height: 3, shape: 'cylinder' },
  { id: 'arch-1x4', label: '1 x 4 拱形', width: 1, depth: 4, height: 3, shape: 'arch' },
];

export const COLORS: readonly { id: string; label: string; hex: string }[] = [
  { id: 'red', label: '珊瑚红', hex: '#E95048' },
  { id: 'blue', label: '晴空蓝', hex: '#3476E3' },
  { id: 'yellow', label: '明黄色', hex: '#F4C442' },
  { id: 'green', label: '草绿色', hex: '#45AD7F' },
  { id: 'pink', label: '花瓣粉', hex: '#E982B0' },
  { id: 'purple', label: '丁香紫', hex: '#9876D8' },
  { id: 'orange', label: '橙子色', hex: '#F38B3B' },
  { id: 'teal', label: '湖水青', hex: '#45B5BF' },
  { id: 'white', label: '雪白色', hex: '#FAFCFD' },
  { id: 'charcoal', label: '石墨灰', hex: '#3D4B55' },
  { id: 'gray', label: '云朵灰', hex: '#A6B6C0' },
  { id: 'coral', label: '砖红色', hex: '#B96153' },
];

export interface BuildDocument {
  version: 1;
  name: string;
  bricks: Brick[];
}

export type BuildValidation = { ok: boolean; reason?: string };
export type DocumentValidation =
  | { ok: true; document: BuildDocument }
  | { ok: false; error: string };

export interface Challenge {
  id: 'house' | 'rocket' | 'castle';
  title: string;
  bricks: Brick[];
}

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const types = new Map(BRICK_TYPES.map((type) => [type.id, type]));
const colors = new Set(COLORS.map((color) => color.id));
const brickKeys = ['id', 'type', 'color', 'x', 'y', 'z', 'rotation'];
const documentKeys = ['version', 'name', 'bricks'];
const HISTORY_LIMIT = 100;

export function getBrickType(type: BrickTypeId): BrickType {
  const definition = types.get(type);
  if (!definition) throw new Error('未知的积木类型');
  return definition;
}

function isRotation(value: unknown): value is Rotation {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3;
}

export function dimensions(type: BrickTypeId, rotation: Rotation) {
  const definition = getBrickType(type);
  if (!isRotation(rotation)) throw new Error('积木朝向必须为 0、1、2 或 3');
  return {
    width: rotation % 2 ? definition.depth : definition.width,
    depth: rotation % 2 ? definition.width : definition.depth,
    height: definition.height,
  };
}

function rotateCell(x: number, z: number, type: BrickType, rotation: Rotation) {
  switch (rotation) {
    case 0: return { x, z };
    case 1: return { x: z, z: type.width - 1 - x };
    case 2: return { x: type.width - 1 - x, z: type.depth - 1 - z };
    case 3: return { x: type.depth - 1 - z, z: x };
  }
}

export function connectorCells(brick: Brick): { x: number; z: number; y: number }[] {
  const type = getBrickType(brick.type);
  if (!isRotation(brick.rotation)) throw new Error('积木朝向无效');
  const cells: { x: number; z: number; y: number }[] = [];
  for (let x = 0; x < type.width; x += 1) {
    for (let z = 0; z < type.depth; z += 1) {
      if (type.shape === 'slope' && z !== type.depth - 1) continue;
      const cell = rotateCell(x, z, type, brick.rotation);
      cells.push({ x: brick.x + cell.x, z: brick.z + cell.z, y: brick.y + type.height });
    }
  }
  return cells;
}

function fail(reason: string): BuildValidation {
  return { ok: false, reason };
}

// Snapshot only plain data properties so imports never evaluate accessor fields.
function readRecord(value: unknown, allowedKeys: readonly string[]): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const keys = Reflect.ownKeys(value);
  if (keys.length !== allowedKeys.length || keys.some((key) => typeof key !== 'string' || !allowedKeys.includes(key))) return null;
  const record: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) return null;
    record[key] = descriptor.value;
  }
  return record;
}

function readBrick(value: unknown): Brick | null {
  const record = readRecord(value, brickKeys);
  if (!record) return null;
  const { id, type, color, x, y, z, rotation } = record;
  if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,95}$/.test(id)) return null;
  if (typeof type !== 'string' || !types.has(type as BrickTypeId)) return null;
  if (typeof color !== 'string' || !colors.has(color)) return null;
  if (typeof x !== 'number' || !Number.isSafeInteger(x)) return null;
  if (typeof y !== 'number' || !Number.isSafeInteger(y)) return null;
  if (typeof z !== 'number' || !Number.isSafeInteger(z)) return null;
  if (!isRotation(rotation)) return null;
  return { id, type: type as BrickTypeId, color, x, y, z, rotation };
}

function cellKey(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function validateNormalized(bricks: readonly Brick[]): BuildValidation {
  const ids = new Set<string>();
  const boxes = bricks.map((brick) => ({ ...brick, ...dimensions(brick.type, brick.rotation) }));
  for (const box of boxes) {
    if (ids.has(box.id)) return fail('积木编号重复');
    ids.add(box.id);
    if (box.x < 0 || box.z < 0 || box.x + box.width > BOARD_SIZE || box.z + box.depth > BOARD_SIZE) return fail('超出底板范围');
    if (box.y < 0 || box.y + box.height > MAX_HEIGHT) return fail('超出可搭建高度');
  }
  for (let index = 0; index < boxes.length; index += 1) {
    const a = boxes[index];
    for (let other = index + 1; other < boxes.length; other += 1) {
      const b = boxes[other];
      if (a.x < b.x + b.width && b.x < a.x + a.width
        && a.z < b.z + b.depth && b.z < a.z + a.depth
        && a.y < b.y + b.height && b.y < a.y + a.height) return fail('积木位置重叠');
    }
  }
  // Positive brick heights make the support graph acyclic; only grounded rows publish connectors.
  const connected = new Set<string>();
  for (const box of [...boxes].sort((a, b) => a.y - b.y)) {
    let supported = box.y === 0;
    for (let x = box.x; !supported && x < box.x + box.width; x += 1) {
      for (let z = box.z; z < box.z + box.depth; z += 1) {
        if (connected.has(cellKey(x, box.y, z))) {
          supported = true;
          break;
        }
      }
    }
    if (!supported) return fail('积木需要下方支撑，不能留下悬空积木');
    for (const cell of connectorCells(box)) connected.add(cellKey(cell.x, cell.y, cell.z));
  }
  return { ok: true };
}

export function validateBuild(bricks: readonly Brick[]): BuildValidation {
  try {
    if (!Array.isArray(bricks) || bricks.length > MAX_BRICKS) return fail(`作品最多可包含 ${MAX_BRICKS} 块积木`);
    const normalized: Brick[] = [];
    for (const value of bricks) {
      const brick = readBrick(value);
      if (!brick) return fail('积木数据无效：请检查类型、颜色、编号、整数坐标和朝向');
      normalized.push(brick);
    }
    return validateNormalized(normalized);
  } catch {
    return fail('无法读取积木数据');
  }
}

export function canPlace(bricks: readonly Brick[], candidate: Brick, ignoreId?: string): BuildValidation {
  try {
    if (!Array.isArray(bricks)) return fail('积木数据无效');
    const retained: Brick[] = [];
    for (const value of bricks) {
      const brick = readBrick(value);
      if (!brick) return fail('积木数据无效');
      if (brick.id !== ignoreId) retained.push(brick);
    }
    return validateBuild([...retained, candidate]);
  } catch {
    return fail('无法读取积木数据');
  }
}

export function dropY(
  bricks: readonly Brick[],
  type: BrickTypeId,
  rotation: Rotation,
  x: number,
  z: number,
  minimumY = 0,
  ignoreId?: string,
): number | null {
  try {
    if (!Array.isArray(bricks) || bricks.length > MAX_BRICKS || !types.has(type) || !isRotation(rotation)
      || !Number.isSafeInteger(x) || !Number.isSafeInteger(z)
      || !Number.isSafeInteger(minimumY) || minimumY < 0 || minimumY > MAX_HEIGHT) return null;
    const candidates = new Set<number>([0]);
    const ids = new Set<string>();
    const normalized: Brick[] = [];
    for (const value of bricks) {
      const brick = readBrick(value);
      if (!brick) return null;
      normalized.push(brick);
      ids.add(brick.id);
      if (brick.id !== ignoreId) candidates.add(brick.y + getBrickType(brick.type).height);
    }
    let previewNumber = 0;
    let id = 'placement-preview-0';
    while (ids.has(id)) id = `placement-preview-${++previewNumber}`;
    for (const y of [...candidates].sort((a, b) => a - b)) {
      if (y < minimumY || y + getBrickType(type).height > MAX_HEIGHT) continue;
      if (canPlace(normalized, { id, type, rotation, color: 'red', x, y, z }, ignoreId).ok) return y;
    }
    return null;
  } catch {
    return null;
  }
}

export function validateDocument(value: unknown): DocumentValidation {
  try {
    const record = readRecord(value, documentKeys);
    if (!record) return { ok: false, error: '作品文件格式不正确' };
    if (record.version !== 1) return { ok: false, error: '不支持这个作品文件版本' };
    if (typeof record.name !== 'string' || !record.name.trim()
      || [...record.name].length > 80 || /[\u0000-\u001f\u007f]/.test(record.name)) return { ok: false, error: '作品名需要 1 至 80 个字符，且不能包含控制字符' };
    if (!Array.isArray(record.bricks) || record.bricks.length > MAX_BRICKS) return { ok: false, error: `作品需要有效的积木列表，最多 ${MAX_BRICKS} 块` };
    const bricks: Brick[] = [];
    for (const value of record.bricks) {
      const brick = readBrick(value);
      if (!brick) return { ok: false, error: '作品含有无效的积木类型、颜色、编号或坐标' };
      bricks.push(brick);
    }
    const result = validateNormalized(bricks);
    if (!result.ok) return { ok: false, error: result.reason ?? '作品结构不合法' };
    return { ok: true, document: { version: 1, name: record.name.trim(), bricks } };
  } catch {
    return { ok: false, error: '无法读取作品数据，原作品未改变' };
  }
}

export function serializeDocument(document: BuildDocument): string {
  const result = validateDocument(document);
  if (!result.ok) throw new Error(result.error);
  return JSON.stringify(result.document, null, 2);
}

let idSequence = 0;

export function makeId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  idSequence += 1;
  return `brick-${Date.now().toString(36)}-${idSequence.toString(36)}`;
}

export function createHistory<T>(value: T): History<T> {
  return { past: [], present: value, future: [] };
}

export function commitHistory<T>(history: History<T>, value: T): History<T> {
  if (Object.is(history.present, value)) return history;
  return { past: [...history.past.slice(-(HISTORY_LIMIT - 1)), history.present], present: value, future: [] };
}

export function undoHistory<T>(history: History<T>): History<T> {
  if (!history.past.length) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
  };
}

export function redoHistory<T>(history: History<T>): History<T> {
  if (!history.future.length) return history;
  return {
    past: [...history.past.slice(-(HISTORY_LIMIT - 1)), history.present],
    present: history.future[0],
    future: history.future.slice(1),
  };
}

function placementKey(brick: Brick): string {
  const type = getBrickType(brick.type);
  const rotation = type.shape === 'slope' ? brick.rotation : type.width === type.depth ? 0 : brick.rotation % 2;
  return `${brick.type}:${brick.x}:${brick.y}:${brick.z}:${rotation}`;
}

export function challengeProgress(bricks: readonly Brick[], challenge: Pick<Challenge, 'bricks'>) {
  const available = new Set(bricks.map(placementKey));
  const missing: Brick[] = [];
  let matched = 0;
  for (const target of challenge.bricks) {
    if (available.delete(placementKey(target))) matched += 1;
    else missing.push({ ...target });
  }
  return { matched, total: challenge.bricks.length, complete: matched === challenge.bricks.length, missing };
}

function recipe(prefix: string) {
  const bricks: Brick[] = [];
  const add = (type: BrickTypeId, color: string, x: number, y: number, z: number, rotation: Rotation = 0) => {
    bricks.push({ id: `${prefix}-${bricks.length + 1}`, type, color, x, y, z, rotation });
  };
  return { bricks, add };
}

function starterHouse(): Brick[] {
  const { bricks, add } = recipe('starter');
  for (const x of [9, 11, 13]) {
    for (const z of [8, 12]) add('plate-2x4', 'green', x, 0, z);
  }
  for (const y of [1, 4]) {
    for (const x of [9, 14]) {
      add('brick-1x4', y === 1 ? 'yellow' : 'white', x, y, 9);
      add('brick-1x2', y === 1 ? 'yellow' : 'teal', x, y, 13);
    }
    add('brick-1x4', y === 1 ? 'yellow' : 'white', 10, y, 14, 1);
  }
  add('brick-1x1', 'yellow', 10, 1, 9);
  add('brick-1x1', 'yellow', 13, 1, 9);
  add('arch-1x4', 'blue', 10, 4, 9, 1);
  for (const x of [9, 11, 13]) {
    for (const z of [8, 12]) add('plate-2x4', 'white', x, 7, z);
  }
  for (const z of [8, 10, 12, 14]) {
    add('slope-2x2', 'red', 9, 8, z, 1);
    add('brick-2x2', 'red', 11, 8, z);
    add('slope-2x2', 'red', 13, 8, z, 3);
  }
  add('cylinder-1x1', 'charcoal', 12, 11, 13);
  add('cylinder-1x1', 'coral', 12, 14, 13);
  add('plate-1x4', 'teal', 10, 0, 7, 1);
  return bricks;
}

function houseChallenge(): Brick[] {
  const { bricks, add } = recipe('house');
  for (const x of [10, 12]) add('plate-2x4', 'green', x, 0, 10);
  for (const x of [10, 13]) add('brick-1x4', 'yellow', x, 1, 10);
  add('brick-1x2', 'yellow', 11, 1, 13, 1);
  for (const x of [10, 13]) add('brick-1x3', 'white', x, 4, 11);
  add('brick-1x2', 'white', 11, 4, 13, 1);
  add('arch-1x4', 'blue', 10, 4, 10, 1);
  for (const x of [10, 12]) add('plate-2x4', 'white', x, 7, 10);
  for (const z of [10, 12]) {
    add('slope-2x2', 'red', 10, 8, z, 1);
    add('slope-2x2', 'red', 12, 8, z, 3);
  }
  return bricks;
}

function rocketChallenge(): Brick[] {
  const { bricks, add } = recipe('rocket');
  for (const x of [8, 12]) {
    for (const z of [11, 12]) add('plate-1x4', 'charcoal', x, 0, z, 1);
  }
  for (const y of [1, 4, 7]) add('brick-2x4', y === 4 ? 'blue' : 'white', 10, y, 11, 1);
  add('slope-1x2', 'blue', 9, 1, 11);
  add('slope-1x2', 'blue', 14, 1, 11, 2);
  add('slope-2x2', 'red', 10, 10, 11, 1);
  add('slope-2x2', 'red', 12, 10, 11, 3);
  return bricks;
}

function castleChallenge(): Brick[] {
  const { bricks, add } = recipe('castle');
  for (const x of [10, 12]) add('plate-2x4', 'green', x, 0, 10);
  for (const x of [10, 13]) {
    for (const z of [10, 13]) {
      add('brick-1x1', 'gray', x, 1, z);
      if (z === 13) add('brick-1x1', 'gray', x, 4, z);
      add('brick-1x1', 'white', x, 7, z);
      add('cylinder-1x1', 'blue', x, 10, z);
    }
    add('brick-1x2', 'gray', x, 1, 11);
  }
  add('brick-1x2', 'gray', 11, 1, 13, 1);
  add('arch-1x4', 'white', 10, 4, 10, 1);
  return bricks;
}

export const STARTER: BuildDocument = { version: 1, name: '起步作品', bricks: starterHouse() };

export const CHALLENGES: readonly Challenge[] = [
  { id: 'house', title: '彩顶小屋', bricks: houseChallenge() },
  { id: 'rocket', title: '启航火箭', bricks: rocketChallenge() },
  { id: 'castle', title: '迷你城堡', bricks: castleChallenge() },
];
