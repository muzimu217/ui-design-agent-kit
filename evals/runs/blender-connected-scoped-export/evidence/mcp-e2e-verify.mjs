// blender-connected-scoped-export：MCP 真实调用端到端（纯 node JSON-RPC stdio，非虚构）
// 断言：initialize 握手/tools list 5 工具/只读 summary/scoped 添加/save_blend_copy 新文件/export_glb
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = path.join(DIR, "..", "mcp-server.mjs");
const child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "pipe"] });

let buf = "";
const pending = new Map();
let nextId = 1;
child.stdout.on("data", (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    } catch { /* 忽略非 JSON 行 */ }
  }
});

const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`); };

const call = (method, params) => new Promise((resolve, reject) => {
  const id = nextId++;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error("timeout")); }, 8000);
  pending.set(id, (msg) => {
    clearTimeout(timer);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
});

try {
  // initialize 握手
  const init = await call("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "eval-client", version: "0.1.0" } });
  check("MCP initialize 握手", init.serverInfo?.name === "blender-mcp-mini", init.serverInfo?.name);

  // tools/list：5 工具 schema 可检视
  const tools = await call("tools/list", {});
  check("tools/list 返回 5 工具（可检视 schema）", (tools.tools?.length || 0) === 5, `tools=${tools.tools?.length}`);

  // 只读 scene_summary
  const summary = await call("tools/call", { name: "scene_summary", arguments: {} });
  check("只读 scene_summary", (summary.content?.[0]?.text || "").includes("OriginalChairCollection"));

  // scoped 添加（仅新集合）
  const added = await call("tools/call", { name: "add_chair_variation", arguments: { collection: "ChairVariations", variant: "approved-chair" } });
  check("scoped 添加（新集合）", (added.content?.[0]?.text || "").includes("scoped"));

  // save_blend_copy 新文件
  const copyPath = path.join(DIR, "approved-chair.blend.copy");
  await call("tools/call", { name: "save_blend_copy", arguments: { path: copyPath } });
  check("save_blend_copy 落盘", fs.existsSync(copyPath));

  // export_glb
  const glbPath = path.join(DIR, "approved-chair.glb");
  await call("tools/call", { name: "export_glb", arguments: { path: glbPath } });
  check("export_glb 落盘", fs.existsSync(glbPath));
} catch (e) {
  check("MCP 端到端流程", false, String(e).slice(0, 120));
}
child.kill();
const fails = results.filter((r) => !r).length;
console.log(`\n== ${results.length - fails}/${results.length} PASS ==`);
process.exit(fails === 0 ? 0 : 1);
