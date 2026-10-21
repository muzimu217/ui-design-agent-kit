# 对标洞察：v0 Versions 文档——第四十四轮学习循环（Lovable 三拦改道）

- 日期：2026-10-17 ｜ 检视级别：**unverified-partial**（文档页 headless 实拍 1 图；未实机操作版本）
- 证据：`v0-versions-2026-10-17.png`
- 过程备注：原计划 Lovable 复检——**第三次被 Cloudflare 拦**（10-11/10-13/10-17，如实记录，维持待检池）；改道 v0 Versions 文档（与画布版本/产物墙直接相关）。

## ① 机制（文档实据）

1. **版本粒度=每次代码块更新**："Each time v0 updates a code block from a message, it creates a new version. Non-message actions (editing code or modifying files directly) do not generate new versions."——**版本绑定"AI 消息"而非"文件保存"**，人工直改不产生版本。
2. **恢复也生成新版本（线性历史）**："Restoring an old version creates a new, most recent version using the restored code to maintain a linear version history."——**不可变追加式历史**（restore 不是回退指针，而是新版本），与 Git 哲学一致。
3. **部署绑定最新版**："When deploying, the latest version of the code is used. If you want to deploy a previous version, you can restore it and then deploy."
4. **版本控件挂在每条生成消息上**：inspect / view diff / restore 三操作。

## ② 研判

- **版本模型三条与我们一致**：①追加式不可变历史（我们的 iteration-log+git 同构）②恢复=新记录（不改写历史，与硬边界"绝不改写历史"完全同构）③部署/交付绑定最新版本（我们的产物墙"最新在前"排序同向）。
- **差异点（可借鉴）**：v0 把版本**挂在消息上**（每次 AI 输出=版本），我们的 chain 是按**任务**一条链、每步一个 decision——**任务级链路 vs 消息级版本**：他们的粒度更细、更适合高频迭代；我们的粒度更粗但含决策依据（他们只有 diff，无"为什么这么改"）。
- **判读**：v0 版本=代码快照（what changed），本仓 chain=决策记录（why changed）。**两者正交，可互补**——画布产物墙可考虑增列"每产物的版本序号+变更摘要"（借鉴其粒度），但决策依据仍是我们独有。

## ③ 不抄

- 消息级版本树（本仓以任务为链，不绑消息）；部署绑定（无部署）。

## ④ 对本仓落点

- K2：insight 简卡（本文件）+多任务 mission control 增量（本轮增量 17）+evals +2（multi-task-registry/stage-progress-not-verification）语料 105→107。
- 立卡候选（下轮）：产物墙条目增加"版本序号+变更摘要"字段（借鉴 v0 版本粒度，先规格后实现）。
- Lovable 三拦如实记录，维持待检池。
