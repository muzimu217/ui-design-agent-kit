# 地铁跑酷 Subway Dash · 验收记录（ACCEPTANCE.md）

> 验收对象：`demo/subway-runner/`（Vite + TypeScript strict 子项目）。
> 计划依据：`DESIGN.md`（P-subway-1 完成 canvas 版实现取证；用户认为手绘角色
> 「不符合精细建模预期」→ P-subway-2 重锁为 Three.js + Kenney CC0 模型）。
> 本机取证：`python3 -m http.server 4174 --directory dist` → <http://127.0.0.1:4174/>。

## P-subway-2：3D 化升级（2026-09-07）

### 素材门（门B）

| 素材 | 许可 | 用途 | 核验 |
| --- | --- | --- | --- |
| Kenney Animated Characters Protagonists 1.1 | CC0（包内 License.txt 保全于 assets-src） | 主角=skaterMaleA 皮肤；警卫=criminalMaleA 皮肤（SkeletonUtils 克隆）；idle/run/jump 动画 | ✅ 用户结构化拍板「Kenney 全家桶」 |
| Kenney Cube Pets 2.0 | CC0（同上） | 狗=animal-dog.glb（GLB 外链 colormap.png 按 loader 相对路径补齐） | ✅ |

素材来源与适配记录同步登记于仓库 `THIRD_PARTY_NOTICES.md`；`assets-src/` 保留
原始 zip 解包与 License.txt 作出处凭证。

### 渲染层迁移（逻辑层复用）

- 新增：`three-env.ts`（渲染器/相机/光照+阴影/雾/渐变天空/循环枕木立柱/
  障碍池 train×3·barrier×4·gate×4/金币池×26/相机跟随与 danger 压迫感）、
  `three-actors.ts`（FBX/GLB 加载、换肤、AnimationMixer 三态动画、
  滑铲压低近似、追捕者两翼站位、狗程序 bob）。
- 复用不动：`engine.ts`（碰撞/判死/生成不变量）、`input.ts`+`swipe.js`（+5 单测）、
  `ui.ts`、`styles.css`、HUD/浮层 DOM。
- 退役删除：canvas 渲染层 `projection/scenery/obstacles/characters/shapes.ts`
  （门C 原型 `prototype.html` 为独立单文件，保留作方向存档）。
- 危险渐晕由 canvas 改为 DOM 覆盖层（`#vignette`）。

### 3D 版取证（Playwright + 图像评审三轮）

证据：`evidence/game3d-title-1280.png`、`game3d-running-1280.png`、
`game3d-over-1280.png`、`game3d-running-375.png`（旧 canvas 版 `game-*.png`
与门C `proto-*.png` 留作演进对照）。

| 验收点 | 结果 |
| --- | --- |
| 模型加载（actorsReady） | ✅ FBX×4 + GLB 全部就绪，console 0 错 0 警 |
| 换道/跳跃/滑铲/双失误终局（3D 版重跑） | ✅ lane -1 / air→落地 / sliding / danger>0.5 二次失误→over |
| 三态截图 + 移动端 375 | ✅ |
| 图像评审首检→修复→复检 | 首检揪出：FBX Phong 材质泛灰（贴图被 wash out）、追捕者两翼恰占车道中心线（读作挡路）、白色条带疑点 → 修复（材质换 Standard+贴图原色、两翼收窄至 ±0.34 车道并随 danger 收拢、复检白条消失）；二检 6/6 通过；终检（加跑动 bob 后）无发布阻断项 |
| 单测/构建 | ✅ 5/5；tsc strict + vite（three 致 chunk >500kB 属预期，单页 demo 接受） |

### 已知问题（3D 版，不阻塞）

1. P2 滑铲用「压低+前倾」近似，与 run→jump 衔接可再顺（素材无 slide 动画）。
2. P2 狗模型自带无动画，bob/俯仰为程序近似（GLB 选择时已知）。
3. P2 Kenney run 动画风格偏休闲，速度感主要靠 timeScale 随速度提升 + 跑动 bob。
4. `prefers-reduced-motion` 已接（bob/相机 FOV 压迫/云漂移关闭），MCP 无法模拟，未实测。
5. 迎面列车警示为车身发光脉冲（无音效，v1 非目标）。

### 依赖备案（Endor 依赖钩子）

- `three@0.185.1`（运行时，MIT，kit 预清表内来源，用户拍板路线 A）；
  `@types/three`（dev，MIT）。均装于 demo 子项目，kit 根 `package.json` 未动，
  安装带 `--ignore-scripts`。

---

## P-subway-1：canvas 版历史记录（已被 3D 版取代，取证时点 2026-09-07）

### 构建与单测（仍有效）

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 类型检查 + 构建 | `npm run build`（tsc --noEmit + vite build） | ✅ 0 错误 |
| 触屏手势单测 | `npm test`（node --test tests/swipe.test.mjs） | ✅ 5/5 |

### 浏览器取证（canvas 版，证据 game-*.png）

三态视图 ✅；换道（弹簧过冲 -1.018）✅；跳跃滞空→落地 ✅；滑铲 0.75s ✅；
触屏四向 ✅；暂停/恢复 ✅；判死（自然两局 59m/100m 双失误 + 确定性序列）✅；
金币拾取 16/24 ✅；画布非空 alpha=255 ✅；console 0 错 ✅；移动端 375 ✅。

### canvas 版缺陷修复记录

| 级别 | 缺陷 | 修复 |
| --- | --- | --- |
| P0 | 列车过相机平面 → 投影 s(z) 极点翻负 → IndexSizeError | 分母钳制 + 过滤提前（3D 版不再有该投影函数，教训记入） |
| P0 | 主角与警卫轮廓穿插 | 两翼包抄站位（3D 版沿用该策略） |
| P1/P2 | 警棍可见性/枕距/涂鸦/云遮阳等 | 见 git 历史与 `game-*.png` 证据 |

### 角色精绘期研究（reference 级）

规则提炼与检索留痕见 `research-notes.md`；该轮成果已随 canvas 渲染层退役，
但设计规则（头身比/剪影三件套/色彩分离）作为 P-subway-2 的评审基准保留。

## MCP 调用留痕（两轮实现合计）

- **Serper**：门C 前基线检索；P-subway-2 素材侦察（Quaternius/Kenney 对比，命中
  Kenney 两包直链）。WebSearch 内置限流至 09-16、Exa 无容量、Tavily 对 fandom
  抓取失败——均已按降级路径记录。
- **Playwright MCP**：Kenney 站点探测（curl 仅得 JS 壳，改真浏览器拿 zip 直链）；
  canvas 版与 3D 版全交互取证（导航/点击/键盘/合成指针/探针采样/截图 12 张归档）。
- **AI 图像分析 MCP**：门C 原型 2 轮 + canvas 实现 2 轮 + 3D 版 3 轮，共 7 轮
  细节评审；3D 版首轮揪出 Phong 泛灰与两翼占道，修复后终检无阻断项。
- **Stitch / 图像生成 / Motion / Figma MCP**：不可用或未启用（门C 已登记降级；
  本任务无 Web 动效库与设计稿接入需求）。**Context7** 未调用（three API 均为
  常规用法，构建期类型检查即验证）。
