# NON-CORPUS

- 日期：2026-10-03（轮 292 预执行）
- 目录性质：**prototype-handover-four-states 场景的执行证据与夹具**——场景定义暂以 `scenario-staged.json` 就绪稿形式存此，尚未入 evals/scenarios.json，故 results.json 无对应键，本标记即为 runs 目录守卫的合规说明。
- 原因（为何暂不入册）：入 scenarios.json 即触发语料 71→72 级联（eval-report/goal/quality-monitor），而 eval-report-2026-09.md 与 results.json 均被并行会话未提交 WIP 占用（+19 行在途）。按"绝不混提并行 WIP"纪律，--record 与级联顺延至锁释放，届时：粘贴场景→npm run eval -- --record prototype-handover-four-states --data data-*.json→口径级联→三连→删除本标记（或保留为预执行档案）。
- 执行实录：13/13 实机断言 PASS（数据单口/四态切换/骨架同构/空态行动邀请/错误态原因修复/语义 token 外零 hex/console 0）；lint:spec 8 字段全登记（本夹具=规格门首个真靶）；D10 四态截图主代理亲眼复核。
- 内环记录：断言两处自身缺陷（用渲染后 DOM 查硬编码必命中 JS 渲染值；纯数字与布局数值巧合命中）+夹具一处真缺陷（.pill.ok 自由 hex #e7f3ee 未走 token）——三处当场全修后复跑全绿。
- 门径说明：夹具沿用已过门A 的库存台方向（R061-01 先例，方向稿经用户"门禁通过"），本批无新方向裁决需求。
