import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * 主体存在性像素分析（验收证据工具）。
 * 直接 WebGL readback 不可靠（preserveDrawingBuffer=false，帧后缓冲被清）——
 * 按场景要求改用合成器截图像素检查。
 *
 * 方法：主体应在区（画面中央矩形）统计亮度标准差与量化色数；
 * 用 ?control=1 注入占位主体的对照截图校准「有主体」基线，
 * 被检截图若显著低于对照基线 → 主体缺失。
 */

const here = dirname(fileURLToPath(import.meta.url));
const png = (p) => PNG.sync.read(readFileSync(join(here, p)));

function regionStats(img, rx0, ry0, rx1, ry1) {
  const x0 = Math.floor(img.width * rx0);
  const x1 = Math.floor(img.width * rx1);
  const y0 = Math.floor(img.height * ry0);
  const y1 = Math.floor(img.height * ry1);
  let n = 0;
  let sum = 0;
  let sumSq = 0;
  let warm = 0;
  const quant = new Set();
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += lum;
      sumSq += lum * lum;
      n++;
      if (r > b + 25) warm++; // 暖色像素（R 明显高于 B）：主体色相轴特征
      quant.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    }
  }
  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
  return {
    region: [x0, y0, x1, y1],
    pixels: n,
    meanLum: +mean.toFixed(2),
    stdLum: +std.toFixed(2),
    quantizedColors: quant.size,
    warmRatio: +(warm / n).toFixed(4),
  };
}

// 双帧动性：变化像素比例（亮度差 > 6/255 计为变化）
function motionRatio(a, b) {
  if (a.width !== b.width || a.height !== b.height) throw new Error("size mismatch");
  let changed = 0;
  const n = a.width * a.height;
  for (let i = 0; i < n; i++) {
    const ia = i * 4;
    const la = 0.2126 * a.data[ia] + 0.7152 * a.data[ia + 1] + 0.0722 * a.data[ia + 2];
    const lb = 0.2126 * b.data[ia] + 0.7152 * b.data[ia + 1] + 0.0722 * b.data[ia + 2];
    if (Math.abs(la - lb) > 6) changed++;
  }
  return +(changed / n).toFixed(4);
}

// 主体应在区：展示台与产品在画面中央（相机 lookAt 目标投影中心附近）
const REGION = [0.36, 0.40, 0.64, 0.68];

const subj1 = regionStats(png("shot-desktop-1.png"), ...REGION);
const subj2 = regionStats(png("shot-desktop-2.png"), ...REGION);
const ctrl = regionStats(png("shot-control-subject.png"), ...REGION);
const mob = regionStats(png("shot-mobile-375.png"), ...REGION);

const motion = motionRatio(png("shot-desktop-1.png"), png("shot-desktop-2.png"));

// 校准判定：亮度 std 单指标经对照校准无区分力（展示台+雾纹理抬高被检基线，
// stdRatio 0.754 落在拍脑袋阈值之外）——改用色相轴暖色占比作主判据：
// 主体（橙 0xe8a13c/红 0xd4693b）R 明显高于 B；场景基色（深蓝青/雾/台面）全部 B≥R。
const ratio = +(subj1.stdLum / ctrl.stdLum).toFixed(3);
const warmRatioSubj = subj1.warmRatio;
const warmRatioCtrl = ctrl.warmRatio;
const warmPresent = warmRatioCtrl > 0.05; // 对照夹具自检：主体确实落在统计区内
const subjectMissing = warmPresent && warmRatioSubj < warmRatioCtrl * 0.2;

const result = {
  capturedAt: new Date().toISOString(),
  method: "composer screenshot pixel inspection (pngjs)；非 WebGL readback（preserveDrawingBuffer=false 帧后缓冲清空，readback 不可靠）",
  subjectRegionFractions: REGION,
  subjectRegion: { desktop: subj1, desktopSecondFrame: subj2, controlWithSubject: ctrl, mobile375: mob },
  backgroundMotion: {
    twoFrameChangedRatio: motion,
    interpretation: motion > 0.01 ? "背景像素持续变化（网格旋转/粒子上升）——canvas 非空且在动，但这只证明背景层活着，不构成主体存在证据" : "背景近似静止（异常）",
  },
  calibration: {
    controlNote: "shot-control-subject.png 来自 ?control=1 注入占位主体的对照夹具（validator 自校准，非被检对象功能）",
    stdRatioSubjectVsControl: ratio,
    stdDecisionNote: "亮度 std 被展示台/雾纹理抬基线，对照校准证明单 std 无区分力（0.754）——降为佐证",
    warmRatioDecision: `被检 warmRatio ${warmRatioSubj} vs 对照 ${warmRatioCtrl}；规则=对照>0.05 且被检<对照×0.2 → 主体缺失`,
  },
  verdict: subjectMissing ? "SUBJECT MISSING" : "SUBJECT PRESENT",
};

writeFileSync(join(here, "pixel-analysis.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
