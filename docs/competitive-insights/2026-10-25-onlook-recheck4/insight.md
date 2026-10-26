# Onlook 复检·第四次（学习循环第一百轮）——local-first 升格为定位词

- 日期：2026-10-25 ｜ 点档：08（开发线）｜ 检视级别：**verified-partial**（onlook.com 首屏实看；未下载实测编辑器）
- 对象：onlook.com（上次检视 69 轮 2026-10-19，隔 6 天）
- 截图：onlook-home.png（本地留存，ADR-0002）

## 机制观察

1. **local-first 升格为定位词（本轮最大信号）**：首屏主标语一手实拍 "**Onlook is a free, local-first editor where designers craft exceptional experiences in code**"——local-first 从技术特征（69 轮记录的开源旧版）升格为**定位主词**。90 轮生存位判读（Motiff 死因=云端锁定，数据可迁出性成为竞争项）获得最强市场确认：商业竞品把"本地优先"直接写进 H1。
2. **角色品类创建**："The Developer Tool for **Visual Engineers**"——不复用"设计师/开发者"既有品类，自造"视觉工程师"角色（品类创建策略：新品类无竞品对位）。
3. 商业化推进：27,000 GitHub stars 庆祝横幅（增长在位）+ MEMBERS ONLY/Join the syndicate（会员制文案，playful 恶棍主题 demo 内容——产品 demo 本身用趣味叙事）。
4. **第四层连续 30 轮无存活对标者**：全页零验证/测试主张。

## 判读

1. **生存位判断的市场验证闭环**：90 轮从 Motiff 死亡推出"云端锁定是死穴、local-first 是抗关服形态"→ 96 轮幸存者收敛（互操作/历史版本/私有化）→ 本轮 local-first 成为竞品主标语。**从死亡案例推出、被幸存者收敛、最终被竞品定位采纳**——三段证据链完整，kit 的 local-first+离线复核包形态判定无需调整。
2. "Visual Engineers"品类创建与 kit 的受众策略对照：kit 不造新品类（用户是"被 AI 生成工作流所困的开发者/产品经理"，问卷 C2 四痛点实录），品类创建是融资叙事工具，kit 无融资诉求——不抄。
3. 会员制文案（MEMBERS ONLY）与开源旧版并存的"开源引流+托管收费"路线（69 轮判读）继续在位。

## 不抄什么

恶棍主题趣味叙事（品牌声线不同）；MEMBERS ONLY 会员文案；"Visual Engineers"品类创建。

## 借鉴→落地

- K2：增量 72=工作台状态持久化（stage/audit/wall 三处 tab 选择存 localStorage、重载恢复——local-first 的界面对应物：用户的选择留在用户机器上，续写"持久化要使用"）。
- KPI4 第三十二条：工作台状态持久化（选择留用户机器+重载恢复实测）vs Onlook local-first 定位词——us 6/6 vs them 1/1（定位词可读 1；其 local-first 机制的公开验收口径不可观测记 null）。
- evals +2：local-first-as-positioning-word / workspace-state-user-machine-persistence。
