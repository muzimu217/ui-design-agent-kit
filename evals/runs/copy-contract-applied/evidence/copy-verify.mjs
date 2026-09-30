// 文案契约实机断言：机制词清零/CTA 结果导向/动作词一致/错误含因与修/空态行动邀请
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const PAGE_URL = 'file://' + fileURLToPath(new URL('../fixture/index.html', import.meta.url));
const out = [];
const log = (s) => { out.push(s); console.log(s); };
let fails = 0;
const check = (name, ok, detail) => { if (!ok) fails++; log(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
const bodyText = await page.evaluate(() => document.body.innerText);

// 1) 机制词清零：设置面板不得以内部机制命名功能
const mechHits = ['Webhook', 'API', 'Token', '推送配置', '回调'].filter((w) => bodyText.includes(w));
const hasUserSideName = bodyText.includes('到货提醒') && bodyText.includes('低库存警报');
check('功能按用户视角命名（机制词 0 命中 + 用户侧名称在位）',
  mechHits.length === 0 && hasUserSideName, `机制词命中=${mechHits.length}（${mechHits.join(',')}）`);

// 2) CTA 结果导向：保存按钮点名按下去的结果
const saveText = await page.$eval('#save-btn', (el) => el.textContent.trim());
check('CTA 主动语态+点名结果（保存提醒设置）', saveText === '保存提醒设置', saveText);

// 3) 动作词一致：点击保存后，动作记录用同一个「保存」词
await page.click('#save-btn');
const logAfterSave = await page.$eval('#action-log', (el) => el.textContent);
check('动作词跨按钮/记录一致（保存）', logAfterSave.includes('保存'), logAfterSave);

// 4) 错误态：说清发生了什么 + 怎么修（含原因与修复路径，非纯道歉）
const errText = await page.$eval('.error', (el) => el.textContent);
const hasCause = errText.includes('网络') || errText.includes('断开');
const hasRepair = errText.includes('重试保存') || errText.includes('复制设置内容');
const notApologyOnly = !(errText.trim() === '出错了，请重试') && errText.length > 30;
check('错误=原因+修复路径（非纯道歉含糊）', hasCause && hasRepair && notApologyOnly,
  `原因=${hasCause} 修复=${hasRepair} 长度=${errText.trim().length}`);

// 5) 空态：行动邀请（非光秃秃「暂无数据」）
const emptyBtn = await page.$eval('#new-btn', (el) => el.textContent.trim());
const emptyHasGuide = await page.$eval('.empty p', (el) => el.textContent.includes('建第一张'));
check('空态=行动邀请（新建按钮+引导语）', !!emptyBtn && emptyHasGuide, `${emptyBtn} / ${emptyHasGuide}`);

// 6) 负路径：裸「暂无数据」不得出现
check('负路径：裸「暂无数据」0 命中', !bodyText.includes('暂无数据'), '0 命中');

log(`console/pageerror: ${errors.length === 0 ? '0 条' : errors.join(' | ')}`);
await page.screenshot({ path: new URL('../evidence/copy-states.png', import.meta.url).pathname, fullPage: true });
check('console clean', errors.length === 0, `${errors.length}`);

await browser.close();
(await import('node:fs/promises')).writeFile(new URL('../evidence/copy-verify-result.txt', import.meta.url), out.join('\n'));
console.log(`\nTOTAL FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
