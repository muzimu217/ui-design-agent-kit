# 睿耳 RuiEar 产品落地页 · 设计契约（DESIGN.md）

- 计划：P-earbuds-2（locked 2026-09-12，Gate C 通过）
- 修订：v1（2026-09-12 初版，随实现验证修订须留痕）

## Mission

一句话：让访客在 60 秒内读懂「睿耳 Buds 是一台会说多种语言的随身耳机」，并选出自己的配色与档位。

## Brand

- 受众：关注 AI 耳机的中文/英文消费者；首要任务：理解产品（翻译/降噪/续航）→ 选配色 → 看价格；表面：桌面 + 移动营销单页。
- 内容现实：**概念演示页**——品牌「睿数 · 睿耳 RuiEar」为真实委托认领，价格/参数全部为示意数据并标注；3D 为真实授权模型（CC BY 4.0）。

## Style foundations

- **参考基线**：apple.com.cn AirPods Pro / AirPods Max 产品页（2026-09-12 实拍，`research/`）。改编：区块结构、大字紧排标题法、色板 radiogroup 模式；叠加用户自有风格层（色调旅程 / 色环过渡 / 大幅动效）。
- **Color（语义 token）**：
  - `--ink #1D1D1F`（主文本）· `--ink-2 #6E6E73`（次级）· `--paper #F5F5F7`（浅底）· `--accent #0071E3`（链接/CTA 蓝）
  - 产品五色（HEX 原型拟值，可换）：月光白 `#F4F4F6` / 午夜黑 `#1D1D1F` / 天空蓝 `#4DA3E8` / 落日橙 `#F4633A` / 玫瑰红 `#E0475B`
  - 区块主题（色调旅程：顶部鲜艳→下部平淡，明暗交替）：
    | 区块 | 主题 | 亮/暗 |
    | --- | --- | --- |
    | Hero | 玫瑰红→落日橙渐变 `#F4633A→#E0475B→#B33757` | 暗底白字 |
    | 配色剧场 | 天空蓝浅域 `#DBEEFD→#F3F9FF` + 选中色晕 | 亮底墨字 |
    | 实时翻译 | 雾蓝 `#5B87B8` | 暗底白字 |
    | 自适应降噪 | 午夜黑 `#1D1D1F` | 暗底白字 |
    | 超长续航 | 浅灰 `#EDEDF0` | 亮底墨字 |
    | 3D 工艺 | 石墨 `#2E2E33` | 暗底白字 |
    | 价格+规格 | 浅灰 `#E8E8EC` | 亮底墨字 |
    | 尾屏/页脚 | 纸白 `#FAFAFC` | 亮底墨字 |
- **Type**：系统栈 `-apple-system, "SF Pro Display", "PingFang SC", sans-serif`；display `clamp(40px,7vw,80px) tracking -0.03em`（hero）、h2 `clamp(30px,4.5vw,48px)`；正文 16–18px；不引外部字体。
- **Spacing**：4/8 节奏；区块纵向 `clamp(96px,14vh,160px)`；容器 max-w 1120px。
- **Depth**：无玻璃滥用；卡片=白底+1px 描边+24px 圆角，仅价格卡与色板胶囊用底；产品始终本体可见。
- **Motion**（motion-contract）：Elegant spring（stiffness 100 / damping 20 / mass 1）为区块渐显与 3D 材质过渡；Snappy（400/30/0.8）给按钮/色板；色环过渡与背景交叉淡入用 `cubic-bezier(0.16,1,0.3,1)`（800ms 内）；入场 stagger 0.06s + blur(4px→0)；hover ≤150ms 起效 scale 1.02，press 0.98；禁 `transition: all` 与 linear；`prefers-reduced-motion` 全部退化（详见 Accessibility）。

## Accessibility

- 对比：正文 ≥4.5:1；大标题 ≥3:1（渐变底上白字按大字号处理）；次级文字不放在渐变最亮端。
- 键盘：色板为 radiogroup（roving tabindex + ←/→/Home/End）；语言开关为按钮；replay 按钮可达；focus-visible 2px 描边。
- Reduced motion：Lenis 关闭、色环过渡跳过、入场直接呈现终态、3D 自动旋转与重播动画停用（滚动刮擦保留=直接操纵）。
- 语言：`<html lang>` 随中/EN 切换；切换持久化 localStorage。

## Writing tone

- 苹果式短句，动词开头， Benefit 先行；不编造参数——数字一律带「示意」角标；CTA「购买（演示）」诚实标注。

## Rules: Do

- 产品 3D 主体在 Hero/配色/工艺三段持续在场，滚动讲同一台设备的故事。
- 配色切换同步三处：3D 壳体材质、区块色晕、色名标签。
- 烘焙动画（Lid 旋转 + Airpods 位移）用滚动刮擦 + 重播双通道，进度条可视化。
- 页脚：demo 声明 + 「3D 模型：Jed Falcone（CC BY 4.0）」署名。

## Rules: Don't

- 不用 emoji 图标、不在每段套玻璃卡、不让文字压在模型正上方不透明化处理。
- 不虚构销量/评测/续航小时数等事实性数字（示意标注除外）。
- 不让色环过渡阻塞滚动或重复轰炸（≥1.2s 冷却 + 同主题不重放）。
- 不在深色块上放 `--ink-2` 灰字（对比不足）。

## Output structure

Nav → Hero（3D 在场）→ 配色剧场（3D + 五色板）→ 功能三屏（翻译/降噪/续航，**各配一张伴生 UI 演示卡：实时互译对话卡 / 噪声前后声谱卡 / 电量环卡**）→ 3D 工艺叙事（烘焙动画刮擦）→ 三档价格卡 + 规格速览 → 尾屏 CTA → 页脚（署名/demo 声明）。

### 修订记录

- v1.1（2026-09-13）：功能三屏按用户反馈增配伴生 UI 演示卡（自绘组件，非外部素材，无新增授权负担）；桌面双栏（ANC 屏翻转布局）、移动端上下堆叠。

## Component expectations

- **色板 radiogroup**：5 圆点 36px（触标 44px 含 padding）、选中态外圈、键盘方向键、aria-checked；切换后 3D 材质 ≤300ms 开始变色（damp lerp）。
- **价格卡**：三张；进阶版强调描边；功能条目 Check/Minus 图标（「无降噪」用 Minus，诚实）；按钮 hover/active/焦点态齐全。
- **语言开关**：中/EN 两段，aria-pressed，切换即时全站生效。
- **Nav**：主题自适应亮/暗配色，滚动恒定可见。
- **3D**：拖拽旋转（fine pointer + DragZone）；自动旋转 reduced-motion 下停用；加载期不白屏（背景色先行）。

## Quality gates

- 主旅程全通（打开→换色→三屏→刮擦动画→价格→切语言→页脚署名可见）。
- 桌面 1440 + 移动 390 截图无横向溢出；键盘全流程；reduced-motion 全程验证。
- 控制台 0 error；Lighthouse 手测无明显布局塌陷（200% 字号存活）。
- 样式八维台账入验收记录（T-002）；问题按 P0/P1/P2 列表呈用户（T-001）。
