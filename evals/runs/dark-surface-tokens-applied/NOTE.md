# NOTE — dark-surface-tokens-applied 场景执行记录

> 场景：既有指标仪表盘的暗色主题（基面/卡片/表格/一个强调按钮），dark 为默认基线；
> dark-surface-standards.md 在册。执行日期 2026-09-30（轮 234）。

## 设计决策（对照判据）

| 决策 | 值 | 判据落点 |
| --- | --- | --- |
| 表面亮度阶梯 | base #101418 → card #171d24 → raised #1d242c（实测亮度 0.0068<0.0119<0.0170，抬升=更亮，零阴影） | 判据 1 |
| 基面与描边 | tinted near-black #101418（非纯黑）；描边 rgba(255,255,255,0.08) 低不透明度白 | 判据 2 |
| 文字梯度 | primary #e8edf2（near-white 非纯白）/ secondary #a8b4bf / placeholder #6b7682 三档独立 | 判据 3 |
| 强调色重校准 | #3fbf8a（暗面重校准，实测亮度 > 浅色版 #177656——不照搬浅色 token） | 判据 4 |
| 双值 token | 每色 token 同时定义 light/dark 两值（:root[data-theme] 双块）；**组件规则零硬编码 hex**（stylesheet 扫描 0 命中，hex 仅存在于 token 定义块） | 判据 5 |

## 实机验证（Playwright 断言 ×8 全 PASS + 截图）

evidence/dark-verify.mjs：表面亮度阶梯程序实算、纯黑/纯白负路径、rgba 白描边模式、
三档文字独立集合断言、强调色亮度对照、**组件规则 hex 扫描（遍历 styleSheets 非
token 块 0 命中）**、正文对比度 15.70:1 程序实算、console 0、全页截图
dark-full.png。首跑 2 条断言自身缺陷（placeholder 需读 ::placeholder 伪元素、
页面内对比度实算需内联亮度函数）当场修复——断言脚本本身也要过运行关。

## styleReview 未评声明

暗色 token 专项场景：判据即暗面规则（本批逐项实机断言）；布局节奏等其余维度
未评，已如实标注。
