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

---

# v2 重做（冲刺 3/8 · 用户质量整改轮，2026-09-06）

> 背景：用户批评 v1"样式不达标、完全没有按智能体链路生成"。本轮补全整条
> 链路并把「样式达标」变成评分台账的正式字段（scripts/eval-run.mjs 新增
> styleReview 八维，与功能分并列展示）。

## 链路补全留痕（v2）

| 环节 | v1 的问题 | v2 的执行 |
| --- | --- | --- |
| 素材检索（环节 2/3） | 跳过，自称"门B 不适用" | ui-ux-pro-max `--design-system` 真实检索命中：Data-Dense Dashboard 风格 + Enterprise 彩板 + Fira 字体配对 + 反模式清单（M1/M2，见 DESIGN.md，**待门B 追认**） |
| 原型（环节 4） | 空转 | Stitch MCP 带真实 key 的 initialize 仍连接超时（HTTP 000，12s，网络层不可达、非鉴权）→ 路径 b：`prototype-prompt.md` 可直接粘贴生成 |
| 设计契约（环节 5） | 无 | `DESIGN.md`：Mission/用户/素材/token 双制式/Do-Don't/组件期望/质量门 |
| 门F MCP | 只有 Playwright | Playwright + Motion MCP 两次真实调用（`generate-css-easing` 弹簧曲线已用于面板动画；`search-motion-docs` "side panel slide in" 无命中、retry "overlay" 返回 8 条 Motion+ 内容——源码仅 Motion+ 会员可见，演示链接公开，Motion+ 为一次性买断 https://motion.dev/plus ；Stitch 不可达如实记录） |
| 样式达标 | 无机制 | 台账新增 styleReview 八维（detail-critique 维度），与功能分并列 |

## v2 内环批评与处置（逐组件/逐交互）

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P1 | sticky 表头（z-index:1）压在详情面板之上，"库存 ↕ 状态"穿透面板 | ✅ 已修（panel z-index:50），截图复验穿透消失 |
| P1 | toast 文案丢上下文：只显示"发起调拨"，违反契约"演示环境：未接通真实库存" | ✅ 已修（App.tsx 组合完整文案），断言 + 截图复验 |
| P1→即改 | styles.css 十六进制色笔误 `#fce fcb`（写入时发现即改） | ✅ |
| P2 | 对比度"实测"未兑现：色值按 AA 设计但未跑测量脚本 | ❌ 未修——styleReview 对比度实测=1，下一轮补测量 |
| P2 | favicon 404（v1 遗留） | ✅ 已修（内联 SVG favicon），console 0 错误 |
| P2 | 表格行 tr 与行内 button 双重 onClick（v1 遗留，幂等冗余） | ❌ 未修，留痕待裁决 |
| P2 | 移动端底部门非模态，背景仍可滚动（v1 遗留） | ❌ 未修，交互取向待裁决 |

## v2 判据复验（全部通过，证据为 v2 截图）

搜索（空态 → 「清空筛选」真实恢复）、状态分段（带各态计数 12/6/4/2）、
排序三态（aria-sort + 计数行"库存升序"提示）、详情面板 v2（水位条 + 阈值
刻度 + 演示动线 + 操作按钮）、toast 完整文案、Esc 关闭 + 焦点归还（断言：
打开后 activeElement=关闭钮；Esc 后 panelOpen=false 且焦点回触发行）、
暗色制式（emulateMedia dark 截图）、移动端 390×844 卡片布局、console 0 错误。

## 样式分对照（styleReview 八维，台账可查）

| 维度 | v1（回评基线） | v2 |
| --- | --- | --- |
| 布局节奏 | 1 | 2 |
| 排版 | 1 | 2 |
| 对比度实测 | 2 | **1**（未跑测量脚本，诚实扣分） |
| 状态覆盖 | 1 | 2（加载态 N/A：本地数据无等待；接真实 API 需补骨架屏） |
| 动效合规 | 2 | 2（MCP 生成曲线 + reduced-motion） |
| 可供性 | 1 | 2 |
| 鲁棒性 | 1 | 2 |
| 一致性 | 1 | 2 |
| **样式分** | **63** | **94** |

## 已知局限（诚实声明）

- TypeScript 仅经 esbuild 转换，环境无 tsc/@types/react，未做类型检查。
- 字体配对（Fira Code/Fira Sans）因 CDN 不可达降级为系统栈 + ui-monospace。
- Stitch 原型图未生成（网络不可达），路径 b 提示词待用户执行后回贴对照。
- 3 项 P2 未修留痕 + 对比度测量待补——均记录在案，不宣称完成。

---

# v2.1 对比度实测兑现（冲刺 4/8，2026-09-06）

- 新增 `scripts/contrast-check.mjs`（`npm run contrast`）：直接解析
  styles.css 的 :root / 暗色块 token（量的是出货值，不是手抄副本），rgba
  底色按浏览器行为与 --surface 合成后测量，逐对输出 WCAG 比值，<4.5:1
  退出码 1。
- **首跑抓到真缺陷**：分段计数角标 @72% 不透明度双制式不达标
  （亮 3.74:1、暗 4.17:1，见 `evidence/contrast-check-before-fails.txt`）。
- 修复：计数角标改实色（层级由 11px 小号 + tabular 数字表达，不再用透明度
  折损），复测 **20/20 全过**（`evidence/contrast-check-after.txt`）。
- 台账更新：对比度实测维度 1→2，v2.1 样式分 94→**100**（逐维证据：
  before/after 实测输出 + v2 截图 + 断言）；v1 回评基线 63 留档对照。
- 同轮 G4：Stitch 带 key 复测仍 HTTP 000（网络层超时），维持降级。
