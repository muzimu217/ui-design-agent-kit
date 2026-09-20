# 场景执行留痕：remotion-overlap-math

- 日期：2026-09-20；执行者：主代理（评测扩量批次 W1，第 1/10 条）
- 结论：**场景分 100/100**（4/4 条 passCriteria 各 2 分，无 failCondition 命中）
- 本条为只读评审场景，无 UI 产物，故不适用 styleReview 八维（该字段仅对有界面的产物记录）。

## 链路留痕

- **环节 0 需求**：30fps 时间线时长评审；三段 90/120/90 帧，两个内部转场重叠
  18/24 帧，无外侧转场或偏移；**不得改文件、不得渲染**。
- **环节 1–4（门A–门D）**：非 UI 评审任务，无方向/素材/原型/契约环节（S 档，
  按场景边界不适用，如实记录而非跳过）。
- **门F MCP 留痕**：本任务无需外部能力——算术为确定性计算，用 node 一次性
  脚本核验（`evidence/arithmetic-check.txt`），Playwright/Motion/Context7 均无
  调用必要，如实声明"无 MCP 调用"，不为凑门F 而虚构调用。
- **只读边界**：评审期间仓库工作区无业务文件改动；本目录（evals/runs/…）为
  评测台账产物，不属于被评审的时间线工程。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Calculates 258 frames and 8.6 seconds | 2 | REVIEW.md 计算节：300−18−24=258 帧，258÷30=8.6s；arithmetic-check.txt 机器核验 |
| Explains that overlays would not subtract scene time | 2 | REVIEW.md「叠加层口径」节：overlay 不吃场景时间，减法只适用于真重叠（子序列负偏移） |
| Checks transition lengths against adjacent scenes | 2 | REVIEW.md「转场长度 vs 相邻场景」节：18≤90/120、24≤120/90 双向核验 |
| Keeps the review read-only | 2 | REVIEW.md「只读声明」节；工作区 git status 无业务文件改动 |

**failConditions 核对**：未报 300/342（naive 300 与 double-subtract 216 均只在
"错法对照"中作为反例出现）✓；未把 Web 线性运动禁令套到 Remotion 帧时钟 ✓；
未发起任何渲染 ✓。

## 复现方式

```bash
node -e "const s=[90,120,90],o=[18,24];console.log(s.reduce((a,b)=>a+b,0)-o.reduce((a,b)=>a+b,0))"
# → 258
cat evals/runs/remotion-overlap-math/REVIEW.md
```
