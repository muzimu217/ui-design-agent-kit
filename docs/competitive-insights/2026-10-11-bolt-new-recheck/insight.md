# 对标洞察：bolt.new（StackBlitz）复检——第二十三轮学习循环（首检 2026-10-07 后 11 天）

- 日期：2026-10-11 ｜ 检视级别：**unverified-partial**（公开落地页实拍 2 图；未注册实跑生成）
- 证据：`landing-hero-2026-10-11.png`（首屏：Plan 按钮/Slides New/Figma-GitHub-Team template 起点）、`auto-test-model-routing-2026-10-11.png`（"98% less errors"+设计系统专题区同框）
- 本轮原计划 Lovable 复检，被 Cloudflare 人机验证拦死（IAB 无法过验，curl 403，如实记录列待检池）——改道同横评组 bolt.new。
- 复检动机：16 点档 v0 复检发现层间熔合加速；bolt 是「前置控制」代表（首检发现 design system 前置选择+Plan 开关+质量/成本显式档位），看它 11 天的动作。

## ① 11 天增量（相对首检）

1. **"98% less errors" 上首屏**："Bolt automatically tests, refactors, and iterates reducing errors"——**生成平台首次把「自动测试-自修复」做成第一屏承诺**。验证环节被平台商品化为"自动兜底"，但形态是 agent 内部黑盒：无人工门、无证据产物、无失败留痕——与第四层"可审计"是两种回答。
2. **"Build with your design system" 专题区**："Stop building from scratch. Start building on-brand."——首检发现的"Select design system"前置按钮已升级为独立营销区，设计系统前置家族收敛×4 中 bolt 的立卡源头地位复检确认。
3. **自动模型路由**："The best model, every time — automatically routes to the right model for each task, balancing quality and cost"，Agent Standard/Max 双档位（Speed/Intelligence/Token cost 显式表）——首检的手动档位选择器演化为自动路由+档位并存。
4. **上下文管理**："Build big without breaking — projects 1,000 times larger"——上下文预算家族再添一家（第六收敛者）。
5. **产物类型扩张**：Website/**Slides(New)**/App/Prototype 四类型+Figma/GitHub/Team template 起点——交付面向"非网页制品"（幻灯片）扩张。

## ② 机制研判

- **第四层外围首次被触碰**：v0 的"Agentic plans"（16 点档）+ bolt 的"自动测试自修复"（本轮）说明生成平台正把**计划**与**测试**都吸收为 agent 内部环节——但两家的形态都是"自动化替代人看"，不是"证据交给人审"。第四层的核心资产（人工确认门+五级证据+失败留痕）仍无人做，但**差异化窗口在收窄**：下一次复检要盯"生成平台是否开始出验收报告类产物"。
- 设计系统前置从按钮变专题区=家族收敛强度再确认；Plan 开关持续在位=前置控制叙事稳定。
- 三家横评更新（v0/bolt/Lovable）：v0 熔合最快（计划+设计系统+设计模式）、bolt 最贴近验证叙事（自动测试）、Lovable 待复检。

## ③ 可借鉴 / ④ 不抄

- 借鉴："98% less errors"的**量化收益表述**——我们的验收叙事（六维/对比度实测）也可给出量化口径（表述借鉴，数字必须自有实测，不借他家）。
- 不抄：黑盒自动兜底叙事（正相反，我们卖"过程可见+人可否决"）；Slides 等产物类型扩张（超 UI 范围）；模型路由（无模型服务）。

## ⑤ 对照表（增量）

| 维度 | bolt（2026-10-11） | 本 kit | 判定 |
| --- | --- | --- | --- |
| 验证 | 自动测试-自修复（98% less errors，黑盒） | 六道门+五级证据+失败留痕（白盒） | 同一问题两种回答；可审计性仍我独有 |
| 设计系统 | 前置选择按钮→专题区 | 门 B 素材确认+designContract | 家族收敛×4 确认；我们带授权边界 |
| 上下文 | 1000x 内建管理 | SKILL 警戒线/渐进加载 | 家族第六收敛者 |
| 产物 | 网站/幻灯片/App/原型 | 界面+验收证据+产品 README | 我们多"证据"这一交付物 |
