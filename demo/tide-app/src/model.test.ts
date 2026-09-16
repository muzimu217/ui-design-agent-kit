import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AXIS_MAX,
  DAY_MINUTES,
  SLACK_RATE_M_PER_HOUR,
  SAMPLE_COUNT,
  SAMPLE_INTERVAL_MINUTES,
  buildCurveInUse,
  buildScenarioValues,
  createTideDay,
  detectExtrema,
  formatClock,
  formatLevel,
  formatLevelWithUnit,
  formatWindow,
  generatePoints,
  levelAtMinutes,
  minutesForStep,
  readoutSentence,
  stepForDate,
  stepForMinutes,
  summarizeDay,
  trendAtMinutes,
  trendLabel,
} from './model.ts';

/* ------------------------------------------------------------ 演示数据生成 */

test('默认生成 145 个采样点，覆盖 00:00–24:00，每点 10 分钟', () => {
  const day = createTideDay();
  assert.equal(day.points.length, SAMPLE_COUNT);
  assert.equal(day.points.length, 145);
  assert.equal(day.points[0].minutes, 0);
  assert.equal(day.points[AXIS_MAX].minutes, DAY_MINUTES);
  for (let index = 1; index < day.points.length; index += 1) {
    assert.equal(day.points[index].minutes - day.points[index - 1].minutes, SAMPLE_INTERVAL_MINUTES);
    assert.equal(day.points[index].step, index);
  }
});

test('采样点取值等于契约公式 h(t) 的解析值', () => {
  const day = createTideDay();
  for (const point of day.points) {
    assert.equal(point.level, levelAtMinutes(point.minutes));
  }
  // 曲线不出现负潮位（相对最低低潮面）
  assert.ok(day.levelMin > 0, `levelMin=${day.levelMin} 应为正`);
});

test('曲线是半日潮：一天内两次高潮、一次低潮', () => {
  const day = createTideDay();
  const highs = day.extrema.filter(item => item.kind === 'high');
  const lows = day.extrema.filter(item => item.kind === 'low');
  assert.equal(highs.length, 2);
  assert.equal(lows.length, 1);
  // 高低潮的时刻落在契约给的示例区间附近（高潮 06:11 与 18:30 附近）
  assert.equal(formatClock(highs[0].minutes), '06:10');
  assert.equal(formatClock(lows[0].minutes), '12:20');
  assert.equal(formatClock(highs[1].minutes), '18:30');
  // 高潮是当日量级的上沿，低潮贴近基准面
  assert.ok(highs[0].level > 2.5, `highs[0]=${highs[0].level}`);
  assert.ok(highs[1].level > 2.5, `highs[1]=${highs[1].level}`);
  assert.ok(lows[0].level < 0.2, `lows[0]=${lows[0].level}`);
});

test('极值识别不把端点当作极值（当日的首尾点不标注）', () => {
  const points = generatePoints();
  const extrema = detectExtrema(points);
  assert.ok(extrema.every(item => item.step > 0 && item.step < AXIS_MAX));
  assert.ok(!extrema.some(item => item.step === 0 || item.step === AXIS_MAX));
});

test('极值识别可以处理平台与单调序列', () => {
  const flat = [
    { step: 0, minutes: 0, level: 1 },
    { step: 1, minutes: 10, level: 1 },
    { step: 2, minutes: 20, level: 1 },
  ];
  assert.deepEqual(detectExtrema(flat), []);

  const rising = [
    { step: 0, minutes: 0, level: 0 },
    { step: 1, minutes: 10, level: 1 },
    { step: 2, minutes: 20, level: 2 },
  ];
  assert.deepEqual(detectExtrema(rising), []);

  const peak = [
    { step: 0, minutes: 0, level: 0 },
    { step: 1, minutes: 10, level: 2 },
    { step: 2, minutes: 20, level: 1 },
  ];
  const found = detectExtrema(peak);
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, 'high');
  assert.equal(found[0].step, 1);
});

test('采点数为 0 或者 1 时返回空数据，不伪造曲线', () => {
  assert.deepEqual(generatePoints(0), []);
  assert.deepEqual(generatePoints(1), []);
  const empty = createTideDay(0);
  assert.deepEqual(empty.points, []);
  assert.equal(empty.summary, null);
  assert.equal(empty.extrema.length, 0);
});

/* -------------------------------------------------------------- 涨退潮判断 */

test('涨退潮判断与曲线走向一致，极值附近判为平潮', () => {
  assert.equal(trendAtMinutes(180), 'rising'); // 03:00 涨潮段
  assert.equal(trendAtMinutes(600), 'falling'); // 10:00 退潮段
  assert.equal(trendAtMinutes(740), 'slack'); // 12:20 低潮附近
  assert.equal(trendAtMinutes(1110), 'slack'); // 18:30 高潮附近
  assert.equal(trendLabel('rising'), '涨潮中');
  assert.equal(trendLabel('falling'), '退潮中');
  assert.equal(trendLabel('slack'), '平潮');
});

test('平潮阈值是斜率阈值：恰好落在阈值上的变化率判为平潮', () => {
  // 构造两个已知差值：直接用 30 分钟中心差分反推
  const half = 30;
  const rate = (levelAtMinutes(half) - levelAtMinutes(0)) / (half / 60);
  const expected = Math.abs(rate) > SLACK_RATE_M_PER_HOUR ? (rate > 0 ? 'rising' : 'falling') : 'slack';
  assert.equal(trendAtMinutes(0), expected);
});

/* ---------------------------------------------------------------- 使用窗口 */

test('赶海窗口是低潮前两小时，且时刻与低潮对得上', () => {
  const day = createTideDay();
  const foraging = day.summary?.foraging;
  assert.ok(foraging);
  assert.equal(formatClock(foraging.toMinutes), '12:20');
  assert.equal(formatClock(foraging.fromMinutes), '10:20');
  assert.equal(foraging.toMinutes - foraging.fromMinutes, 120);
  assert.equal(foraging.low.kind, 'low');
  assert.equal(foraging.low.minutes, foraging.toMinutes);
});

test('海钓窗口取的是涨潮最急的两小时，且净上涨为正', () => {
  const day = createTideDay();
  const fishing = day.summary?.fishing;
  assert.ok(fishing);
  assert.ok(fishing.gain > 0);
  assert.equal(fishing.toMinutes - fishing.fromMinutes, 120);
  assert.ok(fishing.toLevel > fishing.fromLevel);
  assert.equal(fishing.toLevel - fishing.fromLevel, fishing.gain);
});

test('低潮发生得太早时赶海窗口为空，不写死时刻', () => {
  const earlyLow = { step: 3, minutes: 30, level: 0.2, kind: 'low' as const };
  const summary = summarizeDay(generatePoints(), [
    { step: 37, minutes: 370, level: 2.9, kind: 'high' },
    earlyLow,
  ]);
  assert.ok(summary);
  assert.equal(summary.foraging, null);
});

test('数据不足以判断时 summary 为 null', () => {
  assert.equal(summarizeDay([], []), null);
  assert.equal(summarizeDay(generatePoints(1), []), null);

  const flat = [
    { step: 0, minutes: 0, level: 1 },
    { step: 1, minutes: 10, level: 1 },
    { step: 2, minutes: 20, level: 1 },
  ];
  assert.equal(summarizeDay(flat, []), null);
});

/* ------------------------------------------------------------------ 格式化 */

test('时间用 24 小时制并补零，24:00 与 00:00 都是合法值', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(370), '06:10');
  assert.equal(formatClock(740), '12:20');
  assert.equal(formatClock(860), '14:20');
  assert.equal(formatClock(DAY_MINUTES), '24:00');
  assert.equal(formatClock(-30), '00:00');
  assert.equal(formatClock(2000), '24:00');
});

test('潮位保留 2 位小数并带单位', () => {
  assert.equal(formatLevel(1.324), '1.32');
  assert.equal(formatLevel(0.0924), '0.09');
  assert.equal(formatLevel(2.9295), '2.93');
  assert.equal(formatLevel(0), '0.00');
  assert.equal(formatLevelWithUnit(1.324), '1.32 米');
  // 2 位小数 → 读数宽度恒定（B1：0.00 → 9.99 不改变字符数）
  assert.equal(formatLevel(0).length, formatLevel(9.99).length);
});

test('时间轴步数与分钟数互为逆运算', () => {
  assert.equal(stepForMinutes(0), 0);
  assert.equal(stepForMinutes(DAY_MINUTES), AXIS_MAX);
  assert.equal(stepForMinutes(370), 37);
  assert.equal(stepForMinutes(-100), 0);
  assert.equal(stepForMinutes(9999), AXIS_MAX);
  assert.equal(minutesForStep(0), 0);
  assert.equal(minutesForStep(AXIS_MAX), DAY_MINUTES);
  assert.equal(minutesForStep(37), 370);
  // 任意分钟数都能吸附到 10 分钟刻度上
  for (const minutes of [0, 1, 4, 5, 1234, 1439, 1440]) {
    const step = stepForMinutes(minutes);
    assert.equal(step, Math.round(step));
    assert.ok(step >= 0 && step <= AXIS_MAX);
  }
});

test('当前时刻映射到时间轴步数，且始终落在合法范围内', () => {
  assert.equal(stepForDate(new Date(2026, 8, 16, 6, 10)), 37);
  assert.equal(stepForDate(new Date(2026, 8, 16, 0, 0)), 0);
  assert.equal(stepForDate(new Date(2026, 8, 16, 23, 59)), AXIS_MAX);
});

test('读数整句用于 aria-valuetext，形式为「时刻，潮位 x.xx 米，涨/退潮」', () => {
  assert.equal(readoutSentence(370, levelAtMinutes(370)), '06:10，潮位 2.88 米，平潮');
  assert.equal(readoutSentence(860, levelAtMinutes(860)), '14:20，潮位 0.76 米，涨潮中');
  assert.match(readoutSentence(600, levelAtMinutes(600)), /^10:00，潮位 \d\.\d{2} 米，(涨潮中|退潮中|平潮)$/);
});

test('窗口格式化用中文连接号', () => {
  assert.equal(formatWindow({ fromMinutes: 620, toMinutes: 740 }), '10:20–12:20');
});

/* ------------------------------------------------- 第三屏与场景卡（B2 / A3） */

test('第三屏的判断全部由同一天的数据推出，且不解释潮汐原理', () => {
  const day = createTideDay();
  const items = buildCurveInUse(day);
  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map(item => item.id),
    ['foraging', 'fishing', 'photography'],
  );

  const values = day.summary;
  assert.ok(values);
  const foraging = items.find(item => item.id === 'foraging');
  const fishing = items.find(item => item.id === 'fishing');
  const photography = items.find(item => item.id === 'photography');
  assert.ok(foraging && fishing && photography);

  // 数值必须能在数据里找到对应来源
  assert.ok(foraging.value.includes(formatClock(values.foraging!.toMinutes)));
  assert.ok(foraging.value.includes(formatLevel(values.foraging!.low.level)));
  assert.ok(fishing.value.includes(formatClock(values.fishing!.fromMinutes)));
  assert.ok(fishing.body.includes(formatLevelWithUnit(values.fishing!.fromLevel)));
  assert.ok(photography.value.includes(formatClock(values.highest.minutes)));

  // 不解释潮汐原理：不出现科普词
  const text = items.map(item => `${item.title}${item.body}${item.value}`).join('');
  for (const forbidden of ['月球', '引力', '一天两次', '什么是潮汐', '原理', '太阳']) {
    assert.ok(!text.includes(forbidden), `第三屏不应出现「${forbidden}」`);
  }
});

test('数据不可用时第三屏为空数组，不产出编造数值', () => {
  const empty = createTideDay(0);
  assert.deepEqual(buildCurveInUse(empty), []);
  assert.equal(buildScenarioValues(empty), null);
});

test('三张场景卡的数值与曲线同源', () => {
  const day = createTideDay();
  const values = buildScenarioValues(day);
  const summary = day.summary;
  assert.ok(values && summary);
  assert.equal(values.fishing, formatWindow(summary.fishing!));
  assert.ok(values.foraging.includes(formatClock(summary.foraging!.low.minutes)));
  assert.ok(values.foraging.includes(formatLevelWithUnit(summary.foraging!.low.level)));
  assert.ok(values.photography.includes(formatClock(summary.highest.minutes)));
  assert.ok(values.photography.includes(formatLevelWithUnit(summary.highest.level)));
});

test('当日潮差等于最高潮位减最低潮位', () => {
  const day = createTideDay();
  const summary = day.summary;
  assert.ok(summary);
  assert.equal(summary.tidalRange, summary.highest.level - summary.lowest.level);
  assert.equal(summary.highest.kind, 'high');
  assert.equal(summary.lowest.kind, 'low');
  assert.ok(summary.tidalRange > 2.5 && summary.tidalRange < 3.2);
});
