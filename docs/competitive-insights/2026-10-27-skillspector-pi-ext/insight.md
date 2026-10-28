# SkillSpector Pi extension 深看（学习循环第一百一十九轮）——确认边界设计与 kit 门控第四次同构

- 日期：2026-10-27 ｜ 点档：08（开发线）｜ 检视级别：**verified-partial**（docs/PI_EXTENSION.md 一手全文实读；未安装运行）
- 对象：NVIDIA/SkillSpector Pi extension（117 轮首检的留观延伸——PI-Desktop 生态直连深看）
- 截图：本轮为 raw 文档实读（无页面截图必要，文档即证据）

## 机制观察

1. **安装与形态**：`pi install /path/to/SkillSpector` → `/reload` → 注册 `skillspector_scan` 本地工具。要求：Pi + Python ≥3.12,<3.15 + uv + 本地 checkout。
2. **工具参数面**：target（路径/URL/zip/Git 仓/SKILL.md）、format（terminal/json/markdown/**sarif**）、noLlm 默认 true、provider（anthropic/gemini/nv_build…）、yaraRulesDir、verbose。
3. **确认边界设计（本轮最大发现）**：会话工作目录内的输入免确认；**远程目标与外部路径需要确认**；重定向别名显示解析后目的地；Print/JSON 会话（无法弹确认框）直接拒绝；本地目标沿用 CLI 的 **symlink 拒绝**；YARA include 指令禁用（仅自包含规则）。**fail-closed 确认边界与 kit 六道门同思想**——外部输入要确认、不可确认的通道直接拒绝、别名透明化。
4. **时限设计**：静态扫描 120 秒进程上限、LLM 630 秒（工作流预算 600+启动写报告）——上限显式且不受环境变量放大（"stays fixed even if configured above"）。

## 判读

1. **同构收敛第四次（升级判读）**：117 轮记录仪器同构（基线抑制 vs wall-reconcile），本轮发现**确认边界设计同构**（外部需确认/不可确认即拒绝/别名透明 = 六道门"外部素材需确认+不可验证不放行"的仪器版）。四族收敛（负自测/基线抑制/确认边界/三段记录）跨两个独立团队——**这些不是 kit 的发明而是 AI 工具时代的收敛常识**，kit 的独特性在"把收敛常识组合成完整工作流"而非单项发明（论文叙事再校准）。
2. **PI-Desktop 可用周边（用户侧价值）**：SkillSpector Pi extension 可装进用户的 PI-Desktop（`pi install`），为 PI-Desktop 的 agent 会话提供 skill 扫描——**列为 PI-Desktop 可选增强候选入待裁决清单**（不擅自装：涉及用户自己的另一项目）。
3. 时限显式固定不受配置放大——与 kit 的"上限如实标注"同纪律（a11y:sweep Tab 上限、trending 48h 通道都是显式上限）。

## 不抄什么

SARIF/OSV.dev 集成（无对应威胁模型）；nv_build 私有 provider。

## 借鉴→落地

- K2：增量 90=**PI-Desktop SkillSpector 增强候选入待裁决清单**（用户自己的项目，不擅自装）+ 深看记录入册（本文档）。
- KPI4：沿第四十四条口径（深看轮无新产物对照面）。
- evals +2：skillspector-pi-extension-confirmation-boundary / convergence-fourth-instance-composition-novelty。
