import { chromium } from 'playwright';
import path from 'node:path';
const root = '/Users/blackevil/Documents/Projects/ui-design-agent-kit';
const out = path.join(root, 'video-production/assets/captures');
const browser = await chromium.launch({ channel: 'chrome' });
const targets = [
  ['site.html', 'site', 1600, 1000, 0],
  ['site.html', 'site-hero', 1600, 1000, 0],
  ['canvas-index.html', 'canvas-index', 1400, 1400, 0],
  ['mini-dashboard.html', 'mini-dashboard', 1400, 1100, 0],
  ['chain-canvas-workbench.html', 'chain', 1400, 1200, 0],
  ['canvas-workbench.html', 'workbench', 1400, 1100, 0],
];
for (const [file, name, w, h, scroll] of targets) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(root, 'output', file), { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(out, name + '.png'), fullPage: false });
  await page.screenshot({ path: path.join(out, name + '-full.png'), fullPage: true });
  console.log(name, 'ok', 'consoleErrors=', errs.length, errs.slice(0,2));
  await page.close();
}
await browser.close();
