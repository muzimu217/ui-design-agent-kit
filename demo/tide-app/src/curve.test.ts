import test from 'node:test';
import assert from 'node:assert/strict';
import { AXIS_MAX, DAY_MINUTES, createTideDay } from './model.ts';
import {
  buildAreaPath,
  buildGridLevels,
  buildLinePath,
  createGeometry,
  minutesForTick,
  xForMinutes,
  xForPoint,
  yForLevel,
  yForPoint,
} from './curve.ts';

/** `.curve-inner` 的像素尺寸（内区，已排除 CSS 留白带）。 */
const BOX = { width: 335, height: 140 };

test('绘图几何把当日极值映射到内区的上下沿', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, BOX);
  // 最高潮位在内区上沿 y=0，最低潮位在内区下沿 y=height
  assert.ok(Math.abs(yForLevel(day.levelMax, geometry) - 0) < 1e-9);
  assert.ok(Math.abs(yForLevel(day.levelMin, geometry) - BOX.height) < 1e-9);
  // 极值之间的映射是单调的：潮位越高，y 越小
  assert.ok(yForLevel(2, geometry) < yForLevel(1, geometry));
});

test('横轴 00:00 在 x=0、24:00 在 x=内区宽度', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, BOX);
  assert.equal(xForMinutes(0, geometry), 0);
  assert.equal(xForMinutes(DAY_MINUTES, geometry), BOX.width);
  assert.equal(xForMinutes(DAY_MINUTES / 2, geometry), BOX.width / 2);
  // 越界值被夹住，不产生超出容器的坐标
  assert.equal(xForMinutes(-100, geometry), 0);
  assert.equal(xForMinutes(9999, geometry), BOX.width);
});

test('测量尺寸为 0 时给安全兜底，不产生除零或 NaN', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, { width: 0, height: 0 });
  assert.ok(geometry.width >= 1 && geometry.height >= 1);
  assert.ok(Number.isFinite(yForLevel(day.levelMax, geometry)));
  assert.ok(Number.isFinite(xForMinutes(720, geometry)));
  assert.ok(buildLinePath(day.points, geometry).length > 0);
  assert.ok(!buildLinePath(day.points, geometry).includes('NaN'));
});

test('曲线路径经过每一个采样点，且是平滑的（不是折线）', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, BOX);
  const path = buildLinePath(day.points, geometry);

  assert.ok(path.startsWith('M'));
  assert.ok(!path.includes('NaN'));
  // 平滑路径：每段用三次贝塞尔（C），而不是逐点直线（L）。
  assert.ok(path.includes('C'), '路径应含三次贝塞尔段');
  assert.equal((path.match(/L/g) ?? []).length, 0, '平滑曲线不应含直线段');

  // 关键不变量：曲线必须精确穿过每个采样点，否则曲线与读数会不一致。
  // 每段 C 的终点就是下一个采样点，故段数应为 points.length - 1。
  assert.equal((path.match(/C/g) ?? []).length, day.points.length - 1);
  const last = day.points[day.points.length - 1];
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const expectedEnd = `${round2(xForPoint(last, geometry))} ${round2(yForPoint(last, geometry))}`;
  assert.ok(path.trimEnd().endsWith(expectedEnd), `路径终点应落在最后一个采样点 ${expectedEnd}`);
});

test('填充区域闭合到内区下沿，形成封闭路径', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, BOX);
  const area = buildAreaPath(day.points, geometry);
  assert.ok(area.startsWith('M'));
  assert.ok(area.endsWith('Z'));
  assert.ok(area.includes(String(geometry.height)));
  assert.ok(!area.includes('NaN'));
});

test('网格线只取落在纵轴范围内的整半米刻度', () => {
  const day = createTideDay();
  const geometry = createGeometry(day, BOX);
  const levels = buildGridLevels(geometry);
  assert.ok(levels.length > 0);
  for (const level of levels) {
    assert.ok(level >= geometry.domainMin - 1e-9 && level <= geometry.domainMax + 1e-9);
    assert.equal(Math.round(level * 10) / 10, level);
  }
});

test('空数据不产生路径，避免画布报错', () => {
  const empty = createTideDay(0);
  const geometry = createGeometry(empty, BOX);
  assert.equal(buildLinePath(empty.points, geometry), '');
  assert.equal(buildAreaPath(empty.points, geometry), '');
});

test('时间刻度步数换算成 6 小时一格的时刻', () => {
  assert.equal(minutesForTick(0), 0);
  assert.equal(minutesForTick(36), 360);
  assert.equal(minutesForTick(72), 720);
  assert.equal(minutesForTick(108), 1080);
  assert.equal(minutesForTick(AXIS_MAX), DAY_MINUTES);
});

test('四种断点的内区尺寸都得到正的高度与有效映射', () => {
  const day = createTideDay();
  // 契约第 8 节：绘图区高 200 / 240 / 280 / 320，扣除上下各 30px 留白带即为内区高。
  for (const box of [
    { width: 280, height: 140 }, // 320 宽窄视口
    { width: 335, height: 140 }, // 375 宽
    { width: 576, height: 180 }, // 640 宽
    { width: 944, height: 220 }, // 1024 宽
    { width: 1352, height: 260 }, // 1280 宽
  ]) {
    const geometry = createGeometry(day, box);
    assert.ok(geometry.height > 100, `${box.width}×${box.height} 内区高度 ${geometry.height}`);
    const yMax = yForLevel(day.levelMax, geometry);
    const yMin = yForLevel(day.levelMin, geometry);
    assert.ok(yMax >= 0 && yMin <= box.height + 1e-9);
  }
});
