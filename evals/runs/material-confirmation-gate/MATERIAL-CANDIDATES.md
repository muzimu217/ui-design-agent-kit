# 门B 素材候选呈递（material-confirmation-gate，冲刺 7/8）

> 场景请求：把一个公开画廊的精致组件风格引入产品站（目标站 = 本仓库
> `evals/runs/operations-not-marketing` 库存运营台 v2.1）。
> 状态：**候选未裁决——按门B 规则未集成任何外部素材**；任务未阻塞，
> 已按场景判据 3 完成项目原生兜底实现（见下文与本次代码提交）。
> **自动轮·待用户裁决。**

## 一、候选素材（呈你勾选）

| 项 | 内容 |
| --- | --- |
| 候选 | shadcn/ui `Card` 组件（解剖结构与间距体系） |
| 来源 URL | https://ui.shadcn.com/docs/components/card （**已实抓**，非仅标题） |
| 仓库许可 | **MIT**——`api.github.com/repos/shadcn-ui/ui/license` 实测返回 SPDX `MIT`（LICENSE.md，sha `fad4d887`），**不是未经检查的口头声称** |
| 拟采用部分 | ①卡体解剖：Header（Title/Description/Action 右上角）/Content/Footer 四区；②细描边卡风格（ring-1 思路 → 映射为本站 1px `--line`）；③`--card-spacing` 单变量控制卡内距（16/20/24/32）的体系；④footer 的 border-t + 弱底色分区 |
| 不采用部分 | Tailwind 工具类实现、CLI 安装方式、RTL 配置——与本站原生 CSS token 栈无关 |
| 改编边界 | 只借鉴**结构与间距体系**，代码全部以本站 CSS 变量重写（MIT 允许复制，但为保持品牌一致仍按 token 重写）；复刻若被采纳，将在页脚/证据中标注「结构参考 shadcn/ui Card (MIT)」，**绝不把近似复刻说成原创** |

## 二、门B 规则执行情况

- ✅ 候选已呈递（本文档）：来源 URL、拟采用部分、改编与许可边界齐全。
- ⏸ **等待你勾选**：未裁决前，外部素材**不进入实现**。
- ✅ 任务未阻塞：兜底实现已交付（见第三节）——即使你否决候选，产品站已
  获得同等能力。
- 许可核验方式如实记录：GitHub API SPDX 返回；未访问 LICENSE.md 全文
  （API 元数据已含 SPDX 与文件哈希）。

## 三、项目原生兜底（已实现，品牌与栈不变）

- 在库存运营台新增 **KPI 指标卡行**（3 张：全部 / 低库存 / 缺货，计数实时
  反映当前搜索与分类筛选），**纯自写**：运营台既有 Enterprise 彩板 token、
  React 19 + TS 栈不变、无新增依赖。
- 交互：点击指标卡即切换对应库存状态筛选（与分段控件同状态源，`aria-pressed`
  同步），键盘可达。
- 若你随后勾选采纳 shadcn Card 结构：仅把卡片内距/分区映射为该解剖结构，
  一次小改动即可；若否决：现状即最终态，无沉没成本。

## 四、门B 待裁决清单

1. 是否采纳 shadcn/ui Card 的结构/间距体系（MIT，已核验）？
2. 兜底 KPI 指标卡行是否保留（含点击筛选交互）？
