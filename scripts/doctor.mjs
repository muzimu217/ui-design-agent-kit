import path from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { ROOT, loadProject, verify } from "./verify.mjs";

export function selectServers(config, names = []) {
  const servers = config.mcp_servers ?? {};
  for (const name of names) {
    if (!Object.hasOwn(servers, name)) throw new Error(`Unknown MCP server: ${name}`);
  }
  return Object.entries(servers).filter(([name]) => !names.length || names.includes(name));
}

function contentText(result) {
  return (result.content ?? []).filter((item) => item.type === "text").map((item) => item.text).join("\n");
}

export function isBlankNavigation(result) {
  const text = contentText(result);
  return !/^#{1,3}\s+Error\b/im.test(text) && /Page URL:\s*about:blank/i.test(text);
}

export function assertToolResult(result, predicate, label) {
  if (result.isError) throw new Error(`${label}: server returned an error result`);
  if (!predicate(result)) throw new Error(`${label}: expected evidence is absent`);
}

export async function smokeCheck(name, client, tools, options = { timeout: 30000 }) {
  const names = new Set(tools.map((tool) => tool.name));
  async function call(tool, args) {
    if (!names.has(tool)) throw new Error(`Expected tool is unavailable: ${tool}`);
    return client.callTool({ name: tool, arguments: args }, undefined, options);
  }
  if (name === "motion") {
    const result = await call("search-motion-docs", { platform: "react", searchTerm: "useReducedMotion" });
    assertToolResult(result, (r) => r.content?.some((item) =>
      item.type === "resource_link" && item.uri.startsWith("motion://docs/")), "Motion docs search");
    const resource = result.content.find((item) => item.type === "resource_link" && item.uri.startsWith("motion://docs/"));
    const document = await client.readResource({ uri: resource.uri }, options);
    if (!document.contents?.some((item) => typeof item.text === "string" && item.text.length > 100)) {
      throw new Error("Motion resource did not return document text");
    }
    if (names.has("generate-css-easing")) {
      const easing = await call("generate-css-easing", { kind: "spring", duration: 0.25, bounce: 0 });
      assertToolResult(easing, (r) => /linear\(/.test(contentText(r)), "CSS spring generation");
      return "docs search + resource read + CSS spring generation";
    }
    return "docs search + resource read";
  }
  if (name === "context7") {
    const result = await call("resolve-library-id", { libraryName: "React", query: "React useState state updates" });
    assertToolResult(result, (r) => /Context7-compatible library ID:/i.test(contentText(r)), "Library resolution");
    return "public React library resolution";
  }
  if (name === "shadcn") {
    const result = await call("search_items_in_registries", { registries: ["@shadcn"], query: "button", limit: 1 });
    assertToolResult(result, (r) => /button/i.test(contentText(r)) && !/unable to|failed to|error:/i.test(contentText(r)), "Registry search");
    return "read-only button registry search";
  }
  if (name === "playwright") {
    try {
      const result = await call("browser_navigate", { url: "about:blank" });
      assertToolResult(result, isBlankNavigation, "Blank-page navigation");
      return "isolated about:blank navigation (not an application UI test)";
    } finally {
      if (names.has("browser_close")) await call("browser_close", {});
    }
  }
  return null;
}

export async function checkServer(name, server, options = {}) {
  if (server.enabled === false) return { name, status: "disabled" };
  if (!options.connect) return { name, status: "configured-not-connected" };

  const client = new Client({ name: "ui-design-agent-doctor", version: "0.1.0" });
  const timeout = Math.min((server.startup_timeout_sec ?? 30) * 1000, 90000);
  // No OAuth provider is supplied: diagnostics never start a login or retrieve stored credentials.
  const transport = server.url
    ? new StreamableHTTPClientTransport(new URL(server.url), {
      fetch: (url, init) => fetch(url, {
        ...init,
        signal: AbortSignal.any([...(init?.signal ? [init.signal] : []), AbortSignal.timeout(timeout)]),
      }),
    })
    : new StdioClientTransport({ command: server.command, args: server.args, cwd: ROOT, stderr: "pipe" });
  transport.stderr?.on("data", () => {});
  let connected = false;
  let tools = [];
  try {
    await client.connect(transport, { timeout });
    connected = true;
    tools = (await client.listTools(undefined, { timeout: 30000 })).tools;
    const smoke = await smokeCheck(name, client, tools);
    return { name, status: smoke ? "smoke-passed" : "connected-no-smoke", tools: tools.map((tool) => tool.name), smoke };
  } catch (error) {
    // Error bodies may echo remote content. Keep only the error class and a bounded local diagnosis.
    const message = String(error.message);
    const reason = /401|403|unauthoriz|forbidden/i.test(message) ? "authentication-or-access-required"
      : /timeout|timed out/i.test(message) ? "timeout"
      : /expected|unavailable|absent|did not return|server returned/i.test(message) ? message.slice(0,240)
      : "connection-or-tool-error";
    return { name, status: connected ? "smoke-failed" : "connection-failed", reason, errorType: error.name, tools: tools.map((tool) => tool.name) };
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}

async function main(args) {
  const unknown = args.filter((arg) => arg.startsWith("--") && !["--connect", "--server"].includes(arg));
  if (unknown.length) throw new Error(`Unknown option: ${unknown[0]}`);
  const names = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--connect") continue;
    if (args[i] !== "--server" || !args[i + 1] || args[i + 1].startsWith("--")) {
      throw new Error("Usage: node scripts/doctor.mjs [--connect] [--server NAME]");
    }
    names.push(args[++i]);
  }
  const report = await verify();
  if (!report.ok) throw new Error(report.errors.join("; "));
  console.log(JSON.stringify({ check: "local-kit", status: "passed", skills: report.skills }));
  const { config } = await loadProject();
  for (const [name, server] of selectServers(config, names)) {
    if (args.includes("--connect") && server.enabled !== false) console.error(`Checking ${name}...`);
    const result = await checkServer(name, server, { connect: args.includes("--connect") });
    console.log(JSON.stringify(result));
    if (["connection-failed", "smoke-failed"].includes(result.status)) process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
