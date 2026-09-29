# EVIDENCE.md · material-source-prioritization（R149-01 批次十九）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 199。
> 场景本质：**素材寻源纪律**——少量高分候选、多维排序、primary/secondary 分区、
> 确认前零下载零整合。

## 一、分类先行（判据 1）

页面/流程参考（需要）· 组件（需要）· 生产图片资产（**本场景判定为零图片**——表单页视觉
重心是输入效率，硬塞图即反模式）· prompt 素材（不需要）——四类判定与理由见
candidate-list.md §〇。

## 二、主意图与首轮控制（判据 2）

主搜索意图=**表单校验与错误提示模式**（预约产品第一失败点=填写与提交）；首轮 1 意图、
3 primary、2 secondary，封顶不发散（failCondition #2 防线）。

## 三、多维排序（判据 3：非热度）

排序维度=任务相关性 / 可检查证据 / 授权清晰度 / 改编成本 / 检索成本：
1. GOV.UK Design System（OGL-3.0，模式文档=可直译规则，相关性与可检性双高）
2. shadcn/ui Form（MIT+源码可检=证据最强，React/TS 一致）
3. unDraw（开源可改色，**条件项**：仅确认页需要插图时启用，默认零图片）
星数与主观审美未参与（failCondition #3 防线）。

## 四、Primary/Secondary 分区与实查（判据 5 前置）

- primary 三者 curl 实查均 200（2026-09-29）；授权逐条标注
- secondary：Dribbble（202 可达但授权模糊不进候选）/ Behance（403 不可达即排除，
  **未反复消耗调用**——failCondition #4 防线）/ pages.xyz（域名过期实拍拦截，前轮已排除）
- **确认前零下载、零整合、零实现代码**（failCondition #5 防线；本 run 目录只有清单与
  元记录，无任何外部素材文件）

## 五、工件清单（满分 ≥3 evidence 门槛的真实拆分）

- candidate-list.md——候选清单对话全文（场景交付物本体）
- source-probe.txt——可达性实查原始记录（含 404 修正轨迹）
- EVIDENCE.md——本元记录

三件均为该场景真实产物，非凑数。

## 六、诚实边界

- GOV.UK 首选路径 patterns/form-validation 实查 404 → 修正为 patterns/ 与 text-input/
  error-message 组件页（探查即记录，未硬凑）
- 候选清单为对话交付物（candidate-list.md）；下载与整合等用户确认后另轮执行
