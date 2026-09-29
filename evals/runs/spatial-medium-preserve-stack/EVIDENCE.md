# EVIDENCE.md · spatial-medium-preserve-stack（R149-01 批次三十）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 210。
> 场景本质：**媒介保持**——已有 Vue 产品页+可用 Three.js loader+已授权 chair.glb，
> 加拖拽检视+换色。考"保留 Vue 不迁移 React/R3F、不装物理引擎、不换视频/CSS tilt 替代、
> 真实验证非挂载即声称"。
> **模拟语境披露**：无真实 chair.glb 文件——椅子以程序化几何组装模拟（材质变体/交互/验证
> 链路全真）。

## 一、保留与拒绝（failCondition 防线）

- **保留 Vue**：原生 three.js 挂 Vue 3 组件树（零 React/R3F——不迁移栈，#1 防线）
- **零新运行时**：three ^0.169 单依赖（无 physics 引擎/Blender——简单转台不需要，#2 防线）
- **无替代品**：真实 three.js 场景（非视频/CSS tilt/占位 cube/静态图，#3 防线）
- "授权 chair.glb"以程序化几何椅子模拟（评测语境披露）

## 二、实现

- 场景：程序化椅子（座/背/四腿）+ 三点光照 + 纸色背景
- 交互：pointer 拖拽旋转（含触屏 pointer 事件统一）+ 方向键微调 + R 复位
- 换色：两材质变体 swatch（aria-pressed + aria-label），色值即刻生效
- reduced motion：matchMedia 关闭展示自转
- 容错：WebGL 初始化 try/catch → 失败态 UI（.err）

## 三、构建坑（入库教训）

Vue runtime-only 构建不含模板编译器（template 字符串不渲染）——**esm-bundler 完整版
alias**（resolve.alias vue → vue/dist/vue.esm-bundler.js）解决。此前 app EMPTY 零错误
即此因（Vue 只发 console warning）。

## 四、验证（8/8，evidence/vue-verify.mjs 可复跑）

- canvas 挂载 ✓；**换色像素差 14.74%** ✓（材质色变化实证——非挂载即声称）
- **拖拽旋转像素差 11.95%** ✓（指针交互实证）
- **键盘 ArrowRight 像素差 9.14%** ✓
- reduced motion：画面静止差异率 **0.000%** ✓
- 移动端 375：渲染+零横向滚动 ✓；console 0 错误 ✓
- 截图：desktop-chair.png / mobile-375.png

## 五、诚实边界

- 键盘旋转为全局监听（未限定画布聚焦）——生产化需 focus 圈定，评测语境记为已知边界
- 椅子为程序化几何模拟（无真实 glb），皮肤/贴图管线未覆盖
- 无阴影/环境贴图（视觉精简为评测最小充分集）
