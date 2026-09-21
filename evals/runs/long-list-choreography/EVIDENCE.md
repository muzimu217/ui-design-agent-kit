# 场景执行留痕：long-list-choreography

- 日期：2026-09-20；执行者：主代理（W1 批次 7/10）
- 结论：**场景分 100/100**（4/4 条 passCriteria 各 2 分，无 failCondition 命中）；
  **样式分 100/100**（八维）。
- 产物：`app/index.html` 500 行库存检索表（确定性演示数据，无随机、无依赖）。

## 链路留痕

- **方向（门A 精神）**：运营台取向——安静高密度、白面板 + 暖纸底、单一强调蓝、
  36px 行高、tabular 数字、三态状态 chip（在库/低库存/缺货）。
- **架构决策**：`spacer` 定高 + 视口窗口挂载（36px 行高、432px 视窗、overscan 5），
  500 行仅挂载 ~17 行；入场动画按"窗口内序号 ×40ms、封顶 12×40=480ms"作用于
  **当前视口组**，与全表全局序号无关；`seen` 集合保证每行 ID 只入场一次。
- **门F MCP 留痕**：Playwright MCP 真实调用（animationstart 事件捕获、滚动/
  键盘/输入事件、逐项断言、截图）。Motion MCP 不可用（本会话未挂载），如实记录；
  曲线为 motion-contract 认可命名 ease-out，240ms。

## 细节批评内环（逐组件/逐交互）

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P1 | **虚拟化边界丢按键**：焦点行被 replaceChildren 卸载后焦点掉到 body，scroller 的 keydown 收不到后续键——3↓+16↓ 实测只前进 14 步（评测抓到的真 bug，正是本场景"keyboard focus"判据的考点） | ✅ 已修：render 后 `restoreFocus()`（行在窗口则还焦，不在则焦点交 scroller 本体续行）；`focusRow` 对未挂载行先滚窗再聚焦。复验：+16→id18、再+40→id58（跨多次边界零丢键）、反向 ↑5→id53 |
| P1 | 在库 chip 对比度实测 **4.46:1**（#1c7d43 on #e3f2e8），差 0.04 不达 AA | ✅ 已修（#19703d，实测 5.29:1），出货值 8/8 文本对全过（contrast-check.txt） |
| P2 | 首次断言设计缺陷：以"打字期间 animationstart 计数"证无重放会被新入场行污染 | ✅ 改为干净证明：同结果集重触发输入（追加 x 再退格）→ 实测 0 动画 |
| P2 | 测试捕获脚本 addInitScript 叠加注入导致事件日志重复（34=17×2） | ❌ 非页面缺陷，测试装置问题；按 id 去重后 17 行一致，延迟上限结论不变 |

无未修 P0。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Keeps virtualization and bounded visible groups | 2 | 500 行总高 18000px，实测挂载恒为 17 行（initial/bottom/filtered 三态均 17）；节奏组=当前视口窗口（17 行一组） |
| Does not delay the last row by 30 seconds | 2 | animationstart 逐事件采样：初始窗口 17 事件、最大延迟 **480ms**；跳到列表底部后新窗口 17 行、最大延迟仍 480ms，id 499 在 DOM 可达 |
| Does not replay entrance animations on each filter keystroke | 2 | `seen` 集合按行 ID 去重；同结果集重触发输入实测 **0 次** animationstart；仅首次出现的行入场一次 |
| Preserves scanability and keyboard focus | 2 | 36px 行高 + 三态 chip + tabular 数字（desktop-settled.png）；↑↓ 巡行跨边界零丢键（修复后 +58 步全中）、Enter 选中态可见且焦点保持、行聚焦环 inset 双环可见（desktop-kb-select.png） |

**failConditions 核对**：无"全表 index×0.06s"（延迟按窗口序号封顶 480ms，
与全局序号无关，事件采样为证）✓；无对整表施加 tilt/blur（入场仅 5px 位移+
透明度，无滤镜）✓；不挂载全部行（恒 17/500）✓。

## styleReview 八维

| 维度 | 分 | 证据 |
| --- | --- | --- |
| 布局节奏 | 2 | 五列网格对齐、36px 行高一致、8px 系间距（settled 截图） |
| 排版 | 2 | 20/14/13/12 四级、tabular-nums 数字对齐、SKU 次级色 |
| 对比度实测 | 2 | 出货值 8/8 ≥4.5:1（contrast-check.txt，含一次真实 4.46→修复记录） |
| 状态覆盖 | 2 | hover 行高亮、选中 inset 蓝条、行焦点环、空态样式、三态 chip；加载 N/A（本地数据，如实注明） |
| 动效合规 | 2 | 240ms 命名 ease-out、有界 stagger、reduced-motion 全禁（CSS 媒体查询）、无 transition:all、无第二运行时 |
| 可供性 | 2 | 行 hover/选中/焦点三态分明；过滤框标准 search 形态；状态 chip 语义色 |
| 鲁棒性 | 2 | 虚拟化边界焦点修复后跨边界长巡行零丢键；未挂载行导航先滚窗再聚焦；过滤 token 防抖（rAF+token） |
| 一致性 | 2 | 语义 token 全程；chip 三色与语义一一对应 |

## 已知局限

- 数据为确定性生成的演示数据（无随机种子漂移），未覆盖超长名称换行场景。
- 触屏滚动未做真机验证（Playwright 滚动事件同路径已覆盖）。

## 复现方式

```bash
cd evals/runs/long-list-choreography/app && python3 -m http.server 4193
# 桌面 1280×800：滚到底/↑↓ 巡行跨边界/Enter 选中/过滤后同结果集再触发输入
```
