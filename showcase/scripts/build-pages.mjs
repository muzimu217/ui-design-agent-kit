import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const PUBLIC_APPS = [
  { project: 'showcase/products', prefix: '' },
  { project: 'demo/brick-workshop', prefix: 'demos/brick-workshop' },
  { project: 'demo/inventory-console', prefix: 'demos/inventory-console' },
  { project: 'demo/nodegrid', prefix: 'demos/nodegrid' },
  { project: 'demo/subway-runner', prefix: 'demos/subway-runner' },
  { project: 'demo/forma-phone-ui', prefix: 'demos/forma-phone-ui' },
  { project: 'demo/tempo-day', prefix: 'demos/tempo-day' },
  { project: 'demo/ruiear', prefix: 'demos/ruiear' },
];
const ROOT_FILES = new Set([
  'index.html', 'favicon.svg', 'robots.txt', 'og-image.webp', 'third-party-licenses.json',
  // nodegrid：公有领域地理边界数据（Natural Earth via world-atlas）与站点图标
  'countries-110m.json', 'logo-mark.svg',
  // subway-runner：门C 视觉原型存档（纯静态单文件）
  'prototype.html',
]);
const ASSET_PATTERN = /^(?:assets|models|photos|Textures)\/[A-Za-z0-9_./-]+\.(?:js|css|png|jpe?g|webp|avif|svg|woff2?|ttf|fbx|glb|gltf|bin|json|mp4)$/;

export function normalizeBase(value = '/') {
  if (typeof value !== 'string' || !/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(value)) {
    throw new Error('Base must be / or a slash-delimited path such as /ui-design-agent-kit/');
  }
  return value;
}

const DIR_PATTERN = /^(?:assets|models|photos|Textures)(?:\/[A-Za-z0-9_-]+)*$/;

export function assertPublicPath(relative) {
  const parts = relative.split('/');
  if (parts.some((part) => part === '' || part.startsWith('.'))
    || (!ROOT_FILES.has(relative) && !ASSET_PATTERN.test(relative))) {
    throw new Error(`Refusing non-public build file: ${relative}`);
  }
}

export async function publicFiles(directory) {
  const rootStat = await lstat(directory);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error(`Build directory is not a real directory: ${directory}`);
  const files = [];
  async function visit(current, prefix = '') {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = path.join(current, entry.name);
      const stat = await lstat(absolute);
      if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`);
      if (stat.isDirectory()) {
        if (!DIR_PATTERN.test(relative)) throw new Error(`Refusing build directory: ${relative}`);
        await visit(absolute, relative);
      } else if (stat.isFile()) {
        if (stat.nlink !== 1) throw new Error(`Refusing hard link: ${relative}`);
        assertPublicPath(relative);
        files.push(relative);
      } else throw new Error(`Refusing special file: ${relative}`);
    }
  }
  await visit(directory);
  if (!files.includes('index.html')) throw new Error(`Missing entrypoint: ${directory}/index.html`);
  return files.sort();
}

export async function runtimeLicenses(projects) {
  const sections = new Map();
  for (const project of projects) {
    const entries = JSON.parse(await readFile(path.join(project, 'dist/third-party-licenses.json'), 'utf8'));
    if (!Array.isArray(entries) || !entries.length) throw new Error('Missing Vite bundled-dependency license report');
    for (const entry of entries) {
      if (typeof entry.name !== 'string' || typeof entry.version !== 'string') throw new Error('Malformed bundled dependency license');
      const identity = `${entry.name}@${entry.version}`;
      if (sections.has(identity)) continue;
      let notice = entry.text;
      if (!notice && identity === '@react-three/fiber@9.7.0') {
        notice = await readFile(new URL('../licenses/react-three-fiber-9.7.0.txt', import.meta.url), 'utf8');
      }
      if (typeof notice !== 'string' || !notice.trim()) throw new Error(`No license text found for bundled dependency: ${identity}`);
      sections.set(identity, `${identity}\nDeclared license: ${entry.identifier ?? 'See notice below'}\n\n${notice}`);
    }
  }
  return `Third-party runtime licenses\nGenerated from Vite's actual bundled module inventory and checked license supplements.\n\n${[...sections.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, text]) => text).join('\n\n========================================\n\n')}\n`;
}

export async function assemblePages({ root = ROOT, basePath = '/', licenseText }) {
  const base = normalizeBase(basePath);
  const releaseId = process.env.VITE_RELEASE_ID || null;
  if (releaseId && !/^[A-Za-z0-9._-]{1,64}$/.test(releaseId)) throw new Error('Invalid public release identifier');
  if (typeof licenseText !== 'string' || !licenseText.trim()) throw new Error('Runtime license bundle is required');
  const inputs = PUBLIC_APPS.map(({ project, prefix }) => ({ directory: path.join(root, project, 'dist'), prefix }));
  const inventory = [];
  for (const input of inputs) inventory.push({ ...input, files: await publicFiles(input.directory) });
  const parent = path.join(root, 'test-artifacts/pages');
  await mkdir(parent, { recursive: true });
  const staging = await mkdtemp(path.join(parent, '.stage-'));
  const entries = [];
  for (const input of inventory) {
    for (const relative of input.files) {
      const target = input.prefix ? `${input.prefix}/${relative}` : relative;
      const destination = path.join(staging, target);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(input.directory, relative), destination);
      const buffer = await readFile(destination);
      entries.push({ path: target, bytes: buffer.length, sha256: createHash('sha256').update(buffer).digest('hex') });
    }
  }
  await writeFile(path.join(staging, 'THIRD_PARTY_LICENSES.txt'), licenseText);
  await writeFile(path.join(staging, '.nojekyll'), '');
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    basePath: base,
    releaseId,
    entrypoints: PUBLIC_APPS.map(({ prefix }) => prefix ? `${prefix}/index.html` : 'index.html'),
    files: entries.sort((a, b) => a.path.localeCompare(b.path)),
  };
  await writeFile(path.join(staging, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const output = path.join(parent, 'site');
  try {
    const stat = await lstat(output);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Existing Pages output is not a real directory');
    const marker = JSON.parse(await readFile(path.join(output, 'build-manifest.json'), 'utf8'));
    if (marker.schemaVersion !== 1 || !Array.isArray(marker.entrypoints)) throw new Error('Refusing to replace unrecognized output');
    await rename(output, `${staging}-previous`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // An existing directory without our manifest is not disposable build output.
    try { await lstat(output); } catch (missing) {
      if (missing.code === 'ENOENT') {
        await rename(staging, output);
        return { output, manifest };
      }
      throw missing;
    }
    throw new Error('Refusing to replace output without a build manifest');
  }
  await rename(staging, output);
  return { output, manifest };
}

export async function buildPages({ root = ROOT, basePath = '/', skipBuild = false } = {}) {
  const base = normalizeBase(basePath);
  if (!skipBuild) {
    for (const { project, prefix } of PUBLIC_APPS) {
      const directory = path.join(root, project);
      const mount = prefix ? `${base}${prefix}/` : base;
      const run = spawnSync('npm', ['run', 'build', '--', '--base', mount], { cwd: directory, stdio: 'inherit' });
      if (run.error) throw run.error;
      if (run.status !== 0) throw new Error(`Build failed: ${path.relative(root, directory)}`);
    }
  }
  return assemblePages({ root, basePath: base, licenseText: await runtimeLicenses(PUBLIC_APPS.map(({ project }) => path.join(root, project))) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const index = args.indexOf('--base');
    const basePath = index === -1 ? '/' : args[index + 1];
    if (index !== -1 && !basePath) throw new Error('--base requires a path');
    const result = await buildPages({ basePath, skipBuild: args.includes('--skip-build') });
    console.log(JSON.stringify({ output: result.output, basePath: result.manifest.basePath, publicFiles: result.manifest.files.length }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
