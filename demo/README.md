# demo 合集 · 产品索引（Collection Manifest）

> 本目录是 kit 的交付证据集：每个子目录一个真实产品 demo，README 承载各自身份。
> 本索引只做盘点与导航，不重复各产品的功能声明——细节以各产品自己的 README 为准。
> 盘点日期：2026-09-30（轮 226，agent-owned 盘点矩阵见
> `evals/runs/product-readme-collection-completeness/`）；2026-10-09 新增 demand-insights。

## 状态图例

`live` = 已上 showcase 可在线访问 · `local` = 本地运行（未上线上站）

## 产品清单（12 个）

| 产品 | 状态 | 一句话身份 | 入口 |
| --- | --- | --- | --- |
| demand-insights | local | 需求信号面板：4 份开发者问卷的洞察仪表盘（n=4 形成性，非统计） | [README](demand-insights/README.md) |
| brick-workshop | live | 积木小工坊：3D 拼搭工作台（非承重模拟；作品存本机浏览器） | [README](brick-workshop/README.md) |
| inventory-console | live | 库存运营台：搜索/状态筛选/详情（演示库存，不连真实业务系统） | [README](inventory-console/README.md) |
| nodegrid | live | NODEGRID：3D 地球云节点分布（虚构云商，数据非实时） | [README](nodegrid/README.md) |
| subway-runner | live | 地铁疾行：跑酷小游戏 | [README](subway-runner/README.md) |
| forma-phone-ui | live | Forma 手机 UI 概念 | [README](forma-phone-ui/README.md) |
| tempo-day | live | Tempo Day 日程概念 | [README](tempo-day/README.md) |
| ruiear | live | 睿耳 RuiEar：AI 耳机概念落地页（占位品牌，示意价格参数） | [README](ruiear/README.md) |
| blog-demo | local | 博客 demo | [README](blog-demo/README.md) |
| phone-demo | local | 手机端 demo | [README](phone-demo/README.md) |
| product-demo | local | 曜时 X1 产品展示页 | [README](product-demo/README.md) |
| zhumu-blog | local | 竹与墨博客（墨竹背景/柔和换场） | [README](zhumu-blog/README.md) |

## 每个产品 README 携带的标准字段

`status`（live/local）· 身份与功能一句话 · 快速开始（真实命令）· **演示边界/限制**
（每家各自如实，不共用声明）· 截图溯源（统一登记于
[docs/readme-media.md](../docs/readme-media.md)）· 实现日志（ACCEPTANCE/DESIGN 等
链接文档，不在 README 内联长文）

## 盘点结论（2026-09-30 审计矩阵摘要）

- 11/11 均有 README 与 status 字段；无缺失入口（2026-10-09 新增 demand-insights 后为 12/12）
- README 引用的截图全部实存于各自产品目录（md5 对照无跨产品重复）
- nodegrid 无独立 .css 文件：样式在 React 组件内（构建通过，非缺失）
- 历史实现日志保留于各产品 ACCEPTANCE/DESIGN 链接文档，与当前验收分开
