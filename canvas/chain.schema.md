# chain.json · 需求解析链路数据契约（画布阶段 2 schema v1）

- 日期：2026-10-13 ｜ 状态：v1（随画布阶段 2 增量演进）
- 用途：每轮产物一条链路文件，画布据此渲染「需求解析链路」——`原始口语 → 解析摘要 → 范围 → 关键问题 → 参考素材 → 设计契约 → 产物 → 验收证据`，每步可展开"AI 依据什么决定"（黑盒→白盒）。
- 落盘位置：`canvas/chain-<chainId>.json`（入库跟踪；构建产物仍在 output/ 不入库）。
- 借鉴来源：v0 Design Systems 2.0 的"starter app 验证理解"（2026-10-13 深读）——链路内建 `verify-understanding` 步（AI 复述需求摘要供用户比对）。

## Schema

```jsonc
{
  "chainId": "string（唯一，kebab-case）",
  "title": "string（任务名）",
  "round": "string（产出轮次，如 2026-10-13-08）",
  "requirement": {
    "raw": "用户原始口语（逐字，不改写）",
    "summary": "门 A 解析后的需求摘要",
    "scope": { "in": ["做"], "out": ["不做"] },
    "keyQuestions": ["关键问题（门 A 呈交时列出的）"]
  },
  "verifyUnderstanding": {           // v0 式理解验证：AI 复述，用户比对
    "restated": "AI 用自己的话复述需求（给用户比对）",
    "confirmedBy": "user | pending",
    "at": "ISO 时间"
  },
  "steps": [                         // 复用 task-state stages 顺序 + decisions
    {
      "id": "brief | reference | contract | build | verify | deliver",
      "title": "string",
      "status": "pending | active | gated | passed | blocked",
      "detail": "这一步做了什么（白话）",
      "evidence": ["相对路径或 URL（截图/文档/产物）"],
      "decision": {                   // 该步的关键决策及依据（白盒核心）
        "question": "当时面对的选择",
        "chose": "选了什么",
        "basis": ["依据引用（文档/对话记录/数据）"]
      }
    }
  ],
  "artifact": { "path": "产物相对路径", "kind": "web|canvas|doc|…" },
  "acceptance": { "sixDim": "六维验收记录路径或摘要", "score": "可选分数" }
}
```

## 规则

1. `requirement.raw` 逐字保留用户原话——解析链路的锚点，**禁止改写**。
2. 每步 `decision.basis` 至少一条引用；无依据的决策视为黑盒步骤，链路渲染时标黄。
3. `verifyUnderstanding.confirmedBy=user` 前链路不得推进到 contract 步（对应门 A）。
4. schema 演进走本文件修订记录，不静默改。
5. 单链路单设计系统：一条 chain 不混多设计系统/多框架栈（借鉴 v0 Best practices "Keep sources focused"——2026-10-14 收官轮）。
