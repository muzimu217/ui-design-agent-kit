import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./verify.mjs";

// 原型交接协议（prototype-handover.md）第三道轻门：规格门。
// 校验方向=单向：契约里缺失 mock 中实际存在的字段，算断点。
// （反向——契约提到 mock 不存在的字段——不检查：契约写"计划中的接口"
// 属合法前瞻，静默比对会误报；如需反向审计走人工。）
// 纯静态比对，零依赖；advisory 工具，交接前必跑。
//
// Usage:
//   npm run lint:spec -- --dir <prototype-dir>
//     （目录内须有 mock_data.json 与 API_CONTRACT.md）
//   node scripts/spec-lint.mjs --self-test        纯函数自检（无副作用）

export function flattenMock(data, prefix = "") {
  // 把 mock_data.json 摊平成"字段路径集合"：对象递归取键，数组取首元素代表项。
  const paths = new Set();
  if (Array.isArray(data)) {
    if (prefix) paths.add(prefix);
    for (const item of data.slice(0, 1)) {
      for (const sub of flattenMock(item, prefix)) paths.add(sub);
    }
    return paths;
  }
  if (data !== null && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("_")) continue; // 下划线前缀=元数据注记（如 _schema），非业务字段
      const full = prefix ? `${prefix}.${key}` : key;
      paths.add(full);
      for (const sub of flattenMock(value, full)) paths.add(sub);
    }
  }
  return paths;
}

export function checkContract(mockPaths, contractText) {
  // 契约按协议是实体作用域写法（"用户列表：id, name, avatar"）：
  // 全点路径或叶子名任一出现即算登记（宽松匹配，advisory 定位）；
  // 报的是"整字段在契约里完全没踪影"的真断点。
  const problems = [];
  for (const field of mockPaths) {
    const leaf = field.split(".").pop();
    if (!contractText.includes(field) && !contractText.includes(leaf)) {
      problems.push({ kind: "missing-in-contract", field, detail: `mock 字段 "${field}" 未在 API_CONTRACT.md 出现（叶子 "${leaf}" 全文无踪影）` });
    }
  }
  return problems;
}

function parseArgs(argv) {
  const dirIndex = argv.indexOf("--dir");
  return dirIndex === -1 ? undefined : argv[dirIndex + 1];
}

async function main() {
  const dir = parseArgs(process.argv);
  if (!dir) {
    console.error("用法：npm run lint:spec -- --dir <prototype-dir>（目录内须有 mock_data.json 与 API_CONTRACT.md）");
    process.exitCode = 1;
    return;
  }
  const mockPath = path.resolve(ROOT, dir, "mock_data.json");
  const contractPath = path.resolve(ROOT, dir, "API_CONTRACT.md");
  for (const [label, p] of [["mock_data.json", mockPath], ["API_CONTRACT.md", contractPath]]) {
    if (!existsSync(p)) {
      console.error(`✗ 缺 ${label}：${path.relative(ROOT, p)}（原型交接协议第 1/4 节：交付同笔产出）`);
      process.exitCode = 1;
      return;
    }
  }
  let mock;
  try {
    mock = JSON.parse(await readFile(mockPath, "utf8"));
  } catch (error) {
    console.error(`✗ mock_data.json 不是合法 JSON：${error.message}`);
    process.exitCode = 1;
    return;
  }
  const contract = await readFile(contractPath, "utf8");
  const mockPaths = flattenMock(mock);
  const problems = checkContract(mockPaths, contract);
  if (problems.length > 0) {
    console.error(`✗ 规格门未过：${problems.length} 个字段未在契约中登记——`);
    for (const problem of problems) console.error(`  [${problem.kind}] ${problem.detail}`);
    console.error("（原型交接协议：数据单口的一切字段都要进 API_CONTRACT.md，后端拿它定接口草案）");
    process.exitCode = 1;
    return;
  }
  console.log(`spec-lint OK：mock 的 ${mockPaths.size} 个字段路径全部在 API_CONTRACT.md 登记。`);
}

export async function selfTest() {
  const assert = (await import("node:assert/strict")).default;
  const mock = {
    _schema: "annotation keys are skipped",
    users: [{ id: 1, name: "a", avatar: "x.png" }],
    stats: { total: 3, change_rate: 0.2 },
  };
  const paths = flattenMock(mock);
  for (const expected of ["users", "users.id", "users.name", "users.avatar", "stats", "stats.total", "stats.change_rate"]) {
    assert.ok(paths.has(expected), `flatten 应含 ${expected}`);
  }
  assert.ok(![...paths].some((p2) => p2.includes("_schema")), "下划线元数据键不得入字段集");
  const ok = checkContract(paths, "- 用户列表：id, name, avatar ← GET /api/users\n- 统计卡：stats.total, stats.change_rate ← GET /api/stats\n");
  assert.equal(ok.length, 0, "登记齐全应零问题");
  const bad = checkContract(paths, "- 用户列表：id, name ← GET /api/users\n");
  assert.ok(bad.some((p) => p.field === "users.avatar"), "漏登记 avatar 应报 missing-in-contract");
  assert.ok(bad.some((p) => p.field === "stats.total"), "漏登记 stats.total 应报 missing-in-contract");
  return "self-test OK";
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.includes("--self-test")) {
    try {
      console.log(await selfTest());
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  } else {
    try {
      await main();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
