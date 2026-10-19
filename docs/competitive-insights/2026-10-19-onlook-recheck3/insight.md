# Onlook 三检（学习循环第六十九轮）

- 日期：2026-10-19 ｜ 点档：16（开发线）｜ 检视级别：**unverified-partial**（仓库页/README 实看；未安装、未实测）
- 对象：github.com/onlook-dev/onlook（距首检 10-11 共 8 天）
- 截图：本地留存（ADR-0002）

## 机制观察

1. **商业化转向**：README 重写为"The design tool for **AI-native designers** — **now in early access**"（waitlist 模式）；开源仓库定位改为"the open-source visual editor **that started Onlook**"——**开源版=获客漏斗，托管版=商业主体**（与 liyupi 仓库的"开源规范+模板"路线相反：Onlook 开源的是旧产品，新产品闭源收费）。
2. **能力清单扩张（8 天内新增）**：**Branching to experiment with designs**（设计的分支实验！）、Checkpoints save/restore、MCP setup in projects、**"Allow Onlook to use itself as a toolcall for branch creation"**（自指调用）、Queue multiple messages、Images as references。
3. **对标声明显式化**："An open-source alternative to **Bolt.new, Lovable, V0, Replit Agent, Figma Make, Webflow**"——直接点名六个对手。
4. **品牌提取**（10-11 首检立卡的"品牌提取候选"）：README 现列"**Manage brand assets and tokens**"——**已落地**（品牌资产管理成为功能项）。

## 判读

1. **"设计分支"是本轮最有价值的新机制**：把 git branching 引入设计迭代（每方案一个分支），与本仓"产物墙 append-only 版本序号"同源但粒度更细（方案级 vs 版本级）；对接入工作流无影响，记录即可。
2. **自指调用（self-as-toolcall）**：agent 用自己做工具调用来生成分支——与我们的守卫自测（fixture 自证）同构，都是"系统吃自己的狗粮"。
3. **品牌提取已落地**：10-11 立卡关闭；本仓品味档案是"从用户身上学"，Onlook 是"从代码库里提"——同名字段不同域，不冲突。

## 可借鉴（③开发的依据）

- **a. 设计分支语义**：产物墙的 version 字段未来可扩展"分支对比"（v1.0-A vs v1.0-B 并排）——立卡（低优先，等产物数上来）。
- **b. waitlist 商业化模式**：开源旧版引流、新版收费——与本仓"公开仓+免费使用"的当前姿态不冲突，但若未来商业化可参考此路径（identity 层议题，**列待裁决**）。
- **c. 本轮代码落地**：学习执行记录结构化（增量 39），把 59-68 轮的每日 L1-L4 执行数据从 iteration-log 散文里抽成机读文件，工作台显示学习状态。

## 不抄什么

- waitlist/early access 营销叙事；SF 招聘信息。

## 产物级 KPI4

- 对象为开源工具 → **0/0 可观测（不适用）**；产物级对比沿用第十一条/十二条。

## 下轮预告

- 增量 40 候选：微循环展示或产物分支对比；
- 学习候选：Motion 类作品深访。
