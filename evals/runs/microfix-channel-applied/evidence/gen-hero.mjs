import { chromium } from 'playwright';
const browser = await chromium.launch();
const gen = async (label, bg, fg, path) => {
  const page = await browser.newPage({ viewport: { width: 912, height: 240 } });
  await page.setContent(`<div style="width:100%;height:240px;background:${bg};display:flex;align-items:center;justify-content:center;font:600 22px 'PingFang SC',sans-serif;color:${fg}">${label}</div>`);
  await page.screenshot({ path });
  await page.close();
};
await gen('运营台首屏示意 · v1（现版）', '#e8eef2', '#26343d', '/tmp/hero-v1.webp'.replace('.webp','.png'));
await gen('运营台首屏示意 · v2（用户上传新版）', '#dff0e8', '#177656', '/tmp/hero-v2.png');
await browser.close();
console.log('generated');
