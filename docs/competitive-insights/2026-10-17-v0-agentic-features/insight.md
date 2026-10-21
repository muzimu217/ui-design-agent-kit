# 对标洞察：v0 Agentic features 文档——第四十六轮学习循环

- 日期：2026-10-17 ｜ 检视级别：**unverified-partial**（文档页 headless 实拍 1 图；未实机操作 agent）
- 证据：`v0-agentic-2026-10-17.png`
- 过程备注：原计划 v0 MCP 文档 404（路径不存在，如实记录）→ 改道 Agentic features 页。

## ① 机制（文档实据）

1. **核心能力四项**：Web search（实时搜索，结果内联可点源链接"so you can verify them"）/ **Browser use**（打开自己构建的应用、使用它们、**critique designs**、debug 复杂流程并主动修复；**工作过程中给你发送它看到的截图**；也能访问外部 URL 抓视觉参考或检查布局再复刻）/ 自动修错 / 外部工具集成（Marketplace/MCP/终端命令）。
2. **"Every action runs inside an isolated sandbox, and you control how much autonomy v0 has."**——沙箱隔离 + **用户可控自治度**。
3. **Automatic error fixing**：检测到错误后诊断并自动修复四类（缺文件依赖/语法格式/运行时错误/导入导出问题）；部署报错时出现「**Fix with v0**」按钮，发送错误日志→诊断→自动修复。
4. **免费额度细则（值得注意）**："Free fixes apply to **unedited code** — if you've manually edited the source before clicking Fix, it uses credits."——**对人工改过的代码不免费**（区分 AI 产物 vs 人工产物）。

## ② 研判（三条重要判读）

1. **"发截图给你看"= 过程可视化的平台版**：v0 在浏览器使用中主动推送它看到的截图——与本仓画布"证据留痕"同向，但它是**过程内即时**、我们是**门后持久台账**（可跨任务复核）。互补关系。
2. **"you control how much autonomy"= 自治度旋钮**：平台把"AI 能做多少"做成用户可调——对照本仓六道门（每个关键点停），我们更粗粒度但**强制**；他们是细粒度但**可选**。再次印证：**强制性是我们的差异化**。
3. **"Free fixes apply to unedited code"= AI 产物与人工产物的血缘区分**：平台用计费区分"纯 AI 生成"与"人改过"——**这与本仓"证据分级"是同一思路的计费版**：不同来源的产物可信度/成本不同。可借鉴：产物墙可标注"AI 直出 vs 人工修订"来源标记。

## ③ 不抄

- 沙箱执行环境（本仓无运行时）；Fix 按钮计费模型；MCP Marketplace。

## ④ 对本仓落点

- K2：insight 简卡（本文件）+画布离线导出包增量（本轮增量 19）+evals +2（offline-export-bundle/export-manifest-traceability）语料 109→111。
- **立卡候选**：产物墙条目增"来源"标记（AI 直出/人工修订）——借鉴 v0 的 unedited 概念，把血缘写进证据。
