# UAK 产品介绍视频（intro-video）

20 秒产品介绍视频的 Remotion 工程。成片已随仓库发布（`showcase/products/media/intro.mp4`），
README 与线上展厅嵌入的是同一份。

## 运行

```bash
npm ci --ignore-scripts
npm run render     # 出片到 out/intro.mp4
npm run studio     # 可视化预览（调参用）
```

`render` 与 `studio` 都会先跑 `gen-audio`：音轨与音效由 `scripts/gen-track.mjs`、
`scripts/gen-sfx.mjs` **程序化合成**，产物落在 `public/sfx/`，该目录被 gitignore
（可重建，不入库）。**不要跳过这一步**——`src/Root.tsx` 通过 `staticFile("sfx/...")`
引用这些 wav，缺文件时渲染会以 404 失败。

单独重新生成音频：`npm run gen-audio`。

## 结构

| 路径 | 作用 |
| --- | --- |
| `src/index.ts` | Remotion 入口 |
| `src/Root.tsx` | 合成定义：场景序列、音轨与音效时间点 |
| `src/scenes/` | 各场景组件 |
| `src/theme.ts` | 色彩与字体 token |
| `scripts/gen-track.mjs` | 合成背景音轨（含峰值归一） |
| `scripts/gen-sfx.mjs` | 合成 whoosh / pop / tick 等音效 |

## 边界

- 本工程不进入根 package 图，独立 `package.json` 与依赖锁。
- `out/`、`node_modules/`、`public/sfx/` 均可重建，不入库。
- 视频只用于展示产品流程，不代表任何生成任务已通过验收。
