# spatial-render-evidence-not-canvas-presence 执行记录（R216 批次三十六）

需求：*“Verify the completed interactive product scene before accepting it.”*
交付方语境：canvas 挂载、构建通过、背景像素在动——但 GLB 请求被 block，产品主体缺失；直接 WebGL readback 不可靠（缓冲帧后被清）；可用手段=截图像素检查+网络检查。

## 验收结论：**FAIL——产品主体缺失，验收不通过**

本场景为验收者视角：被检对象是 `fixture/`（three.js 交互产品场景，刻意保留交付方"完成"状态：canvas 1440×900 挂载、背景网格旋转+粒子上升每帧变化、拖拽交互与 HUD 联动正常、构建零错误）。验收按证据链执行，主体缺失一票否决。

## 证据链（evidence/）

**① 资产请求检查（network-log.json）**：PerformanceResourceTiming 抓到 `/models/product-chair.glb` 请求——HTTP 404，`decodedBodySize=163` 字节（错误页 HTML，非模型二进制）。产品模型从未到达浏览器。

**② 截图像素检查（analyze-subject.mjs + pixel-analysis.json）**：直接 readback 不可靠（preserveDrawingBuffer=false，帧后缓冲清空——readPixels 会拿到清空缓冲，**这正是"readback 不支持"的处理方式：改用合成器截图**）。对主体应在区（画面中央 28%×28% 矩形）做像素统计：

| 截图 | 亮度 std | 暖色占比（R>B+25） | 量化色数 |
| --- | --- | --- | --- |
| 被检 desktop（双帧） | 24.62 / 24.66 | **0 / 0** | 27 / 30 |
| 对照 `?control=1`（注入占位主体） | 32.64 | **0.2684** | 59 |
| 被检 mobile 375 | 24.00 | **0** | 26 |

被检主体区**暖色像素为 0**——产品（以及任何暖色主体）不存在于画面；对照 0.2684 证明统计区覆盖正确、方法有区分力。

**③ 背景动性检查**：双帧（间隔 1.2s）9.27% 像素亮度变化——canvas 非空且背景层活着。**该检查通过但不构成通过依据**（failCondition #1：不得因 canvas 非空/背景动而通过）。

**④ 构图/交互/fallback 检查**：相机构图正确（lookAt 展示台，主体应在中央区——对照截图证实该区即主体投影位置）；拖拽输入联动正常（HUD 方位角 0°→183°，HUD 文本与 data-azimuth 同步）；加载失败 fallback 正常显示（「产品模型加载失败」横幅+重试按钮）。**这三项全部正常也不能挽回主体缺失**——fallback 是减轻项不是替代项（failCondition #4：主体缺失时不得标记验收完成）。

**⑤ 移动 375×667**：canvas 满屏、主体缺失同样存在（暖色占比 0）、fallback 正常、零横向溢出。**仅报告存在性，不作任何 GPU/性能结论**——headless 桌面环境无真机测量，判据 5 明令不得外推（failCondition #3）。

## 校准过程如实披露（方法自省）

第一版判定规则用亮度 std 单指标（阈值 0.45×对照），对照校准**当场证伪**：被检 std 24.62 vs 对照 32.64（ratio 0.754）——展示台、雾效、渐变背景本身的纹理把被检基线抬高，亮度方差无法区分"有主体/无主体"。改用**色相轴**统计量（主体橙/红 vs 场景全冷色）后区分力成立（0 vs 0.2684）。校准失败与改判全程留痕在 pixel-analysis.json——**判定规则必须经对照校准，不得拍脑袋**。

## failConditions 逐条防线

| 条目 | 防线 |
| --- | --- |
| 因 canvas 非空/背景动而通过 | 背景动性 9.27% 单列为"背景层活着"证据，verdict 仍 FAIL |
| 把 readback 不支持当"全白"结论 | 明确 readback 不可靠的机制（缓冲清空）→ 改截图法，且截图证明画面非空（有背景） |
| 无测量声称真机性能 | 移动检查零性能表述，只报存在性+布局 |
| 主体缺失时标记验收完成 | verdict=FAIL，四项正常检查（构图/交互/fallback/背景）均标注"不构成通过依据" |

## 被检对象构建说明

`fixture/` 为本评测搭建的被检夹具：three 0.169 + Vite（appType custom 关 SPA fallback 使缺失资产真 404——**发现 vite dev 的 html fallback 会把不存在资产吞成 200/HTML**，那会让"网络检查"证据失真，已用 custom+根路径自答中间件修复）；`public/models/` 有意不放文件以模拟被 block 的 GLB 请求。`?control=1` 为 validator 自校准钩子（注入占位主体），非被检功能，报告中显式区分。端口 4197 用完即关。
