# 设计契约：库存运营台 v2（冲刺 3/8 · 质量整改轮）

> 本轮为用户质量整改驱动的重做：v1 被评为"样式不达标、未按链路执行"。
> 本契约按 `references/design-contract.md` 口径补全，门D 产物，自动轮·待用户追认。

## Mission

仓库运营者 10 秒内定位任一 SKU 的库存状态并做出决策（调拨/盘点）；数字可信、
状态一眼可辨、全程键盘可达。

## 用户与场景

- 仓管/运营人员，桌面高频操作、移动端查数。
- 环境约束：网络受限（Google Fonts / 图片 CDN 不可达）→ 字体降级为系统栈。

## 素材来源（门B 候选与采用）

| # | 素材 | 来源 | 状态 |
| --- | --- | --- | --- |
| M1 | 「Data-Dense Dashboard」风格 + Enterprise 彩板（primary #1E40AF、bg #F8FAFC、muted #E9EEF6、muted-fg #475569、destructive #DC2626、琥珀强调） | ui-ux-pro-max 本地数据集（`--design-system` 检索真实命中） | 自动轮临时采用，**待门B 追认** |
| M2 | Fira Code / Fira Sans 字体配对 | 同上检索命中 | **降级**：CDN 不可达 → 系统字体栈 + `ui-monospace` 等宽数字 |
| M3 | 面板弹簧曲线 `linear(0, 0.25, 0.595, 0.8225, 0.9372, 0.9844, 0.9999, 1.0029, 1.0024, 1.0013, 1.0006, 1)`（感知时长 0.18s） | Motion MCP `generate-css-easing` 真实调用（门F 留痕） | 已采用，原样引用 |
| M4 | Motion 文档检索「side panel slide in」 | Motion MCP `search-motion-docs` | 无命中（如实记录），仅采用 M3 曲线 |
| — | Stitch 原型图 | Stitch MCP | 带真实 key 连接超时（HTTP 000，网络层不可达）→ 路径 b：提示词见 `prototype-prompt.md`，供用户网页版生成 |

## 风格基础：安静的工业感数据台

冷灰底 + 企业蓝主色 + 琥珀/红语义色；低装饰、高密度、强对齐；数据一律等宽
数字；8px 间距网格；圆角 12（容器）/8（控件）/999（胶囊）。

## 语义 token（亮/暗双制式，`prefers-color-scheme`）

| token | 亮 | 暗 |
| --- | --- | --- |
| --bg | #F8FAFC | #0B1220 |
| --surface | #FFFFFF | #101A2B |
| --ink / --ink-2 | #16202B / #475569 | #E6EDF6 / #94A3B8 |
| --line | #E2E8F0 | #24304A |
| --brand（主色/焦点环） | #1E40AF | #8AB0F8（文字/描边）、实心钮仍 #1E40AF+白字 |
| --row-hover / --row-selected | #F1F5F9 / rgba(30,64,175,.08) | #16233C / rgba(138,176,248,.14) |
| 状态 ok（fg/bg/dot） | #067647 / #E7F6EC / #17B26A | #75E0A7 / rgba(23,178,106,.14) / 同 fg |
| 状态 low | #8A4B0F / #FCEFCB / #F79009 | #FDB022 / rgba(247,144,9,.14) |
| 状态 out | #B42318 / #FEECEB / #F04438 | #F97066 / rgba(240,68,56,.14) |
| 警示横幅（fg/bg/边） | #8A4B0F / #FCEFCB / #EBD9A8 | #FDB022 / rgba(247,144,9,.10) / rgba(247,144,9,.35) |

类型：h1 20/700/-0.01em；正文 13；次要 12；行名 500；数字 `ui-monospace` +
`tabular-nums`。动效：hover/按压 120–150ms ease；面板 350ms linear()（感知
0.18s）；`prefers-reduced-motion` 全部降级为无动画。

## Do / Don't（来自检索反模式与交付清单）

- Do：SVG 图标（不用 emoji）；可点元素 `cursor:pointer`；状态 = 色点 + 文字
  （不只靠颜色）；空态给恢复动作；操作给反馈（toast）；对比度 ≥4.5:1；键盘
  焦点可见。
- Don't：花哨装饰；无筛选的表格；`transition: all`；>200ms 的悬停动效；
  占位符当标签；纯颜色编码状态。

## 组件期望（本轮落地范围）

工具条（搜索图标 + 就地清除、分类下拉、状态分段控件带各态计数）、表格
（sticky 表头、行 hover/选中态、库存列三态排序 + `aria-sort`、名称超长
省略）、状态胶囊（色点 + 文字）、空态（图标 + 「清空筛选」真实动作）、
详情面板 v2（状态胶囊、库存水位条 + 阈值刻度、最近动线列表、两个演示
操作 → toast 反馈）、toast（`role="status"`）、favicon 内联 SVG、暗色制式、
KPI 指标卡行（4 张，点击切状态筛选，与分段控件同源）。

**URL 状态同步（v2.3，产品化增量）**：搜索词/分类/状态/排序映射查询参数
`q/cat/status/sort`，加载时恢复、变更时 `history.replaceState` 无痕同步；
「清空筛选」同时清空参数。分享链接即分享视图（演示数据环境下这是唯一
可行的"现场恢复"机制）。

## 质量门

AA 对比度（亮暗各自核对）｜键盘全旅程（Esc 关闭、焦点进出面板）｜
reduced-motion 降级｜console 0 错误｜桌面 1280×800 + 移动 390×844 + 暗色
走查留证｜样式八维（detail-critique）逐维留痕入台账。
