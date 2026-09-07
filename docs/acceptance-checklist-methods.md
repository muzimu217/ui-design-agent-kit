# 方法案例融入验收测试清单（供审核）

> 审核对象：本轮从 workbuddy「像素君 UI 设计师」插件（来源：agency-agents MIT、
> impeccable Apache-2.0、anthropics/skills 框架）融入本 kit 的方法案例。
> 审核人可对照本清单逐项核验；机器检查项可直接运行，内容检查项按"文件 + 预期
> 内容"人工核对。

## 一、融入范围（P0 + P1，共 7 项）

| # | 融入项 | 来源模块 | 落点文件 | 变更摘要 |
| --- | --- | --- | --- | --- |
| 1 | 设计上下文收集门 | impeccable「设计上下文」 | `references/ui-designer-thinking.md` + `SKILL.md` | 设计前必须确认受众/用例/品牌调性；**不得仅靠读代码库推断**；来源顺序：请求内 Design Context → 项目设计文档(.impeccable.md) → 问用户 |
| 2 | AI Slop 检验 | impeccable「The AI Slop Test」 | `SKILL.md`（Verify） | 每页验收问"展示给人看是否一眼 AI"；独特界面应让人问"怎么做的"而非"哪个 AI 做的" |
| 3 | 六维反模式速查 + AI 配色禁用清单 | impeccable「DO/DON'T」 | `references/design-contract.md` | 字体/色彩/空间/动效/交互/响应六维反模式；禁用纯黑纯白、青+深色、紫蓝渐变、霓虹、默认深色+发光 |
| 4 | AIDA 文案框架 | frontend-dev「persuasive copywriting」 | `references/design-contract.md` | Writing tone 行扩展：收益导向 CTA（attention→interest→desire→action） |
| 5 | 交付补强 | agents/ui-designer「Deliverable Template」 | `references/design-contract.md` | 44px 触控目标、200% 文本缩放、断点策略(320/640/1024/1280)、完整状态枚举、同视口 QA 协议 |
| 6 | 媒体资产生成候选路由 | frontend-dev「AI 媒体生成」 | `references/tool-routing.md` | minimax 图像/视频/音乐/TTS 列为**候选未验证**能力；用前须核发者/许可证/环境/输出条款 |
| 7 | 资产命名/目录规范 | frontend-dev「Assets」 | `references/tool-routing.md` | 资产命名 `{type}-{descriptor}-{timestamp}.{ext}`、assets/ 目录树（images/videos/audio） |

## 二、机器检查（自动可跑，全部应通过）

```bash
npm run verify          # 期望 {"ok": true, "errors": []}；skills 15 个、锁文件合规
npm test                # 期望 13/13 通过（含单文件 prompt 嵌入与锚点测试）
npm run prompt:build    # 期望 output/ui-design-agent.system.md 正常生成
git grep -n "AQ\." .    # 期望无输出（无密钥泄漏）
```

## 三、内容正确性检查（人工逐项核对）

| # | 核对文件 | 预期出现的关键内容 | 核对点 |
| --- | --- | --- | --- |
| 1a | `ui-designer-thinking.md` | `## Design context gate` 段 | 含"required context: audience/use cases/brand"与"do not infer from the codebase alone" |
| 1b | `SKILL.md` | Establish a direction 内 `Confirm the design context first...` | 上下文来源顺序与"ask the user"逻辑 |
| 2 | `SKILL.md` | Verify 段含 `AI-slop test` | "which AI made this" 判定与每轮清单呈现 |
| 3 | `design-contract.md` | `## Anti-pattern quick reference` 六维表 | 六行（Type/Color/Space/Motion/Interaction/Responsive），Don't 列含 AI 配色禁用信号 |
| 4 | `design-contract.md` | Structure 表 Writing tone 行 | 含 "attention -> interest -> desire -> action" |
| 5 | `design-contract.md` | `## Delivery hardening` 段 | 44px、200% 缩放、320/640/1024/1280 断点、状态枚举、QA 协议 |
| 6 | `tool-routing.md` | 候选能力表 `Media assets` 行 + 媒体生成说明段 | minimax 标注候选未验证；"never report a generated asset as shipped" |
| 7 | `tool-routing.md` | Assets bullet 命名规范 | `{type}-{descriptor}-{timestamp}.{ext}` 与 assets/ 目录树 |

## 四、行为验证（可选，建议用现有 demo 复现）

1. 用 v5 链跑一个微任务，检查：**上下文收集是否发生在设计稿之前**（先问受众/用例/品牌调性，而非直接出稿）
2. 检查验收记录是否含 **AI Slop 检验** 项（每页判定 + 是否呈现给用户）
3. 检查设计契约的 Rules: Don't 是否引用反模式清单（例如未采用 `transition: all`、未使用青+深色 AI 配色）

## 五、未融入 / 待确认项

| 项 | 状态 | 说明 |
| --- | --- | --- |
| impeccable 30-playbook 升级（adapt/audit/bolder/colorize/delight/...） | ⏳ 待用户确认 | 需替换已 vendored 版本（Apache-2.0 兼容、保留 NOTICE），改动面大，另行处理 |
| 身份指令（Identity Directive）、连真实 Chrome 保留登录态 | ❌ 不采纳 | 平台要求 / 与安全边界冲突 |
| 对方 CSS 示例中的 `transition: all` | ❌ 不采纳 | 与 motion-contract 明确禁止项冲突，仅借鉴方法论 |

## 六、审核结论（审核人填写）

| 项 | 结论 |
| --- | --- |
| 机器检查 | ☐ 通过 ☐ 未通过（附输出） |
| 内容检查 1-7 | ☐ 全部通过 ☐ 需修改（注明条目） |
| 行为验证 | ☐ 通过 ☐ 未执行 ☐ 需修改 |
| 总体意见 | |
