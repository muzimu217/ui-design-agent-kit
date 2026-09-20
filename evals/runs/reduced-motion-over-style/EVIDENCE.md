# 场景执行留痕：reduced-motion-over-style

- 日期：2026-09-20；执行者：主代理（W1 批次 5/10）
- 结论：**场景分 100/100**（4/4 条 passCriteria 各 2 分，无 failCondition 命中）；
  **样式分 100/100**（八维）。
- 产物：`app/index.html` 单文件画廊「拾贰面」（12 幅内联 SVG，无外部请求、无依赖）。

## 链路留痕

- **方向（门A 精神）**：美术馆墙取向——暖白墙 `#f4f1ea`、白色画框卡、细线
  分隔、小字号图注；入场 = 轻微透视倾斜 4° + 10px 上移 + 6px 模糊→清晰，
  420ms `cubic-bezier(0.22,1,0.36,1)`，卡片间隔 60ms（0.04–0.08s 判据带内）。
- **架构决策（防 failCondition）**：动画是增强不是闸门——内容默认完整可见，
  只有 JS 确认用户**没有** reduced-motion 偏好时才加 `html.fx` 启用入场动画；
  无 JS、偏好降级、动画被禁三种情况内容均首帧可见，绝无"等 observer 才显形"。
- **门F MCP 留痕**：Playwright MCP 真实调用——`emulateMedia` 切换两种
  `prefers-reduced-motion` 偏好分别重载断言 + 键盘 Tab/Enter/Escape 走查 +
  截图。Motion MCP 不可用（本会话未挂载），曲线为 motion-contract 认可的
  命名 ease-out，如实记录。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Normal entrance uses stagger steps between 0.04 and 0.08 seconds | 2 | `--stagger:60ms`；实测 card[0] delay 0s、card[5] delay **0.3s=5×60ms**；animationName=card-in（desktop-entrance-midframe.png 可见模糊/倾斜中间帧） |
| Reduced motion removes spatial animation, blur, tilt, and stagger | 2 | reduce 模式实测：html 无 `.fx`，card `animationName:none`、`transform:none`、`filter:none`、`opacity:1`（desktop-reduced-motion.png）；CSS 层 `@media (prefers-reduced-motion:reduce){ html.fx .card{animation:none} }` 双保险 |
| Touch and keyboard users retain equivalent feedback and all actions | 2 | 卡片为真实 `<button>`：Tab → `:focus-visible` 双环（5.95:1），Enter 开 dialog（焦点入框），Esc 关 + 焦点还原触发钮（断言 focusBack=赤面）；触屏有 `:active` 按压态 + hover 阴影等价反馈；reduce 模式下 dialog 全部动作复验等价（dialogReduced=open:true） |
| Tests both preference modes | 2 | Playwright `emulateMedia` 分别以 no-preference / reduce 重载，两组计算样式断言 + 各自截图（desktop-entrance-settled.png / desktop-reduced-motion.png） |

**failConditions 核对**：reduce 模式无任何弹簧/动画强加（fx 类直接不加）✓；
内容不因 observer/动画未触发而隐藏（无 JS 也完整可见）✓；核心动作无 hover
依赖（按钮 + 键盘全通）✓。

## styleReview 八维

| 维度 | 分 | 证据 |
| --- | --- | --- |
| 布局节奏 | 2 | auto-fill 220px 网格、24px 沟槽、画框内 10px 衬边（settled 截图） |
| 排版 | 2 | 标题 26px / 说明 14px / 图注 13px 三级；字距 .04em 的编号图注 |
| 对比度实测 | 2 | 5/5 文本对 ≥4.5:1（contrast-check.txt：最低图注 4.97:1） |
| 状态覆盖 | 2 | hover 阴影/active 按压/focus 环/dialog 开合/焦点还原全实测；加载 N/A（静态本地内容，如实注明） |
| 动效合规 | 2 | 命名曲线 420ms、stagger 60ms 带内、reduced-motion 全移除、无 transition:all、无第二运行时 |
| 可供性 | 2 | 画框卡 + 悬浮阴影表意可按；dialog 含大图/标题/年代/关闭钮 |
| 鲁棒性 | 2 | 无 JS 内容可见、原生 dialog 焦点圈闭、Esc 还焦实测、SVG 全带 aria-label |
| 一致性 | 2 | 五色 token 贯穿 12 幅画与 UI；焦点环双色统一 |

## 已知局限

- 触屏路径以 `:active`/hover 样式与指针事件冒泡为证，未做真机触摸试验
  （无触屏设备），键盘路径为全真断言。
- 入场动画的中间帧证据为 120ms 采样截图（动画 420ms），非逐帧。

## 复现方式

```bash
cd evals/runs/reduced-motion-over-style/app && python3 -m http.server 4191
# 桌面 1280×800；DevTools/仿真切换 prefers-reduced-motion 两档各重载一次
```

---

# v2 素材重做（2026-09-20 · 用户质量整改轮）

> 背景：用户指出 v1 的 12 幅"画"是手绘内联 SVG，违反既定的"素材拼接优先"
> 方向，且未经门B（外部素材须给用户过目选择）。本轮按门B 流程重做视觉资产，
> 动效/键盘/降级系统与 v1 判定逻辑不变，全部断言重新取证。

## 门B 素材选择留痕（用户已裁定）

- 侦察：仓内素材（截图类，不适配"画作陈列"）→ Met Open Access API（实测可达）
  → 芝加哥艺术学院 API（备选）。**用户选定：Met 馆藏 CC0**。
- 采用：12 幅馆藏油画真迹，`art/MANIFEST.json` 逐幅记录 objectID / 标题 /
  作者 / 年代 / creditLine / **license: CC0 (Met Open Access)** / 馆藏页 URL /
  文件字节数。图片下载入仓（`art/*.jpg`，共 ~1.4MB），不热链。
- 改编边界：仅按 4:3 缩略裁切（object-fit: cover）+ 详情弹层完整展示
  （contain）；不调色、不裁署名、说明牌保留馆藏 creditLine 原文。

## v2 复验（全部断言重跑）

| 断言 | 结果 |
| --- | --- |
| 12 幅图片全部真实加载（naturalWidth>0） | ✅ 12/12 |
| 入场动画 + stagger（delay5=0.3s=5×60ms） | ✅ |
| 键盘 Enter 开馆藏详情（真实 creditLine："Robert Lehman Collection, 1975 · CC0 (Met Open Access)"） | ✅ v2-dialog-open.png |
| Esc 关闭 + 焦点还原触发卡 | ✅ |
| reduced 模式：animation/transform/filter 全 none、opacity 1、内容即刻可见 | ✅ v2-reduced-motion.png |
| reduced 模式下 dialog 全部动作等价 | ✅ |
| 网格卡底对齐（说明行数不齐导致的高度差） | ✅ 修复：按钮 height:100%，实测 4/4 底边=558px |

对比度结论沿用 v1 实测（文字色未变，仅图片资产更换）。

## v2 内环批评与处置

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P1 | v1 视觉资产为手绘 SVG，违反素材拼接优先方向且未走门B | ✅ 本轮根修（真迹+授权留痕+用户选定） |
| P2 | 说明牌行数不同导致同排卡底不齐 | ✅ 已修（按钮撑满网格单元），对齐断言复验 |

## 诚实声明

- v1 的台账记录（含手绘资产时期的分数）按台账规则保留历史，不覆盖；
  本轮为第 2 次记录。v1 截图保留在 evidence/（desktop-* 前缀）作为对照。
- 图片为博物馆开放授权计划的数字化摄影，作品本身均为公有领域；
  MANIFEST.json 为唯一授权真相源。
