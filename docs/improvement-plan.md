# 改进文档（Improvement Plan）

> 交付对象：维护本 kit 的工程师。本文档描述产品愿景对应的思维链改造、
> 已落地改动与后续待办。改动基线：main @ 08d6cfb 之后的工作区。

## 一、产品愿景与思维链

产品定位：**素材 + 提示词驱动的 UI 设计智能体**。核心思维链三步：

```text
第 1 步  素材收集与确认门
        在线上（素材库/成品项目/组件库）检索可复刻的素材，
        整理候选清单（来源 + 拟采用部分 + 授权边界）发给用户，
        用户确认后才允许整合进网站。复刻优于重新自写。

第 2 步  生图能力探测（可选）
        若环境有 AI 生图能力 → 生成示例图辅助方向确认；
        若无法生图 → 明说一次，直接进入第 3 步，不阻塞任务。

第 3 步  Prompt 驱动实现
        生成设计 Prompt，安排代理按契约完成 UI 设计与实现，
        最终交付以 prompt + 代码驱动，不以生图工具驱动。
```

## 二、已落地改动（工作区，未提交）

| 文件 | 改动 |
| --- | --- |
| `references/design-contract.md`（新增） | 可测试设计契约：Mission/品牌/风格基础/无障碍/语气/Do·Don't/输出结构/组件期望/质量门，无需 MCP |
| `references/inspiration-library.md`（新增） | 素材库：10 个来源验证结果、用途路由、授权注意、可达性信号表、素材确认门 |
| `SKILL.md` | ① reference-first 加入灵感库与"素材确认门"；② 生图能力探测与降级；③ 验证对照设计契约质量门 |
| `references/tool-routing.md` | ① reference-first 步骤 2 挂接灵感库、新增步骤 3"候选清单交用户确认"；② Assets 补充生图可用性探测与降级 |
| `scripts/build-prompt.mjs` | 单文件导出数组加入 design-contract 与 inspiration-library |
| `README.md`、`docs/usage.md` | 同步新参考文件链接 |

## 三、思维链落地位置对照

| 产品行为 | 对应提示词位置 |
| --- | --- |
| 网上找成品素材 → 发给你确认 | `SKILL.md` reference-first 条目 + `tool-routing.md` 步骤 2/3 |
| 复刻优于自写 | `SKILL.md` "replicating a proven example is preferred" |
| 有生图则生成示例图 | `SKILL.md` Route capabilities + `tool-routing.md` Assets 条目 |
| 无生图则降级继续 | 同上，"state that once and proceed" |
| 最终靠 prompt 安排代理完成设计 | `SKILL.md` "final deliverable is driven by the design prompt" |

## 四、后续待办（工程师执行）

1. **确认 "Awesome DESIGN" 指向**：当前收录 `VoltAgent/awesome-design-md`，
   若用户指 `goabstract/Awesome-Design-Tools` 或其他，替换/补充素材库条目。
2. **真实浏览器复验**：uiverse.io（403）与 uiprompt.site（https 不稳）用
   Playwright 实测后回填素材库"可达性信号表"。
3. **生图能力接入**：若目标环境配置图像生成 MCP/CLI，在 tool-routing.md
   Assets 条目补一条可执行路由（工具名、schema、权限边界），并保持"不可用
   即降级"逻辑。
4. **评测场景补充**（可选）：在 `evals/scenarios.json` 增加"素材确认门"
   与"生图降级"两个行为评测场景（request/context/passCriteria/failConditions），
   保证新思维链可重复验证。
5. **发布前检查**：确认 Remotion skills 上游授权后，再将仓库转为 public。

## 五、验收方式

```bash
npm run verify      # 期望 errors: []
npm test            # 期望 13/13 通过（含单文件 prompt 嵌入与锚点测试）
npm run prompt:build  # 检查 output/ui-design-agent.system.md 含新引用与锚点
```

改完提示词后 `npm test` 的 "single-file prompt embeds its references" 用例
会校验所有 `references/*.md` 链接均已替换为文档内锚点，新增引用必须同步
注册到 `scripts/build-prompt.mjs` 的 references 数组，否则测试失败。
