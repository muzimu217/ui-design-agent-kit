import {chromium} from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const root = '/Users/blackevil/Documents/Projects/ui-design-agent-kit';
const out = path.join(root, 'video-production/assets/captures/elements');
fs.mkdirSync(out, {recursive: true});

const browser = await chromium.launch({channel: 'chrome'});

const shot = async (file, selector, name, opts = {}) => {
  const page = await browser.newPage({
    viewport: {width: opts.w ?? 1440, height: opts.h ?? 900},
    deviceScaleFactor: 2,
  });
  const errs = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
  });
  await page.goto('file://' + path.join(root, 'output', file), {waitUntil: 'load'});
  await page.waitForTimeout(1500);
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({path: path.join(out, name + '.png')});
  const box = await el.boundingBox();
  console.log(name, JSON.stringify(box), 'consoleErrors=', errs.length);
  await page.close();
};

// Hero: brand + kicker + h1 + lede + cta
await shot('site.html', '.hero', 'hero');
// Stats bar
await shot('site.html', '.stats', 'stats');
// Six gates grid
await shot('site.html', '#gates', 'gates');
// Capability table
await shot('site.html', '#caps', 'caps');
// Knowledge base block
await shot('site.html', '#kb', 'kb');
// Steps
await shot('site.html', '#how', 'how');
// Canvas index: three entry cards + stage row
await shot('canvas-index.html', 'main', 'index-main', {w: 1200, h: 1600});
await shot('canvas-index.html', '.grid', 'index-cards', {w: 1200, h: 900});
await shot('canvas-index.html', '.stages', 'index-stages', {w: 1200, h: 900});
// mini dashboard
await shot('mini-dashboard.html', 'main', 'mini-main', {w: 1200, h: 1400});
// chain
await shot('chain-canvas-workbench.html', 'main', 'chain-main', {w: 1200, h: 1400});

await browser.close();
