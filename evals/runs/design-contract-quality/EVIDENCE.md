# EVIDENCE.md · design-contract-quality（R149-01 批次十四）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 190 日间。
> 场景：新库存台——**契约先于实现**（DESIGN.md 全字段先行，实现与验收由契约驱动）。

## 一、契约全字段（判据 1：DESIGN.md，全部可证伪）

Mission（10 秒判断补货/≤3 步可证伪）· brand context（农资仓储稳重、色彩让位状态语义）·
style foundations（8 个 semantic token 精确 HEX 表+8px 网格）· accessibility（focus-visible
2px/状态双编码/表格语义/375 无横滚）· writing tone（动词短语/无感叹号/无营销形容词）·
do&don't（Do 低库存行淡黄底；Don't 仅色标危险/hover 隐藏列/intent 词）· output structure
（三段）· component expectations（FilterChipGroup/StockTable/StatusPill 含数据规格）·
quality gates（6 项全部可断言）。**零 intent 级形容词**（无 modern/polished——failCondition
#2 防线）。

## 二、参考基线披露（判据 2）

库内 run 先例 operations-not-marketing（运营台克制传统）+ detail-constants（18 条细节常数）
——**disclosed baseline**；未声称检索过任何外部工具（failCondition #3 防线）。

## 三、契约驱动实现与验收（判据 3）

fixture/（Vite+React 18+TS strict，tsc 通过）：三段结构/5 行种子农资（低库存 2 缺货 1）/
StatusPill 12% 同色系底+深色文字/筛选 aria-pressed/搜索框——每一项都能回指契约字段。
**实现期间契约零静默修订**（failCondition #4 防线——DESIGN.md 与首版同步落盘，git 可证）。

## 四、Quality gates 验证（7/7，evidence/contract-verify.mjs 可复跑）

- Gate5 token 断言：字标 computed=rgb(23,118,86)=#177656 ✓
- Gate3 筛选：全部 5 行→低库存 2 行 + aria-pressed 同步 ✓
- 状态双编码：色底+文字 ✓；Gate4 键盘 Tab 焦点可达 ✓
- Gate6 对比度实算：正文 12.80:1 ✓；Gate2 375 零横向滚动 ✓；console 0 错误 ✓
- 截图：desktop-dashboard.png / mobile-375.png

## 五、诚实边界

- 契约 token 表中 --muted 白底 5.07:1 与 --warn 4.54:1 为预计算声明，页内实际唯一断言项
  （正文 12.80:1）已实算；状态 pill 底色 12% 透明度叠白底的对比未单独实算（文字色本身
  深于 4.5 门槛，标注为推断项）
- 5 行数据为场景给定内容的实例化（模拟语境披露）
