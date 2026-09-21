# 场景执行留痕：physical-motion-presets

- 日期：2026-09-20；执行者：主代理（W1 批次 6/10）
- 结论：**场景分 100/100**（5/5 条 passCriteria 各 2 分，无 failCondition 命中）；
  **样式分 100/100**（八维）。
- 产物：`app/index.html` 产品陈列页「拙器」（特色卡可展开 + 三个商品卡）。

## 链路留痕

- **环境披露**：场景 context 假定 `motion/react` 已存在；本评测沙箱无
  node_modules，安装 React+Motion 运行时反而触发 failCondition"不必要地安装
  第二动画运行时"。**降级决策**：页内实现 40 行半隐式欧拉弹簧积分器
  （8 substep 保稳），预设参数即代码常量（`window.__springPresets` 验证钩子
  暴露，断言读到 verbatim 值）；打断时位置与速度天然连续保留——这正是判据
  要的弹簧语义，比 CSS transition 的重新插值更贴。如实记录，不假装用了
  motion/react。
- **方向（门A 精神）**：暖纸底 `#f5f3ee` + 墨色按钮 + 陶土强调色 `#d97f5e`；
  网格陈列 + 全宽特色卡；图标为内联 SVG。
- **门F MCP 留痕**：Playwright MCP 真实调用（pointer/keyboard 事件、逐帧
  transform 采样、:active 断言、reduced-motion 仿真、截图）。Motion MCP 不可用
  （本会话未挂载），如实记录；预设值以 motion-contract 的 Snappy/Playful 数值
  为准。

## 弹簧预设（判据参数 = 代码常量，运行时断言读到原值）

| 预设 | stiffness | damping | mass | 用途 |
| --- | --- | --- | --- | --- |
| Snappy | 400 | 30 | 0.8 | 按钮悬停 ×1.03 / 按压 ×0.97 |
| Playful | 280 | 18 | 1.2 | 特色卡展开进度 0→1（箭头随进度转 180°） |

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Uses stiffness 400, damping 30, mass 0.8 for crisp feedback | 2 | `__springPresets.snappy` 运行时断言原值 `{400,30,0.8}`；悬停实测 settle 至 1.0300 |
| Uses stiffness 280, damping 18, mass 1.2 for the expressive card | 2 | `__springPresets.playful` 原值 `{280,18,1.2}`；展开过冲实测：箭头最大转到 **210.1°**（目标 180°，低阻尼过冲的物理证据） |
| Hover response starts within 150ms without promising spring settlement in 150ms | 2 | 指针进入后 **21ms** 出现首次 transform 移动（逐 16ms 采样）；页面无任何"150ms 内稳定"的承诺，稳定时间由物理决定（实测 ~0.5s） |
| Press feedback includes keyboard active state and preserves the hit area | 2 | 键盘 Space 按下 80ms 时：`el.matches(':active')===true` 且 scale 1.011（按压弹簧在途，悬停 1.03×按压 0.97 复合）；命中区实测 93×42.5px ≥ 原尺寸 90%（desktop-kb-press.png） |
| Rapid reversal leaves the state and focus correct | 2 | ①悬停快进快出后 settle 回 1.0300，全程焦点未被指针抢走（BODY）；②展开→120ms 内反转→复开：settle opacity 0.9996、`aria-expanded=true`、焦点保持触发钮；③全关闭后 opacity 0.0006、箭头 0.11°——零残留偏移 |

**failConditions 核对**：无 `transition: all` 与泛型 0.3s ease（CSS 全文扫描
false，transform 全部由弹簧逐帧驱动）✓；无第二动画运行时（零依赖，自研积分器
40 行）✓；无输入阻塞——弹簧在途时按钮可即时再点击、卡片可即时反转（实测）✓。

## styleReview 八维

| 维度 | 分 | 证据 |
| --- | --- | --- |
| 布局节奏 | 2 | 全宽特色卡 + 3 列商品网格，20px 沟槽（desktop-card-open.png） |
| 排版 | 2 | 26/18/16/13 四级字号层级清晰 |
| 对比度实测 | 2 | 5/5 文本对 ≥4.5:1（contrast-check.txt，最低 4.85:1） |
| 状态覆盖 | 2 | hover/press(指针+键盘)/focus-visible/已加入✓回弹/aria-expanded 开合；加载 N/A（本地静态） |
| 动效合规 | 2 | 命名预设弹簧、reduced-motion 跳过积分器即时到位（实测 60ms 内终态）、无 transition:all |
| 可供性 | 2 | 按钮墨色实底+悬停加深；卡片头部整行可点、箭头方向表意开合 |
| 鲁棒性 | 2 | 三种反转场景实测零残留；pointercancel/blur 兜底复位；点按 1.2s 后文案自动还原 |
| 一致性 | 2 | 五 token 贯穿；两焦点环样式统一（bg 间隔双环） |

## 已知局限

- 积分器未处理标签页切回时的 dt 跳变上限保护已有（dt clamp 1/30s），
  但未做长时静置回归测试。
- 未在真机触屏验证 pointerdown/up 路径（Playwright 指针事件已覆盖同一代码路径）。

## 复现方式

```bash
cd evals/runs/physical-motion-presets/app && python3 -m http.server 4192
# 桌面 1280×800：悬停/点按/键盘 Tab+Space/快速开合特色卡
# reduced-motion：仿真切换后重载，状态应即时到位
```

---

# v3 素材重做（2026-09-20 · 用户质量整改轮，第 2 次记录）

> 背景：与画廊同批整改——v2 版页面的台灯/水壶/播放器/香薰图标为手绘 SVG，
> 违反"素材拼接优先"方向。经用户裁定改为**陈列仓内真实产品**。

## 门B 素材选择留痕（用户已裁定：仓内真实产品）

| 卡片 | 素材 | 来源（仓内路径） | 授权 |
| --- | --- | --- | --- |
| 特色卡·积木工坊 | castle.webp | `demo/brick-workshop/screenshots/castle.webp` | 本仓库自有产物 |
| NODEGRID 像素云 | gate-e-r2-s0-hero.png | `demo/nodegrid/evidence/gate-e-r2-s0-hero.png` | 本仓库自有产物 |
| 地铁疾行 | readme-desktop.webp | `demo/subway-runner/screenshots/readme-desktop.webp` | 本仓库自有产物 |
| 库存运营台 | readme-desktop.webp | `demo/inventory-console/screenshots/readme-desktop.webp` | 本仓库自有产物 |

- CTA 从虚构"加入清单"改为**真实链接**：每张卡的"查看案例"指向
  `github.com/muzimu217/ui-design-agent-kit/tree/main/demo/<目录>`——真实可导航目的地。
- 文案只用可核事实（125 项测试、门 A–F 全过、线上展厅可玩路由），不编造数据。

## v3 复验（全部断言重跑）

| 断言 | 结果 |
| --- | --- |
| 5 处图片引用全部真实加载（naturalWidth>0） | ✅ |
| 预设参数 verbatim（`__springPresets`：400/30/0.8、280/18/1.2） | ✅ |
| 悬停首动 25ms（<150ms），稳定 1.0300 | ✅ v3-hover.png |
| 特色卡 Space 开合（:active=true；Space 于 keyup 原生触发 click，按住期间 aria-expanded=false 为原生时序） | ✅ v3-card-open.png |
| 中途反转：110ms 内反转→复开 opacity 1；全关 opacity 0、chev -0.34° 零残留 | ✅ |
| CTA 键盘 Enter **真导航**（首次未拦导航时因本机 github 直连超时挂起而实证；复测用 route 替身拦截，href 断言为真实 demo 目录） | ✅ |
| reduced-motion：悬停 96ms 内直达终态、卡片即时开合 | ✅ |
| 无 transition:all / 0.3s ease（全文扫描 false） | ✅ |

对比度 5/5 文本对 PASS（v3-contrast-check.txt，色板未变重测留档）。

## 诚实声明

- CTA 链接的键盘按压微断言（:active 采样）因导航竞态不稳定；键盘激活路径以
  "Enter 真导航"实证 + 特色卡 button 的 Space 断言覆盖，不虚报。
- v1（手绘图标时期）记录保留台账历史，本轮为第 2 次记录。
