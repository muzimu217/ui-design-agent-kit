# thinkrail.ai 官网首检（学习循环第一百三十二轮）——营销面与产品面的一致性本身就是信号

- 日期：2026-10-28 ｜ 点档：10（开发线）｜ 检视级别：**verified-partial**（thinkrail.ai 首屏+内嵌 README 一手实看；未安装）
- 对象：thinkrail.ai（131 轮候选执行——GitHub 产品面（123 轮）已深读，本轮补营销面对照）
- 截图：thinkrail-site.png（本地留存，ADR-0002）

## 机制观察

1. **官网即产品（营销面与产品面同源）**：thinkrail.ai 首屏直接内嵌 GitHub README 的渲染（"website"本身是一个 git worktree 项目——页头可见 `workspace/website · from main`、PROJECTS 侧栏、README.md/WHY/FEATURES 文件导航）——**营销面就是产品自己的 spec-first 实践演示**：官网不是另写的营销文案，而是"用产品建的产品"。
2. **营销主张与产品面逐字一致**："The agentic IDE that gets better every time you use it"（与 README 同句）+"Agents deserve worktrees, not your working tree"（worktree 哲学一句话化）+"Specs are the ground truth…Intent survives the session"（spec 图谱主张）——**营销叙事=产品 README 的子集，无夸大增量**。
3. 开源与治理确认：JetBrains InnovationHub 出品、Apache-2.0、Discord 社区——与 123 轮 GitHub 面记录一致。
4. Cookie 同意墙（EU 标准）为唯一摩擦。

## 判读

1. **营销面=产品面的一致性本身就是第四层证据（新形态）**：此前第四层判读靠"宣称测量 vs 回执"对照；thinkrail 展示了**第三种形态——产品自证**（用产品建产品，官网即 worktree 产物）。这类自证比黑盒宣称强（可复核：GitHub 仓库开放），比回执弱（无量化六维）——**在五级证据等级上处于"Configured"与"Tool-callable"之间的公开可验形态**。kit 的产物墙（六维回执）仍是可验证性的上限形态，但 thinkrail 的"官网即产物"是值得记录的第四层外围新形态（第 50 轮口径延伸）。
2. **"Agents deserve worktrees, not your working tree"**——隔离哲学的一句话化（与 123 轮 worktree 机制笔记互证）：agent 的混乱留在自己的分支——与 kit 的"目标工作区不污染"边界同思想（跨团队同构再+1，但此条已由 123 轮覆盖，本轮为营销化确认）。
3. thinkrail 连续四读上升段后的官网检视闭环：产品面（123 README）→ 营销面（本轮官网）双层已看齐——**追踪表的下轮读数回归纯数据**（官网面已覆盖，无新面可看）。

## 不抄什么

Cookie 同意墙的合规工程（kit 无网站追踪）；Discord 社区运营（无对应资源）。

## 借鉴→落地

- K2：增量 132=**官网即产物形态入册**（第四层外围新形态记录：产品自证型公开可验）。
- KPI4：沿第四十四条口径（官网检视轮无新产物对照面）。
- evals +2：marketing-equals-product-self-evidence / worktree-philosophy-one-liner。
