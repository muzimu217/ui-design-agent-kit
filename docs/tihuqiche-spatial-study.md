# 从鹈鹕骑车吸收 3D、交互与视频制作经验

检查日期：2026-09-07。对象：[线上页面](https://tihuqiche.com/)及其公开源码。
当前 URL 展示的是 3D 骑行游戏，不是餐厅网站；以下分析只针对实际看到的页面。
源码检查固定在 [51815d8](https://github.com/Licoy/tihuqiche/tree/51815d8be6c4f2720610a3ee94f067b02e6be899)。
没有验证线上构建与该提交逐字节一致，源码事实与线上观察分别记录。

## 结论

值得学的不是把更多 MCP 接进来，而是让真实主体、场景、美术、动作、输入和状态形成一个整体。
它的低多边形角色并不是静态插画：可以旋转、切换载具，随后进入同一视觉世界里的骑行流程。
我们的 Agent 应先判断用户要的是对象交互、物理模拟还是一段影片，再组织相应的制作链。

## 实际使用的技术

| 已检查的证据 | 能确认的事实 | 不能据此宣称 |
| --- | --- | --- |
| [package.json](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/package.json) | Vue 3.5.42、Vite 8.2.2、Three.js 0.160.1 | 作者使用了哪种 AI 或 MCP；也不应把这些版本当作新项目默认版本 |
| [rider-primitives.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/rider-primitives.js) | 球、圆柱、圆环等几何体组合，材质使用 flatShading | 角色一定由 Blender 建模；已检查的模型路径是程序化构造 |
| [world.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/world.js) | 半球光、方向光、阴影、雾、实例化和像素比上限 | 使用了复杂离线渲染或自定义 shader 才能获得这种风格 |
| [game.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/game.js)、[collisions.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/collisions.js) | RAF 驱动，时间差限幅，至多 1/90 秒的子步进和定制碰撞规则 | 已使用 Rapier/Cannon；子步进上限也不等于完整的固定时间步累加器 |
| [game-camera.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/game-camera.js) | 按状态、屏幕和角色位置调整镜头，使用指数阻尼平滑跟随 | 所有动作都是弹簧，或网页正在播放 Remotion 视频 |
| 浏览器 DOM 与加载资源 | 首页有 canvas，没有发现 video/iframe；换装后模型发生可见变化 | 整个站点从未使用其他离线制作工具 |

所以要明确区分：低多边形是美术方向，Three.js 是实时渲染器，Blender 是可选资产制作工具，
Rapier 是可选物理引擎，Remotion 是帧时间轴视频系统，MCP 则是 Agent 访问工具的接口。

## 吸收什么

1. **主体先成立，再加效果。** 可识别的轮廓、统一的分面材质和光照，比给空白页面加漂浮光球更有内容。
   餐厅类应用可以对应真实菜品、餐桌或空间模型，但不应因此照搬游戏配色和菜单结构。
2. **操作与视觉结果靠近。** 换载具、换颜色后立刻看到模型变化；这种模式可以迁移到产品配置、家具展示和空间预览。
   [Wardrobe.vue](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/components/Wardrobe.vue)把草稿预览与保存分开，而不是一点击就永久提交。
3. **自动演示让位于人。** 拖动时停止自动旋转，键盘也能转动；取消时恢复已保存外观和入口焦点。
   [RiderPreview.vue](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/components/RiderPreview.vue)还处理了 pointer capture、取消和失焦。
   其装扮视图闲置 10 秒恢复自动旋转，是这个产品的选择，不是所有网页必须采用的规则。
4. **镜头是界面的一部分。** 背景赛道、角色和菜单之间通过空间位置与镜头建立联系；不要把 3D 当成任意尺寸卡片里的孤立玩具。
   本例镜头平滑主要是指数阻尼，不能混称为真实刚体模拟。
5. **同源资产贯穿不同视图。** [home-preview.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/home-preview.js)复用角色工厂，
   [缩略图生成器](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/scripts/generate-outfit-thumbnails.mjs)也从真实模型出图。
   可以进一步用于统一网页模型、商品缩略图、视频和封面，避免每个环节长得不一样。
6. **首帧就绪才是真正加载完成。** [boot-tasks.js](https://github.com/Licoy/tihuqiche/blob/51815d8be6c4f2720610a3ee94f067b02e6be899/src/boot-tasks.js)
   跟踪真实任务，游戏另有首帧 ready 信号。学习可恢复的加载流程，不使用与资源状态无关的假进度。

另一个工程细节：页面上多个 canvas 不等于多个 WebGL renderer。
这里的角色预览借用主 renderer，再复制到 2D canvas；是否采用这种结构要根据目标项目测量，
不能把它推广成所有 R3F 页面都必须手写的渲染系统。

## 不照搬什么

- 390×844 首页截图中，背景角色靠右且被裁切；这不能作为商品检查视图的合格构图。
- 手机装扮面板较长，底部动作不在初始视口；桌面 1280×720 下也需要注意面板滚动与动作可达性。
- 游戏的持续背景运动不适合直接搬进后台工具。减少动效、暂停、低性能和无 WebGL 路径要独立验收。
- 自制跑道碰撞规则适用于其有限玩法，不代表应该从零重写通用刚体引擎。
- 本次没有测到真实手机 GPU 帧率，也没有完整通关、验证双人手感、全站无障碍或减少动效。

## 我们的工具选择

| 需求 | 应当调用或使用 | 本项目边界 |
| --- | --- | --- |
| UI 的状态与过渡 | 现有 CSS/Motion；Motion 文档 MCP | 已有路由，不额外装 3D 引擎 |
| 实时网页 3D | Three.js；React 项目可选 R3F/Drei；Context7 查询 API | 这些是库，不是假想的 Three.js MCP |
| 真实碰撞、堆叠、关节 | Rapier 或兼容的现有引擎 | 按物理需求启用，普通旋转展示不需要 |
| 建模、UV、烘焙、可编辑源文件 | Blender；可选 [第三方 Blender MCP](https://github.com/ahujasid/blender-mcp) 或已安装的本地 CLI | 未安装/配置该 MCP；不自动改插件、全局设置、隐私选项或付费服务 |
| 3D 影片、产品演示、可下载视频 | Remotion skill + 本地渲染；[ThreeCanvas](https://www.remotion.dev/docs/three-canvas)支持帧驱动 3D | 不能直接复用网页 RAF/物理世界作为视频时间轴 |
| 嵌入网页 | 普通视频元素；需要 React 动态参数时用 [Remotion Player](https://www.remotion.dev/docs/player) | Player 不是视频导出，也不是自由操控的 3D 场景 |
| 实际验收 | Playwright 截图、输入、像素与失败状态检查 | 连接成功不等于渲染成功，构建成功不等于视觉合格 |

推荐资产链是：建模或选取授权资产，保留源文件，导出并验证 GLB，然后分别接入实时网页和视频工程。
二者共享主体资产与外观配置，不共享不可控的运行时钟。Blender 材质和模拟不保证自动进入 glTF，
应检查[官方导出器](https://github.com/KhronosGroup/glTF-Blender-IO)与目标版本文档。

[Remotion 官方说明](https://www.remotion.dev/docs/ai/mcp)确认旧 MCP 已废弃并不建议新装；
继续使用 Agent Skills 和文档路由。不要把“增加视频能力”误实现成装回旧 MCP。
本次 Remotion 文档搜索接口连接超时，改为读取官方 Markdown 页面；没有声称搜索成功。
Blender 手册的部分 URL 抓取失败，因此没有根据搜索摘要编造具体导出参数。

## Agent 应掌握的顺序

1. 场景图、相机、变换、光照、材质、色彩空间和生命周期：先让一个真实主体正确显示。
2. 输入与状态：拾取、旋转、重置、草稿/取消、键盘和触屏，先把一次完整交互做好。
3. 资产工程：Blender/GLB、UV/PBR、动画片段、压缩解码、路径、授权与加载失败。
4. 按需物理：刚体、碰撞体、约束、固定步进、CCD、睡眠与重置，不把碰撞和视觉反馈混为一谈。
5. 视频分镜与帧驱动：同一帧可重现、跳帧访问、3D 动画采样、Player 与文件渲染的区别。
6. 实机验收：构图、像素、移动端输入、资源与帧耗时预算、减少动效和失败降级。

这些应是 Agent 的内部执行能力，不要求用户先学会 Blender、Rapier 或 Remotion 才能提出需求。

## 本次检查与维护范围

真实浏览器检查了首页、换载具、拖动、键盘焦点、取消恢复、手机布局、开始骑行和暂停。
装扮预览的 2D canvas 抽样为 627×547，检测到 13,056 个非透明样本和 1,870 种颜色；
这是本次非空像素证据，不是性能分数。拖动前后截图也确认了主体朝向变化。
手机装扮视图页面宽度为 390，无页面级横向溢出；这不等于整个页面通过了响应式验收。

本机可重建截图位于 `output/playwright/tihuqiche/`，未提交为项目资产：
`desktop-home.jpg`、`desktop-wardrobe.jpg`、`desktop-dragged.jpg`、
`mobile-home.jpg`、`mobile-wardrobe.jpg`、`desktop-game.jpg`。
没有安装或执行网站源码，也没有复制它的模型、贴图或商标到本项目。

维护入口是主 skill 的 [Spatial Media](../.agents/skills/ui-design-agent/references/spatial-media.md)
和 Remotion 的 [3D Video and Web Delivery](../.agents/skills/remotion-video-agent/references/three-and-web.md)。
新增的行为场景位于 `evals/scenarios.json`；静态验证只证明指令、引用和评测结构有效，
不能证明 Agent 已经生成并验收过实际 Blender 模型、刚体场景或 Remotion 成片。

维护验证结果：`npm ci --ignore-scripts`、`npm run verify`、`npm run prompt:build`
和两个自有 skill 的 `quick_validate.py` 均通过；`npm test` 为 25/25 通过。
新增 9 个场景后共 45 个场景定义，原回归测试中的固定总数改为核对实际列表。
这些是结构与回归检查，不是 45 次行为任务执行。
一次独立的只读情境检验因服务返回 429 限流而未完成，没有写入通过记录或虚构评分。
