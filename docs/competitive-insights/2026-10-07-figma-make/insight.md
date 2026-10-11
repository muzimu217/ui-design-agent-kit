# 对标洞察：Figma Make——第四轮学习循环

- 日期：2026-10-07 ｜ 检视级别：**unverified-partial**（实看落地页截图+完整 DOM 探查；kits/skills/MCP 均为官方帮助文档链接所述，未实机操作）
- 证据：`landing.png`

## 机制观察（DOM 实据，非转述）

1. **Make kits**：设计系统包一键挂载——"Sync your npm packages, library styles, and guidelines directly"，另可附 Figma 画框/PDF 作上下文。
2. **Custom skills**（官方能力清单在列）+ **MCP connectors**（接外部工具作上下文）。
3. **点选即改**：示例文案"光标高亮 CTA 按钮，AI 输入框说 'Make the button glow on hover'"——点元素直接 prompt 修改。
4. **原型 Comments**：给原型/应用留协作反馈，作为产品功能。
5. **Make on your local codebase (Beta)**：本地代码库模式（Coming soon）。
6. 定位语："Prototype. Polish. Ship." + "Start with design context, prompt, then edit on the canvas"——**上下文先行**。

## 对照我们（最刺眼的一轮）

| Figma Make 在造 | 我们仓库里早已存在的对应物 |
| --- | --- |
| Make kits（设计系统包挂载） | 设计契约 + `tooling/sources.lock.json` 钉版 + uak-design-system 本地检索 |
| Custom skills | `.agents/skills/` 22 个技能（更早、更细） |
| MCP connectors | `.codex/config.toml` 的 MCP 编排（motion/context7/shadcn/playwright） |
| 点选即改 | 门 C 原型 + 细节自评内环 + uak-visual-critique |
| Comments 反馈 | 门 E 人裁决 + 问题清单 |

**结论：设计工具 incumbent 正把"上下文+技能+引用"架构逐件商品化——行业在收敛到我们仓库的形态；我们的护城河不在这些件，在门与证据（人裁决+五级证据+实验级可审计）。**

## 可借鉴

- **立卡**：借鉴 Make kits 的"一键挂载"呈现——我们的设计契约/品味档案目前对用户是隐形资产，做一个"把契约/品味一键注入本次任务"的显式开关（门 A 呈交件，先立卡不私改）。

## 不抄

- 无门、无证据、无实验闭环——他们的"Keep the control"是文案，我们的是机制。

## 反馈

- K1=本卡；K2=立卡（契约/品味一键注入开关）；K3=本目录截图。
- 下轮对象预告：Copilot agent mode 文档（"规划→执行→监控"叙事）或 B站需求信号。
