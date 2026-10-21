# video-production — 介绍片工程

Remotion + three.js 的项目介绍片工程。成片见 `output/uak-intro-ac.mp4`（1080p 母版）与
`showcase/products/public/video/uak-intro.mp4`（720p 分发版）。

## 重建

```bash
cd video-production
npm ci
# 截取真实界面（需先 npm run canvas:build 生成 output/*.html）
node scripts/capture-uak.mjs
# 采集数据（读仓库 JSON 台账）
node scripts/collect-data.mjs
# 生成配乐（AC 混剪）
python3 scripts/make-score-ac.py out/scores/AC_mashup.wav
cp out/scores/AC_mashup.wav public/music.wav
# 渲染
npx remotion render UakIntro out/uak-intro-ac.mp4 --concurrency=4
```

## 结构

| 路径 | 说明 |
| --- | --- |
| `src/Film.tsx` | 13 场景时间轴 + 31 条字幕 + 硬切白闪 |
| `src/scenes/` | 各场景组件（Hook/Proof/Workbench/Wall/Chain/Regressions/Taste/Learning/Gates3D/Guards/Knowledge/Mini/End） |
| `src/three/textTexture.ts` | 3D 门框文字贴图 |
| `src/data.json` | 从仓库台账采集的真实数据（产物/能力/知识卡/反例/品味/自学） |
| `scripts/capture-*.mjs` | Playwright 现场截取真实运行页面 |
| `scripts/make-scores.py` | 四首备选配乐（A 模拟脉冲 / B 玻璃钢琴 / C 深潜 techno / D 电影感） |
| `scripts/make-score-ac.py` | **AC 混剪**（C 的 124BPM 骨架 + A 的和声，按 13 场景编排呼吸） |
| `scripts/vision-ocr.swift` | Apple Vision OCR，用于帧级文字验收 |

## 约束

- 不使用仓库既有素材（`intro-video/`、`showcase/products/media/`、`demo/*/screenshots/`）；
  界面画面全部为**现场截取**的真实运行页面。
- 配乐全部程序化合成，无第三方版权义务。
- 3D 段落为真实三维（three.js，相机推进 + 深度雾 + 视差），非平面伪 3D。
