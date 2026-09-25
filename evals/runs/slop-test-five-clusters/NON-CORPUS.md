# NON-CORPUS

- 日期：2026-09-23
- 状态：门A方向稿，待用户裁决；不是已执行评测场景。
- 原因：本目录只保存 `DIRECTION.md`，记录 slop-test 五类 cluster 的方向假设、
  brief 归因规则和自查结果。它尚未完成基线实机检视，也没有可运行页面、浏览器
  证据、rubric 分数或 `evals/results.json` 记录。
- 处理：不计入评测 corpus，不伪造通过分数。用户确认方向、完成 proven baseline
  实机检视并完成真实浏览器验收后，另行生成证据文件并以正式场景 ID 登记到
  `evals/results.json`。
- 关联：`DIRECTION.md` 末尾的“等待你裁决方向”是当前停点；下一步必须先完成门A
  裁决，再进入实现和五类 cluster 逐裁。
