// Embeds the artifacts a task state references, so the diagram shows the
// document itself rather than only a path string.
//
// At build time every evidence path is resolved against the task workspace,
// read, and inlined into the output. The result stays a single offline file:
// opening it shows the direction note, the research list, the contract, or a
// prototype, with no server and no repository checkout.
//
// Two renderings:
//   - Markdown is converted to HTML with a deliberately small converter (see
//     markdown.mjs) covering the subset these documents actually use.
//   - HTML artifacts (a prototype board, for example) are inlined as-is inside a
//     sandboxed iframe, so the artifact renders as a design, not as source.
//
// A missing file is recorded as missing. It is never silently dropped and never
// replaced with a plausible-looking placeholder.

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { markdownToHtml } from "./markdown.mjs";

const MAX_BYTES = 400 * 1024;

export async function embedArtifacts(model, { workspace }) {
  const wanted = new Map();
  for (const stage of model.stages) {
    const paths = splitEvidence(stage.evidenceActual);
    if (!paths.length) continue;
    wanted.set(stage.id, paths);
  }
  for (const [stageId, paths] of wanted) {
    const embedded = [];
    for (const raw of paths) {
      embedded.push(await loadArtifact(raw, workspace));
    }
    model.artifacts = model.artifacts ?? {};
    model.artifacts[stageId] = embedded;
  }
  return model;
}

// Evidence cells are written for a human ("docs/A.md · docs/B.md"). Split on the
// separators the records actually use, and keep only entries that look like a
// repo-relative file path.
export function splitEvidence(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/[·、,;]|\s{2,}|\s+\+\s+/)
    .map((part) => part.trim())
    .filter((part) => part && /^[\w./-]+\.(md|html|json|tsx?|css)$/i.test(part));
}

async function loadArtifact(rawPath, workspace) {
  const abs = path.resolve(workspace, rawPath);
  if (!abs.startsWith(path.resolve(workspace))) {
    return { path: rawPath, status: "blocked", reason: "路径超出任务工作区，未读取" };
  }
  try {
    const info = await stat(abs);
    if (!info.isFile()) return { path: rawPath, status: "missing", reason: "不是文件" };
    if (info.size > MAX_BYTES) {
      return { path: rawPath, status: "too-large", reason: `文件 ${Math.round(info.size / 1024)}KB，超过内嵌上限 ${MAX_BYTES / 1024}KB` };
    }
    const text = await readFile(abs, "utf8");
    const ext = path.extname(abs).toLowerCase();
    if (ext === ".html") {
      return { path: rawPath, status: "ok", kind: "html", bytes: info.size, text };
    }
    if (ext === ".md") {
      return { path: rawPath, status: "ok", kind: "markdown", bytes: info.size, html: markdownToHtml(text), text };
    }
    return { path: rawPath, status: "ok", kind: "text", bytes: info.size, text };
  } catch (error) {
    return { path: rawPath, status: "missing", reason: error.code === "ENOENT" ? "文件不存在" : error.message };
  }
}
