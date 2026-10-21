import {chromium} from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1400,height:1100}, deviceScaleFactor:2});
await p.goto('file:///Users/blackevil/Documents/Projects/ui-design-agent-kit/output/mini-dashboard.html',{waitUntil:'load'});
await p.waitForTimeout(1000);
for (const sel of ['main','.board','video','footer','h1']) {
  const el = p.locator(sel).first();
  if (await el.count()) console.log(sel, JSON.stringify(await el.boundingBox()));
}
await b.close();
