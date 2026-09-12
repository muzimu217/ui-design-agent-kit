import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { parseSkill, validateConfig, loadProject, verify, ROOT } from "../scripts/verify.mjs";
import { selectServers, assertToolResult, checkServer, smokeCheck, isBlankNavigation } from "../scripts/doctor.mjs";
import { buildPrompt } from "../scripts/build-prompt.mjs";

test("installed skills, references, and pinned MCP config are complete", async () => {
  const result = await verify();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.skills.sort(), [
    "animation-vocabulary", "baoyu-design", "emil-design-eng",
    "gsap-core", "gsap-frameworks", "gsap-performance", "gsap-plugins",
    "gsap-react", "gsap-scrolltrigger", "gsap-timeline", "gsap-utils",
    "impeccable", "jiejoe-design", "motion", "pick-ui-library",
    "remotion-best-practices", "remotion-create", "remotion-docs",
    "remotion-markup", "remotion-render", "remotion-studio",
    "remotion-video-agent", "ui-design-agent", "ui-ux-pro-max",
  ]);
});

test("frontmatter parser accepts multiline YAML but rejects invalid metadata", () => {
  assert.equal(parseSkill("---\nname: motion\ndescription: >\n  Web motion\n  guidance\n---\nBody").name, "motion");
  assert.throws(() => parseSkill("No frontmatter"));
  assert.throws(() => parseSkill("---\nname: BAD NAME\ndescription: text\n---\n"));
  assert.throws(() => parseSkill("---\nname: valid\ndescription: []\n---\n"));
  assert.throws(() => parseSkill("---\nname: 123\ndescription: text\n---\n"));
  assert.throws(() => parseSkill("---\nname: valid\ndescription: text\nversion: 1\n---\n"), /Unsupported/);
  assert.equal(parseSkill("---\nname: valid\ndescription: text\nmetadata:\n  version: '1'\n---\n").metadata.version, "1");
});

test("configuration checks catch endpoint drift, unpinned commands, and inline secrets", async () => {
  const { config, lock } = await loadProject();
  const changed = structuredClone(config);
  changed.mcp_servers.motion.url = "https://example.invalid";
  changed.mcp_servers.shadcn.args = ["shadcn@latest", "mcp"];
  changed.mcp_servers.context7.http_headers = { Authorization: "test-fixture" };
  changed.approval_policy = "never";
  assert.equal(validateConfig(changed, lock).length, 4);
  assert.equal(validateConfig(config, lock).length, 0);
});

test("premium and account integrations ship disabled", async () => {
  const { config } = await loadProject();
  assert.equal(config.mcp_servers.motion_plus.enabled, false);
  assert.equal(config.mcp_servers.figma.enabled, false);
});

test("the deprecated Remotion MCP is not configured", async () => {
  const { config } = await loadProject();
  assert.equal(Object.hasOwn(config.mcp_servers, "remotion"), false);
  assert.equal(Object.hasOwn(config.mcp_servers, "remotion_mcp"), false);
  assert.equal(Object.hasOwn(config.mcp_servers, "remotion-mcp"), false);
});

test("unknown server selection fails instead of producing a false success", async () => {
  const { config } = await loadProject();
  assert.throws(() => selectServers(config, ["typo"]), /Unknown/);
  assert.deepEqual(selectServers(config, ["motion"]).map(([name]) => name), ["motion"]);
});

test("offline diagnostics and disabled servers never attempt a connection", async () => {
  assert.equal((await checkServer("offline", { url: "invalid" })).status, "configured-not-connected");
  assert.equal((await checkServer("disabled", { enabled: false, url: "invalid" }, { connect: true })).status, "disabled");
});

test("tool errors and empty content cannot count as smoke-test success", () => {
  assert.throws(() => assertToolResult({ isError: true }, () => true, "test"));
  assert.throws(() => assertToolResult({ content: [] }, (r) => r.content.length > 0, "test"));
  assert.doesNotThrow(() => assertToolResult({ content: [{ type: "text", text: "evidence" }] }, (r) => r.content.length > 0, "test"));
});

test("a tab listing is not evidence of a browser navigation", () => {
  assert.equal(isBlankNavigation({content: [{type: "text", text: "### Result\n- 0: (current) [](about:blank)"}]}), false);
  assert.equal(isBlankNavigation({content: [{type: "text", text: "### Page\n- Page URL: about:blank"}]}), true);
  assert.equal(isBlankNavigation({content: [{type: "text", text: "### Error\nPage URL: about:blank"}]}), false);
});

test("browser smoke closes its isolated session even when navigation fails", async () => {
  const calls = [];
  const client = { callTool: async ({name}) => {
    calls.push(name);
    return name === "browser_navigate" ? {isError: true} : {content: []};
  }};
  await assert.rejects(smokeCheck("playwright", client, [{name: "browser_navigate"}, {name: "browser_close"}]), /server returned/);
  assert.deepEqual(calls, ["browser_navigate", "browser_close"]);
});

test("Motion smoke accepts the current docs-only tool surface", async () => {
  const calls = [];
  const client = {
    callTool: async ({name}) => {
      calls.push(name);
      return {content: [{type: "resource_link", uri: "motion://docs/use-reduced-motion"}]};
    },
    readResource: async ({uri}) => ({contents: [{uri, text: "Motion documentation with enough evidence to verify the resource read and preserve the current API guidance for reduced-motion behavior in a real project."}]}),
  };
  assert.equal(
    await smokeCheck("motion", client, [{name: "search-motion-docs"}]),
    "docs search + resource read",
  );
  assert.deepEqual(calls, ["search-motion-docs"]);
});

test("design search runs outside the repository working directory", () => {
  const script = path.join(ROOT, ".agents/skills/ui-ux-pro-max/scripts/search.py");
  const stdout = execFileSync("python3", [script, "keyboard focus modal", "--domain", "ux", "--json"], {
    cwd: "/tmp", encoding: "utf8", timeout: 10000,
  });
  const result = JSON.parse(stdout);
  assert.equal(result.domain, "ux");
  assert.ok(result.count > 0);
  assert.ok(result.results.some((item) => /focus/i.test(item.Issue)));
});

test("behavior evaluation scenarios have distinct ids and observable criteria", async () => {
  const scenarios = JSON.parse(await readFile(path.join(ROOT, "evals/scenarios.json"), "utf8"));
  assert.equal(new Set(scenarios.map((item) => item.id)).size, scenarios.length);
  assert.ok(scenarios.length >= 6);
  for (const item of scenarios) {
    assert.ok(item.request && item.context && item.passCriteria.length && item.failConditions.length);
  }
});

test("single-file prompt embeds its references and uses working in-document links", async () => {
  const prompt = await buildPrompt();
  const headingAnchors = new Set([...prompt.matchAll(/^# (.+)$/gm)].map((match) => match[1].toLowerCase().replaceAll(" ", "-")));
  assert.equal(prompt.includes("(references/"), false);
  assert.equal(prompt.includes("\nname: ui-design-agent\n"), false);
  const links = [...prompt.matchAll(/\]\(#([^)]+)\)/g)];
  assert.ok(links.length >= 3);
  for (const [, anchor] of links) assert.ok(headingAnchors.has(anchor), `Broken prompt anchor: ${anchor}`);
  for (const name of ["motion-contract.md", "tool-routing.md", "spatial-media.md", "stitch-mcp.md", "material-scouting.md", "plan-execute.md", "image-to-code-fidelity.md", "product-readme.md", "acceptance.md"]) {
    const source = await readFile(path.join(ROOT, ".agents/skills/ui-design-agent/references", name), "utf8");
    assert.equal(prompt.split(source.trim()).length - 1, 1, `Reference must be embedded exactly once: ${name}`);
  }
  assert.equal(await buildPrompt(), prompt);
});

test("prompt and workflow enforce bounded sequential agent dispatch", async () => {
  const skill = await readFile(path.join(ROOT, ".agents/skills/ui-design-agent/SKILL.md"), "utf8");
  const chain = await readFile(path.join(ROOT, "docs/chain-flow.md"), "utf8");
  const usage = await readFile(path.join(ROOT, "docs/usage.md"), "utf8");
  for (const source of [skill, chain, usage]) {
    const normalized = source.replace(/\s+/g, " ");
    assert.match(normalized, /at most one active subagent|最多一个活跃子代理|only one subagent may be active/i);
  }
  const skillText = skill.replace(/\s+/g, " ");
  const chainText = chain.replace(/\s+/g, " ");
  assert.match(skillText, /\| S narrow repair \| 0 subagents by default/);
  assert.match(skillText, /\| M page-level work \| Sequential subagents as needed/);
  assert.match(skillText, /\| L substantial new UI \| A, B, and C phases at most once each/);
  assert.match(chainText, /\| S 窄修复 \| 默认 0 个 \|/);
  assert.match(chainText, /\| M 页面级 \| 按需串行派发 \|/);
  assert.match(chainText, /\| L 实质性新 UI \| 标准链最多 A\/B\/C 各 1 次 \|/);
  const usageText = usage.replace(/\s+/g, " ");
  assert.match(usageText, /S-level repairs use 0 subagents/i);
  assert.match(usageText, /M-level work uses sequential/i);
  assert.match(usageText, /L-level A\/B\/C chain is also sequential/i);
  assert.match(skill, /user explicitly authorizes the exception/i);
  assert.match(chain, /用户明确授权/);
});

test("SKILL.md stays under the growth tripwire and the lean prompt export stays self-contained", async () => {
  const skill = await readFile(path.join(ROOT, ".agents/skills/ui-design-agent/SKILL.md"), "utf8");
  const lines = skill.split(/\r?\n/).length;
  assert.ok(
    lines <= 600,
    `SKILL.md is ${lines} lines (tripwire 600): sink stable details into references/ and keep routing in the body`,
  );

  const full = await buildPrompt();
  const lean = await buildPrompt(ROOT, { lean: true });
  assert.ok(lean.length < full.length, "lean export must be smaller than the full export");
  for (const marker of ["Design Contract", "Web Motion Contract", "UI Acceptance", "User Taste Profile"]) {
    assert.ok(lean.includes(marker), `lean export is missing core section: ${marker}`);
  }
  assert.ok(!lean.includes("](references/"), "lean export keeps links to references it does not embed");
  assert.ok(full.includes("](#"), "full export must rewrite reference links to anchors");
});
