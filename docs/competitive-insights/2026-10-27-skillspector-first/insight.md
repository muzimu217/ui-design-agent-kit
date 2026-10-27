# NVIDIA SkillSpector 首检（学习循环第一百一十七轮）——第四层外围的巨头安全形态 + 可执行对接立卡

- 日期：2026-10-27 ｜ 点档：08（开发线）｜ 检视级别：**verified-partial**（GitHub API 三数+README 一手实读；未安装运行）
- 对象：NVIDIA/SkillSpector（113 轮 trending #7 留观的复核执行）
- 截图：skillspector-readme.png（本地留存，ADR-0002）

## 机制观察

1. **定位：skill 安全扫描器（不是 skill 本体）**——"Security scanner for AI agent skills. Detect vulnerabilities, malicious patterns… before you install them"。NVIDIA 入局 skill 生态占的是**验收/安全层**：第四层外围首次出现巨头安全形态（此前邻居=预览对齐/生成器自查，全是"生成侧"；SkillSpector 是"安装侧门禁"）。
2. **skill 生态安全基率首次量化**："31,132-skill 分析子集中 **26.1% 含漏洞、5.2% 疑似恶意**"——第三方 skill 的安全风险有了数字（此前只有定性"供应链风险"叙事）。
3. **Verified Skills 管线**：扫描→评估→**签名**→发布到 NVIDIA skills catalog——skill 的"应用商店审核"供应链成型。
4. **技术深度**：71 漏洞模式 ×17 类（prompt injection/数据外泄/权限提升/供应链/过度代理/MCP least privilege/**MCP tool poisoning**…）+ 两段分析（静态+LLM 语义）+ 0-100 风险评分 + fail-closed 资源上限 + **基线/误报抑制（glob 规则，重扫只浮新问题）** + SC4 查 OSV.dev。
5. **Pi extension**：可作为 Pi 工具装进 agent 会话（/skillspector 命令）——PI-Desktop 生态直连（宿主相关，留观）。
6. 22,705 星、今日 push、Apache-2.0。

## 判读

1. **第四层光谱再添一极**：Base44 预览对齐（106）→ Figma agent 产品化（108）→ **NVIDIA 安装侧安全门禁（本轮）**——第四层不再只是"验收回执"单一空位，而是"对齐-验证-安全"三个子方向都有人进场的早期市场。kit 的六维验收回执占"质量验收"子位；"安装安全"子位已有巨头。
2. **kit 的供应链纪律是 SkillSpector 问题的原始形态**：上游钉版（sources.lock 40 位 revision）+NOTICE+双源核对 = "安装前知道装的是什么"；SkillSpector = "安装前知道装的是否有害"。**可执行对接立卡：用 SkillSpector 扫 kit 的 .agents/skills/（20 个第三方钉版技能）**——但引入 Python venv/uv 依赖属环境变更，**本轮立卡待用户裁决不擅自安装**。
3. 基线/误报抑制模式与 kit 的 wall-reconcile（断言 vs 回执）同构：重扫只浮新增——独立仪器设计再次收敛。

## 不抄什么

0-100 评分的具体权重（无对应威胁模型）；Docker/uv 技术栈（环境边界）。

## 借鉴→落地

- K2：增量 88=**SkillSpector 扫描 kit 技能库立卡（待用户裁决）**——裁决通过后：uv 安装→扫描 .agents/skills/ 全量→报告入 output/→基线抑制规则与既有 finding 对账。立卡理由：第四层判读的第一次可执行对接（用邻居的仪器扫自己），引入依赖属环境变更须裁决。
- KPI4：沿第四十四条口径（立卡轮无新产物对照面）。
- evals +2：skillspector-install-side-gate-giant-form / skill-ecosystem-security-base-rate。
