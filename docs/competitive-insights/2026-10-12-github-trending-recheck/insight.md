# 对标洞察：GitHub trending 复访（三日增量）——第二十五轮学习循环

- 日期：2026-10-12 ｜ 检视级别：**unverified-partial**（trending 榜单实拍+DOM 提取 9 条+榜首 rea 仓库详情实拍；未实机运行）
- 证据：`trending-daily-2026-10-12.png`（每日榜单）、`morluto-rea-2026-10-12.png`（榜首详情）
- 上检：2026-10-10（context-mode 首现）；复访粒度 3 天增量（合规）。过程备注：本轮 codearts 排障占用主要时间（认证+信任修通、执行层挂死），学习循环按轻量粒度快速完成。

## ① 榜单增量（相对 10-10）

1. **榜首 morluto/rea**（★156,478，单日 +45,327）：**"Reverse engineer anything with agents, from app behavior down to native binaries"**——agent 逆向工程工具（Ghidra/Hopper/IDA 类），TypeScript。**仓库根有 `.agents/skills/` 目录**（AGENTS.md 约定的又一大厂级采用）；commit 署名活跃、CI 状态公开（failure 亦显示）。
2. **context-mode 连续多日在榜**（★27,279，上检 20k 级→3 日 +1,943）——上下文预算家族第六收敛者持续升温；描述新增 "**enforces routing across 17 platforms via MCP + hooks**"——多平台路由+强制机制成卖点（与 13 宿主工作台同向）。
3. **storytold/artcraft 新面孔**（★21,978）："ArtCraft is an intentional crafting engine for artists, designers, and filmmakers"——**"intentional crafting"（意图驱动创作）**：设计向 agent 工具进入大众视野，非代码向。
4. **cathrynlavery/diagram-design 连续在榜**（★52,588）——44 种 diagram 类型×多 harness（Claude Code/Codex/Copilot/Cursor/Factory Droid/Pi）；Harness 清单再次扩张（**Pi 首次出现**）。
5. **free-claude-code**（★59,104）："Use Claude Code, Codex, VSCode, Pi, and OpenCode (**and 6 other harnesses**) for free (1.3B+ free tokens)"——**harness 聚合+免费 token 引流**：10+ harness 清单商品化。

## ② 机制研判

- **Harness 清单通胀**：我们的 13 宿主 ↔ diagram-design 的 6 家 ↔ free-claude-code 的 10+ 家——"支持 N 家 harness"已成标配叙事，**差异化不能靠家数**；靠的是"接入后干什么"（工作流 vs 免费引流）。
- **.agents/skills 约定成为头部项目标配**（rea 根目录直落）——ADR-0003 路线第三次获头部项目实证。
- **design/creative agent 进入 trending**（artcraft）：UI 专项赛道的市场热度上升，需求侧验证。
- 强制路由（context-mode "enforces routing…via MCP + hooks"）——"hooks 强制"与我们六道门"人裁决"是两种强制；前者防技术漂移，后者防方向漂移。

## ③ 可借鉴 / ④ 不抄

- 借鉴：context-mode 的描述方式（一句机制+一个数字+一个平台数）——README 措辞参考。
- 不抄：免费 token 引流（不可持续且非我们模式）；逆向工具领域（非 UI 专项）。

## ⑤ 对照表

| 维度 | trending 现状 | 本 kit | 判定 |
| --- | --- | --- | --- |
| Harness 叙事 | 6-10+ 家成标配 | 13 宿主 | 家数不构成差异化，工作流才是 |
| 指令约定 | .agents/skills 头部标配（rea） | ADR-0003 同款 | 第三次头部实证 |
| 强制机制 | hooks 强制路由（context-mode） | 六道门人工裁决 | 技术强制 vs 方向强制，正交 |
