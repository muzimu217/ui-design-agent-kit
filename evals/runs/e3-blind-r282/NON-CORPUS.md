# NON-CORPUS

- 日期：2026-10-03（轮 282）
- 目录性质：**e3 决策质量盲评证据**（R101-01 首跑），非 R149-01 语料扩量批次——本目录不对应 results.json 的场景键，理由如下。
- 原因（为何暂无 results.json 记录）：三条 e3 场景的 `npm run eval -- --record` 会整文件重写 evals/results.json，而该文件当前被并行会话的未提交 WIP（+19 行在途）占用；按「并行 WIP 须显式选择性暂存、绝不混提」纪律，本轮不触碰该文件。--record 顺延至 results.json 释放后执行，届时三条记录将以 `e3-review-repair-boundary` / `e3-resume-approved-direction` / `e3-evidence-led-priorities` 为键落账，本标记随之可移除或保留为盲评档案。
- 双轨方法：`node scripts/eval-e3.mjs` 产出剥离评分标准的盲评包（output/e3/f1272ff7….json，哈希即文件名）→ 零上下文代理仅凭 instructions+三案例盲答（answers-blind-agent.md）→ 持标准侧批改（grading-r282.md，100/88/80 真实梯度）→ 合规 --data 三份（键自 scenarios.json 逐字生成，预校验过 validateRun 规则）。
- 证据清单：answers-blind-agent.md（盲答原文）、grading-r282.md（逐条判分依据）、data-e3-*.json ×3（待 --record 的入参）、盲评包在库副本 blind-packet.json（226KB，含 instructions+三案例、不含评分标准；上游生成位 output/e3/f1272ff7….json 已 gitignored——批 25 审计 P2-4 整改：证据须异机可复核，故落库自证）。
- 工单链路：R101-01（轮 101 开单「e3 盲评双轨建成从未运行」）→ 轮 282 首跑执行 → --record 后核销。
