# 门C 原型提示词（Stitch 路径 b · 供网页版粘贴）

> 门F 留痕：Stitch MCP 带真实 key 的 initialize 仍连接超时（HTTP 000，12s
> timeout，网络层不可达、非鉴权问题），按链路降级到路径 b：由用户在 Stitch
> 网页版用以下提示词生成原型图后回贴给 agent 对照。

## Prompt（可直接粘贴到 Stitch 网页版）

```text
Design a dense, quiet inventory operations dashboard (internal tool, light mode).

Layout, top to bottom:
- App bar: product title "库存运营台" (bold, 20px) + a small outlined blue pill badge "DEMO · 演示数据".
- Amber notice banner: "本页所有库存数字为演示样本，不连接任何真实库存系统。"
- Compact filter toolbar: search input with magnifier icon and an inline clear button;
  a category dropdown (全部/货架/周转箱/搬运/包装); a 4-segment control
  (全部/有库存/低库存/缺货) where every segment shows a small count number.
- Main area: dense data table with columns 商品 (name), SKU (monospace),
  分类, 库存 (right-aligned monospace numbers, sortable header with arrows),
  状态. Status is a tinted pill with a colored dot: green "有库存", amber "低库存",
  red "缺货". Row hover highlight, selected row tinted blue. One row shows a
  very long product name truncated with an ellipsis.
- Right side: slide-in detail panel (360px) for the selected item: status pill on top,
  item name (bold), SKU line; large stock number (28px monospace) with a thin rounded
  progress bar and a threshold tick mark on it; caption "低库存阈值 10 · 建议补货至 30";
  section "最近动线（演示）" listing 3 rows: timestamp + note + signed delta
  (+12 green / -4 red, monospace); two buttons at the bottom: "发起调拨" (filled
  blue primary) and "创建盘点" (outline secondary); small caption "演示样本数据，
  操作不会写入任何真实系统。"
- Dark toast at bottom center: "演示环境：「发起调拨」未接通真实库存".

Style: quiet industrial data tool. Background #F8FAFC, white cards, slate ink #16202B,
secondary text #475569, hairline dividers #E2E8F0, primary blue #1E40AF, amber accents,
8px spacing grid, rounded corners 8–12px, subtle shadows only, system sans-serif with
monospace numerals. No decoration, no illustrations, no gradients, high information
density. Also produce a mobile 390px variant where the table becomes stacked cards and
the detail panel becomes a bottom sheet.
```

## 用途

生成图回来后由 agent 与实现做分区对照（image-to-code 保真循环），差异项进
门E 清单。本提示词与 DESIGN.md 的 token 完全一致。
