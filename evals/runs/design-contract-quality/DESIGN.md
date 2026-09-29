# DESIGN.md · 种子仓库存台账（design-contract-quality 评测交付物）

> 本契约先于实现撰写；实现与验收均以下列**可证伪字段**为据。
> 参考基线：operations-not-marketing（run 目录先例，运营台 vs 营销页的克制传统）+
> detail-constants（18 条细节常数）——** disclosed baseline，非虚构外部工具**。

## Mission

让仓库管理员在 **10 秒内**判断 5 类种子农资中**哪些需要补货**（可证伪：完成路径=
打开页面→看状态列→读低库存行，≤3 步）。

## Brand context

农资仓储工具（非营销页）：稳重、少装饰、数据先行。品牌色仅一处（头部字标绿），
其余色彩全部让位给**状态语义**。

## Style foundations（semantic tokens，可证伪=页内 computed 断言）

| token | 值 | 用途 |
| --- | --- | --- |
| --ink | #26343d | 正文 |
| --muted | #61717d | 次要文字（白底 5.07:1 ≥4.5 达标） |
| --line | #d9e2e7 | 边框 |
| --paper | #fafcfd | 页面底 |
| --brand | #177656 | 字标/主按钮 |
| --ok | #177656 | 充足 |
| --warn | #b4690e | 低库存（白底 4.54:1） |
| --danger | #b3261e | 缺货（白底 6.0:1） |
| --focus | #2566c4 | 焦点环 |

间距 8px 网格（8/16/24/32）；圆角 10px（卡）/8px（控件）。

## Accessibility

- 全部可交互元素 `:focus-visible` 2px #2566c4（可证伪：Tab 后 computed outline 非 none）
- 状态=色+文字双编码（禁止仅色标——色弱用户读文字）
- 表格语义 `<table>`；筛选按钮 `aria-pressed`
- 375px 无横向滚动

## Writing tone

动词短语按钮（补货/筛选）；状态单词（充足/低库存/缺货）；**无感叹号、无营销形容词**
（不出现"强大/极致/智能"）。

## Do / Don't

- Do：低库存行整行淡黄底 #fdf6ec + 文字状态
- Don't：仅红色数字标危险；隐藏列靠 hover 才出现；用"modern/polished"类意图词描述样式

## Output structure

单页三段：头部（字标+总数）→ 筛选行（全部/低库存/缺货 + 搜索框）→ 库存表
（SKU/批次/库存/状态 4 列）。

## Component expectations

- FilterChipGroup：aria-pressed 切换，激活态 brand 底白字
- StockTable：5 行种子农资数据（油菜种子/水稻种子/复合肥/多菌灵/地膜），
  低库存 2 行、缺货 1 行
- StatusPill：底色 12% 透明度同色系 + 深色文字

## v2 增补（2026-09-29，用户令「种子数据重置本地数据库，从头测试」——显式修订，非静默 amend）

- **持久化**：库存数据存 localStorage（key `seed-inventory-v2`），刷新保留
- **出入库操作**：每行 ±5 按钮，状态由库存数自动重算（阈值：≤0 缺货；<10 低库存；否则充足——
  种子数据 42/8/120/0/6 与阈值自洽）
- **重置种子数据**：头部按钮清空本地改动恢复初始 5 条（从头测试入口）
- 读写容错：解析失败/隐私模式静默降级为内存态

## Quality gates（验收门，全部可断言）

1. build 通过（vite build）
2. 375px 无横向滚动
3. 筛选点击行数变化正确（全部 5 → 低库存 2）
4. 键盘 Tab 顺序：筛选→搜索→表内按钮，焦点环可见
5. token 断言：body 背景/--brand/状态色 computed 与本表一致
6. 对比度：正文与状态文字 ≥4.5:1（脚本实算）
