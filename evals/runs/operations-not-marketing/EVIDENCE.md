# 场景执行留痕：operations-not-marketing（冲刺 2/8）

- 日期：2026-09-06；执行者：冲刺自动轮（每小时 :15 序列的第 1 个真实执行轮）
- 结论：**场景分 100/100**（5/5 条 passCriteria 各 2 分，无 failCondition 命中）
- 状态：**自动轮·待用户裁决**——门A/门C/门E 产物停在门前，未代替用户签字

## 链路留痕（v6 自动轮口径）

- **环节 0 需求**：场景 request/context 原文——库存运营台（搜索、库存筛选、
  表格、详情面板），React + TypeScript，允许演示数据、无真实 API。
- **环节 1 门A 方向稿（待裁决）**：冷静高密度运营台；白底深灰字、单一强调蓝
  （#1a56db）、语义状态色（绿/琥珀/红，AA 对比）；结构 = 工具条（搜索/分类/
  状态分段）+ 表格（桌面 ≥720px）/卡片（移动）+ 右侧详情面板；动效意图 =
  面板 150ms 滑入、悬停/按压 ≤150ms、`prefers-reduced-motion` 全降级。
- **环节 2/3 门B**：本轮未采用任何外部素材（组件全部自写），门B 不适用。
- **环节 4 门C 原型（待裁决）**：自动轮无用户确认生成图，取路径 b 精神——
  以上方方向稿文字作为原型说明，未写代码原型。
- **环节 5 门D 契约**：小任务，契约简化为本文件"方向稿 + 组件期望"段。
- **环节 6 实现**：React 19.2.8 + TypeScript 源码（vite 8.2.2 dev 转换）。
  **诚实局限**：环境无 tsc/@types/react，类型被 esbuild 剥离而未做类型检查。
- **门F MCP 调用留痕**：
  - Playwright MCP：真实调用（导航 / 点击 / 键入 / Escape 按键 / 截图 /
    JS 断言 activeElement 与 panel 状态）——浏览器证据的来源。
  - Motion MCP：未使用——动效为纯 CSS ≤150ms，无弹簧曲线需求。
  - Context7 / shadcn：未使用——无外部组件/API 引入。
  - Stitch：复测 HTTP 000（本 shell 无 `STITCH_API_KEY`，端点不可达），
    维持降级路径 b，与 e923a66 记录一致。
- **环节 7 门E 走查清单（待用户勾选）**：见下节内环结果。

## 细节批评内环（逐组件/逐交互）

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P1 | 详情面板键盘可达性：无 Esc 关闭、打开不移焦、关闭不还焦，键盘用户需 Tab 穿越全表 | ✅ 本轮修复（App.tsx：Esc 关闭 + 打开聚焦"关闭"钮 + 关闭还焦触发钮），Playwright 断言复验（打开后 activeElement=关闭；Esc 后 panelOpen=false 且 activeElement=触发行按钮）+ evidence/desktop-detail-esc.png |
| P2 | favicon.ico 404（console 唯一错误） | ❌ 未修复，留痕，下一轮候选 |
| P2 | 表格行 tr 与行内 button 双重 onClick（幂等但冗余的事件路径） | ❌ 未修复，留痕待裁决 |
| P2 | 移动端详情为非模态底部门，打开时背景仍可滚动 | ❌ 未修复，非模态交互取向需用户裁决 |

无 P0。未修复 P0 = 0，本轮可声明完成（自动轮口径，门E 待用户确认）。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Opens directly into the usable dashboard | 2 | evidence/desktop-dashboard.png（无落地页，直接可用面板） |
| Search and filters change displayed records | 2 | desktop-search.png（搜索"周转箱"12→2 项）、desktop-filter.png（低库存 12→4 项） |
| Details can open and close | 2 | desktop-detail-open.png、desktop-detail-closed.png、Esc 断言（activeElement 关闭→行按钮、panelOpen true→false）、desktop-detail-esc.png |
| Demo data is distinguished from live inventory | 2 | desktop-dashboard.png：顶部演示横幅 + DEMO 徽标 + 逐条"演示 ·"前缀 + 面板"演示样本"提示 |
| Inspects mobile and desktop output | 2 | mobile-dashboard.png（390×844 卡片布局）+ 桌面 1280×800 全套截图 |

**failConditions 核对**：未构建宣传页 ✓；无装饰性死控件（全部控件实测有行为）✓；
明确声明演示数据、未宣称实时库存或持久化 ✓。

## 复现方式

```bash
cd evals/runs/operations-not-marketing/app
# node_modules 为软链 → ../../../../showcase/node_modules（未新增安装）
# 若软链失效：ln -sfn ../../../../showcase/node_modules node_modules
../../../../showcase/node_modules/.bin/vite . --port 5173 --strictPort
# 浏览器打开 http://localhost:5173 ，桌面 1280×800 / 移动 390×844 各走查一遍
```
