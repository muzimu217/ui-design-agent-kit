# FORMA One

独立的 Vite + React + TypeScript 手机产品 UI 概念页。页面采用“陶瓷窑架 / 釉料流”视觉世界：产品渲染、颜色与容量选择、实时价格、购物袋反馈、亮点和技术规格都在一个响应式购买路径里完成。

本轮升级加入了 `motion/react` 的 spring、layoutId、AnimatePresence 和 whileInView 编排，并在产品窑架中嵌入本地 6 秒釉料流视频 `public/assets/forma-kiln-loop.mp4`。完整的触发、状态、参数、打断策略和 reduced-motion 约定见 [docs/motion-plan.md](./docs/motion-plan.md)。

## Run

```bash
npm install
npm run dev
```

默认地址：`http://127.0.0.1:5173/`

生产构建：

```bash
npm run build
```

## Interaction

- 点击窑白、钴蓝、藏红或苔绿，产品背板和配方摘要同步更新。
- 点击 128 / 256 / 512 GB，价格实时变化。
- “加入购物袋”进入成功状态，支持“撤销”。
- 技术规格使用原生 `details/summary` 展开。
- 支持可见键盘焦点和 `prefers-reduced-motion`。

## Design records

- [PRODUCT.md](./PRODUCT.md): 产品事实与边界
- [DESIGN.md](./DESIGN.md): 视觉设计契约
- [docs/surface-brief.md](./docs/surface-brief.md): 页面 brief
- [docs/direction-contract.md](./docs/direction-contract.md): concept-seed 方向与挑战者判定

## Verification

- `npm install`：通过，无漏洞报告。
- `npm run build`：通过，TypeScript 与 Vite 构建成功。
- Impeccable detector：`src/main.tsx`、`src/styles.css` 无机械警告。
- 浏览器：375、768、1024、1440px 均无横向溢出；颜色/容量/价格/购物袋交互已验证；键盘 Tab 顺序已验证；reduced-motion 已验证。
- Motion：正常模式下视频 `readyState=4` 且时间持续推进；选色/容量使用 layout spring，价格和购物袋使用 `AnimatePresence`；reduced-motion 下视频暂停、手机位移归零。
- 截图：`artifacts/forma-375.png`、`artifacts/forma-1440.png`。

价格、规格、库存和购物袋均为概念演示数据，不产生真实订单。
