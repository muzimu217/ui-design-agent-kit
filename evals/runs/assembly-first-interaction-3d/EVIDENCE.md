# EVIDENCE.md · assembly-first-interaction-3d（R149-01 批次二十六）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 206 系。
> 场景本质：**装配优先**——交互 3D hero+环境动画背景，考"基线矩阵选路→MIT 组件装配→
> 手绘 CSS 仅为例外→真实像素与交互取证（非挂载即声称）"。

## 一、基线矩阵选路（判据 1）

三路径评估：① R3F+组件库装配（交互 3D 正解）② 预渲染视频（无交互，不符）③ 手绘 CSS
（failCondition #1 主防线——**未手绘 WebGL 等价物**）。选①：任务要求指针交互的实时 3D。

## 二、装配与许可（判据 2）

- **MIT 组件装配**：@react-three/fiber（Canvas/useFrame）+ drei（OrbitControls 拖拽/
  Float 漂浮）+ three（几何体/材质）——与 demo/brick-workshop 已验证组合同族
- 改编部分：几何组合（二十面体主 knob+torus/dodecahedron 卫星）、配色（库内 token
  #2fbf8f/#4d9fff/#8f7bf5）、reduced motion 分支——自有内容
- **手绘 CSS 例外记录**（判据 3）：环境动画背景（.ambient 渐变漂移）为 2D 背景非 3D
  对象，用 CSS 实现——理由记录于 fixture/index.html 注释与 EVIDENCE §三
- **外部素材零整合**（判据 4 前置）：纯几何+token，无图片/模型需求，零下载

## 三、取证教训（failCondition #3 活教材）

首版取证用 canvas.readPixels 全黑判"未渲染"——**假阴性**：R3F 默认
preserveDrawingBuffer=false，帧后 drawing buffer 被清空。v2 改合成器截图（元素级）
PNG 解码比像素——真实渲染可见。**取证方法必须匹配渲染管线**。

## 四、真实像素与交互验证（判据 5，6/6）

evidence/assembly-verify.mjs（可复跑）：
- 指针拖拽改变 3D 渲染：元素截图像素差 **2.39%** ✓
- reduced motion：画面静止差异率 **0.000%**（自转/漂浮正确关闭）✓
- 移动端 375：canvas 渲染+无横向滚动 ✓
- console 0 错误 ✓
- 截图：desktop-hero.png / mobile-375.png

## 五、诚实边界

- 键盘路径：OrbitControls 默认 arrow-pan 已随 enablePan=false 关闭——本批**未实现
  键盘旋转**，如实记录为已知边界（指针交互已实证）；键盘旋转属后续增强
- 环境 CSS 动画为手绘例外（非 3D 对象），理由在案
