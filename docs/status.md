# 当前状态（Status）

> 可恢复性补缺（R106-05）：一页看懂"现在进行到哪"。本页只**指向实时
> 数据源**并给出稳定事实，不复制会过期的数字——数字以各源为准。
> 术语见 [glossary.md](glossary.md)。

## 工作分支与发布

- 开发分支：`experiment/uak-paper`（研究、评测、整改的滚动工作分支）；
  线上站来自 `main`（push main 自动重建，见 custom-domain.md）。
- 当前 HEAD：`git log --oneline -1`；远程对照：`git fetch && git status`。
- 发布管线：`node showcase/scripts/build-pages.mjs --base <path>`（含
  assertPublicAppsLive 硬校验）；发布前手动跑 `npm run visual:check` 与
  `npm run lint:detail`（均为建议项，不阻塞 CI）。CI 自测门：kit-self-test。

## 质量与评测（数字看这里）

- 评测覆盖：`npm run eval`（台账 `evals/results.json` vs 语料
  `evals/scenarios.json`）；校验 `npm run eval -- --check`。
- 机械守门：`npm run verify` / `npm test` / `npm run prompt:build`。
- 文档口径机锁：`tests/doc-drift.test.mjs`（语料数/测试数/§4.1 清单/
  quality-monitor 行/README 双语链接集——改这些必须同笔更新）。

## 工单与评审

- 队列总表：`output/review-suggestions/INDEX.md`（gitignored 发件箱）。
- 核销轨迹与逐轮报告：`output/review-reports/`。
- 评审会话：大师 sess_24b15603（读在线仓库）；学员 sess_6e717857（本会话）。

## 长期账（等用户裁决，详见各文档）

- 两场景门A 方向稿（detail-constants-application / slop-test-five-clusters，
  自 2026-09-23 停在用户裁决点）。
- 合并 main：**用户裁决（2026-09-26）"目前都不合并"**——三页 + 锚点修复 + 抛光 + 截图基线继续堆叠在实验分支，等后续指令。
- 依赖裁决：`@axe-core/playwright`（R050-04）、pixelmatch（视觉回归升级）。
- 口径裁决：「六道门」最终称谓；jiejoe-design 补锁（需改 sources.lock.json）。
- B/C 包剩余项与论文门 P3/P5（Zenodo DOI 已达成）。

## 挂账历史

- 决议编号与状态：`docs/gates.md`（D7①-⑨）、
  `docs/archive/d7-decision-packet.md`（包 A/B/C）、
  `docs/product-review-2026-09.md`（D1-D8）。
- 迭代史：`docs/iteration-log.md`（最新在上）。
