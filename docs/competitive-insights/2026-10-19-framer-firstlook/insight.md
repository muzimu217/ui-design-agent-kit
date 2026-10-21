# Framer 首检（学习循环第七十轮）

- 日期：2026-10-19 ｜ 点档：17（开发线）｜ 检视级别：**unverified-partial**（公开首屏与文案实看；未注册、未生成）
- 对象：framer.com（64/69 轮两轮作为 recent.design 赞助位出现，本轮首检）
- 改道记录：原定 Motion 类作品深访，**作品外链全部指向 X.com（需登录）**——如实改道 Framer
- 截图：01-framer-first-screen（本地留存，ADR-0002）
- 访问性：直连可达

## 机制观察

1. **定位**："**Framer is the design agent for every step from idea to launch**"；导航"New: **Skills**"——**Framer 也上了 Skills 入口**（与 Remotion/hyperframes/opencode 的 skills 分发共识一致，第 5 家）。
2. **Agent/Style 双模式切换**（首屏核心交互：Agent | Style 两个 tab）——**生成与精修分离**的界面表达（生成用 agent、微调用 style），与我们的"门径产出 + 门 D 修订"同构。
3. **关键卖点句**："Agents that work **alongside you, not instead of you**. It works directly on your site to generate and refine **in place, with every change visible, editable, and under your control**."——**"每处改动可见、可编辑、可控"**=白盒+可控叙事被 Framer 用一句话表达；与我们的"门径而非黑盒"完全同源。
4. **CMS agent**："sets up, organizes, and updates your entire CMS"——内容管理也有专属 agent（角色化 agent 分工，与 hyperframes 21 skills 的域技能一致）。
5. **品牌治理**：导航里直接有"**Copy logo SVG / Brand guidelines**"——品牌资产自服务的公开化（与 Onlook 的 brand tokens 功能同向）。

## 判读

1. **"alongside you, not instead of you"是本仓定位的最佳英文翻译**：我们对外表述"监管而非生成"的英文版即此句式——**立卡（文案类，转自主）**。
2. **Agent/Style 双模式**=生成/精修分离的界面范式，对应本仓"门 C 产出 + 门 D 修订"——记录，不改。
3. **Skills 入口第 5 家**：skills 分发共识进一步强化（`npx skills add` 立卡依据持续增强，仍待裁决）。

## 可借鉴（③开发的依据）

- **a. "alongside, not instead"句式**：README/官网英文版的定位句候选——立卡转自主。
- **b. 本轮代码落地**：官网 stroke-art 升级**描边循环动画**（CSS stroke-dashoffset，3s 循环，reduced-motion 停帧）——把 `icon-single-stroke-constraint`（构图）与 `motion-force-anticipation`（动效克制）两卡合并落地，同时为 Motion 形态的"微循环展示"（64 轮立卡）做首次实现。

## 不抄什么

- Cookie 弹窗叙事；"Get started for free"的免费钩子（本仓无账户体系）。

## 产物级 KPI4（第十四条）

| 维度 | 本仓官网页（v2） | Framer 首屏（公开页） |
| --- | --- | --- |
| 桌面 | ✓ 直拍通过 | ✓ 有 |
| 移动 | ✓ 520px 实测 | — 不可观测 |
| 键盘 | ✓ 12/12 | — 不可观测 |
| 对比度 | ✓ 32 项 0 低于 | — 不可观测 |
| 降动效 | ✓ 静态帧一致 | — 不可观测 |
| 控制台 | ✓ 0 错误 | — 不可观测（本会话 13 错未深查） |
| **分** | **6/6** | **1/1 可观测**（unverified-partial） |

## 下轮预告

- 增量 41 候选：chain 页圆角已收敛后的微循环 GIF；学习候选：Motion 作品深访（X 依赖解除后）。
