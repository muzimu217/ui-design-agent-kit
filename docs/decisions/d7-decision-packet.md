# D7 裁决包（包 A/B/C，2026-09-21 整理）

> 依据账本 D2/D5 惯例：本包是一次性裁决载体，**每项仍需独立勾选，未选保持 open**。
> 勾选格式：`A1: 过 / 否 / 改（附改法）+ 日期`。来源：大师第 16 轮深度评审（在线仓库）。

## 包 A · 证据与发布完整性轮（约半天，最急——都影响线上公众可见面）

| # | 事项 | 说明与建议改法 | 状态 |
| --- | --- | --- | --- |
| A1 | **"曜石 X1" 命名混拼** | 线上站三名字并存：历史截图卡"曜石 X1" vs `demo/phone-demo`=曜石 12 Pro vs `demo/product-demo`=曜时 X1。建议：历史卡片统一加后缀"（历史截图）"，不改正案产品名；**需你定改法**。改源在 main 侧 showcase，须随 A4 上线 | **passed（2026-09-21）**：showcase/products/src/main.tsx obsidian 卡 name→"曜石 X1（历史截图）"，description 注明与现行 demo「曜石 12 Pro」为不同代产物；展示边界测试 9/9。随 A4 上线生效 |
| A2 | 六卡截图重截（D7①） | `showcase/evidence/` 仅 showcase-six-cards.png，PUBLIC_APPS 已 8 项；需起服务+浏览器实拍 8 卡版 | **passed（2026-09-21）**：`showcase/evidence/showcase-eight-cards.jpeg`（2560×15204 全页实拍，9 卡齐含 A1 改名卡）。根因笔记：build-pages 默认把资产烧成根相对路径 `/assets/*`，服务根必须指 `site/` 本身（父目录+符号链接都会 404/空白）；`--base "./"` 被规范化为 `/`，无需再用 |
| A3 | intro.mp4 过期数字 | 视频内测试计数 16/16，现 58/58；需 Remotion 改字幕重渲染 | **passed（2026-09-21）**：Scene4Numbers 计数器更新为 9 showcase 案例 / **58 测试全绿** / 6 确认门，Remotion 全量重渲 604/604 帧，`showcase/products/media/intro.mp4` 已替换（5.3MB，随 A4 上线生效）。旧图 six-cards.png 已改名 `-archived` 留档 |
| A4 | **线上站合回 main** | 页脚 SHA `aa38774` = main 的 09-17 快照；实验分支 20+ 笔整改（链路加固/漂移整改/P-habit-2 归档）对线上零影响。合并 main 会触发 Pages 自动部署；**须你明确授权合并** | **passed（2026-09-21）**：大师轮 25 确认"无阻塞，正式放行"后执行定向合并 `aa38774..0976476 main`（--no-ff，不夹带），Pages 工作流随即触发（run 35643944180）；线上站与页脚 SHA 将随部署更新 |

## 包 B · 知识密度轮（1-2 天）

| # | 事项 | 说明 | 状态 |
| --- | --- | --- | --- |
| B1 | 五类"AI 默认味"校准清单（D7②） | 替换 SKILL.md 一句话 slop test：奶油底+赤陶 accent、SaaS 卡片套件、眉标 chrome 等 | **passed（2026-09-23，工单 R050-02）** |
| B2 | 方向稿三旋钮（D7③） | DESIGN_VARIANCE 8 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4 式可记录档位 | **passed（2026-09-23，工单 R050-03）** |
| B3 | 规则密度扩容（D7④） | 对标 ui-ux-pro-max 192 条推理规则的知识层扩容 | **passed（2026-09-23，工单 R050-01 detail-constants 18 条军规（上游 19，末条并入），已 verified）** |
| B4 | ~~showcase 任务优先入口~~ | **搁置**（用户 2026-09-21 改向：先吸收 awesome-ui-design 素材入知识库+方法论拆解，页面方向暂缓） | 搁置 |
| B5 | ~~展示层门面工艺升级~~ | **搁置**（同上） | 搁置 |

## 包 C · 机制升级轮

| # | 事项 | 说明 | 状态 |
| --- | --- | --- | --- |
| C1 | 门C 多变体并排呈交（D7⑤） | 原型阶段 2-3 变体并排供裁决 | open |
| C2 | 发布前截图回归 + GATES↔账本一致性机检（D7⑦） | PUBLIC_APPS 发布前自动截图对比 | open |
| C3 | drift 守护变异冒烟自检（D7⑨） | dev-only 篡改副本跑断言预期失败；前置：测试注入根目录小重构 | open |

## 包外待决（已在账本 §五，不重复登记）

- 论文 P3（arXiv 分类）/ P5（背书人）：建议 arXiv 与 Zenodo 二选一定终线。

## 执行约定

- A 包整改落在 main 侧的部分，合并授权后一次性收口并自动部署；
- B/C 包按既有规矩走：新增行为必须配 eval 场景、三连全绿、留痕、推送实验分支。
