# Copy Contract

Interface copy is designed content, not decoration: wording can make a
product feel as templated as its visuals. This file sets construction-side
rules for labels, buttons, errors, and empty states; the triage (P0/P1/P2)
and evidence rules come from [detail-critique.md](detail-critique.md), which
applies unchanged to copy findings. Sources: Anthropic frontend-design
"writing in design" chapter (read in full, 2026-09 master armament).

Precedence: the governing design contract and recorded
[user-taste-profile.md](user-taste-profile.md) entries win; a brand voice
may bend phrasing, never the clarity rules below.

## Rules

1. **Name things from the user's side**: call it what it is and what it does
   ("通知", "库存记录"), not the internal mechanism ("Webhook 配置"). No
   selling inside labels — describe, don't promote. Counter-example: a
   settings page titled "赋能中台" for what is a notification list.
2. **Active voice by default; CTAs name the outcome**: the button says what
   pressing it does. Counter-example: "提交" on a settings form — what is
   being submitted where?
3. **One action, one word, everywhere**: the flow's vocabulary is the user's
   navigation. If the button says "发布", the completion state says
   "已发布", the log says "发布成功", and the menu entry says "发布设置".
   Counter-example: create → add → new → submit for the same operation in
   one flow.
4. **Errors obey three laws**: say what happened and how to repair it; do
   not apologize in the interface's voice; never be vague. Errors speak in
   the product's voice, not a person's. Counter-example: "出错了，请重试" —
   no cause, no fix, and an apology nobody asked for.
5. **Empty states are action invitations**: state what will live here and
   offer the first move. Counter-example: a bare "暂无数据" panel with a
   dashboard's worth of empty space.
6. **Plain verbs, sentence-case, no filler**: every copy element does one
   job — a tooltip explains, a button acts, a status reports; no element
   decorates. Counter-example: "温馨提示：为了给您带来更好的体验……" standing
   in for an actual instruction.

## Before / after

| Before | After | Rule |
| --- | --- | --- |
| 提交 | 保存更改 | 2 — the button names the outcome |
| 出错了，请重试 | 网络中断，检查连接后点"重新加载" | 4 — cause + repair, no apology |
| 暂无数据 | 还没有库存记录，添加第一件商品 | 5 — empty state as invitation |

Verification: acceptance rounds compare the interface copy against this
contract alongside the five-cluster typography check
([detail-critique.md](detail-critique.md)); each round's list states the
copy-contract verdict explicitly, with P0/P1/P2 triage identical to visual
findings.
