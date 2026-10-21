import {chromium} from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1400,height:1100}, deviceScaleFactor:2});
await p.goto('file:///Users/blackevil/Documents/Projects/ui-design-agent-kit/output/mini-dashboard.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
console.log('TITLE', await p.title());
console.log('H1', await p.locator('h1').first().textContent());
await p.screenshot({path:'/tmp/recheck-mini.png'});
await b.close();
