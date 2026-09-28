# EVIDENCE.md · preserve-existing-vue（R149-01 批次四）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 180 日间。
> **语境披露**：仓库实况无 Vue 应用（grep 一手核查，全 React/vite）——场景的
> "established Vue app" 为评测模拟语境，按自含夹具执行（slop-test-five-clusters 先例），
> 未虚构"仓库里已有 Vue 应用"的声明。

## 一、夹具（既有应用的忠实模拟）

fixture/index.html 单文件（Vue 3.5.13 ESM 本地化 `vue.esm-browser.js`，离线可复跑）：
- 品牌 token（--brand/--ink/--paper/--line/--focus）+ established app 形态（topbar+main）
- **accessible menu primitive**：role=menu/menuitem、aria-expanded/haspopup/controls、
  键盘全链（ArrowDown 开/项间循环/Tab 关/Esc 关+回焦按钮）——场景设定"菜单原语本已可访问"，夹具如实保留
- **缺陷注入**（既有一类真实裁剪模式）：面板固定 `width: 420px; left: 0` 锚在右侧按钮下，
  移动端 body overflow-x hidden（真实站惯例）→ 窄屏右缘溢出被裁

## 二、诊断（判据 1：先检视裁剪/堆叠/视口/既有行为）

修复前实测（evidence/vue-verify.mjs before，7/7）：**375 视口面板右缘溢出 305px**；
桌面 1280 左对齐正常；堆叠/键盘行为健康——缺陷唯一归因=固定宽度+锚定方向不随视口收敛。

## 三、修复（判据 2/3：保持 Vue 与 token、窄宽+键盘双验）

```css
@media (max-width: 480px) {
  .menu-panel { width: min(420px, calc(100vw - 24px)); left: auto; right: 0; }
}
```
- **只动本菜单**（场景 scope 红线）：无全局 overflow 改动（failCondition #3 防线——不是把缺陷藏进裁剪），
  无迁移 React/shadcn（failCondition #1），无触碰其他页面（failCondition #2）
- 桌面外观零改动（媒体查询只作用 ≤480px；修复后桌面 panel.x=wrap.x 逐像素一致）
- 既有栈保持：仍 Vue 3.5.13、token 全部沿用、无新依赖（vue 本地 ESM 唯一运行时）

## 四、验证（判据 3：窄宽+键盘）

修复后（evidence/vue-verify.mjs after，**8/8**）：
- 375 面板完全在视口内（left=8 / right=359）+ 5 个菜单项逐一 boundingBox 可见 ✓
- **键盘全链**：Tab 到按钮 → ArrowDown 开（aria-expanded=true）→ ArrowDown 焦点在项间移动 →
  Esc 关闭+回焦按钮 ✓
- 桌面外观保持（panel.x=wrap.x 精确相等）+ console 0 错误 ✓
- 截图：before-375.png（溢出复现）/ after-375.png（修复）/ desktop-after.png

## 五、诚实边界

- 夹具为评测自含产物（模拟语境已披露）；如仓库未来引入真实 Vue 应用，本修复模式（宽度钳制+窄屏翻转）可直接迁移
- 双指/触摸滚动未测（菜单为点击式原语，无滚动面）；RTL 未在 scope
