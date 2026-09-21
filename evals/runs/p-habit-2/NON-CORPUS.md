# NON-CORPUS 台账标记

本目录**不进** `evals/scenarios.json` 语料、**不占** `evals/results.json` 台账键。
原因（大师第 3 轮复审"二选一"裁决，2026-09-20）：p-habit-2 是用户委托代行
裁决下的**全链产品交付归档**（门A 用户裁决 → B/C/E 代行 → 验收收尾），不是
预注册行为场景的执行；回溯补造场景再打分属于事后拟合，不做。

链路合规证据不改由评分台账承担，由以下机械证据承担：

- `npm run chain:audit -- evals/runs/p-habit-2` → `ok: true`（门A passed 等）；
- `EVIDENCE.md` 逐门呈交物/裁决表；`docs/gates.md`（本目录内）全门记录；
- iteration-log 2026-09-20 三条留痕。

doc-drift 测试据此放行：`evals/runs/` 下每个目录必须在 `results.json`
runs 有键，**或**含本标记文件。
