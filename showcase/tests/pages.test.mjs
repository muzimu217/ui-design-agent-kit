import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { normalizeBase, assertPublicPath, publicFiles, assemblePages, runtimeLicenses } from '../scripts/build-pages.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'brick-pages-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['showcase/products/dist', 'demo/brick-workshop/dist', 'demo/inventory-console/dist', 'demo/nodegrid/dist', 'demo/subway-runner/dist', 'demo/forma-phone-ui/dist', 'demo/tempo-day/dist', 'demo/ruiear/dist']) {
    await mkdir(path.join(root, directory, 'assets'), { recursive: true });
    await writeFile(path.join(root, directory, 'index.html'), '<!doctype html><title>fixture</title>');
    await writeFile(path.join(root, directory, 'assets/app.js'), 'console.log("fixture")');
  }
  return root;
}

test('base paths support project mounts and reject URL/path injection', () => {
  assert.equal(normalizeBase('/'), '/');
  assert.equal(normalizeBase('/ui-design-agent-kit/'), '/ui-design-agent-kit/');
  for (const invalid of ['https://example.com/', '//host/', '/a/../b/', '/a%2fb/', '/missing-trailing', '', undefined]) {
    if (invalid === undefined) assert.equal(normalizeBase(invalid), '/');
    else assert.throws(() => normalizeBase(invalid));
  }
});

test('only explicit public entrypoints and asset types are publishable', () => {
  for (const name of ['index.html', 'favicon.svg', 'assets/main-Q2.js', 'assets/desktop.webp', 'countries-110m.json', 'logo-mark.svg', 'prototype.html', 'models/characterMedium.fbx', 'models/animal-dog.glb', 'models/Textures/colormap.png', 'models/skins/skaterMaleA.png', 'photos/nasa.jpg']) assert.doesNotThrow(() => assertPublicPath(name));
  for (const name of ['.env', '.codex/config.toml', 'docs/PLAN.md', 'package.json', 'assets/app.js.map', 'assets/../secret.js', 'assets/.env.js', '../index.html', 'node_modules/react/index.js', 'models/track.mp3', 'models/../escape.js', 'data/countries.json']) {
    assert.throws(() => assertPublicPath(name), /Refusing/);
  }
});

test('site assembly publishes only the explicitly selected applications', async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'private-note.txt'), 'not for the public site');
  const result = await assemblePages({ root, basePath: '/kit/', licenseText: 'Fixture license' });
  assert.deepEqual(result.manifest.entrypoints, ['index.html', 'demos/brick-workshop/index.html', 'demos/inventory-console/index.html', 'demos/nodegrid/index.html', 'demos/subway-runner/index.html', 'demos/forma-phone-ui/index.html', 'demos/tempo-day/index.html', 'demos/ruiear/index.html']);
  assert.equal(result.manifest.files.length, 16);
  assert.ok(result.manifest.files.every((item) => /^[a-f0-9]{64}$/.test(item.sha256)));
  assert.equal(await readFile(path.join(result.output, 'THIRD_PARTY_LICENSES.txt'), 'utf8'), 'Fixture license');
  await assert.rejects(access(path.join(result.output, 'private-note.txt')));
  await access(path.join(result.output, 'demos/brick-workshop/assets/app.js'));
  await access(path.join(result.output, 'demos/inventory-console/assets/app.js'));
  await access(path.join(result.output, '.nojekyll'));
});

test('source maps or private files in build output stop assembly', async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'showcase/products/dist/assets/app.js.map'), '{}');
  await assert.rejects(assemblePages({ root, licenseText: 'License' }), /Refusing/);
  await assert.rejects(access(path.join(root, 'test-artifacts/pages/site')));
});

test('custom-domain root preserves mounted demo routes and release metadata', async (t) => {
  const root = await fixture(t);
  const result = await assemblePages({ root, basePath: '/', licenseText: 'Fixture license' });
  assert.equal(result.manifest.basePath, '/');
  assert.deepEqual(result.manifest.entrypoints, ['index.html', 'demos/brick-workshop/index.html', 'demos/inventory-console/index.html', 'demos/nodegrid/index.html', 'demos/subway-runner/index.html', 'demos/forma-phone-ui/index.html', 'demos/tempo-day/index.html', 'demos/ruiear/index.html']);
  for (const entrypoint of result.manifest.entrypoints) {
    await access(path.join(result.output, entrypoint));
    assert.equal(new URL(entrypoint, 'https://agent.kcos.club/').pathname, `/${entrypoint}`);
  }
});

test('symbolic links are rejected before reading their target', async (t) => {
  const root = await fixture(t);
  const directory = path.join(root, 'showcase/products/dist');
  await writeFile(path.join(root, 'secret.txt'), 'fixture only');
  await symlink(path.join(root, 'secret.txt'), path.join(directory, 'assets/link.js'));
  await assert.rejects(publicFiles(directory), /symbolic link/);
});

test('unrecognized output is preserved, recognized output is replaced recoverably', async (t) => {
  const root = await fixture(t);
  const output = path.join(root, 'test-artifacts/pages/site');
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'keep.txt'), 'keep');
  await assert.rejects(assemblePages({ root, licenseText: 'License' }), /without a build manifest/);
  assert.equal(await readFile(path.join(output, 'keep.txt'), 'utf8'), 'keep');
  const other = await fixture(t);
  await assemblePages({ root: other, licenseText: 'Old license' });
  const next = await assemblePages({ root: other, licenseText: 'New license' });
  assert.equal(await readFile(path.join(next.output, 'THIRD_PARTY_LICENSES.txt'), 'utf8'), 'New license');
});

test('missing license bundle cannot produce a release', async (t) => {
  const root = await fixture(t);
  await assert.rejects(assemblePages({ root }), /license bundle/);
});

test('license bundle follows the compiled inventory and fails closed on missing text', async (t) => {
  const root = await fixture(t);
  const project = path.join(root, 'showcase/products');
  const file = path.join(project, 'dist/third-party-licenses.json');
  await writeFile(file, JSON.stringify([{ name: 'fixture', version: '1.0.0', identifier: 'MIT', text: 'Fixture license text' }]));
  assert.match(await runtimeLicenses([project]), /fixture@1\.0\.0[\s\S]*Fixture license text/);
  await writeFile(file, JSON.stringify([{ name: 'unknown', version: '1.0.0', identifier: 'MIT' }]));
  await assert.rejects(runtimeLicenses([project]), /No license text/);
});
