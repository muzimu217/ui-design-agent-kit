# NODEGRID 全球节点云 · 设计契约（DESIGN.md）

> 门D 产物（L 级 + 动效复杂 → 强制）。上游：DIRECTION.md v4.1（门A 定稿）、
> PROTOTYPE.md（门C 已过，用户确认"三屏形象对位"）。基线与许可见文末。
> 状态：**门D 待用户裁决**（2026-09-07）。实现阶段对本文档的任何修订
> 必须显式追加修订记录。

## Mission

让开发者与中小团队在 3 分钟内"看见并走进"NODEGRID 的全球节点网络：
从数据地球换场进入像素光点世界地图，点开任一节点看到机房、线路与
起价，然后从定价货架进入部署。

## Brand

- 受众：开发者、独立站长、技术选型者（中文）。
- 主任务：① 感知节点覆盖 → ② 查目标区域节点（照片/线路/延迟/价格）→
  ③ 比价并"部署"。
- 表面：产品官网单页（品牌 + 转化），借运营台的探查密度做差异化。
- 内容现实：虚构演示品牌；价格与库存为演示数据（页内标注）；
  机房照片为公有领域素材（页脚署名）。

## Style foundations

### Color（语义 token，深空科幻）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--bg-base` | #04070D | 页面底 |
| `--bg-raised` | #070C13 | 卡片/面板 |
| `--bg-overlay` | #0B141D | 浮层/页签 |
| `--line` | #12333E | 1px 描边 |
| `--ink` | #EAFCFF | 主文本 |
| `--ink-2` | #9FC9D6 | 次文本 |
| `--ink-3` | #5B7F8C | 弱文本/图例 |
| `--brand-hi` | #9DF3FF | 顶亮（logo 顶/高光） |
| `--brand` | #22D3EE | 主交互色（按钮/焦点/核心节点） |
| `--brand-mid` | #38D9F0 | 中间档 |
| `--brand-deep` | #0E7490 | 深档（图表/地图底纹） |
| `--brand-shadow` | #0A5068 | 云脚档 |
| `--accent-hot` | #F59E0B | 特惠区/限量角标（唯一暖色） |
| `--accent-plan` | #7C8BF5 | 规划中节点（虚线环） |
| `--ok` / `--warn` | #34D399 / #F59E0B | 状态点（在线/维护） |

青色是**品牌递阶**（五档 ramp，来自 logo），不是点缀发光：同一页面
同时出现的档位 ≤3。品红/紫外不入正式 token（方向稿点缀项收缩为
`--accent-plan` 一处）。亮色文本对 #04070D 对比度由实现阶段
`contrast-check` 逐对实测（目标 AA 4.5:1，等宽数字 ≥4.5:1）。

### Type

- 展示/正文（中文）：`"HarmonyOS Sans SC", "MiSans", "PingFang SC",
  "Noto Sans SC", system-ui`——中文 webfont 单字重数 MB，不引入网络
  字体；标题靠字重/字距/尺寸做层级。
- 数据/仪表（等宽）：`ui-monospace, "SF Mono", Menlo` + `font-variant-numeric:
  tabular-nums`；价格、延迟、坐标一律等宽。
- 字阶（clamp 流式）：hero 标题 `clamp(28px, 4vw, 52px)`；节标题
  `clamp(20px, 2.4vw, 28px)`；正文 15px；仪表 12-13px；最小 11px。

### Spacing / Depth / Radius

- 4/8px 节奏；分区纵向呼吸 `clamp(64px, 10vh, 128px)`。
- 深度三层：base → raised(1px line) → overlay(+阴影 `0 8px 32px
  rgba(0,0,0,.5)`）；不叠玻璃拟态，不做全局发光。
- 圆角：卡片 10px、按钮 8px、徽标 4px；像素光点为直角方形（呼应 logo）。

### Motion（motion-contract 预设）

| 交互 | 预设 | 说明 |
| --- | --- | --- |
| 按钮/页签/hover | Snappy (400/30/0.8) | hover ≤150ms 起始响应；press scale .98 |
| 面板滑出/卡片展开 | Elegant (100/20/1) 或 `cubic-bezier(0.16,1,0.3,1)` | 节点面板 320-380ms |
| **zoom-through 换场** | Elegant 曲线，~600ms，仅 transform+opacity | 见 Component expectations |
| 节点级联点亮 | stagger 0.06s（0.04-0.08） | 限可见组 ≤12 个 |
| 节点 ping 环 | 2.4s 循环 | 装饰循环，reduced-motion 移除 |
| 禁止 | `transition: all`、通用 ease、线性位移 | 加载旋转例外 |

## Accessibility

- 对比度：AA（4.5:1）为目标，出货 CSS 用 contrast-check 实测留痕。
- 键盘全旅程：Tab 顺序 Hero CTA → 统计条跳过（aria-hidden 装饰）→
  进入地图按钮 → 地图内节点可 Tab 聚焦（roving tabindex）→ 回车打开
  节点面板（焦点陷入，Esc 关闭并还焦触发节点）→ 定价页签/滑杆/
  切换全可操作。
- 焦点样式：2px `--brand` 外环 + 2px offset，任何可交互元素可见。
- reduced-motion：地球/地图停止自转与循环，zoom-through 变为直接
  切换（opacity 150ms），级联/雨滴/扫光全部移除；语义状态即时呈现。
- 语言：`lang="zh-CN"`；地球与地图提供 `aria-label` 与屏幕阅读器
  可读的节点列表等价物（地图下方折叠城市列表，即 Cloudflare 式分组）。

## Writing tone

简体中文、IDC 专业术语（弹性云服务器 ECS / 独立服务器 / 裸金属 /
CN2 直连 / BGP 多线 / EIP / IPv4 段）、利益导向 CTA（"部署到最近的
节点"而非"立即购买"）；不虚构客户与上线数据，演示数据如实标注。

## Rules: Do

- 装配优先：地球用 react-globe.gl（MIT）实现；世界底图用
  world-atlas/Natural Earth 数据（公有领域）canvas 绘制；节点光点、
  脉冲、光弧为自绘层（无授权负担）。
- 3D logo 直接复用已定稿 `logo-demo.html` 的体素云（移植为组件，
  交互/降级不变）。
- 每个可交互元素全状态集：default/hover/press/disabled/focus/selected
  (+loading/error/empty 按需)；触达面积 ≥44px。
- 图片全部带 alt；机房照片页脚署名（NASA 公有领域仍署"NASA，公有领域"）。
- 价格数字 tabular-nums；所有价格区角部统一「演示数据」标注。

## Rules: Don't

- 不做玻璃拟态全屏、不在正文区堆辉光；青色档位同屏 ≤3。
- 不用 Inter/Roboto 当"科技感"主字；不用等宽字排正文长段落。
- 不隐藏移动端核心功能（地图在 ≤720px 降级为区域列表 + 简化地图）。
- 不用动画替代反馈语义（部署按钮点击必有 toast/状态变化）。
- 不虚构：无假客户 logo、无编造在线率数字（演示数据标注除外）。

## Output structure（单页 S0-S6）

S0 Hero（logo + 主张 + 双 CTA + 数据地球 + 统计条）→ S1 zoom-through
换场（无独立 DOM，转场行为）→ S2 全球网络地图全屏舞台（可从 S0 进入/
退出）→ S3 节点详情面板（地图内浮层）→ S4 定价货架（三页签 + 滑杆）→
S5 信任区（照片墙 + SLA + 大区分组城市列表）→ S6 CTA + Footer
（署名 + 演示声明）。

## Component expectations

### C1 数据地球（S0，react-globe.gl）

- 数据：≥20 节点（虚构坐标与城市），核心/边缘两级；弧线 ≥8 条，
  dash 流动；缓慢自转（可拖拽打断，松手恢复）。
- 状态：加载（占位球体）/ 就绪 / 拖拽中（暂停自转）/ hover 节点
  （高亮 + tooltip 城市）；点击节点 = 触发换场（同 CTA）。
- 探针：`window.__nodegrid.globeReady` 且节点层非空。

### C2 zoom-through 换场（S0→S2）

- 触发：点击地球/「进入全球网络」；初始态 hero scale 1 → 终态
  scale 2.2 + opacity 0（同时 S2 从 scale 1.08/opacity 0 进入）；
  仅 transform+opacity；Elegant 曲线 ~600ms；一步辉光过桥
  （叠加层 radial-gradient opacity 0→.6→0）。
- 中断：换场中再触发反向立即反转，语义状态（URL hash `#network`）
  即时同步；不阻塞输入。
- 降级：reduced-motion 直接切换；View Transitions 不可用时 transform
  等效实现。

### C3 世界网络地图（S2 全屏）

- 底图：Natural Earth 数据 canvas 绘制暗色全息轮廓 + 经纬网格；
  平移（拖拽）/缩放（滚轮/双指，0.6-3×，确定性插值）。
- 节点：**方形像素光点**三层——核心（9px 白心 + `--brand` 晕 +
  2.4s ping 环）、边缘（6px 稳定点）、规划中（`--accent-plan` 虚线环）；
  光弧上流动光点（canvas 动画）。
- 虚拟化：仅渲染视口内节点标签（DOM 上限 60），底图瓦片化或
  整幅 canvas + 变换（实现时以帧率实测二选一）；首屏懒加载。
- 筛选：区域 tab（全部/亚太/北美/欧洲/特惠区）+ 搜索（城市/国家），
  结果即时高亮，无结果空态提示。
- 键盘：roving tabindex 遍历节点；Esc 退出地图回 Hero。

### C4 节点详情面板（S3，右侧 380px 滑出）

- 内容：机房照片（NASA PD，16:10 裁切）、城市/国家码/线路徽标
  （CN2 直连/BGP 多线/CMI）、延迟大数字（等宽，演示值）、产品起价
  列表、「部署到此节点」主按钮（点击 → toast「演示环境：部署流程
  未接入」）+「相邻节点 →」。
- 状态：滑入/滑出（Elegant）、加载、照片加载失败（占位 + 来源说明）；
  焦点陷入 + Esc 还焦；≤720px 变底部抽屉。

### C5 定价货架（S4）

- 三页签：特惠区 / 普通区 / 全球节点（aria-selected；URL 同步
  `?shelf=`）；卡片含产品名/配置等宽行/月价大数字/区域徽标/角标
  （特惠·限量 = `--accent-hot`）。
- 月/年切换（年付 -10%）；配置滑杆（vCPU 1-16 / 内存 2-64G / 带宽
  5-500M）实时改价（防抖 120ms，价格 aria-live）。
- 全部价格角部「演示数据」标注。

### C6 统计条 / 照片墙 / Footer

- 统计条 count-up（进入视口触发一次，不重复）；照片墙 3 张
  （1 NASA PD + 2 CC BY-SA，页脚署名表）；Footer 含素材署名与
  「本站为演示项目，数据虚构」声明。

## Quality gates（映射验收）

1. 对比度：出货 CSS 全部文本/图标对 ≥4.5:1（contrast-check 输出留痕）。
2. 键盘全旅程：仅键盘完成 Hero→地图→节点面板→定价→部署按钮
   （含 Esc 还焦），录证或逐步断言。
3. reduced-motion：模拟开启后无自转/循环/换场动画，功能不缺失。
4. 3D/画布：`__nodegrid` 探针（globeReady / mapReady / nodeCount ≥20 /
   visibleLabels ≤60）+ 非空白像素截图。
5. 性能：地图平移/缩放无可感知卡顿（门E 实测帧率留痕）；首屏
   只加载 S0 资源。
6. 响应式：390px / 768px / 1440px 三档截图；≤720px 地图降级路径可用。
7. console 0 错误；文本 200% 缩放不破版。
8. 门F 留痕：Context7（globe.gl API）、浏览器取证（Playwright/
   chrome-devtools）；Motion MCP 本会话不可达 → 动效参数以
   motion-contract.md 预设为准并记录降级。
9. ACCEPTANCE.md：六门记录 + 每轮门E 清单（P0/P1/P2）+ 证据索引。

## 参考基线与素材（含授权）

| 基线/素材 | 采用部分 | 授权 |
| --- | --- | --- |
| react-globe.gl（github.com/vasturiano/globe.gl） | 地球节点/弧线/交互 | MIT（实抓） |
| Natural Earth / world-atlas 底图数据 | 世界轮廓 | 公有领域 |
| Cloudflare Network 页 | 节点页信息结构 | 仅结构参考 |
| Lapa Ninja | 暗色 hero 节奏 | 画廊参考 |
| NASA 机房照片 ×1 + Pi/MIVITEC ×2（Wikimedia） | 节点图/照片墙 | PD / CC BY-SA 3.0 / 4.0（页脚署名） |
| 体素云 logo（demo/nodegrid 已定稿） | 3D 组件移植 | 自有产物 |
| 截图拼板 evidence/ref-*.png | 方向裁决 | 参考数据，不进生产 |

## 修订记录

- 2026-09-07（门E 第二轮，用户反馈）：①页脚署名表按用户裁决移除——照片
  全部换为公有领域素材（NASA 机房 / MGB Server Room / Postgirot 1966，
  Commons API 逐张核验 PD），页面零署名负担，来源许可记录保留于本修订
  与 ACCEPTANCE.md；②照片路径改 BASE_URL 绝对前缀（修非根路径 404）；
  ③「演示数据」标注收敛为页脚一行声明；④?shelf= 仅用户切换后写入；
  ⑤节点面板照片提亮；⑥城市口径统一「21 座城市」。
- 2026-09-07（门D 通过后，实现前置）：①Tailwind 省略——token 以
  CSS 自定义属性直接落地（契约样式基座本就是 CSS 变量表），减少
  依赖面；技术栈定为 Vite + React 19 + TS。②门F 记录：Context7 MCP
  本会话 API key 无效（Invalid API key），降级为**官方文档实抓**——
  globe.gl 与 react-globe.gl README 均经真实浏览器检视（Points/Arcs/
  Rings/Labels 层 API、Emit Arcs on Click 与 Ripple Rings 示例），
  留痕于本记录。
