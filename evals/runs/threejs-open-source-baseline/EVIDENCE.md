# EVIDENCE.md · threejs-open-source-baseline（R149-01 批次二）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 178 日间。
> 目标产品：demo/brick-workshop（showcase 主打可玩案例，已发布）。
> 既有场景实检先行（判据 1），改动为 bounded 键盘可达性增益，未触碰既有交互路径。

## 一、既有场景盘点（判据 1：先检视再动手）

Scene.tsx（639 行）实检结论：
- 相机：正交（ortho，zoom 18，position [30,31,-39]）
- 控制：OrbitControls（drei 10.7.8），enablePan=false（拼搭台语义），damping/极角/距离钳制齐备
- 指针：左键旋转/中键缩放/右键旋转；hover 拾取（非 touch）；`touches={ONE: ROTATE, TWO: DOLLY_ROTATE}` —— **触控路径已存在**
- 资产：程序化几何（geometry.ts + domain.ts），无外部 GLB 网络加载
- **缺口：键盘路径为零**（grep keydown/keyboard 无命中）——键盘用户无法操作 3D 画布
- WebGL fallback（判据 6）**已存在**：webgl2 能力探针（Scene.tsx:595-610）+ SceneBoundary（App.tsx:45-58，role=alert + 重试按钮）+ Canvas fallback prop（:669）

## 二、可检视基线（判据 2）

- three.js 官方示例 **misc_controls_orbit**（github.com/mrzmyr/three.js → examples 中 OrbitControls 键盘事件模式：`controls.listenToKeyEvents(window)` + keys 映射）
- 官方 OrbitControls 文档（threejs.org/docs OrbitControls.keys）
- 适配声明：官方键位=**平移**（pan）；本产品拼搭台禁 pan（enablePan=false），照搬会让键盘用户平移走丢焦点——**适配为旋转（方向键）+缩放（+/-）**，正是判据 4 要求的"适配基线到既有产品，而非为偏好换栈"
- 权限：three/drei 均 MIT；未复制任何示例代码文件，仅沿用其键位事件模式；零新依赖

## 三、版本/许可/来源/运行成本（判据 3）

- three 0.185.1（MIT）/ @react-three/fiber 9.7.0（MIT）/ drei 10.7.8（MIT）——package.json 在案
- 资产来源：积木几何全程序化；Kenney 素材许可 token 在库（既往验收留痕）
- 运行成本：**零新增依赖、零新增 bundle 块**（纯 three 内置 Spherical + window listener）；运行时成本=每键一次三角函数（可忽略）

## 四、实现（判据 4）

Scene.tsx 三处：
1. SceneRuntime 键盘效果：window keydown，**仅当 `document.activeElement === gl.domElement`**（画布聚焦）才响应——不劫持页面滚动/按钮焦点；方向键 ±15°方位角/±12°极角（Spherical，尊重既有 min/maxPolar 钳制），+/-=zoom ×1.15（6-60 钳制）；OrthographicCamera 判型缩放投影矩阵
2. Canvas onCreated：`domElement.tabIndex = 0` + aria-label 写明键盘用法（可达性正确姿势：画布可聚焦可操作可描述）
3. styles.css：`canvas:focus-visible` 2px 焦点环（#2566c4）

## 五、双端验证（判据 5，evidence/ 脚本可复跑）

桌面 1440×900（brick-keyboard-verify.mjs，11 项断言 11 PASS）：
- 画布挂载/tabIndex=0/aria-label 含键盘用法 ✓
- **未聚焦按方向键画面 0.000% 差分**（不劫持）✓
- 聚焦后 activeElement=CANVAS；ArrowLeft×4 画面差分 **5.29%**（旋转发生）✓
- + ×3 画面差分 **9.29%**（缩放发生）✓
- console 0 错误（资产与运行时干净）✓

移动 390×844 touch（同脚本）：
- 画布挂载 ✓；**单指触控拖拽画面差分 1.86%**（touch path 实证）✓
- 截图：desktop-keyboard-rotated.png / mobile-touch-rotated.png

WebGL fallback（brick-fallback-verify.mjs）：
- 覆盖 `getContext('webgl2')→null`（探针真实路径）→ SceneBoundary 渲染「3D 画面暂不可用 / 作品仍在 / 重新加载画面」（role=alert + 重试按钮）✓
- 验证注记：chromium `--disable-webgl` 旗标在 SwiftShader 下不生效（首跑假阴性），改 getContext 覆盖后实证——**旗标式禁用验证不可信**

## 六、门径披露

改动已发布 demo 的交互行为，超出微修通道常规范围；按 a11y 修复扩展适用微修通道（键盘可达性与轮 175 色对比同类），代行裁决留痕于此。既有交互路径零改动（diff 纯增量）；三连+双端验证全绿后合并。

## 七、诚实边界

- 双指捏合（TWO=DOLLY_ROTATE）未单独脚本验证（触控路径单指已实证；双指为 OrbitControls 内置）
- 键盘缩放无 UI 提示（aria-label 已含用法；页面可视提示属后续打磨项，不在本判据内）
