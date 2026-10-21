# 知识库 Schema v1.2

- schemaVersion：**1**（minor 1.2，向后兼容新增可选字段）
- 更新日期：2026-10-20
- 变更纪律：见 `docs/self-learning-loop.md` §3（向后兼容优先；破坏性变更走 migrations/；卡片不删除只 superseded）

## 一、v1.1/v1.2 新增可选字段（向后兼容）

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `layer` | ⬜ | enum | `composition`（构成/静态形式）/ `motion`（运动/时间）/ `order`（秩序/系统）。用于三层体系检索 |
| `measurable` | ⬜ | boolean | 该机制能否被 check 脚本启发式检测（默认 `false`，不得夸大为可自动判定） |
| `codable.paramProvenance` | ⬜ | enum | 参数来源：`observed`（从作品观察）/ `inferred`（从多例归纳）/ `measured`（本项目实测）。**缺省视为 `inferred`** |
| `alias` | ⬜（v1.2） | string | 场景化别名（如"一眼稳"），用于传播与检索；**是柄不是替换**——正式引用仍用机制标题 |
| `aliasFrom` | ⬜（v1.2） | string | 别名出处（如"75 轮 Vox preset 生态判读"） |

**为什么要这些字段**：v1 只能回答"这条知识说了什么"，回答不了"它在体系里属于哪层""能不能自动检测""数值有多可信"（v1.1 三问）与"怎么向别人提起它"（v1.2 alias——场景化别名是传播单元，参见 75 轮 Vox preset 判读）。全部可选——旧卡无需改写即可继续读取。

## 二、卡片文件位置与命名

```
docs/knowledge-base/
├── schema.md                 # 本文件（版本与字段定义）
├── index.md                  # 人读索引（自动生成可，手维护亦可）
├── index.json                # 机读索引（工作台渲染用）
├── cards/<domain>-<slug>.md  # 卡片本体，domain ∈ {motion, layout, color, type, icon, interaction, three-d, video, workflow}
└── migrations/NNNN-<name>.md # 破坏性变更的迁移记录
```

## 二、Frontmatter 字段（v1）

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `id` | ✅ | string | 唯一，与文件名一致（不含 .md） |
| `title` | ✅ | string | 机制名（**可复用的一句话命名**，不是观后感标题） |
| `domain` | ✅ | enum | 见上 domain 列表 |
| `status` | ✅ | enum | `active` / `incomplete` / `superseded` / `deprecated` |
| `confidence` | ✅ | enum | `verified`（本项目实测）/ `sourced`（外部来源可信）/ `unverified-partial` |
| `source` | ✅ | object | `{kind: video|article|product|experiment, ref: url/路径, author, publishedAt, heat?: 播放量}` |
| `mechanism` | ✅ | string | 机制的一句话解释（为什么有效） |
| `codable` | ✅ | object | `{params: [], constraints: [], appliesTo: [], paramProvenance?: observed\|inferred\|measured}` —— **可编码参数**，缺此视为 incomplete |
| `scope` | ✅ | string | 适用边界（什么场景成立、什么场景不成立） |
| `counterexample` | ⬜ | string | 反例/失效条件 |
| `relations` | ✅ | array | `[{type: extends|supersedes|conflicts|related, target: <card id>}]` |
| `resolution` | ⬜ | string | 当 relations 含 conflicts 时必填：消解结论或"证据不足并存" |
| `version` | ✅ | integer | 卡片自身版本，从 1 起 |
| `createdAt` / `updatedAt` | ✅ | date | ISO 日期 |

## 三、机读索引 `index.json`

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-10-19",
  "cards": [
    { "id": "...", "title": "...", "domain": "...", "status": "active", "confidence": "sourced", "relations": [], "version": 1 }
  ]
}
```

工作台"知识库"区块读此文件渲染（卡数/域分布/最近学习/兼容状态）。

## 四、校验规则（未来接 check 脚本）

1. `id` 与文件名一致；frontmatter 必填字段齐全；
2. `codable.params` 为空 → 强制 `status: incomplete`；
3. `relations.type === "conflicts"` → 必须填 `resolution`；
4. `superseded` 卡片必须存在指向它的新卡（双向一致）；
5. `source.kind === "video"` 时 `heat` 必须填写（播放量信号）。

## 五、兼容策略

- **v1 为基线**；新增可选字段不升 major（记为 v1.x）；
- 语义变更/字段改名 → v2 + migration；
- 读取方（工作台）必须容忍未知字段与缺失可选字段。
