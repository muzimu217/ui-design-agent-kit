// 真实复现尝试：对当前构建（design-contract-quality fixture v2）清点破坏性控件并实测
// 报告声称「demo 的删除按钮坏了」——本脚本回答：当前构建有没有删除按钮？现有控件是否正常？
import { chromium } from 'playwright';

const URL = 'http://localhost:4199/';
const out = [];
const log = (s) => { out.push(s); console.log(s); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(URL, { waitUntil: 'networkidle' });

// 1) 控件清点：当前构建里所有按钮
const buttons = await page.$$eval('button', (bs) => bs.map((b) => b.textContent.trim() || b.getAttribute('aria-label')));
log('## 当前构建全部按钮：');
buttons.forEach((b) => log('  - ' + b));
const hasDelete = buttons.some((t) => t.includes('删除') || /delete/i.test(t));
log(`\n删除按钮存在性：${hasDelete ? '存在' : '不存在（报告所称「删除按钮」无法映射到当前构建）'}`);

// 2) 现有破坏性/变更控件实测：出库 → 库存-5 → 入库 → 恢复 → 重置 → 回到种子
const row = page.locator('tbody tr').first();
const sku = await row.locator('td').first().textContent();
const stockBefore = await row.locator('td').nth(2).textContent();
await page.getByLabel(`${sku} 出库 5`).click();
const stockAfterOut = await row.locator('td').nth(2).textContent();
await page.getByLabel(`${sku} 入库 5`).click();
const stockAfterIn = await row.locator('td').nth(2).textContent();
await page.getByTitle('清空本地数据，恢复初始种子库存').click();
const stockAfterReset = await row.locator('td').nth(2).textContent();
log(`\n## 现有控件实测（SKU=${sku}）：`);
log(`  库存 初=${stockBefore} → 出库5后=${stockAfterOut} → 入库5后=${stockAfterIn} → 重置后=${stockAfterReset}`);
log(`  出库断言：${Number(stockAfterOut) === Number(stockBefore) - 5 ? 'PASS' : 'FAIL'}；入库断言：${Number(stockAfterIn) === Number(stockAfterOut) + 5 ? 'PASS' : 'FAIL'}；重置断言：${stockAfterReset === stockBefore ? 'PASS' : 'FAIL'}`);

// 3) console 错误与截图
log(`\nconsole/pageerror：${errors.length === 0 ? '0 条' : errors.join(' | ')}`);
await page.screenshot({ path: 'evidence/repro-attempt.png', fullPage: true });
log('截图：evidence/repro-attempt.png');

await browser.close();
(await import('node:fs/promises')).writeFile('evidence/repro-attempt-result.txt', out.join('\n'));
