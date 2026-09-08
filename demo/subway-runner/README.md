# 地铁跑酷 Subway Dash

中文单页 3D 跑酷小游戏。三车道地铁轨道向前狂奔：弹簧换道、跳跃、下滑铲躲
四类障碍（低栏 / 限高门 / 静止与迎面列车）、吃金币，警卫与狗两翼追捕——
擦碰小障碍会被追近，短时间再失误或正面撞上列车即结束。键盘与触屏滑动双输入，
本机最佳纪录存于浏览器。

角色与动物来自 Kenney CC0 素材（Animated Characters Protagonists + Cube Pets），
场景为 Three.js 实时渲染（透视相机追尾、实时阴影、雾效）。

## 本地运行

```sh
npm ci --ignore-scripts
npm run dev
```

默认开发地址为 http://127.0.0.1:5173（如与积木小工坊等并行，加 `-- --port 5176`
换端口）。需要支持 WebGL 2 的现代浏览器。

```sh
npm run build   # tsc --noEmit + vite build → dist/
npm test        # 触屏滑动分类单测（node --test）
```

构建产物为纯静态文件，任意静态服务器指向 `dist/` 即可在线体验，例如：

```sh
python3 -m http.server 4174 --directory dist
```

门C 视觉原型存档在 `dist/prototype.html`（构建自动携带）。

角色和皮肤贴图加载完成后才开放开局；加载失败时，原按钮提供重试。
[`subway-readiness.browser.js`](../../showcase/tests/subway-readiness.browser.js)
可由 Playwright MCP 的 `browser_run_code_unsafe.filename` 在展示站页面执行，
覆盖贴图延迟、失败重试、解码就绪、触屏换道与暂停。它不包含在 `npm test`
的纯逻辑单测中，需另行运行真实浏览器。

## 结构

- `src/engine.ts` — 游戏模型：状态机、弹簧换道、跳跃/滑铲、生成不变量
  （至少一条车道可通行、金币不与障碍重叠）、碰撞与判死、追捕者距离。
- `src/three-env.ts` — Three.js 环境：轨道循环、障碍池、金币池、光照与相机。
- `src/three-actors.ts` — 角色加载与动画（FBX/GLB、换肤、AnimationMixer）。
- `src/input.ts` + `src/swipe.js` — 键盘与触屏滑动（分类器可单测）。
- `public/models/` — Kenney CC0 模型与皮肤（出处见仓库 THIRD_PARTY_NOTICES.md，
  原始包与 License.txt 在 `assets-src/`）。
- `DESIGN.md` / `ACCEPTANCE.md` / `research-notes.md` — 设计契约、验收留痕、
  角色设计参考研究。
