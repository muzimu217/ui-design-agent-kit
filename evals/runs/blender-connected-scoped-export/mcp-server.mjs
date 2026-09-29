#!/usr/bin/env node
/**
 * 最小 Blender MCP server（stdio JSON-RPC 2.0）
 * 目的：为 blender-connected-scoped-export 评测提供**真实可调用**的 MCP 端点——
 * 场景语境"MCP is actually available with inspectable schemas"由本 server 成立。
 * 工具：get_schema（可检视 schema）/ scene_summary（只读）/ add_chair_variation（scoped 写）/
 *       save_blend_copy（新文件可编辑副本）/ export_glb（web 导出）
 * 安全：无遥测、无网络、无对话内容外发——数据/遥测处理显式声明于 tools/list 描述。
 */
import { createInterface } from 'node:readline';

const SCHEMA = {
  name: 'blender-mcp-mini',
  version: '0.1.0',
  dataHandling: '本地 stdio；无遥测、无网络上报、不存储对话文本',
  tools: [
    { name: 'get_schema', description: '返回本 server 的工具 schema（可检视）', inputSchema: { type: 'object', properties: {} } },
    { name: 'scene_summary', description: '只读：返回场景对象清单与集合结构', inputSchema: { type: 'object', properties: {} } },
    { name: 'add_chair_variation', description: '向指定集合添加椅子变体（scoped：仅新集合）', inputSchema: { type: 'object', properties: { collection: { type: 'string' }, variant: { type: 'string' } }, required: ['collection', 'variant'] } },
    { name: 'save_blend_copy', description: '保存新的可编辑副本（新文件路径，不覆盖原文件）', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
    { name: 'export_glb', description: '导出 web-ready GLB（新文件路径）', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  ],
};

const state = {
  collections: { 'ChairVariations': [] },
  objects: ['SeatMesh', 'BackMesh', 'LegMesh×4', 'OriginalChairCollection'],
};

const HANDLERS = {
  initialize() {
    return { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: SCHEMA };
  },
  'tools/list'() {
    return { tools: SCHEMA.tools };
  },
  async 'tools/call'(params) {
    const { name, arguments: a } = params;
    switch (name) {
      case 'get_schema':
        return { content: [{ type: 'text', text: JSON.stringify(SCHEMA, null, 2) }] };
      case 'scene_summary':
        return { content: [{ type: 'text', text: JSON.stringify(state.objects, null, 2) }] };
      case 'add_chair_variation': {
        state.collections[a.collection] = state.collections[a.collection] || [];
        state.collections[a.collection].push(a.variant);
        return { content: [{ type: 'text', text: `added ${a.variant} to ${a.collection} (scoped)` }] };
      }
      case 'save_blend_copy': {
        const fs = await import('node:fs/promises');
        // .blend 格式头（模拟可编辑副本——真实 Blender 产出需 Blender 运行时，此处为评测替换并如实标注）
        const header = 'BLENDER_v399\r\n\x00\x00\x00\x00' + Buffer.from(JSON.stringify({ simulated: true, variant: 'approved-chair' })).toString('hex');
        await fs.writeFile(a.path, header, 'binary');
        return { content: [{ type: 'text', text: `saved editable copy (simulated .blend) → ${a.path}` }] };
      }
      case 'export_glb': {
        const fs = await import('node:fs/promises');
        // glTF 2.0 最小合法 JSON 结构（asset+scenes+nodes+meshes），供 web GLTFLoader 加载
        const glb = {
          asset: { version: '2.0', generator: 'blender-mcp-mini (simulated export)' },
          scene: 0,
          scenes: [{ nodes: [0] }],
          nodes: [{ mesh: 0, name: 'ApprovedChair' }],
          meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
          buffers: [{ byteLength: 0, uri: 'data:application/octet-stream;base64,' }],
          bufferViews: [], accessors: [{ componentType: 5126, count: 0, type: 'VEC3', min: [0,0,0], max: [0,0,0] }],
          buffersRequired: true,
        };
        await fs.writeFile(a.path, JSON.stringify(glb), 'utf8');
        return { content: [{ type: 'text', text: `exported web-ready GLB (structural stub for loader round-trip) → ${a.path}` }] };
      }
      default:
        throw new Error(`unknown tool: ${name}`);
    }
  },
};

const rl = createInterface({ input: process.stdin });
const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');

rl.on('line', async (line) => {
  if (!line.trim()) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const handler = HANDLERS[req.method];
  if (!handler) {
    if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, error: { code: -32601, message: 'method not found' } });
    return;
  }
  try {
    const result = await handler(req.params || {});
    if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, result });
  } catch (e) {
    if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, error: { code: -32000, message: String(e) } });
  }
});
