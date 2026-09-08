import { describe, expect, it } from 'vitest';
import {
  BOARD_SIZE,
  BRICK_TYPES,
  CHALLENGES,
  COLORS,
  LAYER_HEIGHT,
  MAX_BRICKS,
  MAX_HEIGHT,
  STARTER,
  canPlace,
  challengeProgress,
  commitHistory,
  connectorCells,
  createHistory,
  dimensions,
  dropY,
  getBrickType,
  makeId,
  redoHistory,
  serializeDocument,
  undoHistory,
  validateBuild,
  validateDocument,
  type Brick,
  type BrickTypeId,
  type BuildDocument,
  type Rotation,
} from '../src/domain';

const rotations: Rotation[] = [0, 1, 2, 3];

function brick(overrides: Partial<Brick> = {}): Brick {
  return { id: 'test-brick', type: 'brick-1x1', color: 'red', x: 0, y: 0, z: 0, rotation: 0, ...overrides };
}

function document(bricks: Brick[] = [brick()]): BuildDocument {
  return { version: 1, name: '测试作品', bricks };
}

function grid(count: number): Brick[] {
  return Array.from({ length: count }, (_, index) => brick({ id: `grid-${index}`, x: index % BOARD_SIZE, z: Math.floor(index / BOARD_SIZE) }));
}

describe('catalog and dimensions', () => {
  it('exposes the approved board, scale, catalog and independent palette', () => {
    expect(BOARD_SIZE).toBe(24);
    expect(MAX_HEIGHT).toBe(36);
    expect(MAX_BRICKS).toBe(400);
    expect(LAYER_HEIGHT).toBe(0.32);
    expect(BRICK_TYPES).toHaveLength(12);
    expect(COLORS).toHaveLength(12);
    expect(new Set(BRICK_TYPES.map((type) => type.id)).size).toBe(12);
    expect(new Set(COLORS.map((color) => color.id)).size).toBe(12);
    expect(COLORS.every((color) => /^#[0-9A-F]{6}$/.test(color.hex))).toBe(true);
  });

  for (const type of BRICK_TYPES) {
    for (const rotation of rotations) {
      it(`${type.id}, rotation ${rotation}: dimensions, ground, board edge and connectors agree`, () => {
        const size = dimensions(type.id, rotation);
        expect(size).toEqual({
          width: rotation % 2 ? type.depth : type.width,
          depth: rotation % 2 ? type.width : type.depth,
          height: type.shape === 'plate' ? 1 : 3,
        });
        const edge = brick({ type: type.id, rotation, x: BOARD_SIZE - size.width, z: BOARD_SIZE - size.depth });
        expect(validateBuild([brick({ type: type.id, rotation })]).ok).toBe(true);
        expect(validateBuild([edge]).ok).toBe(true);
        expect(validateBuild([{ ...edge, x: edge.x + 1 }]).ok).toBe(false);
        expect(validateBuild([{ ...edge, z: edge.z + 1 }]).ok).toBe(false);
        expect(validateBuild([{ ...edge, x: -1 }]).ok).toBe(false);
        expect(validateBuild([{ ...edge, z: -1 }]).ok).toBe(false);
        const cells = connectorCells(edge);
        expect(cells).toHaveLength(type.shape === 'slope' ? type.width : type.width * type.depth);
        expect(new Set(cells.map((cell) => `${cell.x}:${cell.y}:${cell.z}`)).size).toBe(cells.length);
        expect(cells.every((cell) => cell.y === size.height
          && cell.x >= edge.x && cell.x < edge.x + size.width
          && cell.z >= edge.z && cell.z < edge.z + size.depth)).toBe(true);
      });
    }
  }

  it('rejects unknown types and fractional rotations in geometry helpers', () => {
    expect(() => getBrickType('unknown' as BrickTypeId)).toThrow();
    expect(() => dimensions('brick-1x2', 0.5 as Rotation)).toThrow();
    expect(() => connectorCells(brick({ rotation: 4 as Rotation }))).toThrow();
  });
});

describe('deterministic occupancy and support', () => {
  it('accepts an empty scene and face contact, but rejects intersecting prisms', () => {
    const base = brick();
    expect(validateBuild([])).toEqual({ ok: true });
    expect(validateBuild([base, brick({ id: 'beside', x: 1 })]).ok).toBe(true);
    expect(validateBuild([base, brick({ id: 'above', y: 3 })]).ok).toBe(true);
    expect(validateBuild([base, brick({ id: 'inside' })])).toMatchObject({ ok: false, reason: '积木位置重叠' });
    expect(validateBuild([base, brick({ id: 'partly-inside', y: 2 })]).ok).toBe(false);
  });

  it('reserves the whole slope prism and visual arch opening', () => {
    for (const type of ['slope-1x2', 'arch-1x4'] as const) {
      expect(validateBuild([brick({ type }), brick({ id: 'inside', z: 1 })])).toMatchObject({ ok: false, reason: '积木位置重叠' });
    }
  });

  it('accepts a single-stud cantilever with a complete support chain, regardless of input order', () => {
    const build = [brick(), brick({ id: 'bridge', type: 'brick-1x4', y: 3, rotation: 1 }), brick({ id: 'tip', x: 3, y: 6 })];
    expect(validateBuild(build).ok).toBe(true);
    expect(validateBuild([...build].reverse()).ok).toBe(true);
    expect(validateBuild(build.slice(1)).ok).toBe(false);
    expect(validateBuild([brick({ y: 3 }), brick({ id: 'top', y: 6 })]).ok).toBe(false);
  });

  it('allows a second support to keep a bridge valid after removal', () => {
    const left = brick();
    const right = brick({ id: 'right', x: 3 });
    const bridge = brick({ id: 'bridge', type: 'brick-1x4', y: 3, rotation: 1 });
    expect(validateBuild([left, right, bridge]).ok).toBe(true);
    expect(validateBuild([right, bridge]).ok).toBe(true);
  });

  it('uses plate units and permits a top exactly at the height limit', () => {
    const stack = Array.from({ length: 12 }, (_, index) => brick({ id: `level-${index}`, y: index * 3 }));
    expect(validateBuild(stack).ok).toBe(true);
    expect(validateBuild([...stack, brick({ id: 'too-high', y: 36 })])).toMatchObject({ ok: false, reason: '超出可搭建高度' });
    expect(validateBuild([brick({ y: -1 })]).ok).toBe(false);
    const plates = Array.from({ length: 36 }, (_, index) => brick({ id: `plate-${index}`, type: 'plate-1x4', y: index }));
    expect(validateBuild(plates).ok).toBe(true);
    expect(validateBuild([...plates, brick({ id: 'too-high-plate', type: 'plate-1x4', y: 36 })]).ok).toBe(false);
  });

  const expectedSlopeCells = [
    [{ x: 5, y: 3, z: 7 }, { x: 6, y: 3, z: 7 }],
    [{ x: 6, y: 3, z: 7 }, { x: 6, y: 3, z: 6 }],
    [{ x: 6, y: 3, z: 6 }, { x: 5, y: 3, z: 6 }],
    [{ x: 5, y: 3, z: 6 }, { x: 5, y: 3, z: 7 }],
  ];

  for (const rotation of rotations) {
    it(`slope high-row connectors rotate with the model at rotation ${rotation}`, () => {
      const slope = brick({ type: 'slope-2x2', x: 5, z: 6, rotation });
      expect(connectorCells(slope)).toEqual(expectedSlopeCells[rotation]);
      const high = expectedSlopeCells[rotation][0];
      const low = rotation === 0 ? { x: 5, z: 6 }
        : rotation === 1 ? { x: 5, z: 6 }
          : rotation === 2 ? { x: 5, z: 7 } : { x: 6, z: 6 };
      expect(canPlace([slope], brick({ id: 'high', ...high })).ok).toBe(true);
      expect(canPlace([slope], brick({ id: 'low', ...low, y: 3 })).ok).toBe(false);
    });
  }

  it('ignores the moved source only for candidate collision, and still rejects orphaning', () => {
    const base = brick();
    const upper = brick({ id: 'upper', y: 3 });
    const build = [base, upper];
    const before = JSON.stringify(build);
    expect(canPlace(build, { ...base }, base.id).ok).toBe(true);
    expect(canPlace(build, { ...base, x: 2 }, base.id).ok).toBe(false);
    expect(canPlace(build, { ...upper, x: 1 }, upper.id).ok).toBe(false);
    expect(canPlace([base], { ...base, x: 2 }, base.id).ok).toBe(true);
    expect(canPlace([base], { ...base, x: 2 }).ok).toBe(false);
    expect(JSON.stringify(build)).toBe(before);
  });

  it('returns a rejection rather than throwing on corrupted scene data', () => {
    expect(canPlace([null] as unknown as Brick[], brick()).ok).toBe(false);
    expect(canPlace(null as unknown as Brick[], brick()).ok).toBe(false);
    expect(validateBuild([null] as unknown as Brick[]).ok).toBe(false);
  });

  it('validates duplicate IDs and the exact maximum brick count', () => {
    expect(validateBuild([brick(), brick({ x: 1 })])).toMatchObject({ ok: false, reason: '积木编号重复' });
    expect(validateBuild(grid(MAX_BRICKS)).ok).toBe(true);
    expect(validateBuild(grid(MAX_BRICKS + 1)).ok).toBe(false);
    const full = grid(MAX_BRICKS);
    expect(canPlace(full, { ...full[0], color: 'blue' }, full[0].id).ok).toBe(true);
    expect(canPlace(full, brick({ id: 'overflow', x: 23, z: 23 })).ok).toBe(false);
  });
});

describe('lowest legal drop position', () => {
  it('finds ground, upper surfaces and minimum-height constraints', () => {
    expect(dropY([], 'brick-1x1', 0, 0, 0)).toBe(0);
    expect(dropY([], 'brick-1x1', 0, 0, 0, 1)).toBeNull();
    expect(dropY([brick()], 'brick-1x1', 0, 0, 0)).toBe(3);
    const stack = [brick(), brick({ id: 'upper', y: 3 })];
    expect(dropY(stack, 'brick-1x1', 0, 0, 0)).toBe(6);
    expect(dropY(stack, 'brick-1x1', 0, 0, 0, 7)).toBeNull();
  });

  it('chooses the lowest fit beneath a cantilever when one exists', () => {
    const build = [brick(), brick({ id: 'bridge', type: 'brick-1x4', y: 3, rotation: 1 })];
    expect(dropY(build, 'brick-1x1', 0, 2, 0)).toBe(0);
    expect(dropY(build, 'brick-1x1', 0, 2, 0, 1)).toBe(6);
  });

  it('uses slope connectors rather than the entire apparent top surface', () => {
    const slope = brick({ type: 'slope-2x2' });
    expect(dropY([slope], 'brick-1x1', 0, 0, 0)).toBeNull();
    expect(dropY([slope], 'brick-1x1', 0, 0, 1)).toBe(3);
  });

  it('rechecks dependent bricks when moving a support', () => {
    const build = [brick(), brick({ id: 'upper', y: 3 })];
    expect(dropY(build, 'brick-1x1', 0, 0, 0, 0, 'test-brick')).toBe(0);
    expect(dropY(build, 'brick-1x1', 0, 3, 0, 0, 'test-brick')).toBeNull();
  });

  it('rejects out-of-bounds positions and malformed inputs', () => {
    expect(dropY([], 'brick-2x4', 0, 23, 23)).toBeNull();
    expect(dropY([], 'brick-1x1', 0, -1, 0)).toBeNull();
    expect(dropY([], 'brick-1x1', 0, Number.NaN, 0)).toBeNull();
    expect(dropY([], 'brick-1x1', 0, 0.5, 0)).toBeNull();
    expect(dropY([], 'brick-1x1', 0, 0, 0, -1)).toBeNull();
    expect(dropY([], 'brick-1x1', 0, 0, 0, 37)).toBeNull();
    expect(dropY([], 'unknown' as BrickTypeId, 0, 0, 0)).toBeNull();
    expect(dropY([], 'brick-1x1', 4 as Rotation, 0, 0)).toBeNull();
    expect(dropY([null] as unknown as Brick[], 'brick-1x1', 0, 0, 0)).toBeNull();
    expect(dropY(null as unknown as Brick[], 'brick-1x1', 0, 0, 0)).toBeNull();
  });

  it('does not collide with an imported preview-like ID', () => {
    const build = [brick({ id: 'placement-preview-0' }), brick({ id: 'placement-preview-1', x: 1 })];
    expect(dropY(build, 'brick-1x1', 0, 3, 0)).toBe(0);
  });
});

describe('document validation and serialization', () => {
  it('round-trips approved starter data and returns detached data', () => {
    const source = JSON.parse(serializeDocument(STARTER)) as unknown;
    const result = validateDocument(source);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.document).toEqual(STARTER);
    expect(result.document).not.toBe(source);
    const input = document();
    const detached = validateDocument(input);
    if (!detached.ok) throw new Error(detached.error);
    expect(detached.document.bricks).not.toBe(input.bricks);
    expect(detached.document.bricks[0]).not.toBe(input.bricks[0]);
    detached.document.bricks[0].color = 'blue';
    expect(input.bricks[0].color).toBe('red');
  });

  it('accepts empty works and Chinese names up to 80 code points', () => {
    expect(validateDocument(document([])).ok).toBe(true);
    expect(validateDocument({ ...document(), name: '木'.repeat(80) }).ok).toBe(true);
    const result = validateDocument({ ...document(), name: '  我的作品  ' });
    expect(result).toMatchObject({ ok: true, document: { name: '我的作品' } });
  });

  for (const value of [null, undefined, [], true, 1, 'data']) {
    it(`rejects a non-document root: ${String(value)}`, () => {
      expect(validateDocument(value).ok).toBe(false);
    });
  }

  it('rejects unknown versions, missing fields and extra or hostile fields', () => {
    for (const value of [
      { ...document(), version: 2 },
      { ...document(), version: '1' },
      { name: '名字', bricks: [] },
      { ...document(), extra: true },
      { ...document(), bricks: {} },
      JSON.parse('{"version":1,"name":"作品","bricks":[],"__proto__":{"polluted":true}}'),
      Object.assign(Object.create({ inherited: true }) as object, document()),
    ]) expect(validateDocument(value).ok).toBe(false);
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('rejects empty, overlong and control-character names', () => {
    for (const name of ['', '   ', '木'.repeat(81), '不\n可以', '不\u0000可以', '不\u007f可以']) {
      expect(validateDocument({ ...document(), name }).ok).toBe(false);
    }
  });

  const invalidBrickFields: [string, unknown][] = [
    ['id', ''], ['id', 'has spaces'], ['id', '<script>'], ['id', 'x'.repeat(97)], ['id', 1],
    ['type', 'unknown'], ['type', '__proto__'], ['color', 'unknown'], ['color', '#E95048'],
    ['x', Number.NaN], ['x', Number.POSITIVE_INFINITY], ['x', 0.1], ['x', '0'],
    ['x', Number.MAX_SAFE_INTEGER + 1], ['y', -1], ['y', Number.NaN], ['y', 0.5],
    ['z', Number.NEGATIVE_INFINITY], ['z', 0.2], ['rotation', -1], ['rotation', 4],
    ['rotation', 1.5], ['rotation', '1'], ['rotation', Number.NaN],
  ];

  for (const [field, value] of invalidBrickFields) {
    it(`rejects invalid ${field}: ${String(value)}`, () => {
      const candidate = { ...brick(), [field]: value };
      expect(validateDocument({ ...document(), bricks: [candidate] }).ok).toBe(false);
      expect(validateBuild([candidate as Brick]).ok).toBe(false);
    });
  }

  it('rejects sparse lists, missing brick fields, extra brick fields and excessive counts', () => {
    expect(validateDocument({ ...document(), bricks: new Array(1) }).ok).toBe(false);
    expect(validateDocument({ ...document(), bricks: [null] }).ok).toBe(false);
    expect(validateDocument({ ...document(), bricks: [{ id: 'partial' }] }).ok).toBe(false);
    expect(validateDocument({ ...document(), bricks: [{ ...brick(), extra: 'untrusted' }] }).ok).toBe(false);
    expect(validateDocument(document(grid(MAX_BRICKS))).ok).toBe(true);
    expect(validateDocument(document(grid(MAX_BRICKS + 1))).ok).toBe(false);
  });

  it('rejects duplicate IDs, overlaps, outside bounds and unsupported imports atomically', () => {
    for (const build of [
      [brick(), brick({ x: 1 })],
      [brick(), brick({ id: 'duplicate-place' })],
      [brick({ x: 24 })],
      [brick({ y: 3 })],
    ]) {
      const input = document(build);
      const before = JSON.stringify(input);
      expect(validateDocument(input).ok).toBe(false);
      expect(JSON.stringify(input)).toBe(before);
    }
  });

  it('never evaluates an accessor and safely rejects throwing object traps', () => {
    let calls = 0;
    const hostile = { version: 1, name: '作品', get bricks() { calls += 1; throw new Error('must not run'); } };
    expect(validateDocument(hostile).ok).toBe(false);
    expect(calls).toBe(0);
    const proxy = new Proxy({}, { getPrototypeOf() { throw new Error('blocked'); } });
    expect(validateDocument(proxy).ok).toBe(false);
  });

  it('throws on invalid serialization instead of exporting a misleading file', () => {
    expect(() => serializeDocument(document([brick({ y: 3 })]))).toThrow();
    expect(() => serializeDocument({ ...document(), version: 2 } as unknown as BuildDocument)).toThrow();
  });

  it('generates unique valid IDs', () => {
    const ids = Array.from({ length: 100 }, makeId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => validateBuild([brick({ id })]).ok)).toBe(true);
  });
});

describe('starter and challenge recipes', () => {
  it('starts with a centered, colorful, fully supported editable house', () => {
    expect(STARTER.bricks.length).toBeGreaterThanOrEqual(25);
    expect(STARTER.bricks.length).toBeLessThanOrEqual(50);
    expect(new Set(STARTER.bricks.map((item) => item.color)).size).toBeGreaterThanOrEqual(5);
    expect(validateBuild(STARTER.bricks)).toEqual({ ok: true });
    expect(validateDocument(STARTER).ok).toBe(true);
    expect(STARTER.bricks.every((item) => item.x >= 7 && item.x <= 16 && item.z >= 7 && item.z <= 16)).toBe(true);
  });

  it('provides exactly three structurally valid, nonempty independent challenges', () => {
    expect(CHALLENGES.map((challenge) => challenge.id)).toEqual(['house', 'rocket', 'castle']);
    for (const challenge of CHALLENGES) {
      expect(challenge.bricks.length).toBeGreaterThan(5);
      expect(challenge.bricks.length).toBeLessThanOrEqual(30);
      expect(validateBuild(challenge.bricks)).toEqual({ ok: true });
      expect(validateBuild([...challenge.bricks].reverse()).ok).toBe(true);
      expect(challengeProgress(challenge.bricks, challenge)).toEqual({ matched: challenge.bricks.length, total: challenge.bricks.length, complete: true, missing: [] });
      expect(challengeProgress([], challenge)).toMatchObject({ matched: 0, complete: false });
    }
    expect(CHALLENGES[0].bricks).not.toBe(CHALLENGES[1].bricks);
    expect(CHALLENGES[0].bricks).not.toBe(STARTER.bricks);
  });

  it('ignores color and ID and allows extras, but requires exact type and pose', () => {
    const target = { bricks: [brick({ type: 'brick-1x2', x: 2, z: 2 })] };
    const recolored = brick({ id: 'new', type: 'brick-1x2', color: 'blue', x: 2, z: 2 });
    expect(challengeProgress([recolored, brick({ id: 'extra', x: 12 })], target).complete).toBe(true);
    for (const item of [
      { ...recolored, x: 3 }, { ...recolored, z: 3 }, { ...recolored, y: 3 },
      { ...recolored, type: 'brick-1x3' as const }, { ...recolored, rotation: 1 as const },
    ]) expect(challengeProgress([item], target).matched).toBe(0);
  });

  it('matches symmetric rotations without treating directional slopes as symmetric', () => {
    for (const type of BRICK_TYPES) {
      const target = { bricks: [brick({ type: type.id })] };
      for (const rotation of rotations) {
        const expected = type.shape === 'slope' ? rotation === 0 : type.width === type.depth || rotation % 2 === 0;
        expect(challengeProgress([brick({ type: type.id, rotation })], target).complete).toBe(expected);
      }
    }
  });

  it('does not let duplicate placements inflate progress and returns detached missing bricks', () => {
    const first = brick();
    const second = brick({ id: 'second', x: 1 });
    const target = { bricks: [first, second] };
    const result = challengeProgress([first, { ...first, id: 'duplicate' }], target);
    expect(result).toMatchObject({ matched: 1, total: 2, complete: false });
    expect(result.missing).toEqual([second]);
    expect(result.missing[0]).not.toBe(second);
    expect(challengeProgress([first, { ...first, id: 'duplicate' }], { bricks: [first, { ...first, id: 'target-duplicate' }] }).matched).toBe(1);
  });
});

describe('immutable bounded history', () => {
  it('commits, undoes and redoes without mutating prior histories', () => {
    const initial = createHistory(0);
    const one = commitHistory(initial, 1);
    const two = commitHistory(one, 2);
    const undone = undoHistory(two);
    expect(initial).toEqual({ past: [], present: 0, future: [] });
    expect(one).toEqual({ past: [0], present: 1, future: [] });
    expect(two).toEqual({ past: [0, 1], present: 2, future: [] });
    expect(undone).toEqual({ past: [0], present: 1, future: [2] });
    expect(redoHistory(undone)).toEqual(two);
  });

  it('keeps identity on no-op boundary actions and clears redo after a branch edit', () => {
    const initial = createHistory('a');
    expect(undoHistory(initial)).toBe(initial);
    expect(redoHistory(initial)).toBe(initial);
    expect(commitHistory(initial, 'a')).toBe(initial);
    const undone = undoHistory(commitHistory(commitHistory(initial, 'b'), 'c'));
    const branch = commitHistory(undone, 'new');
    expect(branch).toEqual({ past: ['a', 'b'], present: 'new', future: [] });
    expect(undone.future).toEqual(['c']);
    expect(redoHistory(branch)).toBe(branch);
  });

  it('retains at most 100 undo steps and their redo states', () => {
    let history = createHistory(0);
    for (let value = 1; value <= 105; value += 1) history = commitHistory(history, value);
    expect(history.present).toBe(105);
    expect(history.past).toHaveLength(100);
    expect(history.past[0]).toBe(5);
    for (let index = 0; index < 100; index += 1) history = undoHistory(history);
    expect(history.present).toBe(5);
    expect(history.past).toEqual([]);
    expect(history.future).toHaveLength(100);
    for (let index = 0; index < 100; index += 1) history = redoHistory(history);
    expect(history.present).toBe(105);
    expect(history.future).toEqual([]);
  });

  it('keeps mode histories and draft snapshots independent', () => {
    const free = createHistory(document([]));
    const house = createHistory(document(CHALLENGES[0].bricks.map((item) => ({ ...item }))));
    const changedFree = commitHistory(free, document([brick()]));
    expect(house.past).toEqual([]);
    expect(house.present.bricks).toHaveLength(CHALLENGES[0].bricks.length);
    expect(undoHistory(changedFree).present.bricks).toEqual([]);
    expect(free.present.bricks).toEqual([]);
    expect(house.present.bricks).not.toBe(CHALLENGES[0].bricks);
  });
});
