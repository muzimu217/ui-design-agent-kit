import { describe, expect, it } from 'vitest';
import { commitHistory, makeId } from '../src/domain';
import { MODES, cloneDocument, documentsFrom, encodeWorkspace, exportFilename, freshWorkspace, historiesFrom, parseImport, restoreWorkspace } from '../src/app-state';

describe('workspace storage', () => {
  it('starts with a separate free draft and three empty challenges', () => {
    const workspace = freshWorkspace();
    expect(workspace.documents.free.bricks.length).toBeGreaterThan(0);
    expect(workspace.documents.house.bricks).toEqual([]);
    expect(workspace.documents.rocket.bricks).toEqual([]);
    expect(workspace.documents.castle.bricks).toEqual([]);
  });
  it('round-trips all four valid drafts and saved works', () => {
    const workspace = freshWorkspace();
    workspace.saved = [{ id: makeId(), mode: 'free', savedAt: new Date().toISOString(), document: cloneDocument(workspace.documents.free) }];
    const restored = restoreWorkspace(() => encodeWorkspace(workspace));
    expect(restored.restored).toBe(true);
    expect(restored.workspace).toEqual(workspace);
    expect(restored.protected).toBe(false);
  });
  it('protects malformed and unsupported saved data without writing it', () => {
    for (const raw of ['{', JSON.stringify({ version: 99 }), JSON.stringify({ ...freshWorkspace(), documents: {} })]) {
      const result = restoreWorkspace(() => raw);
      expect(result.protected).toBe(true);
      expect(result.raw).toBe(raw);
      expect(result.error).toContain('原存档未改写');
    }
  });
  it('retains a recoverable in-memory draft when storage access throws', () => {
    const result = restoreWorkspace(() => { throw new Error('Access denied'); });
    expect(result.error).toContain('Access denied');
    expect(result.workspace.documents.free.bricks.length).toBeGreaterThan(0);
  });
  it('rejects one malformed saved-work document atomically', () => {
    const workspace = freshWorkspace();
    const value = { ...workspace, saved: [{ id: 'bad', mode: 'free', savedAt: new Date().toISOString(), document: { ...workspace.documents.free, version: 2 } }] };
    const restored = restoreWorkspace(() => JSON.stringify(value));
    expect(restored.restored).toBe(false);
    expect(restored.protected).toBe(true);
    expect(restored.workspace.saved).toEqual([]);
  });
  it('isolates histories and documents between game modes', () => {
    const workspace = freshWorkspace();
    const histories = historiesFrom(workspace.documents);
    const next = { ...histories, house: commitHistory(histories.house, { ...histories.house.present, name: '新版小屋' }) };
    expect(documentsFrom(next).house.name).toBe('新版小屋');
    for (const mode of MODES.filter((mode) => mode !== 'house')) expect(next[mode]).toBe(histories[mode]);
    expect(next.free.past).toEqual([]);
  });
});

describe('file boundaries', () => {
  it('imports valid versioned documents without changing the source object', () => {
    const original = freshWorkspace().documents.free;
    const parsed = parseImport(JSON.stringify(original));
    expect(parsed).toEqual(original);
    expect(parsed.bricks).not.toBe(original.bricks);
  });
  it('rejects invalid JSON, unknown versions and large files', () => {
    expect(() => parseImport('not json')).toThrow('有效的 JSON');
    expect(() => parseImport(JSON.stringify({ version: 2, name: '作品', bricks: [] }))).toThrow('版本');
    expect(() => parseImport(' '.repeat(2 * 1024 * 1024 + 1))).toThrow('2 MB');
  });
  it('builds usable filenames without path separators', () => {
    expect(exportFilename('我的/作品:*?', 'png')).toBe('我的-作品---.png');
    expect(exportFilename('', 'json')).toBe('积木作品.json');
  });
});
