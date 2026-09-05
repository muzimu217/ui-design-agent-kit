import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse as parseToml } from "smol-toml";
import { parse as parseYaml } from "yaml";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));

export function parseSkill(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Missing YAML frontmatter");
  const metadata = parseYaml(match[1]);
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("Invalid skill metadata");
  const allowed = new Set(["name", "description", "license", "allowed-tools", "metadata"]);
  for (const key of Object.keys(metadata)) {
    if (!allowed.has(key)) throw new Error(`Unsupported frontmatter key: ${key}`);
  }
  if (typeof metadata.name !== "string" || metadata.name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) {
    throw new Error("Invalid skill name");
  }
  if (typeof metadata.description !== "string" || !metadata.description.trim()) {
    throw new Error("Missing skill description");
  }
  if (metadata.description.length > 1024 || /[<>]/.test(metadata.description)) {
    throw new Error("Skill description exceeds local format limits");
  }
  return metadata;
}

export function validateConfig(config, lock) {
  const errors = [];
  for (const key of ["approval_policy", "sandbox_mode", "model", "hooks"]) {
    if (key in config) errors.push(`The kit must not set ${key}`);
  }
  for (const item of lock.mcp) {
    const server = config.mcp_servers?.[item.name];
    if (!server) {
      errors.push(`Missing MCP configuration: ${item.name}`);
      continue;
    }
    if (item.url && server.url !== item.url) errors.push(`Unexpected URL: ${item.name}`);
    if (item.package) {
      const expected = item.name === "shadcn"
        ? ["-y", item.package, "mcp"]
        : ["-y", item.package, "--headless", "--isolated"];
      if (server.command !== "npx" || JSON.stringify(server.args) !== JSON.stringify(expected)) {
        errors.push(`Unexpected command or unpinned arguments: ${item.name}`);
      }
    }
    if (server.env && Object.keys(server.env).length) {
      errors.push(`Do not store inline environment values in the kit: ${item.name}`);
    }
    if (server.http_headers && Object.keys(server.http_headers).length) {
      errors.push(`Use environment-backed headers instead of inline values: ${item.name}`);
    }
  }
  return errors;
}

export async function loadProject(root = ROOT) {
  return {
    config: parseToml(await readFile(path.join(root, ".codex/config.toml"), "utf8")),
    lock: JSON.parse(await readFile(path.join(root, "tooling/sources.lock.json"), "utf8")),
  };
}

export async function verify(root = ROOT) {
  const { config, lock } = await loadProject(root);
  const errors = validateConfig(config, lock);
  const skills = [];
  const skillRoot = path.join(root, ".agents/skills");
  for (const entry of await readdir(skillRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const metadata = parseSkill(await readFile(path.join(skillRoot, entry.name, "SKILL.md"), "utf8"));
      if (metadata.name !== entry.name) throw new Error("Folder and skill name differ");
      skills.push(metadata.name);
    } catch (error) {
      errors.push(`${entry.name}: ${error.message}`);
    }
  }
  for (const item of lock.skills) {
    if (!skills.includes(item.name)) errors.push(`Missing installed skill: ${item.name}`);
    if (!/^[0-9a-f]{40}$/.test(item.revision)) errors.push(`Unpinned skill: ${item.name}`);
    try { await access(path.join(root, item.notice)); }
    catch { errors.push(`Missing upstream notice: ${item.name}`); }
  }
  // Keep the bundled Remotion router usable without requiring extra downloads.
  const remotionRoot = path.join(skillRoot, "remotion-best-practices");
  const remotionRouter = await readFile(path.join(remotionRoot, "SKILL.md"), "utf8");
  for (const match of remotionRouter.matchAll(/\]\((\.\/[^)]+\.md)\)/g)) {
    try { await access(path.join(remotionRoot, match[1])); }
    catch { errors.push(`Missing Remotion route: ${match[1]}`); }
  }
  try { await access(path.join(skillRoot, "impeccable/NOTICE.md")); }
  catch { errors.push("Missing original Impeccable NOTICE.md"); }
  for (const agentName of ["ui-design-agent", "remotion-video-agent"]) {
    if (!skills.includes(agentName)) {
      errors.push(`Missing agent entrypoint: ${agentName}`);
      continue;
    }
    const entrypoint = path.join(skillRoot, agentName);
    const ownSkill = await readFile(path.join(entrypoint, "SKILL.md"), "utf8");
    for (const match of ownSkill.matchAll(/\]\((references\/[^)]+)\)/g)) {
      try { await access(path.join(entrypoint, match[1])); }
      catch { errors.push(`Missing agent reference: ${agentName}/${match[1]}`); }
    }
    const metadata = parseYaml(await readFile(path.join(entrypoint, "agents/openai.yaml"), "utf8"));
    if (!metadata.interface?.default_prompt?.includes(`$${agentName}`)) {
      errors.push(`Default prompt does not invoke ${agentName}`);
    }
    if (metadata.policy?.allow_implicit_invocation === false) {
      errors.push(`${agentName} discovery is disabled`);
    }
  }
  return { ok: errors.length === 0, skills, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await verify();
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
