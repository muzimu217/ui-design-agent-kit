# 术语表（Glossary）

> 可恢复性补缺（R106-05）：仓库自造缩写与编号体系的唯一定义处。新术语
> 入册到这里，而不是散落在各文档里各自解释。

## 工单与评审

- **R0xx / R<轮次>-<序号>**：发件箱工单编号（如 R107-04 = 大师第 107 轮
  评审的第 4 条建议）。工单文件在 `output/review-suggestions/`（gitignored），
  总表为该目录的 `INDEX.md`。生命周期：open → claimed → done-pending-verify
  → verified / disputed / resolved / blocked。
- **大师轮 / 评审轮**：每小时一次的「大师评审跟进」定时任务轮次（大师会话
  读在线仓库 + 零上下文独立代理双源评审）。核销 = 大师一手验证工单完成
  证据后置 verified；含数字/表格的交付物核销时必须重算数字（R111-01 制度）。
- **代行裁决**：用户委托主代理按品味档案与门径协议在门上代其裁决（门径
  记录须留用户授权出处）。

## 流程与门径

- **门A-F**：六道门 = A 方向稿 / B 素材清单 / C 原型 / D 契约 / E 验收
  （以上五道为用户裁决门）+ F MCP 调用留痕（agent 侧留痕门，非用户停止
  点）。定义在 `.agents/skills/ui-design-agent/references/gate-protocol.md`。
- **S / M / L**：任务分级（窄修复 / 页面级 / 实质性新 UI）。分级只缩放
  产物深度，不缩减用户裁决。
- **三连**：`npm run verify` / `npm test` / `npm run prompt:build`——每次
  改动的机械守门组合。
- **微修通道**：已批准设计内单点小视觉决策（≤3 处/轮）的协议内快车道。
- **协作模式（PEE/PEER/GRR/IS）**：agent 侧分工模式卡，见 plan-execute.md。

## 评测与台账

- **eval 台账 / 语料**：`evals/scenarios.json`（语料）与 `evals/results.json`
  （执行台账）。覆盖率记法 `<已执行>/<语料总数>`。
- **NON-CORPUS**：`evals/runs/<id>/NON-CORPUS.md` 标记——该目录不在语料
  计数内（如门上待裁的方向稿）。
- **五类校准 / AI-slop**：detail-critique.md 的五类 AI 默认味签名表，每轮
  验收须显式表态。
- **样式八维 / 样式分**：detail-critique 的八个维度评分（0-2 制，独立于
  功能分）。

## 决议与账本

- **裁决包（包 A/B/C）**：`docs/archive/d7-decision-packet.md` 的 D7 决议
  分组——A 证据发布完整性、B 知识密度、C 机制升级。各项独立裁决。
- **D1-D8**：`docs/product-review-2026-09.md` 产品评审的决议编号（D5 =
  评测对称性缺口等）。
- **D7①-⑨**：大师评审挂起项包在 `docs/gates.md` 的行内子项编号。
- **基线漂移 a-f**：大师侧每轮核查的六处文档/测试基线一致性哨位。

## 语言地图

- `docs/`、`.agents/skills/`、工单与评审产物：**中文为主**，个别 reference
  为英文（与上游体例一致）。
- `README.md`：完整版中文；`README.en.md`：面向研究者的精简英文版（见其
  Scope note）。
- `paper/`：英文论文（Zenodo DOI 10.5281/zenodo.22804947）。
- `docs/usage.md`：中文，命令与调用示例。
