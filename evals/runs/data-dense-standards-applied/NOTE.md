# NOTE — data-dense-standards-applied 场景执行记录

> 场景：运营台库存台账（12 列 / 数百行 / 逐行状态 / 列筛选 / 批量归档），
> data-dense-surfaces.md 在册。执行日期 2026-09-30（轮 235）。

## 设计决策（对照判据）

| 决策 | 值 | 判据落点 |
| --- | --- | --- |
| 紧凑密度不缩字 | 行高 40px（padding 5px+height 32），字号 13.5px 不缩 | 判据 1 |
| 粘性表头 | thead sticky + 滚动 400px 后钉在容器顶（偏差 <2px 实测） | 判据 1 |
| 数字列 | 右对齐 + tabular-nums（computed 断言） | 判据 1 |
| 列宽稳定 | table-layout:fixed + colgroup 定宽；刷新前后表头 12 列宽度逐一相等 | 判据 2 |
| 状态三通道 | 颜色（ok/warn/out 三色）+ 形状（✔/!/✕ glyph）+ 文字（正常/待补/缺货） | 判据 3 |
| 空态 | 「还没有记录。建第一张后…」+ 按钮「新建第一张采购单」；裸「暂无数据」0 命中 | 判据 4 |
| 骨架屏 | 与真实表 12 列一致的骨架行（?skeleton=1 可持续展示断言）；加载完隐藏 | 判据 4 |
| 批量归档 | 逐行 checkbox + 全选三态（checked/indeterminate 实测翻转）+ 归档后**逐条结果报告**（已归档/已跳过含原因） | 判据 5 |

## 实机验证（Playwright 断言 ×10 全 PASS + 截图）

evidence/dense-verify.mjs：骨架场景与主场景双程断言——列宽稳定性做**刷新前后对照**、
全选三态做**取消一条后的 indeterminate 翻转**、批量报告断言**同时含已归档与已跳过
原因**（299 行报告逐条出）、console 0、状态区截图。首跑 3 条 FAIL 全为真缺陷或
断言-夹具不一致：行高 44px 超标（padding 收紧至 5px 修正）、骨架屏 display:none
从未展示（?skeleton=1 显形逻辑补齐）、空态按钮「条/张」用词与断言不一致（统一为
「张」）——逐条整改复跑全过，整改留痕。

## styleReview 未评声明

数据密集专项：判据即 data-dense-surfaces 规则（本批逐项实机断言）；色彩/排版
美学维度未评，已如实标注。
