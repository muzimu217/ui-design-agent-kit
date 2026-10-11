# Figma Make 季度复检（2026-10-09，第十六轮学习循环，第二 sweep 第五检）

- 对象声明（①）：Figma Make 复检（首检 2026-10-07，对象池"季度复检"项；本次为间隔两天的快速复检——原计划季度粒度，因第二 sweep 排程提前执行，下次复检建议 2026-11 上旬）
- 检视级别：**unverified-partial**——浏览器实看 figma.com/make/ 官网（1 张截图+DOM 文本提取）；未登录、未生成
- 证据：本轮真实浏览器访问（Playwright），截图 1 张本地留存（按版权克制纪律**截图不入库**）
- 勘误：首检用的 `figma.com/figmake/` 现返回 404，正式路径为 `figma.com/make/`（产品页已迁移）

## ② 复检发现（对照首检的增量）

1. **最大增量：Make on your local codebase（Beta）**——"Convert your Figma designs into localized, production-ready assets in Make's visual software editor"，且明确 "Use Make locally to build in any codebase, then ship right to production. **Coming soon**"。**生成前置路线的头部玩家正从"托管生成"进军"本地代码库+直接发布"**——生成工具与工程现场融合，直接逼近 Cursor/v0 的腹地。
2. **标语升级**："Prototype. Polish. Ship."——**Ship 首次进主标语**（首检时叙事停在原型/设计上下文）。
3. **Figma agent 独立产品**：页脚出现 `figma.com/agent/` 独立入口——Figma 自身的 agent 化从 Make 内部能力扩展为独立产品线。
4. 既有机位复确认：Make kits（npm/设计系统同步）、Custom skills、MCP connectors、点选元素 prompt 修改、Comments 协作——首检记录全部仍在且位次提升。
5. 社区模板位（Travel App Prototype 等）——Make 产出进入 Figma 社区分发。

## ③ 对照表（学什么/不抄什么/为什么）

| 信号 | 学（借鉴关系） | 不学（原因） |
| --- | --- | --- |
| 本地代码库（Beta→Coming soon） | **趋势确认**："生成"与"工程现场"融合是行业主航道——kit 的"工作流作用于目标项目"定位恰好站在这条航道上，验证其前瞻性 | 不做设计稿转码（kit 无设计运行时） |
| Ship 进主标语 | 交付叙事升级的同行信号：kit 的门 E（交付+证据）是更强形态的同一叙事 | 不改 kit 标语（已有"有证据的可验收界面"） |
| Figma agent 独立产品线 | 大厂 agent 化全面铺开的市场证据 | 不对标大厂产品矩阵 |
| 季度复检粒度 | 复检间隔实测：两天内变化有限，**季度粒度合适**；下次 Figma Make 复检排 2026-11 | — |

## ④ 来源

- https://www.figma.com/make/ （落地页实拍+DOM 文本提取，2026-10-09）
- https://www.figma.com/figmake/ （404 实测记录）
- 对照：docs/competitive-insights/2026-10-07-figma-make/（首检知识卡）

截图（本地留存，不入库）：`landing-2026-10-09.png`。

## ⑤ 本轮 KPI 落点

- **K1 知识卡**：本文件（同步入 iteration-log 第十六轮行；核心=本地代码库 Beta + Ship 叙事升级两项增量）。
- **K2 优化落地**：`docs/learn-loop.md` 对象池 sweep 进度更新——Figma Make 复检完成，第二 sweep 仅剩 claude-mem 型记忆信号一项。
- **K3 证据**：本目录（insight.md 入库，截图 1 张本地留存）。

## 下轮对象预告

第二 sweep 收官检视：**claude-mem 型记忆信号**（GitHub trending 已见 98k★ 的跨会话记忆产品；检视其 README 机制即可，轻量）。完成后第二 sweep 5/5 收官。
