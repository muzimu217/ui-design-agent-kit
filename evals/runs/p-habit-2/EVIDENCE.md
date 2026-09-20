# EVIDENCE.md · p-habit-2 习惯打卡单页工具（链路摘要）

> 本目录为 ui-design-agent 门径链路的终版归档（场景执行即链路执行，gate-protocol.md §6）。
> 裁决方式标注：门A 为**用户本人裁决**；门A 换向、门B、门C、门E 为**用户委托代行裁决**
> （2026-09-20，iteration-log / docs/gates.md 留痕）；收尾流程由主会话终审计。

## 任务

用户原话（口语摄取）："我想给自己做一个习惯打卡的小工具，单页就够：能看到一周七天、
每个习惯点一下打卡，有连续天数统计。不用后端，数据存浏览器本地就行。"

交付：index.html（23KB 单文件自包含，双击即开、离线可用，localStorage，无后端）。

## 门径痕迹（哪条消息→哪个门→裁决）

| 顺序 | 门 | 呈交物 | 裁决 | 方式 |
| --- | --- | --- | --- | --- |
| 1 | 门A 首稿 | InlitX/streak 主基线方向稿（M 档、A1–A5、品味对照） | **改**：方向本体通过；唯一改动=过程记录纯文本、不产可视化流程产物；T-007→T-008 修订 | 用户本人 |
| 2 | 实机检视 | streak 网页版实为落地页不可操作 → unverified 无法诚实消除 | 触发换向条款（裁决既定规则） | 规则执行 |
| 3 | 门A 修订 P-habit-2 | 主基线换向 DoHabit（实机检视通过，AGPL 关系改编） | **过** | 用户委托代行 |
| 4 | 门B | 素材清单（B1 Lucide ISC / B4 DoHabit / B5 uhabits；可拉取>可检视源码>纯截图） | **选定 B1+B4+B5** | 用户委托代行 |
| 5 | 门C | 无代码原型（成品截图拼板+周七列线框，prototype-gateC.html） | **过**（#6 压字等记 P2 不影响裁决） | 用户委托代行 |
| 6 | 实现 | index.html + DESIGN.md（无独立门D：M 档并入交付） | 门F trace：Context7 失败如实记录→motion-contract 曲线降级；Lucide ISC 声明保留；Playwright/contrast 留痕 | — |
| 7 | 门E 第一轮 | 逐问题清单 P1×3 已修 + P2×3 open + 未验证项声明 | **有条件通过**：#5 移动端触达修一轮；#6/#7 接受留痕 | 用户委托代行 |
| 8 | 收尾 | #5 修毕复测（375: 45×44px、320: 37×44px、横滚 0、console 0/0）；本归档 | E=passed（代行裁决标注） | 收尾 |

## 复测结论（#5 修复后）

- 375×812：横向滚动 0；格子 45×44px（≥44 达标）；打卡冒烟正常。
- 320×700：横向滚动 0；格子 37×44px。
- Console：0 error / 0 warning。
- 对比度：tools/contrast.mjs 16 对全过（4.54–14.38:1，WCAG 公式实测）。

## 本目录清单

- index.html —— 成品（单文件；Lucide v1.47.0 ISC 声明保留于头部注释）
- DESIGN.md —— 精简设计契约（语义 token、Snappy 动效参数、Do/Don't、验收门、#6 行为说明）
- docs/gates.md —— 门账本（逐门呈交/裁决/状态）
- docs/ACCEPTANCE.md —— 门E 验收记录（问题清单、已跑检查、未验证声明、门F 留痕）
- docs/gateB-materials.md —— 素材清单与选定记录（B2/B3 留查未采用）
- evidence/ —— 关键截图（择要）：桌面终态、移动 375/320 复测、上一周补卡、空态、减动效
- 完整证据（11 张截图、gateC 拼板、DoHabit 实拍 10 张）在工作区
  /Users/blackevil/Documents/ChatGPT/uak-chain-test/（evidence/、evidence/acceptance/）

## 授权与边界

- 图标：Lucide，ISC（内联，版权声明保留）。
- 布局/交互关系：改编自 DoHabit（AGPL-3.0）与 Loop Habit Tracker（GPL-3.0）实机检视的
  可观察关系，未复制其代码或资产。
- 无虚构数据/能力：示例数据明确标注"示例"；界面写明数据仅存本浏览器。
