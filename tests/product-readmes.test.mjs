import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { ROOT } from "../scripts/verify.mjs";

async function productRoots() {
  const projects = [".", "showcase", "showcase/products"];
  for (const entry of await readdir(path.join(ROOT, "demo"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const project = path.join("demo", entry.name);
    try { await access(path.join(ROOT, project, "package.json")); }
    catch { continue; }
    projects.push(project);
  }
  return projects;
}

// These READMEs use inline Markdown links without titles or nested labels.
// Rendered Markdown and visual checks remain separate from this packaging test.
function inlineLinks(source) {
  const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
  return [...prose.matchAll(/(!?)\[([^\]\n]*)\]\(([^\s)]+)\)/g)]
    .map(([, image, label, target]) => ({ image: image === "!", label, target }));
}

test("first-party README media is durable and the historical missing-media exception is explicit", async () => {
  for (const project of await productRoots()) {
    const sourcePath = path.join(ROOT, project, "README.md");
    const source = await readFile(sourcePath, "utf8");
    const images = inlineLinks(source).filter((link) => link.image);
    if (project === "showcase" && images.length === 0) {
      assert.ok(inlineLinks(source).some((link) => link.target === "../docs/readme-media.md"),
        "Historical screenshot gap must link its evidence record");
      continue;
    }
    assert.ok(images.length > 0, `${project}: no product image or documented exception`);
    for (const { label, target } of images) {
      assert.ok(label.trim(), `${project}: image needs alt text`);
      assert.equal(/^(?:[a-z]+:|\/)/i.test(target), false, `${project}: use product-local image paths`);
      const file = path.resolve(path.dirname(sourcePath), decodeURIComponent(target));
      const bytes = await readFile(file);
      assert.ok(bytes.length > 1024, `${project}: image is unexpectedly empty`);
      const ignored = spawnSync("git", ["check-ignore", "--", file], { cwd: ROOT, encoding: "utf8" });
      assert.equal(ignored.status, 1, `${project}: README image is ignored or could not be checked: ${target}`);
    }
  }
});

test("product README local links resolve inside the repository", async () => {
  for (const project of await productRoots()) {
    const sourcePath = path.join(ROOT, project, "README.md");
    const source = await readFile(sourcePath, "utf8");
    for (const { target } of inlineLinks(source)) {
      if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
      assert.equal(/^(?:[a-z]+:|\/)/i.test(target), false, `${project}: nonportable link ${target}`);
      const file = path.resolve(path.dirname(sourcePath), decodeURIComponent(target.split("#")[0]));
      const relative = path.relative(ROOT, file);
      assert.equal(relative.startsWith("..") || path.isAbsolute(relative), false, `${project}: link escapes repository`);
      await assert.doesNotReject(access(file), `${project}: broken local link ${target}`);
    }
  }
});

test("documented npm scripts and clean-install lockfiles exist for each product", async () => {
  for (const project of await productRoots()) {
    const root = path.join(ROOT, project);
    const source = await readFile(path.join(root, "README.md"), "utf8");
    const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
    const blocks = [...source.matchAll(/^```(?:bash|sh)\n([\s\S]*?)^```/gm)].map((match) => match[1]);
    for (const block of blocks) {
      for (const [, script] of block.matchAll(/^npm run ([\w:-]+)/gm)) {
        assert.ok(Object.hasOwn(pkg.scripts, script), `${project}: missing npm script ${script}`);
      }
      if (/^npm test\b/m.test(block)) assert.ok(pkg.scripts.test, `${project}: missing test script`);
      if (/^npm ci\b/m.test(block)) await access(path.join(root, "package-lock.json"));
    }
  }
});
