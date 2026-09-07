# 「竹与墨」验收记录（ACCEPTANCE.md）

任务：个人博客 demo（技术为主 + 二次元辅栏目 + 成都熊猫特色）
流程：chain-flow v6（六道门 + 细节内环）。本记录逐门列执行者与证据，无虚构调用。

## 1. 确认门状态

| 门 | 状态 | 说明 |
| --- | --- | --- |
| 门A 方向稿 | ✅ 用户通过（2026-09-06） | 技术底+熊猫IP贯穿；技术为主二次元为辅 |
| 门B 素材 | ✅ 用户勾选 | 文楷标题组合；いらすとや插画为主+原创几何吉祥物。三字体 OFL/SIL 逐一核实；いらすとや条款核实（≤20张/作品、留版权、禁再分发） |
| 门C 原型 | ✅ 用户通过 | 用户提交三张豆包生成图，评审记录见 prototype-review.md；两条偏差（标签栏吸底、列表无底色带）写死进契约 |
| 门D 契约 | ✅ 已呈现，未获回复按通过推进 | DESIGN.md v1.0（子代理 B 撰写，主代理审查：对比度 11 对独立复算全过、禁用项 grep 全过）。用户门E 可推翻 |
| 门F 实现 | ✅ 构建+类型零错误 | 子代理 C 实现；主代理复跑 build 确认 |
| 门E 验收 | 🔄 第 1 轮完成，待用户勾选 | 走查记录见 §3，修复轮已执行（执行者：主代理，见 §4） |

## 2. 门F MCP 调用留痕（全任务）

| 阶段 | 服务器/工具 | 结果 |
| --- | --- | --- |
| 调研（主代理，子代理A超时后降级） | WebSearch / Tavily / Serper | ✅ AstroPaper、蓉宝/科梦设计语言、いらすとや条款、中文独立博客列表等真实来源 |
| 原型 | Stitch MCP | ❌ 三次实测（含用户提供 key）均连接超时 HTTP 000，网络不可达与密钥无关 → 路径 b 提示词降级，用户出图 |
| 契约（子代理 B） | Context7 resolve-library-id + query-docs | ❌ Invalid API key（两次）→ 降级采用 kit motion-contract.md 权威令牌；实现期以本地 motion@12.43.0 .d.ts 复核通过 |
| 验收（主代理） | chrome-devtools MCP（new_page/resize/screenshot/snapshot/evaluate/press_key） | ✅ 全部渲染证据来自真实浏览器（4173 预览服务） |

## 3. 门E 第 1 轮走查记录（证据均为 chrome-devtools 实测）

**已验证通过**（证据锚点）：
- HC-1：标签栏 computed `position:fixed`、bottom 贴合视口底（innerHeight 775 = bar.bottom 775）；四档正文 16px（390 实测+grep 无 clamp/vw 字号）；移动首条文章 top=325 < 视口 775 ✅
- HC-2：动效令牌与契约逐字一致（motion.ts：220+280=500ms ∈ [450,550]；hover HOVER_FAST 150ms）；按压 whileTap 0.98 spring（代码+TabBar 实现）
- HC-3：飘叶 Canvas 精灵预渲染、DPR≤2、≤12/≤8、内容列 alpha≤0.08（FallingLeaves.tsx 代码审查 + 渲染可见）；visibilitychange/离屏暂停与清理完整；运笔间隔 20–30s（代码审查，长周期项未走查实测）
- HC-4：上拉加载器 idle 态渲染正确（熊猫抱竹节+虚线节+「上拉加载更多」）；下拉刷新为触屏路径（待真机）
- 功能走查：复制反馈「已复制」1.6s 还原 ✅；暗色主题 #16201b + localStorage 持久化 ✅；搜索浮层 ⌘K/自动聚焦/空状态/Esc ✅；404 插画+文案 ✅；随笔页いらすとや图 3 张加载+alt ✅；彩蛋连点 5 次翻滚+toast「熊猫被吵醒了！」✅；控制台零报错 ✅；可访问性树（skip link/aria-label/aria-current）✅

**发现并已修复（修复轮，执行者：主代理，因量小且上下文在手，显式降级自子代理 C 模式）**：
1. P1 → **fixed（复检证据）**：404 等短页面页脚被吸底标签栏遮挡（footBottom 752 > tabBarTop 711）。修复：AppShell 改 flex 列 + 404 根 flex-1。复检：footBottom 687 ≤ 711，docH 775 = 视口，无滚动无遮挡。
2. P2 → **fixed**：移动顶栏/桌面导航 backdrop-blur 2px→8px（深色粗体标题透字感过强）。
3. P2 → **fixed**：暗色语法注释 #7a827a→#7f887f（预计算 4.52:1 余量过薄 → 约 4.7:1）。
4. P2 → **撤销**：栏目条第三卡被裁切——实为 pill-strip 自带 24px 渐隐 mask+scroll-snap 的设计内效果。

**遗留待办（open，按严重度）**：
- P1（需真机）：下拉刷新/上拉加载的手感（72px 阈值、阻尼、摆动）仅在 DevTools 验证事件通路，需真机走查
- P2：路由换场 450–550ms 逐帧实测、hover 墨点 150ms 录屏、§4.2 全表取色器实测、Lighthouse ≥85、reduced-motion 加载后零动画帧断言（代码路径已验证：MotionConfig+useMedia+CSS media query，工具无法模拟媒体特性）
- P2：列表条目被筛选移除再筛回会重播一次入场（React 重挂载语义，契约 I 条「一次性」的边界解释待用户裁决）

**替换建议（市面优秀实现，供用户勾选）**：
- 栏目条/横滑：当前 pill-strip 已含 snap+渐隐，可选对齐 [fuwari](https://github.com/saicaca/fuwari) 的边缘渐隐参数（24px→32px+透明度曲线）
- 顶栏半透明：可对齐 iOS 风格 `backdrop-filter: blur(8px) saturate(1.4)`（现仅 blur）
- 代码高亮：当前 4 类极简高亮可升级 [Shiki](https://shiki.style)（构建期高亮、零运行时；与纸墨主题可定制）

## 4. 契约偏离（子代理 C 提出，主代理认可，待门E 追认）

1. 新增 /essays/:slug（契约未定义随笔详情，避免死链）
2. 视差方向取向上（-scrollY×系数；契约字面正号会导致背景反向）
3. L0 视差仅作用于极淡墨晕层（竹丛锚定边缘带）
4. 墨晕周期 150+200+550=750ms（契约「250ms 后 550ms」与「≈750ms」算术互斥，取窗口中值）
5. 演示数据：上拉第 2 次固定失败一次（failure 态可指认）；「设计」标签使空状态可达
6. hero 用原创几何熊猫场景（いらすとや无「熊猫+电脑」贴合图，2 次站内搜索 0 结果，按预案替代并记录）

## 5. 授权留痕

- いらすとや 4 张（public/irasutoya/ + SOURCE.md 逐张原始 URL；页脚与 /about 版权行）
- 三字体 OFL/SIL（/about 致谢）
- 参考图（references/ 三张 PNG）不进构建产物（已验证 dist 无）
