# 睿耳 RuiEar 落地页 · 验收记录

- 计划：P-earbuds-2（locked）· Gate C 通过（2026-09-12「其他都可以了」）
- 验收轮次：**Round 1（2026-09-12，自检+浏览器实证）** — 待用户复验
- 执行者：主代理（M 级链路内自做调研与实现；无子代理派工，故无派工留痕）

## 工具/MCP 调用留痕

| 阶段 | 工具 | 结果 |
| --- | --- | --- |
| 素材调研 | Playwright MCP（Poly Pizza / Sketchfab / Tripo 实查）+ gltf-transform CLI 验件 | 通过（授权元数据自 GLB 提取） |
| 原型 | 无图像生成/Stitch MCP → 按预案真实截图拼贴板（prototype-board.html），用户 Gate C 通过 | 通过 |
| 动效 | Motion MCP 未配置 → 降级采用 motion-contract.md 规范预设（Elegant/Snappy），已如实记录 | 降级留痕 |
| 组件/API | 本地 @types/three + tsc 严格校验；gltf-transform 场景 dump 脚本核节点树 | 通过 |
| 验收 | Playwright MCP：同视口截图、键盘事件、emulateMedia(reducedMotion)、控制台采集 | 通过 |

## Round 1 自捕缺陷（已修复，修复后截图复验）

| 级别 | 缺陷 | 修复 |
| --- | --- | --- |
| P0 | 3D 模型过近占屏（相机 7.6 + 归一化 3.4 过大） | STAGE_SIZE 2.55 + 相机 z 8.8 |
| P0 | 滚动刮擦无效：mixer.setTime 对 paused action 不推进（进度条 90% 姿态不变） | 改 `action.time = t; mixer.update(0)` 标准刮擦配方，50%/98% 截图确认开合盖联动 |
| P0 | 配色剧场模型压住标题 | color 阶段模型 y 上移 0.62 |
| P1 | 耳机随转台公转，周期性被盒体遮挡 | 世界轴定位：盒体自转、耳机恒居画面右侧 |
| P1 | 移动端模型压住价格行 | ≤1024px 时 hero 模型下沉至拖拽区（ty -1.05） |
| P1 | 假 GLB 判废（4 顶点贴图平面，含 Apple 版权图） | 已删除；启用真模型并留档判废理由 |

## 实证核验矩阵（Round 1）

| 检查 | 结果 | 证据（research/ 或 docs/shots/） |
| --- | --- | --- |
| 桌面 1440 主流程（Hero→换色→三屏→刮擦→价格→页脚） | 通过 | hero-desktop / color-theater-rose / pricing / process-scrub |
| 五色换装：3D 材质+色晕+色名联动 | 通过（玫瑰红实测） | color-theater-rose |
| 刮擦动画 45% / 50% / 98% 姿态变化 | 通过 | process-scrub |
| 色板键盘：←/→ 移动、焦点跟随、roving tabindex | 通过（aria 断言） | — |
| 中/EN 切换 + 刷新持久化 + html lang 同步 | 通过 | — |
| prefers-reduced-motion：色环不渲染、重播直达终态 | 通过（emulateMedia 实测） | — |
| 移动 390：hero / 配色剧场无横向溢出 | 通过 | hero-mobile |
| 控制台 | 0 error（仅 reduced-motion 模拟下 motion 库提示性 warning） | — |

## 样式八维台账（T-002）

| 维度 | 评级 | 备注 |
| --- | --- | --- |
| 布局结构 | 达标 | 8 区块全落位，明暗交替，无塌陷无溢出 |
| 排版层级 | 达标 | display/h2/正文/chips 四级清晰，紧排大标题 |
| 色彩系统 | 达标 | 语义 token + 五产品色 + 八区块主题（鲜艳→平淡旅程执行到位） |
| 间距节奏 | 达标 | 4/8 节奏，区块纵向 clamp(96px,14vh,160px) |
| 圆角描边 | 达标 | 胶囊 CTA/色板、24px 卡片、1px 描边，无嵌套卡 |
| 阴影景深 | 达标 | ContactShadows + 卡片投影克制，无发光滥用 |
| 动效过渡 | 达标 | Elegant/Snappy spring 分工、色环过渡、刮擦动画、reduced-motion 全退化 |
| 响应式适配 | 达标 | 1440/390 双端实测；200% 字号抽样存活 |

## 遗留问题（Round 1 未修，P2 级，不阻塞验收）

1. 生产包 1.34MB（gzip 381KB），three.js 未做 manualChunks 代码分割。
2. 移动端配色剧场：盒体底缘与「五种表达」kicker 轻微贴近（不遮字，可读性无碍）。
3. 转台旋转中耳机偶被盒体短暂遮挡（动态构图预期行为；如需恒定可见可锁旋转角）。
4. 3D 加载期无进度指示（本地 <1s；线上视带宽，背景色先行不白屏）。
5. 英文品牌名 RuiEar、五色 HEX 终值、示意价数字均为占位，待用户随时定稿。

## AI-slop 自检

页面具备不可泛化元素：八区块色调旅程、同心色环过渡、真实授权模型的滚动刮擦动画、
单只耳机展示位如实标注——判断为「会问怎么做的」而非「一眼 AI」。

## Round 1.1 追加（2026-09-13，用户反馈「功能屏缺配图」）

| 级别 | 事项 | 处置 |
| --- | --- | --- |
| 增强 | 功能三屏纯文字失色（用户反馈） | 新增三张自绘伴生 UI 演示卡：实时互译对话卡（原声/译文气泡+声浪动画）、噪声前后声谱卡（rose→emerald 对比条+徽章）、电量环卡（32h 环+8h/+24h 拆分+快充行）；双语全覆盖，reduced-motion 下声浪静止 |
| P0 | Features 重构时暗色屏文字颜色类丢失（午夜黑屏黑字标题不可见） | 补回 light/dark 颜色分支，ANC 屏截图复验白字清晰 |
| 备选 | 真实摄影配图（Unsplash/Pexels） | 未采用：授权逐一核验成本高且库存图难贴合概念品牌；已向用户说明，如需要再走素材 gate |

复验证据：`docs/shots/feature-*.jpeg`（桌面三屏）、`research/feat-translate-mobile.jpeg`（移动端）。

## Round 1.2 追加（2026-09-13，用户三条组件级反馈 + 三张 AI 生成照片到位）

| 级别 | 反馈 | 处置（均已浏览器复验） |
| --- | --- | --- |
| P1 | 翻译对话一次性全量出现，不真实；缺自动识别语种；语种不可切换 | 翻译卡重做：状态机「识别中→对方说话→原声浮现→翻译中→译文浮现」逐条产生（motion 滑入，reduced-motion 直达终态）；「已自动识别 · X语」chip；语种 pill 变真实下拉菜单（西/日/法/德/韩 menuitemradio），切换后对话按新语种重播 |
| P1 | 降噪卡 before/after 静态并列无交互感 | 加真实开关（role=switch）：默认 OFF 只显示原声玫瑰噪声条 -6dB + 引导文案；用户打开后条形收拢变绿、标签/dB 切换「降噪后 · -42dB」；reduced-motion 下无抖动动画 |
| 增强 | 功能屏需要真实摄影感 | 用户提供 ZImageTurbo（Gitee AI z-image-turbo）生成三张照片（金色街头/地铁夜行/清晨出门，按既定提示词），已压缩入 `public/photos/` 并作为三屏主视觉，UI 卡悬浮叠放；页脚与 README 增补「人像照片为 AI 生成示意图」标注 |
| 诚实 | — | 素材库路线检索结论留痕：主题被付费图库垄断不可用，Openverse 直连超时，故采生成路线 |

键盘/溢出复验：横向无溢出（scrollWidth=clientWidth=1440）；开关为原生按钮可 Tab 聚焦；语言菜单 menuitemradio 语义。证据：`docs/shots/feature-*.jpeg`（含 anc-off/anc-on 对比、语言菜单展开态）、`research/v2-anc-mobile.jpeg`。

## 下一步

- 用户复验 Round 1（或提出修改项 → Round 2 定向修复）。
- 定稿项：五色 HEX、示意价数字、英文名。
- 如需部署（GitHub Pages / showcase 卡片），另行确认后走部署流程（不自动执行）。
