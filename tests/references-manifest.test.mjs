import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { ROOT } from "../scripts/verify.mjs";
import { references, leanReferences } from "../scripts/build-prompt.mjs";

// S2 (agentUniverse absorption, 2026-09-25): the reference registry is the
// registry of record. Four sets must agree — registry entries, the actual
// references/ directory, the prompt:build export list, and SKILL.md links.
// A reference that is added, deleted, or silently dropped from an export
// fails here instead of rotting quietly (the source-catalog lesson).

const manifestPath = path.join(ROOT, "tooling/references-manifest.json");
const referencesDir = path.join(ROOT, ".agents/skills/ui-design-agent/references");
const skillPath = path.join(ROOT, ".agents/skills/ui-design-agent/SKILL.md");
const GATES = new Set(["A", "B", "C", "D", "E", "F", "all"]);

async function loadManifest() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const files = manifest.references.map((entry) => entry.file);
  assert.equal(new Set(files).size, files.length, "manifest entries must be unique");
  return { manifest, byFile: new Map(manifest.references.map((e) => [e.file, e])) };
}

test("the registry covers exactly the references that exist on disk", async () => {
  const { byFile } = await loadManifest();
  const onDisk = (await readdir(referencesDir))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const registered = [...byFile.keys()].sort();
  assert.deepEqual(registered, onDisk);
});

test("every registry entry carries purpose, load trigger, gate, and export tier", async () => {
  const { manifest, byFile } = await loadManifest();
  for (const entry of manifest.references) {
    assert.ok(entry.file.endsWith(".md"), `${entry.file}: bad file name`);
    assert.ok(typeof entry.purpose === "string" && entry.purpose.length >= 10, `${entry.file}: purpose too thin`);
    assert.ok(typeof entry.loadWhen === "string" && entry.loadWhen.length >= 8, `${entry.file}: loadWhen too thin`);
    assert.ok(GATES.has(entry.gate), `${entry.file}: unknown gate ${entry.gate}`);
    assert.ok(entry.export === "full" || entry.export === false, `${entry.file}: export must be "full" or false`);
    if (entry.export === false) {
      assert.ok(typeof entry.exportReason === "string" && entry.exportReason.length >= 10,
        `${entry.file}: an export exclusion needs a recorded reason`);
    }
    for (const dep of entry.dependsOn ?? []) {
      assert.ok(byFile.has(dep), `${entry.file}: dependsOn unknown reference ${dep}`);
      assert.notEqual(dep, entry.file, `${entry.file}: depends on itself`);
    }
  }
});

test("the prompt:build export lists match the registry, not memory", async () => {
  const { byFile } = await loadManifest();
  const exported = references.map(([file]) => file);
  const registeredFull = [...byFile.values()].filter((e) => e.export === "full").map((e) => e.file);
  assert.deepEqual(exported.sort(), registeredFull.sort());

  const registeredLean = [...byFile.values()].filter((e) => e.leanCore).map((e) => e.file);
  assert.deepEqual([...leanReferences].sort(), registeredLean.sort());
  for (const file of registeredLean) {
    assert.equal(byFile.get(file).export, "full", `${file}: leanCore must also be a full export`);
  }
});

test("SKILL.md links only point at references that exist", async () => {
  const { byFile } = await loadManifest();
  const source = await readFile(skillPath, "utf8");
  const linked = [...source.matchAll(/references\/([a-z0-9-]+\.md)\)/g)].map((m) => m[1]);
  assert.ok(linked.length > 10, "SKILL.md should reference the library");
  for (const file of new Set(linked)) {
    assert.ok(byFile.has(file), `SKILL.md links ${file}, but the registry does not know it`);
  }
});
