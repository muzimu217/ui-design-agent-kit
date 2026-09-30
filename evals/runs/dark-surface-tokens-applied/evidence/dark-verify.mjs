// 暗色表面 token 实机断言：阶梯/非纯黑/文字梯度/强调色重校准/双值 token/组件零硬编码 hex
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const PAGE_URL = 'file://' + fileURLToPath(new URL('../fixture/index.html', import.meta.url));
const out = [];
const log = (s) => { out.push(s); console.log(s); };
let fails = 0;
const check = (name, ok, detail) => { if (!ok) fails++; log(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`); };
const lum = (rgbStr) => {
  const c = rgbStr.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
    const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

// 1) 表面亮度阶梯：base < card < raised（抬升更亮，非阴影）
const bgL = lum(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
const cardL = lum(await page.$eval('.card', (el) => getComputedStyle(el).backgroundColor));
const raisedL = lum(await page.$eval('.panel', (el) => getComputedStyle(el).backgroundColor));
check('表面亮度阶梯 base<card<raised', bgL < cardL && cardL < raisedL,
  `${bgL.toFixed(4)} < ${cardL.toFixed(4)} < ${raisedL.toFixed(4)}`);

// 2) 非纯黑基面 + 低不透明度白色描边
const bgRgb = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const borderRgb = await page.$eval('.card', (el) => getComputedStyle(el).borderColor);
check('基面非纯黑（tinted near-black）', bgRgb !== 'rgb(0, 0, 0)', bgRgb);
check('描边为低不透明度白（rgba 白基）', /rgba\(255, 255, 255, 0\.0?\d+\)/.test(borderRgb), borderRgb);

// 3) 文字梯度：正文 near-white（非纯白）+ secondary/placeholder 独立三档
const text = await page.evaluate(() => getComputedStyle(document.body).color);
const secondary = await page.$eval('.card h2', (el) => getComputedStyle(el).color);
const placeholder = await page.$eval('.ph', (el) => getComputedStyle(el, '::placeholder').color);
const distinct = new Set([text, secondary, placeholder]).size === 3;
check('正文 near-white 非纯白', text !== 'rgb(255, 255, 255)', text);
check('三档文字独立（primary/secondary/placeholder）', distinct, `${text} / ${secondary} / ${placeholder}`);

// 4) 强调色为暗面重校准（亮度高于浅色主题 token #177656）
const accentDark = await page.$eval('.btn-accent', (el) => getComputedStyle(el).backgroundColor);
check('强调色暗面重校准（亮度 > 浅色版 #177656）', lum(accentDark) > lum('rgb(23, 118, 86)'), `${accentDark} vs rgb(23, 118, 86)`);

// 5) 双值 token：hex 只出现在 :root/[data-theme] 块，组件规则零硬编码
const hexScan = await page.evaluate(() => {
  const sheetRules = [];
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText && !/^:root/.test(rule.selectorText) && !/\[data-theme/.test(rule.selectorText)) {
        const hexes = rule.cssText.match(/#[0-9a-fA-F]{3,8}\b/g);
        if (hexes) sheetRules.push({ sel: rule.selectorText, hexes });
      }
    }
  }
  return sheetRules;
});
check('组件规则零硬编码 hex（hex 仅存在于 token 定义块）', hexScan.length === 0, JSON.stringify(hexScan));

// 6) 对比度：正文与强调按钮文字（程序实算）
const bodyContrast = (await page.evaluate(() => {
  const lum = (rgbStr) => {
    const c = rgbStr.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
      const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const t = getComputedStyle(document.body).color, b = getComputedStyle(document.body).backgroundColor;
  return (Math.max(lum(t), lum(b)) + 0.05) / (Math.min(lum(t), lum(b)) + 0.05);
})).toFixed(2);
check('正文对比度 >= 4.5:1（实算）', Number(bodyContrast) >= 4.5, `${bodyContrast}:1`);

log(`console/pageerror: ${errors.length === 0 ? '0 条' : errors.join(' | ')}`);
await page.screenshot({ path: new URL('../evidence/dark-full.png', import.meta.url).pathname, fullPage: true });
check('console clean', errors.length === 0, `${errors.length}`);

await browser.close();
(await import('node:fs/promises')).writeFile(new URL('../evidence/dark-verify-result.txt', import.meta.url), out.join('\n'));
console.log(`\nTOTAL FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
