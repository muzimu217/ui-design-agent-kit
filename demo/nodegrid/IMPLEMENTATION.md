# NODEGRID 全球节点云 · 实现报告（IMPLEMENTATION.md）

> 子代理 C（实现工程师）产物，2026-09-07。上游契约：DESIGN.md（权威）、
> DIRECTION.md v4.1（定价数字来源）、PROTOTYPE.md（三屏方向）。
> 契约与门产物（DIRECTION/DESIGN/PROTOTYPE/logo-*/montage/evidence）未做任何修改。

## 一、文件清单

```
demo/nodegrid/
├── package.json              # 脚手架与依赖版本
├── vite.config.ts
├── tsconfig.json             # src 严格模式；vite.config 由 Vite 自身转译
├── index.html                # lang=zh-CN · favicon /logo-mark.svg
├── .gitignore                # node_modules/ dist/（实体 node_modules，非软链）
├── public/
│   ├── countries-110m.json   # world-atlas@2（公有领域，unpkg 实下载 107KB）
│   ├── logo-mark.svg         # favicon（契约产物副本）
│   └── photos/
│       ├── nasa.jpg          # 1280px，NASA，公有领域（节点面板 + 照片墙）
│       ├── amravati.jpg      # 1280px，Pi Data Centers，CC BY-SA 4.0
│       └── mivitec.jpg       # 960px 原图，Dr-text，CC BY-SA 3.0
└── src/
    ├── main.tsx
    ├── App.tsx               # 视图状态机 + zoom-through 换场 + hash 驱动 + toast
    ├── styles/global.css     # DESIGN.md token 表逐条落地 + 动效预设 + VT 伪元素
    ├── types/topojson-client.d.ts  # 最小类型垫片（不引入 @types 依赖）
    ├── lib/
    │   ├── probe.ts          # window.__nodegrid 探针
    │   └── world.ts          # world-atlas 加载/缓存 + geojson 环展开
    ├── hooks/
    │   ├── usePrefersReducedMotion.ts
    │   ├── useCountUp.ts     # 含 useInViewOnce（进入视口触发一次）
    │   └── useFocusTrap.ts   # 面板焦点陷入 + Esc 还焦
    ├── data/
    │   ├── nodes.ts          # 32 节点 / 21 城市 / 12 弧 / 分组 / 最近邻
    │   └── pricing.ts        # DIRECTION.md 定价表全量 + 区域映射 + 改价公式
    └── components/
        ├── VoxelLogo.tsx/.css        # 3D 体素云（logo-demo.html v4 移植，双态）
        ├── Hero.tsx/.css             # S0：2D lockup + 主张 + 双 CTA + 统计条
        ├── DataGlobe.tsx/.css        # S0 地球（react-globe.gl）
        ├── NetworkStage.tsx/.css     # S2 全屏舞台（HUD/图例/空态/移动端列表）
        ├── NetworkMap.tsx/.css       # S2 canvas 地图（交互与虚拟化核心）
        ├── NodePanel.tsx/.css        # S3 节点详情（380px / ≤720px 抽屉）
        ├── Pricing.tsx/.css          # S4 三页签货架 + 滑杆实时改价
        ├── Trust.tsx/.css            # S5 SLA 条 + 照片墙 + 城市折叠
        ├── Footer.tsx/.css           # S6 CTA（3D logo 位）+ 署名表
        └── Toast.tsx/.css            # 部署演示 toast
```

## 二、依赖版本（npm 实装）

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| react / react-dom | ^19.2.8 | |
| react-globe.gl | ^2.38.0 | 自带 TS 类型（d.ts 引用 three，npm 提升，无需显式依赖） |
| topojson-client | ^3.1.0 | 底图拓扑展开（附最小类型垫片） |
| vite | ^8.2.2（dev） | |
| @vitejs/plugin-react | ^6.1.1（dev） | |
| typescript | ^7.0.2（dev） | `tsc --noEmit` 门禁 |
| @types/react(-dom) | ^19.2.x（dev） | |

未引入清单外依赖；three 经 react-globe.gl 传递安装且**未在源码中直接 import**
（球体直接用 three-globe 内置纯黑 MeshPhongMaterial 默认材质，见决策 2）。

## 三、关键实现决策

1. **样式基座**：DESIGN.md token 表全部落为 CSS 自定义属性（`src/styles/global.css`），
   无 Tailwind；等宽栈 `ui-monospace,"SF Mono",Menlo` + `tabular-nums`；
   中文 system 栈；全站 `:focus-visible` 2px `--brand` + 2px offset。
2. **暗色球体零贴图**：react-globe.gl 不传 `globeImageUrl`，three-globe 默认材质即
   纯黑 Phong；叠加青色大气（`atmosphereColor`）+ 内置经纬网（`showGraticules`，
   lightgrey 0.1 透明）+ countries-110m 多边形蒙皮（青描边）= 全息暗球，
   无网络贴图依赖（离线可跑）。
3. **换场（C2）**：URL hash `#network` 为唯一驱动源（CTA/Esc/后退键全部经
   hashchange 汇入），View Transitions 可用时 `startViewTransition` +
   `::view-transition-old/new(zoom-hero|zoom-network)` 关键帧（600ms
   cubic-bezier(0.16,1,0.3,1)，仅 transform+opacity）；`view-transition-name`
   **动态挂载**（旧态命名当前舞台、回调内命名新舞台，结束即清），避免被
   全屏地图遮住的 hero 常驻命名而被提升进顶层快照。降级路径：`.vt-out` /
   `.is-entering` 对元素本体施加同名关键帧；辉光过桥为进入态内 600ms 一步
   radial 叠加层（0→.6→0）。中断：skipTransition + 换场序号守卫（旧换场
   finally 不再触碰新换场状态）。reduced-motion：直接切换（150ms 淡入）。
4. **S2 地图**：单 canvas 每帧矢量重绘（110m 数据 ~万级顶点，实测帧成本远低于
   预算，未走瓦片化——契约允许二选一）；等距圆柱投影到 2000×1000 世界坐标，
   视图用「目标态 + 时间常数指数插值」（`1-exp(-dt·11)`，帧率无关的确定性收敛）；
   缩放 0.6–3×，滚轮/双指/按钮三种入口，锚点世界坐标保持不动；国界 mesh 一笔
   描边（屏幕等宽 1px）；节点三层：核心 9px 白心+青晕+2.4s 方形 ping 环（相位按
   纬度散开）、边缘 6px 稳定亮点、规划中紫虚线环；光弧二次贝塞尔 + 每弧 2 颗
   流动光点；标签为 DOM 按钮（44px 命中区 + 城市芯片），rAF 内直接写
   transform，视口内筛选结果才渲染、上限 60（虚拟化）；roving tabindex 沿
   **筛选结果**遍历（方向键/Home/End，聚焦出视自动滚入）。
5. **键盘全旅程**：Hero CTA → 「进入全球网络」（Enter）→ 舞台首 tab 自动聚焦 →
   Tab 至地图（单停点 roving）→ 方向键遍历 → Enter 开面板（焦点陷入 + Esc 还焦
   触发节点）→ Esc 退出地图还焦 Hero CTA；主页面在地图态挂 `inert`。
6. **定价**：三页签 aria-selected + `?shelf=` replaceState 同步（与 `#network`
   可共存为 `?shelf=x#network`）；全部卡片数字逐项取自 DIRECTION.md 定价表；
   年付 = round(×0.9)；滑杆 120ms 防抖后改价，价格 `aria-live=polite`；
   GPU 按时价不参与年付折扣（页内注明）。
7. **S2 懒加载**：NetworkStage 为 `React.lazy` 独立分块（18.9KB），空闲 1.6s 后
   预热；地球在进入地图后 `pauseAnimation()`（首屏只跑 S0 的性能口径）。
8. **照片降级**：NodePanel 图 onError 换占位块 + 来源 URL（不虚构）。

## 四、与契约的偏差（及理由）

1. **地球未用圆柱 points 的显式高度层区分之外的自绘层**——采用 react-globe.gl
   Points 层（核心 0.032 / 其余 0.016 高度）+ 12 条 dash 弧，契约 C1 允许
   （"圆柱 points 或自绘"）。无 Rings 层：弧线 dash 流动已承载"流动"语义，
   避免与地图 ping 环重复堆动效（DESIGN「不堆辉光」）。
2. **S0 左上用 2D lockup、3D 体素云置于 S6 CTA 区**——按任务简报 S0 规格
   （"左上 2D lockup"）执行；3D logo 组件完整移植（点击轮转展示双态、
   reduced-motion 静态）并保留在页面 S6，满足质量门"3D logo 组件移植后
   保持…"。
3. **`?shelf=` 用 history.replaceState 而非 hash 段**——简报明示 `?shelf= 同步`，
   与 `#network` 分属 search 与 hash，二者共存无冲突。
4. **statista/统计条 aria-hidden**——DESIGN 无障碍节明示"统计条跳过
   （aria-hidden 装饰）"，照办。
5. **构建体积警告（>500KB 单块）**——react-globe.gl（three 全家桶）本身即 ~2MB，
   属库固有；S2 已分块、照片按需加载，未再对 S0 必需的地球库做激进拆分
   （无收益）。门 E 若有要求可再议。
6. **amravati.jpg 首次下载超时**——已重试成功（1280×854 JPEG），无残留问题。

## 五、自检结果

- `npm install` exit 0（无 peer 冲突，React 19 + react-globe.gl 2.38 兼容）。
- `npm run build`（tsc --noEmit && vite build）exit 0：
  - dist/index.html 0.83 kB；CSS 22.82 + 10.11 kB；JS 主块 2132.95 kB
    （gzip 607.63 kB）+ NetworkStage 分块 18.85 kB（gzip 7.09 kB）。
  - public 资产（countries-110m.json / logo-mark.svg / 3 张照片）完整拷入 dist。
- 数据核对：32 节点 / 21 城市 / 12 弧（≥8）/ 规划中 4 / 特惠节点 2（脚本实测）。
- 对比度预检（WCAG 相对亮度手算）：ink 17:1、ink-2 10.4:1（overlay 上）、
  ink-3 仅用于 base/raised（4.53–4.66:1）、brand 11.2:1、按钮深字于青底
  11.2:1、特惠角标深字于 #F59E0B 9.4:1；搜索占位符用 #7fc6d8（9.7:1，
  弃 ink-3-on-overlay 的 4.29:1）。出货级 contrast-check 留痕由门 E 执行。
- reduced-motion 覆盖清单：地球自转/弧 dash、地图 ping/流点、换场（→150ms
  淡入）、count-up（瞬时终值）、stagger、orb 呼吸、扫光/雨滴（logo CSS 原样
  降级）——功能均保留。
- 未启动 dev server / preview（按简报，浏览器取证归主代理）。
- 探针：`window.__nodegrid = { globeReady, mapReady, nodeCount: 32,
  visibleLabels }`（globeReady 于 onGlobeReady + 控制器装配后置位；
  mapReady 于底图 JSON 解析完成置位；visibleLabels 随视口标签集实时更新）。
