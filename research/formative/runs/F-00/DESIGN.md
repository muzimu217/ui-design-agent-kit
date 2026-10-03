# F-00 DESIGN.md —— 赛博番茄钟 V1 设计契约（门D 呈交件）

- 计划编号：P-f00-2（呈交时为 draft；契约通过后升级 P-f00-3 锁定）
- 日期：2026-10-01 ｜ 依据：DIRECTION.md v2 + 门A/B/C 裁决 + PROTOTYPE.html v3
- 平台：V1 = Web 核心（浏览器验证链）；V1.5 = Tauri 2 壳（Windows + macOS，鸿蒙出局）

## Mission

开发者自用的赛博风专注工具：3D 立体翻页钟计时 + 任务清单 + 主题包换肤。
信息密度克制（两卡），视觉表达放开（赛博霓虹）。后续套桌面壳常驻。

## 语义 token（Tailwind v4 `@theme`，主题包 = token 集 + 背景图引用，热换）

| token | theme-neon-city（默认） | theme-magenta-rain（备选） | 用途 |
| --- | --- | --- | --- |
| --bg-base | #0b0e14 | #0d0a16 | 页面底 |
| --surface | rgba(18,23,34,.72) | rgba(24,17,36,.72) | 卡面（半透压背景） |
| --text-primary | #dbe4f0 | #e4dcf0 | 主文字/计时数字 |
| --text-dim | #8b96a8 | #9a8fb8 | 次文字 |
| --accent | #37e0ff | #b26bff | 霓虹主强调/流光起点 |
| --accent-2 | #ff3d8a | #37e0ff | 流光终点/次强调 |
| --card-face | #14181f | #1a1424 | 翻页牌面 |
| --card-edge | #05070b | #070510 | 翻页牌侧立面（厚度） |
| --glow | rgba(55,224,255,.35) | rgba(178,107,255,.35) | 耀光 |

- 对比度硬指标（门E 实测）：text-primary on bg-base ≥ 12:1；text-dim on surface ≥ 4.5:1；accent on bg-base ≥ 7:1；**计时数字用 text-primary 不用 accent**（读数优先）。
- 节奏：间距 4/8px；圆角——计时卡 16px、任务行 8px、按钮 10px。
- 字号：计时数字 clamp(64px, 12vw, 120px) 等宽 tabular-nums；模式/任务 13-14px。

## 动效规格（三个新动效类别，全部定档）

### ① 3D 立体翻页（计时）
- 结构：每数字位三层——上叶 + 下叶 + 翻转叶；容器 `perspective: 600px`。
- 翻转：翻转叶 `rotateX(-90deg → 0)`，**Snappy 弹簧**（motion-contract 预设），时长 450ms；铰链 = 中缝 1px 分隔线。
- 厚度：卡片底缘侧立面（--card-edge）+ 悬浮投影 `0 8px 24px rgba(0,0,0,.4)`。
- 明暗：上叶亮度 1.05 / 下叶 0.85 / 翻转叶随角度动态。
- 触发：秒位与分位进位必翻；暂停时冻结；标签页不可见时降频（rAF 暂停由浏览器接管）。
- reduced-motion：叶片直切（无 rotateX 动画），透视保留。
- 组件路线（三步，保真不足即退）：flipclock 自定义 3D 主题 → @leenguyen → 按 pqina 机械规格自写。

### ② 轮询流光 + 耀光（边框）
- border-beam：光束 40×2px 沿计时卡边框轨迹旋转，**周期 6s/周**（轮询感），colorFrom --accent → colorTo --accent-2。
- 耀光：计时卡双层 shadow（外 0 0 26px --glow；内 inset 0 0 18px）低强度常驻；**番茄完成瞬间脉冲一次**（300ms，Elegant 曲线）。
- 状态规则：running 才转流光；paused/idle 流光停驻不旋转；**禁止常亮闪烁**。
- reduced-motion：流光关闭，边框纯色。

### ③ 主题切换过渡
- 背景图交叉淡入 300ms（Elegant）；token 颜色 200ms 过渡。
- reduced-motion：即时切换。

## 状态机与交互契约

- `idle(番茄) → running ⇄ paused → 完成(提示音+耀光脉冲) → idle(休)`；每 4 番茄 → 长休。时长可配（默认 25/5/15）。
- 键盘全程：Space=开始/暂停（全局，输入框聚焦时除外）；T=新建任务；Enter 确认 / Esc 取消；Tab 顺序 = 模式 → 开始 → 重置 → 任务列表。
- 提示音：Web Audio 振荡器 880Hz 150ms ×2（仅完成时）；设置里可关。
- 无障碍：计时数字 `aria-live="off"`（防每秒播报），状态变化走独立 aria-live=polite 通告；图标按钮有可读名；任务列表语义化。
- 标签页标题：`25:00 · 专注中` 实时倒计时。
- 持久化：localStorage（任务、今日番茄数、主题、时长配置）。

## Do / Don't

- **Do**：信息密度克制；抄 proven 关系（pomofocus 布局 / flipclock 族形态 / border-beam 流光）；组件粒度验收；逐图记录素材来源与授权；空状态给引导文案。
- **Don't**：不做入场动画狂欢；不做常亮闪烁；不堆玻璃拟态；不用 accent 色做计时数字；不虚构数据/集成/后端；不用自绘素材替代现成组件；整页参考图禁用 object-fit:cover 裁剪（D10）。

## 验收门（门E 逐轮对照）

- **P0**：计时准确（前台每分钟漂移 ≤1s）；键盘全程可完成主流程；对比度按 token 硬指标实测达标；reduced-motion 三类降级全部生效；翻页动画 Chrome + WebKit 双内核正常。
- **P1**：流光 6s 周期稳定不卡顿；主题切换无白闪；任务 CRUD + 刷新持久化；360px 宽无横向滚动。
- **P2**：提示音可关；标题倒计时；空状态文案。

## 参考来源附录（D9）

| 用途 | 来源 | 链接 | 状态 |
| --- | --- | --- | --- |
| 翻页组件/3D 形态 | FlipClock.js / @leenguyen / pqina-flip | flipclockjs.com ｜ npmjs.com/package/@leenguyen/react-flip-clock-countdown ｜ github.com/pqina/flip | ✅ 实拍+复核（evidence/gatec-*） |
| 流光边框 | Magic UI border-beam | github.com/magicuidesign/magicui | ⚠️ 源码级（演示站不可达） |
| 布局/行为 | pomofocus.io | pomofocus.io | ✅ 实拍+复核 |
| 背景渠道 | Unsplash / Pexels / ZImageTurbo（用户侧） | 详见 research-notes.md | ✅ 条款实读 |
| 动效预设依据 | motion-contract.md（Snappy/Elegant） | 本仓 .agents/skills/ui-design-agent/references/motion-contract.md | 仓内契约 |
