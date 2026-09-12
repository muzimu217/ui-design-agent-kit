# User Taste Profile

The kit's cross-project memory of the user's design taste and standing
requirements. It answers one question: **when the agent selects anything or
drafts any direction, what has this user already told us they want?**

Project-specific requirements live in each project's design contract, not
here. This file records only preferences that travel across projects. It is
a ledger, not a scratchpad: entries are appended with dates, never silently
rewritten, and superseded only by newer dated entries.

## Mechanism

Four behaviors, each with a trigger and an evidence rule:

1. **Hit (命中)** — before a direction draft, candidate shortlist, or
   material selection, read this profile. Every candidate presented to the
   user must state which entries it honors and which it deliberately
   violates (a violation is allowed, but it must be named, not silent).
2. **Update (更新)** — when the user states a preference, approval, veto,
   or standing requirement in conversation, append a dated entry in the
   user's language. A changed requirement gets a new entry that supersedes
   the old one by id; the old entry stays visible with status
   `superseded-by T-xxx`. Never edit history in place.
3. **Confirm (确认)** — present the profile digest to the user for
   confirmation at: new-project intake, the first gate presentation after
   any update, or on request. The user confirms, edits, or retires entries;
   retired entries keep their rows with status `retired`. An unconfirmed
   entry still guides work (marked `pending`) but must not be reported as
   user-confirmed.
4. **Drift (漂移)** — when the user's actual selection flips a recorded
   entry (they pick the glass card after "no glassmorphism"), mark that
   entry `contested` and surface the conflict in the next confirmation
   round instead of silently rewriting it.

Scope discipline: process habits (server cleanup, commit workflow) and
single-project constraints (a specific blog's animation requirements) do
not belong here — the first is host memory, the second is the project's
design contract.

## Entry format

```markdown
| id | 状态 | 品味/需求 | 依据（对话/裁决留痕） | 记录日期 | 修订 |
```

- `id`: `T-001` onward, never reused.
- `状态`: `confirmed`（用户确认过）/ `pending`（记录了但未过确认轮）/
  `contested`（近期行为与条目矛盾，待复核）/ `superseded-by T-xxx` /
  `retired`（用户明示弃用，留行不删）。
- 品味/需求 written in the user's language.
- 依据: the conversation, gate decision, or memory the entry came from.

## Ledger

Seeded 2026-09-12 from established user decisions; the first confirmation
round happens the next time the profile is presented.

| id | 状态 | 品味/需求 | 依据 | 记录日期 | 修订 |
| --- | --- | --- | --- | --- | --- |
| T-001 | pending | 验收与批评必须落到组件/交互粒度，做人类级细节纠错，不泛泛而谈 | 用户多轮拍板"细节粒度标准" | 2026-09-12 | — |
| T-002 | pending | 功能 100 ≠ 样式达标；界面必须真跑链路，样式八维入台账，评分不得为低质背书 | 用户整改轮拍板"样式达标与链路强制" | 2026-09-12 | — |
| T-003 | pending | 交互/动画/3D 优先用现成素材与组件拼接；CSS 手画是例外，需记录理由 | 用户拍板"素材拼接优先方向" | 2026-09-12 | — |
| T-004 | pending | demo/案例诚实标注：不虚构数据、能力、集成；证据留痕 | showcase 诚实标注体系 + 门账本裁决 | 2026-09-12 | — |

## Usage rules

- Consult before selection, not after: a shortlist assembled without
  checking this profile is a process defect, same severity as skipping the
  inspiration library routing.
- Recording is cheap, confirming is deliberate: append freely during
  conversation, but only mark `confirmed` after an explicit user
  confirmation round.
- This profile rides existing gates and checkpoints; it does not create a
  new gate. The confirmation digest is attached to intake or a gate
  presentation, never a standalone interruption.
- When this file and a project's design contract conflict, the contract
  wins for that project and the conflict is reported in the confirmation
  round as drift evidence.
