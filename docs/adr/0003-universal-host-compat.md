# ADR-0003：通用宿主兼容——一层转换、多次输出

- 状态：已接受 ｜ 日期：2026-10-08（用户裁决） ｜ 证据：docs/competitive-insights/2026-10-08-github-trending/（diagram-design、mattpocock skills 多宿主分发面）

## 背景

同类头部项目按宿主分别维护分发清单（.claude-plugin/、.codex-plugin/、marketplace.json 等）。
用户裁决：本工作流要**兼容所有宿主，而不是分开来支持**。

## 决策

1. **一层转换**：以 `AGENTS.md` 类指令文件约定 + `npm run prompt:build` 单文件导出为唯一转换层。
   任何能读取指令文件（AGENTS.md/CLAUDE.md/系统提示词）的 AI CLI 编辑器或桌面端宿主，
   注入导出文件或 AGENTS.md 指针即可使用本工作流；`scripts/uak-init.mjs` 负责幂等接入。
2. **不做按宿主分别的插件清单**。宿主指令文件名不同时（如 CLAUDE.md），
   用一行指针文件指向 AGENTS.md 或导出文件，不为该宿主维护独立副本。
3. **主界面写教程**：README 与 docs/usage.md 提供通用接入说明——下载安装（npm/npx）即可使用，
   覆盖 AI CLI 编辑器与桌面端宿主。

## 理由

- 行业指令文件约定正在收敛（AGENTS.md 已被多家 CLI 采纳），一层转换维护成本最低；
- 导出文件自包含（引用已内联为锚点、无绝对路径），本就是为跨宿主迁移设计；
- 按宿主分别建清单会把 N 个宿主的分发维护成本引入本仓，收益边际递减。

## 后果

- README/usage 需保持"通用接入"教程与导出自包含校验同步（tests/kit.test.mjs 已锁定无死链/无绝对路径）；
- 若未来某宿主成为主要使用面且指针文件不够用，再以新 ADR 推翻本条（预期不快）；
- `.claude-plugin/` 等目录明确**不建**（除非本 ADR 被取代）。
