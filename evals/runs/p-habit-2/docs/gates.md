# 门账本 · docs/gates.md（任务：习惯打卡单页工具，P-habit-1 → P-habit-2）

登记规则（gate-protocol.md §4.6，按用户裁决 2026-09-20 修订：不再产出流程图
HTML 类可视化产物，过程记录一律纯文本，原 habit-tracker-state.json 与
habit-tracker-workflow.html 已删除）。一门一呈交；沉默不是批准；裁决只覆盖
它所回应的门。阶段枚举沿用 ai/tooling/workflow-stages.json 词汇。

| 日期 | 门 | 阶段 | 状态 | 呈交物 / 事件 | 裁决 |
| --- | --- | --- | --- | --- | --- |
| 2026-09-20 | A | brief | passed | 首稿 DIRECTION.md（主基线 InlitX/streak） | 用户：改（方向本体通过；唯一改动=不再产出可视化流程产物，过程记录纯文本；删 workflow HTML）。M 档确认；A5 单文件 HTML 通过，A1–A4 默认通过；T-007 amended (user ruling 2026-09-20)：个人安静工具类产品不要求玻璃磨砂与高饱和主色（kit 侧由主会话更新） |
| 2026-09-20 | A | brief | passed | 门A 修订稿 P-habit-2（主基线换向 DoHabit） | 用户代行裁决：**过**（iteration-log 留痕，2026-09-20）——换向条款执行、实检证据、AGPL 边界、周七列推断标注、边界事故自纠均确认；M 档、A1–A5、品味修订（T-007→T-008）沿用 |
| 2026-09-20 | B | reference | passed | 素材清单 docs/gateB-materials.md | 用户代行裁决：**选定 B1 Lucide（ISC）+ B4 DoHabit（AGPL 关系改编）+ B5 uhabits（GPL，仅连续双数字排法关系）**，门B passed（iteration-log 留痕，2026-09-20）；B2/B3 留清单备查不采用 |
| 2026-09-20 | C | contract | passed | prototype-gateC.html（截图拼板+周七列线框） | 用户代行裁决：**过**（iteration-log 留痕，2026-09-20）——映射/分层/来源/边界均确认；⑥压字与黑色示意格记 P2 不影响裁决 |
| 2026-09-20 | D | contract | merged | 按代行裁决：M 档不单独停门D；实现时须随代码交付精简 DESIGN.md（语义 token、Snappy 动效参数、Do/Don't、验收门） | —（已并入实现交付物） |
| 2026-09-20 | F | build | passed | 实现完成（index.html 23KB 单文件）。调用留痕见 docs/ACCEPTANCE.md 门F 节：Context7 失败（Invalid API key，如实记）→ 按 motion-contract.md 曲线降级；Motion MCP 不存在于本会话目录（未调用未伪造）；unpkg 取 Lucide ×10；contrast 脚本落地 tools/contrast.mjs（16 对全过）；Playwright 全程取证 | —（trace 留痕完整） |
| 2026-09-20 | E | verify | passed | 第一轮验收清单 docs/ACCEPTANCE.md：P1×3 已修 + P2×3 open + 未验证项声明 | 用户委托代行裁决：**有条件通过**——#5 移动端触达修一轮（已修：375 格 45×44、320 格 37×44、横滚 0，acc-11-*）；#6/#7 接受留痕（#6 已写入 DESIGN.md）。**E=passed**（代行裁决标注，2026-09-20） |
| 2026-09-20 | — | deliver | passed | 收尾归档：kit 仓库 evals/runs/p-habit-2/（index.html、DESIGN.md、docs/ 三件、evidence/ 择要 6 张、EVIDENCE.md 链路摘要，代行裁决全程标注） | 终审计由主会话执行（npm run chain:audit） |
| 2026-09-20 | E | verify | pending | — | — |
| 2026-09-20 | F | build | pending | 留痕门（trace） | — |

## 实机检视记录（2026-09-20，Playwright 浏览器，证据在 evidence/）

- streak（github.com/InlitX/streak / inlitx.github.io/streak）：落地页 + 整页 +
  Features 区截图（streak-live-1.png、streak-live-fullpage.png、streak-features.png）。
  结论：营销页文本证实"one tap a day / year grid / streaks / 无账号无网络/GPLv3"，
  但应用是 Android APK，无法在浏览器实机操作 → 不能消除应用 UI 的 unverified。
- DoHabit（dohabit.app / github.com/iNikAnn/DoHabit，AGPL-3.0，TypeScript）：
  落地页（dohabit-live-1.png）：中文、100% 隐私保护、无需账号无需服务器、纯离线、
  即开即用；mockup 显示月历格、Current/Longest 连续、周完成柱、月趋势。
  应用本体（dohabit-app-view.png、dohabit-habit-card.png、dohabit-card-main.png、
  dohabit-checked.png）：中文空状态教学；创建表单（名称/频率/颜色×20/图标）；
  习惯卡=图标+名称+🔥当前连续+大对勾+双月日期网格（今日圈出）；点对勾→按钮变
  实色、连续 0→1、今日格填充，可逆路径未逐一验证。
  局限：未核查其存储实现（宣称 local-first，我们只抄关系）；未检视源码结构；
  检视产生的测试数据仅存在于本机浏览器 profile，无外部影响。
- 边界事故留痕：Playwright MCP 的工作目录在 ai 仓库，首次截图与快照落入了
  ai 仓库根目录；已当场移入本工作区 evidence/ 并清除其 .playwright-mcp 会话
  文件，仓库恢复原状。后续截图一律经允许根目录中转后移出。

## 检索留痕（累计）

- 2026-09-20 门A 轮：Google 检索 ×2、GitHub API/搜索 ×4（streak、uhabits、
  DoHabit 元数据 + topic 搜索；openhabittracker 仓库名猜测 404 留次级桶）。
- 2026-09-20 实机轮：GitHub API ×1（lucide-icons/lucide：API 返回 NOASSERTION，
  已读原始 LICENSE 核实为 ISC，需保留版权声明）；Playwright 浏览器实检
  inlitx.github.io/streak 与 dohabit.app（含创建习惯+打卡交互）。
