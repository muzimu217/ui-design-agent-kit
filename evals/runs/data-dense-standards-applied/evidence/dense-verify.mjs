// 数据密集标准实机断言：密度/粘性表头/右对齐 tabular/列宽稳定/三通道状态/空态/骨架/批量逐条报告
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const base = 'file://' + fileURLToPath(new URL('../fixture/index.html', import.meta.url));
const out = [];
const log = (s) => { out.push(s); console.log(s); };
let fails = 0;
const check = (name, ok, detail) => { if (!ok) fails++; log(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`); };

const browser = await chromium.launch();

// ===== A. 骨架场景（?skeleton=1：骨架持续展示） =====
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + '?skeleton=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  const skelVisible = await page.$eval('#skel', (el) => el.offsetParent !== null && el.offsetHeight > 0);
  const skelCols = await page.$$eval('#skel td', (tds) => new Set(tds.map((t) => t.cellIndex)).size);
  const realCols = await page.$$eval('#ledger thead th', (ths) => ths.length);
  const emptyHidden = await page.$eval('#empty', (el) => getComputedStyle(el).display === 'none');
  check('骨架行与真实表列数一致（12 列）', skelVisible && skelCols === realCols, `skeleton cols=${skelCols}/${realCols}`);
  check('加载期间空态不抢显', emptyHidden, 'empty display:none during load');
  await page.close();
}

// ===== B. 主场景（数据加载后） =====
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelectorAll('#rows tr').length > 0);

// 1) 紧凑行高（≤40px）且字号不缩（≥13px），粘性表头
const rowH = await page.$eval('#rows tr td', (el) => el.getBoundingClientRect().height);
const fontSize = await page.$eval('#rows tr td', (el) => getComputedStyle(el).fontSize);
check('紧凑行高 ≤40px', rowH <= 40, `${rowH.toFixed(1)}px`);
check('字号不缩水（≥13px）', parseFloat(fontSize) >= 13, fontSize);
const stickyPos = await page.$eval('#ledger thead th', (el) => getComputedStyle(el).position);
await page.$eval('.tablebox', (el) => { el.scrollTop = 400; });
await page.waitForTimeout(80);
const thTop = await page.$eval('#ledger thead th', (el) => el.getBoundingClientRect().top);
const boxTop = await page.$eval('.tablebox', (el) => el.getBoundingClientRect().top);
check('粘性表头（sticky + 滚动后钉在容器顶）', stickyPos === 'sticky' && Math.abs(thTop - boxTop) < 2, `pos=${stickyPos}, thTop=${thTop.toFixed(1)} vs boxTop=${boxTop.toFixed(1)}`);
await page.$eval('.tablebox', (el) => { el.scrollTop = 0; });

// 2) 数字列右对齐 + tabular-nums
const numAlign = await page.$eval('#rows tr td.num', (el) => getComputedStyle(el).textAlign);
const numVar = await page.$eval('#rows tr td.num', (el) => getComputedStyle(el).fontVariantNumeric);
check('数字列右对齐 + tabular-nums', numAlign === 'right' && /tabular-nums/.test(numVar), `${numAlign} / ${numVar}`);

// 3) 列宽稳定：数据刷新前后表头/列宽一致
const widthsBefore = await page.$$eval('#ledger thead th', (ths) => ths.map((t) => Math.round(t.getBoundingClientRect().width)));
await page.fill('#f-name', '库存品 00'); await page.waitForTimeout(60);
await page.fill('#f-name', ''); await page.waitForTimeout(80);
const widthsAfter = await page.$$eval('#ledger thead th', (ths) => ths.map((t) => Math.round(t.getBoundingClientRect().width)));
check('列宽稳定（刷新前后一致，不回流）', JSON.stringify(widthsBefore) === JSON.stringify(widthsAfter), `${widthsBefore.join(',')} vs ${widthsAfter.join(',')}`);

// 4) 三通道状态（颜色+形状+文字）
const stSample = await page.$eval('#rows .st', (el) => ({ cls: el.className, shape: el.querySelector('.shape')?.textContent, text: el.textContent.replace(/\s/g, '') }));
check('状态三通道（颜色 class + 形状 glyph + 文字标签）',
  /ok|warn|out/.test(stSample.cls) && !!stSample.shape && /[\u4e00-\u9fa5]/.test(stSample.text),
  JSON.stringify(stSample));

// 5) 空态=行动邀请（筛选至零结果）
await page.fill('#f-name', '不存在的品名XYZ');
await page.waitForTimeout(60);
const emptyShown = await page.$eval('#empty', (el) => el.offsetParent !== null);
const firstAction = await page.$eval('#first-btn', (el) => el.textContent);
check('空态=首条记录行动邀请（非裸暂无数据）', emptyShown && firstAction.includes('新建第一张'), firstAction);
await page.fill('#f-name', ''); await page.waitForTimeout(60);

// 6) 批量归档：逐行选择 + 三态全选 + 逐条结果报告
await page.click('#sel-all'); // 全选 300 条（含缺货→将逐条跳过）
await page.waitForTimeout(60);
const bulkShown = await page.$eval('#bulkbar', (el) => el.offsetParent !== null);
const selCount = await page.$eval('#sel-count', (el) => el.textContent);
const triState = await page.$eval('#sel-all', (el) => ({ checked: el.checked, indeterminate: el.indeterminate }));
// 取消 1 条 → 半选态
await page.$eval('#rows tr .row-sel', (el) => { el.checked = false; el.dispatchEvent(new Event('change')); });
await page.waitForTimeout(40);
const triAfter = await page.$eval('#sel-all', (el) => ({ checked: el.checked, indeterminate: el.indeterminate }));
check('全选=三态（全选/半选）', triState.checked === true && triAfter.indeterminate === true, `全选后=${JSON.stringify(triState)} 取消一条后=${JSON.stringify(triAfter)}`);
await page.click('#archive-btn');
await page.waitForTimeout(80);
const repShown = await page.$eval('#report', (el) => el.offsetParent !== null);
const repRows = await page.$$eval('#report-rows tr', (trs) => trs.length);
const repHasSkip = await page.$eval('#report', (el) => el.textContent.includes('已跳过'));
const repHasOk = await page.$eval('#report', (el) => el.textContent.includes('已归档'));
check('批量归档=逐条结果报告（含成功与跳过原因）', repShown && repRows > 0 && repHasOk && repHasSkip,
  `报告行数=${repRows}, 含已归档=${repHasOk}, 含跳过原因=${repHasSkip}`);

log(`console/pageerror: ${errors.length === 0 ? '0 条' : errors.join(' | ')}`);
await page.screenshot({ path: new URL('../evidence/dense-bulk-report.png', import.meta.url).pathname, fullPage: false });
check('console clean', errors.length === 0, `${errors.length}`);

await browser.close();
(await import('node:fs/promises')).writeFile(new URL('../evidence/dense-verify-result.txt', import.meta.url), out.join('\n'));
console.log(`\nTOTAL FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
