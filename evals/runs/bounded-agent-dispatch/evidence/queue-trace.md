# 派发轨迹（queue-trace）——以「库存台新增 CSV 导出」为例的真实调度决策

分级背景：项目已有 S/M/L 分级与 A/B/C 角色（A=素材检索、B=设计契约、C=实现）。用户偏好：省 token、一个完成停止再派下一个。轨迹中每个决策都可在 dispatch-simulator.mjs 状态机上重放（断言编号标注）。

## 任务分解与派发序列

| # | 请求片段 | 分级 | 决策 | 依据 |
| --- | --- | --- | --- | --- |
| 0 | 「导出」按钮文案核对（CSV→导出 CSV） | **S** | 主代理直接改，零派发 | 说明比任务长=不派（断言 01） |
| 1 | 导出按钮组件（含菜单态） | **M** | 派 1 个子代理；完成后主代理审查（computed 断言+键盘走查）→释放→结束 | 单活跃+生命周期闸门（断言 02-04） |
| 2 | 完整特性链：素材检索（A）→契约（B）→实现（C） | **L** | 严格串行：A 派发→终结→审查→释放→B；B failed→审查→返工指令→补审→释放→C | 串行闸门（断言 05-08） |

## 串行链逐事件（L 级）

```
t0 派发 A（素材检索）           → active=[A]
t1 A 终态 completed             → active=[]，pendingReview=A（闸门合上）
t2 主代理审查：素材清单 3 primary/2 secondary 封顶核对 ✓ → 释放 A
t3 派发 B（设计契约）           → active=[B]
t4 B 终态 failed（token 超限自停）→ pendingReview=B
t5 主代理审查：失败原因成立→返工指令（契约范围收窄到导出面板）
t6 B 补审通过 → 释放
t7 派发 C（实现）               → active=[C]
```

**t2/t6 两个审查点是硬闸门**：没有它们，t1 的 completed 会直接滚进 t3（主代理失去核对素材清单的机会），t4 的 failed 会被下一个代理静默兜底（失败被掩盖+token 翻倍）。

## 故意违规对照（被调度器拒绝的尝试）

| 尝试 | 结果 | 断言 |
| --- | --- | --- |
| S 级文案核对派出子代理 | 拒：「S-level: main agent handles directly」 | 01 |
| B 运行中同时派 C「省等待时间」 | 拒：「maxActivePerTask=1」 | 02 |
| A 已 completed 未审查就派 B | 拒：「lifecycle gate: awaits review」 | 03 |
| L 链跳过 A 直派 B | 拒：「serial gate: expected A」 | 05 |
| B failed 未审查派 C | 拒：「lifecycle gate」 | 07 |
| 并发例外缺用户授权 / 缺 token 台账 | 拒：「exception gate」 | 09/10 |

违规尝试全部留痕于 `state.violations`（7 条）——调度器不是文档倡议，是会拒绝违规派发的闸门。

## 与本循环自身的对照

评审循环（automation-6898a26f）自身即按此纪律运行：每轮一个主任务串行执行；审计/研究代理按需**单发**、读产出但不读彼此结论；合并 main 前置三连绿审查——循环本身就是这套调度规则的运行实例。
