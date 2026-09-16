/**
 * 组件树渲染冒烟测试。
 *
 * 用 react-dom/server 把整棵组件树渲染成字符串，目的只是确认没有运行时崩溃、
 * 且契约要求的关键文案与无障碍属性真的出现在产物里。
 * 这不是浏览器验证，也不替代阶段 5 的渲染证据——它只能证明组件能渲染出预期结构。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import App, { Hero } from './App.tsx';
import { CurveCanvas, TideCurve } from './TideCurve.tsx';
import { createGeometry } from './curve.ts';
import { createTideDay, formatClock, formatLevel } from './model.ts';

/** SSR 里 ResizeObserver 拿不到尺寸，因此直接给画布一个显式内区尺寸。 */
const GEOMETRY = createGeometry(createTideDay(), { width: 335, height: 140 });

function renderCanvas() {
  const day = createTideDay();
  return renderToString(
    createElement(CurveCanvas, {
      day,
      geometry: GEOMETRY,
      cursorPoint: day.points[37],
      nowMinutes: 370,
      dragging: false,
    }),
  );
}

test('整页可以渲染出五个 section，不抛异常', () => {
  const html = renderToString(createElement(App));
  // 五个纵向 section（契约第 8 节）
  assert.ok(html.includes('id="tide-curve"'));
  assert.ok(html.includes('id="curve-in-use"'));
  assert.ok(html.includes('id="scenarios"'));
  assert.ok(html.includes('id="download"'));
  assert.ok(html.includes('id="hero-title"'));
  // 只有 html lang="zh-CN" 由 index.html 负责；这里确认没有意外出现别的语言根
  assert.ok(html.includes('潮汐 TIDE'));
});

test('首屏读数块把时间、潮位、单位、涨退潮文字与演示徽章都渲染出来', () => {
  const day = createTideDay();
  const html = renderToString(createElement(Hero, { status: 'ready', nowMinutes: 370, day }));
  assert.ok(html.includes('今日潮位 · 现在'), '读数块标签');
  assert.ok(html.includes('06:10'), '时间');
  assert.ok(html.includes('2.88'), '潮位 2 位小数');
  assert.ok(html.includes('米'), '单位');
  assert.ok(/涨潮中|退潮中|平潮/.test(html), '涨/退潮文字标签（不只靠颜色）');
  assert.ok(html.includes('演示数据'), '演示数据徽章（A2/A3）');
  assert.ok(html.includes('看今天的潮汐'), '主 CTA');
  // 主 CTA 带动作语义的锚点，指向页内曲线
  assert.ok(html.includes('href="#tide-curve"'));
});

test('首屏在加载/空态给出占位读数，不留空白也不显示假数字', () => {
  const loading = renderToString(createElement(Hero, { status: 'loading', nowMinutes: 370, day: null }));
  assert.ok(loading.includes('—.—'));
  assert.ok(loading.includes('正在载入'));
  assert.ok(!/\d\.\d{2}/.test(loading), '加载态不得出现真实的小数读数');

  const empty = renderToString(createElement(Hero, { status: 'empty', nowMinutes: 370, day: null }));
  assert.ok(empty.includes('暂无数据'));
  assert.ok(empty.includes('数据不可用'));
});

test('全页默认路径只渲染一个主 CTA（QG23）', () => {
  const html = renderToString(createElement(App));
  const primary = html.match(/primary-cta/g) ?? [];
  assert.equal(primary.length, 1);
});

test('时间轴是真正的 input[type=range]，带 min/max/step 与 aria 语义（A4）', () => {
  const day = createTideDay();
  const html = renderToString(
    createElement(TideCurve, { status: 'ready', day, step: 37, onStepChange: () => {}, nowMinutes: 370 }),
  );
  assert.ok(html.includes('type="range"'));
  assert.ok(html.includes('min="0"'));
  assert.ok(html.includes('max="144"'));
  assert.ok(html.includes('step="1"'));
  assert.ok(html.includes('value="37"'));
  assert.ok(html.includes('aria-label="潮汐时间轴，方向键调整，每步 10 分钟"'));
  assert.ok(html.includes('aria-valuetext="06:10，潮位 2.88 米，平潮"'));
  // B3：不得出现内联的 display:none / visibility:hidden
  assert.ok(!html.includes('display:none'));
  assert.ok(!html.includes('visibility:hidden'));
});

test('时间轴把当前步数写进 value，且不渲染成隐藏控件', () => {
  const day = createTideDay();
  for (const step of [0, 37, 111, 144]) {
    const html = renderToString(
      createElement(TideCurve, { status: 'ready', day, step, onStepChange: () => {}, nowMinutes: 0 }),
    );
    assert.ok(html.includes(`type="range"`));
    assert.ok(html.includes(`value="${step}"`));
  }
});

test('高低潮标注直接标在曲线上，且没有按钮样式（D1）', () => {
  const day = createTideDay();
  const html = renderCanvas();
  // 三个极值：06:10 高潮、12:20 低潮、18:30 高潮
  for (const item of day.extrema) {
    assert.ok(html.includes(formatClock(item.minutes)), `${formatClock(item.minutes)} 应出现在标注里`);
    assert.ok(html.includes(formatLevel(item.level)), `${formatLevel(item.level)} 应出现在标注里`);
  }
  // 标注是 <p>，不是 button / a —— 不可点击，也就无从呈现按钮样式
  const annotations = html.match(/<p class="curve-annotation [^"]*"[^>]*>/g) ?? [];
  assert.equal(annotations.length, 3);
  for (const tag of annotations) {
    assert.ok(!tag.includes('<button'), '标注不得是按钮');
    assert.ok(!tag.includes('tabindex'), '标注不得进入 Tab 序列');
    assert.ok(!tag.includes('role="button"'), '标注不得声明按钮角色');
  }
});

test('SVG 曲线带 role=img 与概述当日高低潮的 aria-label（契约 9.1）', () => {
  const html = renderCanvas();
  assert.ok(html.includes('role="img"'));
  assert.ok(html.includes('今日潮汐曲线'));
  assert.ok(html.includes('06:10 高潮 2.88 米'));
  assert.ok(html.includes('12:20 低潮 0.09 米'));
  // 曲线是自绘 path，没有任何外部图表库痕迹
  assert.ok(html.includes('class="curve-line"'));
  assert.ok(html.includes('class="curve-area"'));
  assert.ok(html.includes('<stop'), '渐变填充的 stop');
});

test('渐变填充的 stop-opacity 不超过 0.10（QG4 硬上限）', () => {
  // opacity 由样式表里的 .fill-stop-* 类给出，不在内联属性上。
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  const stops = [...css.matchAll(/stop-opacity:\s*([\d.]+)/g)].map(match => Number(match[1]));
  assert.ok(stops.length >= 2, '至少要有起点与终点两个 stop');
  assert.ok(Math.max(...stops) <= 0.1, `最大 stop-opacity = ${Math.max(...stops)}，不得超过 0.10`);
  // 起点必须高于终点，形成「0.10 → 0」的衰减
  assert.ok(stops[0] > stops[stops.length - 1], '填充应从起点向终点衰减');
});

test('当前时刻标记渲染出来，脉冲动画由 CSS 类驱动', () => {
  const html = renderCanvas();
  assert.ok(html.includes('class="now-marker"'));
  assert.ok(html.includes('class="now-line"'));
  assert.ok(html.includes('class="now-dot"'));
  assert.ok(html.includes('now-label'));
  assert.ok(html.includes('06:10'));
  // 脉冲的周期与缓动写在样式表里，且必须可以用减少动效关掉
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('animation: now-pulse 2400ms cubic-bezier(0.16, 1, 0.3, 1) infinite'));
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*now-pulse|now-line[\s\S]*animation: none/);
});

test('全站只有一处循环动画声明（契约 3.6）', () => {
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  const infinite = css.match(/infinite/g) ?? [];
  assert.equal(infinite.length, 2, `infinite 应只出现在 now-line 与 now-dot 上，实际 ${infinite.length} 处`);
  assert.equal((css.match(/@keyframes/g) ?? []).length, 1, '只允许一个 @keyframes');
});

test('游标渲染出来，且初始 transform 由 Motion 的内联样式给出', () => {
  const html = renderCanvas();
  assert.ok(html.includes('class="curve-cursor'));
  assert.ok(html.includes('class="cursor-line"'));
  assert.ok(html.includes('class="cursor-dot"'));
});

test('加载态渲染骨架文案，不画假曲线，时间轴存在但被禁用', () => {
  const html = renderToString(
    createElement(TideCurve, { status: 'loading', day: null, step: 37, onStepChange: () => {}, nowMinutes: 370 }),
  );
  assert.ok(html.includes('正在载入今日潮位…'));
  assert.ok(!html.includes('class="curve-line"'), '加载态不得渲染曲线');
  assert.ok(html.includes('—.—'), '占位读数');
  // 契约 9.2 的「禁用」状态：控件仍在布局中（B3），但不可操作
  assert.ok(html.includes('type="range"'), '时间轴必须保留在布局中');
  assert.ok(html.includes('disabled'), '未就绪时时间轴应为禁用');
});

test('空态渲染指导性文案，不画假曲线，时间轴同样被禁用（契约 9.1 / 9.2）', () => {
  const day = createTideDay(0);
  const html = renderToString(
    createElement(TideCurve, { status: 'empty', day, step: 37, onStepChange: () => {}, nowMinutes: 370 }),
  );
  assert.ok(html.includes('今日潮位数据暂不可用。演示数据生成失败——刷新页面可重新生成。'));
  assert.ok(!html.includes('class="curve-line"'), '空态不得渲染曲线');
  assert.ok(html.includes('暂无数据'));
  assert.ok(html.includes('type="range"'));
  assert.ok(html.includes('disabled'));
});

test('SVG 之外不出现第二个图表库的痕迹（无外部图表依赖）', () => {
  const html = renderCanvas();
  for (const forbidden of ['recharts', 'd3-', 'chart.js', 'echarts', 'victory']) {
    assert.ok(!html.includes(forbidden), `不应出现 ${forbidden}`);
  }
});

test('时间轴覆盖层与曲线内区共用同一套水平范围，游标与原生滑块不产生偏移', () => {
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  // 曲线内区只在纵向让出留白带（inset: var(--plot-inset) 0），左右为 0；
  // 时间轴 inset: 0 铺满绘图区。两者水平范围一致，value 0..144 才与曲线 x 一一对应。
  // 内区与所有覆盖层共用同一套上下 inset（--plot-inset / --plot-inset-bottom）。
  // 下带比上带高一行，好让低潮标注与时间刻度各占一行、不再重叠。
  const INSET = /inset:\s*var\(--plot-inset\)\s+0\s+var\(--plot-inset-bottom\)\s*;/;
  assert.match(css, new RegExp('\\.curve-inner\\s*\\{[^}]*' + INSET.source));
  assert.match(css, /\.tide-range\s*\{[^}]*inset:\s*0\s*;/);
  for (const cls of ['curve-annotations', 'now-marker', 'curve-cursor']) {
    const block = css.match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`));
    assert.ok(block, `${cls} 应有样式块`);
    assert.match(block[1], INSET, `${cls} 必须与 .curve-inner 共用同一套 inset，否则会被留白带整体偏移`);
  }
  // 下留白带必须确实高于上带，否则低潮标注会压住刻度行。
  const top = css.match(/--plot-inset:\s*([\d.]+)rem/);
  const bottom = css.match(/--plot-inset-bottom:\s*([\d.]+)rem/);
  assert.ok(top && bottom, '上下留白带变量都应存在');
  assert.ok(Number(bottom[1]) > Number(top[1]), '下留白带必须高于上带（避免低潮标注压刻度）');
});

test('B3：时间轴用 opacity:0 隐藏，且保留在布局中', () => {
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  const block = css.match(/\.tide-range\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(block, /opacity:\s*0/);
  assert.match(block, /position:\s*absolute/);
  assert.match(block, /width:\s*100%/);
  assert.match(block, /height:\s*100%/);
  // 绝不允许 display:none / visibility:hidden（会让控件失去可聚焦性）
  assert.ok(!/display:\s*none/.test(block));
  assert.ok(!/visibility:\s*hidden/.test(block));
  // 保留原生键盘行为
  assert.ok(!/pointer-events:\s*none/.test(block), '不得用 pointer-events:none 让控件失去可操作性');
});

test('A3：五个必标位置都渲染出演示数据徽章', () => {
  const app = renderToString(createElement(App));
  const badges = (app.match(/demo-badge/g) ?? []).length;
  assert.ok(badges >= 5, `默认路径下演示徽章至少 5 处，实际 ${badges} 处`);
  // 页脚下载区
  assert.ok(app.includes('下载 App（演示）'));
  // 场景卡里的具体数值旁
  assert.ok(app.includes('低潮 '));
});
