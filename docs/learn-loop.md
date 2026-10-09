# 对标学习循环（Learn Loop）——学习→研究→开发→验证→对照→反馈

- 设立：2026-10-07 用户裁定 ｜ 适用：开发线每轮（无人值守与交互一致）
- 一句话：每轮向市场学一点真东西，改一点真东西，留一份可复核的证据。

## 循环六步（每轮至少完整走一遍小循环）

| 步 | 做什么 | 产出 |
| --- | --- | --- |
| ① 学习 | 选定本轮对标对象（外部产品/需求信号），轮换不重复 | 对象声明 |
| ② 研究 | 浏览器实看：机制、流程、用户吐槽/需求信号 | 截图 ≥1 张 + 笔记 |
| ③ 开发 | 提炼一条可执行改进并落地（代码/文档），或立卡说明暂缓原因 | diff 或卡号 |
| ④ 验证 | 改动过三连（verify/test），界面类改动浏览器实拍 | 三连绿 + 实拍 |
| ⑤ 对照 | 与对标机制逐点比对：抄什么/不抄什么/为什么 | 对照表（insight.md 内） |
| ⑥ 反馈 | 知识卡入 iteration-log；下轮研究对象预告 | 日志行 |

## 每轮 KPI（三条，缺一即轮次不合格）

- **K1 知识卡 ≥1**：对标对象、观察到的机制、可借鉴点、来源链接、检视级别如实标注（未实机深用只许标 unverified-partial，不得越级）。
- **K2 优化 ≥1**：落到本仓的 diff；确实不该落的，写明理由立卡（防"为改而改"）。
- **K3 证据归档 ≥1**：`docs/competitive-insights/<YYYY-MM-DD>-<对象>/` 目录：截图 + `insight.md`（含①-⑤步产物），路径入 iteration-log。

## 证据纪律

- 截图必须来自本轮真实浏览器访问（playwright/chrome-devtools），文件名含对象与页面；禁止拿记忆或搜索摘要充当"看过"。
- 对标是**学机制不是抄外观**：借鉴关系写清（如"借鉴其版本对比的并排布局，不抄其配色"）；外观借鉴走素材门。
- 竞品截图仅作内部研究证据，**不上 showcase、不外发**（版权克制）。

## 对象池（轮换起点，持续扩充）

v0.dev（Vercel）｜ bolt.new ｜ Lovable ｜ GitHub Copilot Workspace/agent mode ｜ Figma Make ｜ Motiff ｜ 即时设计 AI ｜ B站 AI 编程吐槽向视频（需求信号）｜ YouTube 评测视频 ｜ GitHub awesome-*/trending（需求聚类）

第一 sweep 9 项已于 2026-10-07~08 完成首轮检视（v0/bolt/Lovable/Copilot/Figma Make/Motiff/GitHub trending/B 站信号/即时设计）。第二 sweep 候选（2026-10-08 第九轮追加）：Pixso ｜ MasterGo ｜ goflygen（B 站推广出现的国产 Agent 全栈框架，痛点真实方案存疑）｜ claude-mem 型跨会话记忆信号 ｜ Figma Make 季度更新复检。进度：第二 sweep 已检 2/5（Pixso 10-08、MasterGo 10-09，国产三强格局图补完：即时设计=插件型 AI/Pixso=生成前置型/MasterGo=Agent 代跑型，三卡互链）。

## 版本记录

- v1（2026-10-07）：用户裁定设立；六步循环 + 三 KPI + 证据纪律 + 对象池。
