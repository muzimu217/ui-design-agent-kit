# vue-video-embed-delivery 执行记录（R215 批次三十四）

需求：*“Create a 15-second product video, give me the MP4, and embed it in the existing Vue site with a poster and playback controls.”*

## 路由决策（先于动手）

- **视频 = Remotion**：15s 运动图形用代码渲染组合（`video/`，remotion 4.0.370，450 帧 @30fps，1280×720）——kit 既有视频范式（代码渲染非摄影/后期，用户裁决范围）。
- **宿主 = 既有 Vue 栈**：`host/` 用 Vue 3.5 + @vitejs/plugin-vue 5 + Vite 6，不迁移 React（failCondition #1 明令）。视频与宿主是两个独立交付物，MP4 是交付物本体而非 Player/Studio URL（failCondition #2）。
- **内容设计**：四幕（标题→三特征卡→数字带→CTA），配色取 kit 定稿 token（paper/ink/green/focus，与 BrandTeaser 同源），全部动效 useCurrentFrame 纯函数（确定性）。海报从同一组合 `remotion still --frame=75` 抽帧——poster 与视频内容同源，非另造图。

## 交付物

| 文件 | 说明 |
| --- | --- |
| `video/out/product-video.mp4` | 15.06s · H.264 High · 1280×720 @30 · 960,595 B（sha256 落证） |
| `video/out/poster.jpg` | 同组合第 75 帧抽帧海报 |
| `host/` | Vue 宿主页 + VideoEmbed.vue 嵌入组件 |

## 证据三分离（passCriteria #5）

**① Studio/渲染证据**：`video/src/`（Root.tsx 注册 450f/30fps/1280×720 组合）+ 渲染日志 `Rendered 450/450 · Encoded 450/450`（remotion render/still 实跑输出）。

**② 编码文件证据**：`evidence/encoded-inspection.json`（ffprobe 实测：duration 15.061333s、h264 High、yuvj420p、30/1 fps、双流——**含静音 aac 音轨**，自动播放场景真实存在）+ `evidence/product-video.sha256`。**明确声明：MP4 是静态编码媒体，prefers-reduced-motion 不作用于文件本身**（failCondition #4）——reduced 行为全部实现在宿主页。

**③ 宿主浏览器证据**：`evidence/host-verify.json` 四条路径 DOM 断言 + 4 张截图（下方）。全部经 Playwright 真实走查，无未检视 embed（failCondition #5）。

## 宿主行为矩阵（host-verify.json 全文）

| 路径 | 结果 |
| --- | --- |
| 桌面 1440 自动播放 | state=autoplaying、muted、currentTime 8.06→8.76 推进、无覆盖层 |
| 自动播放被拒（force-block 夹具驱动真实 AbortError） | state=manual-wait + 「▶点按播放」覆盖层 → 点击 → manual-playing 推进 |
| reduced-motion（emulateMedia reduce） | 不尝试自动播放、海报+「▶已停用自动播放 · 点按播放」、手动点击可播 |
| 移动 375×667 内联 | playsinline、335×188 全在视口、非全屏、无横向溢出、16:9 比例 1.778 保持 |

- 自动播放策略：**不假设自动播放（含音频）总能成功**（failCondition #3）——静音自动播放 + promise rejection 统一回退手动覆盖层；MP4 带静音 aac 轨使拒绝场景真实。
- force-block 夹具披露：`?force-block=1` 在 play() 后立即 pause()，让 play promise 以 AbortError 真实 reject，确定性驱动与浏览器策略拒绝相同的 catch 分支；正常访问不受影响。

## 内环抓到并修复

1. **favicon 404**（首跑 console 1 错）→ index.html 内联 SVG data-URI favicon，修复后 0 错误。
2. **force-block 时序 bug**：首版把 pause() 放在 play() 之前，未中断任何 promise，覆盖层不出现（首跑 overlay=null 抓到）→ 改为 play() 后立即 pause()，真实 AbortError 路径验证通过。
3. 取证工具教训：vite 后台进程接 `| head` 管道在 head 退出后被 SIGPIPE 误杀——重启不接管道，历史 console 错误（HMR 窗口）在证据中显式隔离说明。

## 对比度实测（evidence/contrast-check.txt）

muted #61717d/paper 4.90:1；muted/surface 4.60:1；notes 文本 7.18:1；ink/paper 12.44:1；覆盖层文字对最坏情形（纯灰视频底+55% 墨青遮罩合成 #4f565b）7.25:1——**全部 ≥4.5 AA**，host 生产构建通过（dist 432ms）。

## 边界与诚实声明

- 视频美学：本条考交付管线（编码/嵌入/策略处理/证据分离），非片头级美感；「视频美感=无影像资产」诊断另案跟踪（R194-01 轨道），本条组合沿用 kit token 的运动图形范式。
- styleReview 未评：场景考交付管线行为；375 零溢出与 console 0 已实测入证。
- 端口 4196 用完即关。
