// 排版标准实机断言：identity 字体/双角色对比/字长/字号跳跃/tabular-nums/无 eyebrow/对比度
import { chromium } from 'playwright';

const URL = 'file://' + import.meta.dirname + '/../fixture/index.html';
const out = [];
const log = (s) => { out.push(s); console.log(s); };
let fails = 0;
const check = (name, ok, detail) => { if (!ok) fails++; log(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const cs = (sel, prop) => page.$eval(sel, (el, p) => getComputedStyle(el).getPropertyValue(p), prop);

// 1) identity 字体非 Inter/Roboto/OpenSans/system-ui，且有声线（Fraunces）
const h1Font = await cs('h1', 'font-family');
check('identity font is Fraunces (not Inter/Roboto/OpenSans/system-ui)',
  /fraunces/i.test(h1Font) && !/inter|roboto|open sans|system-ui/i.test(h1Font), h1Font);

// 2) 双角色真实对比：display serif 900 vs body sans 400（同族两字重不算配对）
const h1Weight = await cs('h1', 'font-weight');
const bodyWeight = await cs('.article p', 'font-weight');
const bodyFamily = await cs('.article p', 'font-family');
const serifVsSans = /fraunces/i.test(h1Font) && /public sans/i.test(bodyFamily);
check('two genuinely contrasting roles (Fraunces 900 display / Public Sans 400 body)',
  serifVsSans && Math.abs(Number(h1Weight) - Number(bodyWeight)) >= 300,
  `h1 ${h1Font.split(',')[0]} w${h1Weight} vs body ${bodyFamily.split(',')[0]} w${bodyWeight}`);

// 3) 正文 measure < ~80 字符（max-width 以 ch 上限）
const measurePx = parseFloat(await page.$eval('.article', (el) => getComputedStyle(el).maxWidth));
const bodyFs = parseFloat(await page.$eval('.article p', (el) => getComputedStyle(el).fontSize));
const estChars = Math.round(measurePx / (bodyFs * 0.5));
check('body measure capped under ~80ch (px-to-char estimate, avg 0.5em/char)', estChars <= 80, `${measurePx}px @ ${bodyFs}px ≈ ${estChars} chars`);

// 4) display→body 字号剧烈跳跃（≥3x，非 1.2x 级）
const h1Size = parseFloat(await cs('h1', 'font-size'));
const bodySize = parseFloat(await cs('.article p', 'font-size'));
check('display-to-body size jump dramatic (>=3x)', h1Size / bodySize >= 3, `${h1Size}px / ${bodySize}px = ${(h1Size / bodySize).toFixed(2)}x`);

// 5a) 表格数字 tabular-nums
const tdNum = await cs('td.num', 'font-variant-numeric');
check('table numerals tabular-nums', /tabular-nums/.test(tdNum), tdNum);

// 5b) 标题区无孤立强调词/all-caps 标签/无信息 eyebrow
const eyebrowScan = await page.$$eval('h1 *, .hero .eyebrow, .hero .kicker, [class*=eyebrow]', (els) => els.length);
const h1Transform = await cs('h1', 'text-transform');
check('headline free of eyebrow/all-caps decorations', eyebrowScan === 0 && h1Transform !== 'uppercase', `eyebrow nodes=${eyebrowScan}, h1 transform=${h1Transform}`);

// 6) 正文对比度实测（ink #1c2430 on paper #faf7f2 → 程序实算）
const contrast = await page.evaluate(() => {
  const lum = (hex) => {
    const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const body = getComputedStyle(document.querySelector('.article p'));
  const bg = getComputedStyle(document.body);
  const parse = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
  const L1 = lum('#' + parse(body.color).map((v) => v.toString(16).padStart(2, '0')).join(''));
  const L2 = lum('#' + parse(bg.backgroundColor).map((v) => v.toString(16).padStart(2, '0')).join(''));
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
});
check('body contrast >= 4.5:1 (computed)', contrast >= 4.5, `${contrast.toFixed(2)}:1`);

log(`console/pageerror: ${errors.length === 0 ? '0 条' : errors.join(' | ')}`);
await page.screenshot({ path: import.meta.dirname + '/typography-full.png', fullPage: true });
log('截图: evidence/typography-full.png');
check('console clean', errors.length === 0, `${errors.length}`);

await browser.close();
(await import('node:fs/promises')).writeFile(import.meta.dirname + '/typography-verify-result.txt', out.join('\n'));
console.log(`\nTOTAL FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
