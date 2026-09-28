// Build the UAK paper (PDF + DOCX) from its Markdown sources.
// Pipeline B of docs/superpowers/specs/2026-09-16-uak-paper-design.md:
// pandoc + LaTeX acmart. paper/out/ is regenerable output and gitignored.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STYLE = join(ROOT, 'paper', 'style');
const OUT = join(ROOT, 'paper', 'out');
const BIB = join(ROOT, 'paper', 'references.bib');

const TARGETS = [
  { src: 'paper/uak-paper.md', stem: 'uak-paper' },
  { src: 'paper/workshop/uak-workshop.md', stem: 'uak-workshop' },
];

function findTex() {
  const candidates = [
    process.env.TEXBIN,
    '/Library/TeX/texbin',
    join(homedir(), 'Library', 'TinyTeX', 'bin', 'universal-darwin'),
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, 'pdflatex'))) return dir;
  }
  console.error(
    `paper:build needs pdflatex but none was found.
Looked in: ${candidates.join(', ')}
Install one of:
  brew install --cask basictex    (system TeX, then: sudo tlmgr install acmart)
  curl -sL https://yihui.org/tinytex/install-bin-unix.sh | sh    (user-space, no sudo)
Then add the acmart class:  tlmgr install acmart
Or point TEXBIN at a directory containing pdflatex.`
  );
  process.exitCode = 1;
}

function pandoc(args, env) {
  execFileSync('pandoc', args, { stdio: ['ignore', 'inherit', 'inherit'], env, cwd: ROOT });
}

const texbin = findTex();
if (!existsSync(join(ROOT, 'paper', 'uak-paper.md'))) {
  console.error('paper/uak-paper.md is missing; nothing to build.');
  process.exitCode = 1;
}
mkdirSync(OUT, { recursive: true });

const env = { ...process.env, PATH: `${texbin}:${process.env.PATH}` };
let failed = 0;

for (const t of TARGETS) {
  const src = join(ROOT, t.src);
  if (!existsSync(src)) {
    console.error(`skip ${t.src}: source not written yet`);
    continue;
  }
  const common = [
    src,
    '-f', 'markdown',
    '--citeproc',
    '--bibliography', BIB,
  ];
  try {
    pandoc([...common,
      '-t', 'latex',
      '--pdf-engine', 'pdflatex',
      '--template', join(STYLE, 'uak-latex.template'),
      '--lua-filter', join(STYLE, 'acmart-compat.lua'),
      '-V', 'documentclass=acmart',
      '-V', 'classoption=sigconf',
      '-o', join(OUT, `${t.stem}.pdf`),
    ], env);
    console.error(`built paper/out/${t.stem}.pdf`);
  } catch {
    failed++;
  }
  try {
    pandoc([...common,
      '-t', 'docx',
      '--reference-doc', join(STYLE, 'uak-reference.docx'),
      '-o', join(OUT, `${t.stem}.docx`),
    ], env);
    console.error(`built paper/out/${t.stem}.docx`);
  } catch {
    failed++;
  }
}

process.exitCode = failed ? 1 : 0;
