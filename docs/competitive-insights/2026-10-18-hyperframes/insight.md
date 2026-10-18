# heygen-com/hyperframes 深检（学习循环第五十轮）

- 日期：2026-10-18 ｜ 点档：12（开发线）｜ 检视级别：**unverified-partial**（仓库页/README 实看；未安装、未实测渲染产物）
- 对象：github.com/heygen-com/hyperframes（trending 周榜新面孔，上轮 49 预告的深检目标）
- 截图：01-hyperframes-repo / 02-how-it-works（本地留存，ADR-0002）
- 访问性：github.com 直连可达

## 机制观察（①学习 ②研究）

1. **产品定位**："Write HTML. Render video. **Built for agents.**"——开源框架把 HTML/CSS/媒体/**可寻址动画**渲染为**确定性 MP4**；本地 CLI、AI agent skills、托管创作工作流的渲染核心三种用法。66.6k★/6k fork/**5,674 commits**，3 小时前刚发 v0.8.172；技术栈 Puppeteer+ffmpeg+GSAP（Apache-2.0）。
2. **技能架构与本仓镜像（本轮最重要发现）**：**21 skills + `/hyperframes` router**——README 明言 router 是 "capability map…**the intent layer that confirms every creation brief up front**"（能力图+每单创作先确认 brief 的意图层），域技能**按需装载**（"the router installs each creation workflow on demand"; "never expands a partial install; nothing re-pulls the full set behind your back"）。这与本仓"ui-design-agent SKILL.md 路由 + 23 支撑技能按需装载 + 门 A 方向稿先行"**逐条同构**——路由式技能族架构已被另一独立团队在同一周内证明可承载 66.6k★ 规模。
3. **生产环 teach 给 agent**："plan the video, write valid HTML, wire seekable animations, add media, **lint, preview, and render**"——lint→preview→render 三步验收环即本仓"三连绿+直拍"的 agent 教学版；"**seekable animations**"为确定性帧渲染的硬前提（与 Remotion 帧数学同约束，本仓 remotion-video-agent 的帧数学/渲染验证同赛道）。
4. **跨宿主分发与新鲜度纪律**：`npx skills add`（skills.sh 注册表，**自曝"can lag main by hours"**并给出 `npx hyperframes skills update` 走 main 的补丁路径）；每宿主清单（.claude-plugin/.codex-plugin/.cursor-plugin/.agents）**同一 release chore 同笔 bump**（v0.8.172 四目录同 commit）；打包硬门"fails if the archive exceeds Codex's 100 MB upload limit"（确定性打包约束）。
5. **Studio/Showcase/Catalog/Playground 四件套**：创作工具+产物陈列+目录+试验场——产物墙的工业完整形态（本仓 showcase+产物墙的对应位）。

## 可借鉴（③开发的依据）

- **a. 路由+按需技能族=被验证的规模化架构（增强信心）**：本仓 23 技能路由式组织无需变更；HyperFrames 的"router 先读+域技能按需"与 kit 的 tool-routing 设计同构。
- **b. skills.sh 注册表滞后自曝+双通道安装（补强上轮立卡 b）**：`npx skills add` 分发形态候选新增一条重要事实——**注册表滞后是已知问题且成熟项目自带 update 走 main 的第二通道**。本仓若走该路线（待用户裁决），需同款双通道+新鲜度说明。
- **c. 可寻址（seekable）动画作为确定性渲染前提**：remotion-video-agent 的帧数学已是此模型；可借鉴其把"动画必须可寻址"写成 agent 可执行的 lint 规则（立卡，视频线下轮候选）。
- **d. 打包硬约束显式化**：导出包若超限应硬失败而非静默截断——本轮增量 23 的导出包增强可同款自查（manifest 逐文件字节即对账基础）。

## 不抄什么

- "Built for agents" 式营销定位语（本仓自述走机制描述，不走口号）。
- 550 tags/1372 branches 的高速发布节奏（本仓节奏=点档制，不追星式发版）。

## ⑤产物级 KPI4 六维并排（本轮对比交付，第四条）

| 维度 | 本仓画布入口页（v1.4，离线自包含 HTML） | hyperframes 渲染产物（确定性 MP4，未实测） |
| --- | --- | --- |
| 桌面 | ✓ 1280 直拍通过 | ✓ 有（README/Showcase 展示） |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ tab 停留 10 全可达 | — 不可观测（视频无键盘维度） |
| 对比度 | ✓ 40 项全过 4.5:1 | — 不可观测 |
| 降动效 | ✓ 静态检查通过 | — 不可观测 |
| 控制台 | ✓ 0 错误 | — 不可观测 |
| **分** | **6/6（全实测）** | **1/1 可观测**（unverified-partial） |

- 判读：同为"确定性输出"契约（我们=离线自包含 HTML 逐字节可复核；他们=可寻址动画→确定性 MP4 逐帧可复现）；**载体不同则六维含义不同**（视频无键盘/对比度维度的公开验证路径），如实记 null 不虚记——对比的意义在契约同族性而非分数高低。
- 与墙内既有对比（vs v0 stepper / vs Figma Make / vs diagram-design）合并为四条产品级 KPI4 记录。

## 下轮预告

候选：B 站痛点 sweep（距上次 5 天）或 `context-mode` 复访；Replit/Lovable 待检池不变。
