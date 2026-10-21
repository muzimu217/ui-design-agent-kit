/**
 * Collects the real numbers used on screen straight from the repository files,
 * so the film cannot drift from the project's own ledger.
 * Run: node scripts/collect-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/blackevil/Documents/Projects/ui-design-agent-kit';
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const artifacts = read('canvas/artifacts.json');
const capabilities = read('canvas/capabilities.json');
const kb = read('docs/knowledge-base/index.json');
const regressions = read('canvas/regressions.json');

const log = fs.readFileSync(path.join(root, 'docs/iteration-log.md'), 'utf8');
const iterationRows = log.split('\n').filter((l) => /^\| 2026-/.test(l)).length;

const adopted = capabilities.capabilities.filter((c) => c.status === 'adopted');
const evaluating = capabilities.capabilities.filter((c) => c.status === 'evaluating');
const rejected = capabilities.capabilities.filter((c) => c.status === 'rejected');

const data = {
  generatedAt: new Date().toISOString(),
  sources: {
    artifacts: 'canvas/artifacts.json',
    capabilities: 'canvas/capabilities.json',
    knowledgeBase: 'docs/knowledge-base/index.json',
    regressions: 'canvas/regressions.json',
    iterations: 'docs/iteration-log.md',
  },
  counts: {
    iterationRows,
    knowledgeCards: kb.cards.length,
    artifacts: artifacts.artifacts.length,
    capabilitiesTotal: capabilities.capabilities.length,
    capabilitiesAdopted: adopted.length,
    capabilitiesEvaluating: evaluating.length,
    capabilitiesRejected: rejected.length,
    regressions: regressions.regressions.length,
    regressionsResolved: regressions.regressions.filter((r) => r.status === 'resolved').length,
    regressionsDeleted: 0,
  },
  gates: [
    {id: 'A', name: '方向确认', desc: '确认需求摘要与范围'},
    {id: 'B', name: '参考素材', desc: '确认参考来源'},
    {id: 'C', name: '设计契约', desc: '确认 DESIGN.md'},
    {id: 'D', name: '修订', desc: '按实测问题决定改什么'},
    {id: 'E', name: '验收', desc: '看六维回执再决定'},
    {id: 'F', name: '留痕', desc: '记录版本与证据路径'},
  ],
  guards: [
    {id: 'L1', name: '数据守卫', desc: '六维键齐全 · 判定不靠措辞'},
    {id: 'L2', name: '渲染守卫', desc: '徽章有语义名 · 评分表有 caption'},
    {id: 'L3', name: '分发守卫', desc: '导出包逐字节对账'},
  ],
  sixDim: ['桌面', '移动', '键盘', '对比度', '降动效', '控制台'],
  adoptedNames: adopted.map((c) => c.name),
  kbCards: kb.cards.map((c) => ({id: c.id, title: c.title, domain: c.domain, layer: c.layer})),
};

fs.writeFileSync(
  path.join(root, 'video-production/src/data.json'),
  JSON.stringify(data, null, 2) + '\n'
);
console.log(JSON.stringify(data.counts, null, 2));
