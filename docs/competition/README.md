# 参赛视频交接包 · 说明

本目录是 **OSChina 开源创新大赛 · 演示视频** 的外部制作交接入口。

| 文件 | 用途 |
| --- | --- |
| [`video-brief.md`](video-brief.md) | **制作需求书（先读这个）**：赛事、产品一句话、素材与风格政策、底线、交付规格 |

## 包里有什么

本包**只交付产品本体（源码 + 文档）**，**不交付任何供你使用的素材**。

- 可运行的产品源码（包根）：`npm ci --ignore-scripts` 后可跑 `npm run verify` 与 `npm test`。
- 若干可运行案例（`demo/*/`）：**跑起来做实机录屏用**。
- 产品自述与机制文档（`README.md`、`docs/identity-and-direction.md`、`docs/gates.md`、`docs/architecture.md`）：用于**理解产品**。

## 素材：不随包提供

**本片一切视觉素材请自行生成或检索，用全新的一套**（图形 / 背景 / 插图 / B-roll / 图标 / 配乐皆然），须可商用并留授权凭证。

包内**任何现成图片、截图、图标、成片、配乐都不是给你用的素材**——请别直接使用，也别在其基础上改。请尽量发挥你（和你所用模型）自己的美学。详见需求书 §3。

## 刻意没有包含

- `node_modules/`、`.git/`、构建产物（`out/`、`dist/`、`output/`）——可由 `npm ci` 重建。
- `docs/competitive-insights/`——内部调研材料，不外发。
- 任何旧成片、旧分镜脚本、配乐与素材包——本版风格与素材决策权完全交给承接方。

## 快速自检

```bash
npm ci --ignore-scripts   # 需 Node ≥ 20.18.1
npm run verify            # 静态校验，应全绿
npm test                  # 自动化测试
```

- `npm run verify` 在本包内应全绿。
- `npm test` 在本包内为 **129/131**：有 2 条用例依赖**本地 Git 历史**，本包为离线快照、刻意不含 `.git`，故这 2 条会失败——是打包方式所致，不是产品缺陷。需要 131/131 全绿可用官方仓库克隆：`git clone https://github.com/muzimu217/ui-design-agent-kit.git`。

产品是活的、可录屏的，这一点不受上面 2 条影响。
