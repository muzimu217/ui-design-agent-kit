import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('assets/models/airpods_pro.glb');
const root = doc.getRoot();

console.log('=== RAW METADATA (grep) ===');
const { readFile } = await import('node:fs/promises');
const buf = await readFile('assets/models/airpods_pro.glb');
const jsonLen = buf.readUInt32LE(12);
const jsonStr = buf.subarray(20, 20 + jsonLen).toString('utf8');
for (const key of ['copyright', 'author', 'license', 'source', 'title']) {
  const m = jsonStr.match(new RegExp(`"${key}"\\s*:\\s*"([^"]{0,200})"`));
  if (m) console.log(`${key}: ${m[1]}`);
}

console.log('\n=== SCENE TREE ===');
const printNode = (node, depth = 0) => {
  const mesh = node.getMesh();
  const meshInfo = mesh ? ` [mesh: ${mesh.getName()} prims:${mesh.listPrimitives().length}]` : '';
  console.log(`${'  '.repeat(depth)}${node.getName() || '(unnamed)'}${meshInfo}`);
  node.listChildren().forEach((c) => printNode(c, depth + 1));
};
root.listScenes()[0].listChildren().forEach((n) => printNode(n));

console.log('\n=== MATERIALS ===');
for (const mat of root.listMaterials()) {
  console.log(
    `${mat.getName()} | baseColor: [${mat.getBaseColorFactor().map((n) => n.toFixed(2)).join(', ')}] | metal:${mat.getMetallicFactor()} rough:${mat.getRoughnessFactor()}`
  );
}

console.log('\n=== ANIMATIONS ===');
for (const anim of root.listAnimations()) {
  console.log(`animation: ${anim.getName()}`);
  for (const ch of anim.listChannels()) {
    const node = ch.getTargetNode();
    console.log(
      `  channel path=${ch.getTargetPath()} target=${node?.getName() || '(unnamed)'} parent=${node?.getParentNode()?.getName() || '-'}`
    );
  }
  for (const s of anim.listSamplers()) {
    console.log(`  sampler input=${s.getInput()?.getArray()?.length || 0} keys output=${s.getOutput()?.getArray()?.length || 0} interp=${s.getInterpolation()}`);
  }
}
