# GitHub trending 三日增量复检（学习循环第四十九轮；补跑 04 点档中断任务）

- 日期：2026-10-18 ｜ 点档：08（开发线）｜ 检视级别：**unverified-partial**（trending 榜与仓库页/README 实看；未安装、未实测生成产物）
- 对象：github.com/trending?since=weekly（距上次 37 轮 ac711c8 约 2 天+，三日增量复访节奏）
- 截图：01-trending-weekly / 02-diagram-design-repo / 03-diagram-design-compare-table（本地留存，ADR-0002）
- 访问性：github.com 直连可达，无拦截

## 机制观察（①学习 ②研究）

1. **周榜面孔增量**（对 37 轮"官方目录/开放标准/框架三连爆发"+"rea 蝉联"基线）：
   - `morluto/rea` 蝉联 #1 且本周 **+239,923 stars**（总量 317K）——逆向 agent 工具的爆发斜率仍在加速；
   - 新面孔：`storytold/artcraft`（Rust，"intentional crafting engine for artists/designers/filmmakers"）、`boykopovar/AnyPS5`、`anthropics/claude-plugins-official`（官方插件目录，37 轮已录）、`mksglu/context-mode`（37 轮已录）、**`cathrynlavery/diagram-design`**（本轮深入）、`heygen-com/hyperframes`、`cursor/plugins`（Cursor 官方插件体系）、`MadsLorentzen/ai-job-search`。
2. **diagram-design 深检（57.5k★ / 3.7k fork / 357 commits，MIT，diagramdesign.dev）**——单体 agent skill 冲上周榜：
   - 产品契约："draws diagrams as **one self-contained HTML + SVG file, in your brand**. 45 diagram types. No shadows. No Mermaid slop."——自包含单文件输出 + 反通用默认（"No Mermaid slop"=反套壳定位话术）。
   - **布局纪律进 CI**："Placed by the agent on a **4px grid, with CI checks for overlaps and clipping**"——确定性网格布局 + 重叠/裁切 CI 检查，与本仓 tests/ 的"layout deterministic / 同泳道节点不重叠 / 渲染文档自包含"断言**逐条同构**（对位证据，链路见⑤）。
   - **跨宿主分发标准化**：`npx skills add cathrynlavery/diagram-design` 一条命令适配 Claude Code/Codex/Copilot/Cursor/Gemini CLI/Cline/Windsurf/Amp/Zed/Warp/Roo/Kiro/OpenCode/Pi——宿主清单目录（.claude-plugin/.codex-plugin/.factory-plugin/.agents）**同一 commit 同笔 bump 版本**（"bump plugin manifests to 2.6.110"）；CI 策略要求 **same-head 审查分**；**Playwright PNG renderer 打包进 CI**（导出与渲染验收）。
   - **品牌抽取入口**："Onboard diagram-design to https://yoursite.com（pulls your palette and fonts so every diagram after this one matches your site）"——从目标站抽色板+字体作为持久样式源（与 10-11 Onlook 轮"品牌提取候选"同向收敛）。
   - 导入迁移："Redraws Mermaid, draw.io and Excalidraw"——存量图表重画即获客路径。

## 可借鉴（③开发的依据）

- **a. 三处同纪律族确认（增强信心，非新增工作）**：同笔清单同步（我们=口径五处，他们=宿主清单多仓目录）、CI 验收门（我们=三连绿+canvas:check，他们=same-head 分数+overlap CI）、渲染取证（我们=直拍，他们=Playwright PNG renderer）——三条纪律在两个独立项目同时出现，说明这套做法已是**公开可验证产品的默认形态**，本仓方向无需变更。
- **b. `npx skills add` 分发形态（立卡，待用户裁决）**：本仓 23 技能目前靠 clone 安装；兼容 skills 标准的单命令安装是分发升级候选。但涉及包结构与发布边界（发版=授权红线），**不在轮次内自做**，列待裁。
- **c. 品牌抽取持久样式源（立卡）**：画布入口页若支持"从目标站抽 token"，可直接服务竞赛视频里的品牌化演示；涉及可选网络行为，列卡待裁决。
- **d. 存量导入重画**：chain.schema 支持从既有文档导链路是自然扩展；优先级低于画布主线，立卡。

## 不抄什么

- "No Mermaid slop" 式贬损性竞品话术（本仓对比只写机制与判据，不贬损）。
- 榜单营销数字当证据（★数只作热度信号，不作质量判据——与产物墙"来源≠质量"口径一致）。

## ⑤产物级 KPI4 六维并排（本轮对比交付）

| 维度 | 本仓 chain 渲染页（v1.4） | diagram-design 产出（gal­lery/README 观测） |
| --- | --- | --- |
| 桌面 | ✓ 直拍通过 | ✓ 有（仓库展示+CI Playwright 渲染） |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ tab 停留 11 全可达 | — 不可观测 |
| 对比度 | ✓ 40 项全过 4.5:1 | — 不可观测 |
| 降动效 | ✓ 静态检查通过 | — 不可观测 |
| 控制台 | ✓ 0 错误 | — 不可观测 |
| **分** | **6/6（全实测）** | **1/1 可观测**（检视级别 unverified-partial） |

- 判读：同一"**自包含 HTML + 确定性布局 + 重叠检查**"契约的两种载体——他们做编辑级单图（消费场景=博客/文档配图），我们做工作流链路+证据抽屉（消费场景=第三方复核）；形态与验收纪律同族，深度层（降动效/对比度/键盘）他们未公开证据，不虚记。
- 与墙内既有对比（vs v0 stepper / vs Figma Make）合并为三条产品级 KPI4 记录。

## 下轮预告

候选：heygen-com/hyperframes 深检（视频帧/UI 帧形态，与画布呈现层相关）或 B 站痛点 sweep（距上次 5 天）；Lovable/Replit 待检池不变。
