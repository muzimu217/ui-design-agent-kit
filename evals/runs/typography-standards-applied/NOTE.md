# NOTE — typography-standards-applied 场景执行记录

> 场景：editorial 产品页（hero + lead + 两段正文 + 小数据表），无品牌字体；
> typography-standards 在册。执行日期 2026-09-30（轮 231）。

## 设计决策（对照判据）

| 决策 | 值 | 判据落点 |
| --- | --- | --- |
| identity 字体 | **Fraunces**（opsz 变量衬线，900）——有声线、非 Inter/Roboto/OpenSans/system-ui | 判据 1 |
| 双角色配对 | Fraunces 900（display）× Public Sans 400（body）——异族真对比，非同族两字重 | 判据 2 |
| 正文 measure | 62ch（实测 ≈76 字符 < 80） | 判据 3 |
| 字号跳跃 | 96px display / 17px body = **5.65x**（阶级行为，非 1.2x 微步） | 判据 4 |
| 表格数字 | tabular-nums（td.num/th.num 显式声明） | 判据 5a |
| 标题卫生 | 零 eyebrow 节点、h1 无 uppercase 变换、无孤立强调词 | 判据 5b |
| 对比度 | 正文 14.62:1（程序实算） | 附加 |

## 实机验证（Playwright 断言 ×7 全 PASS + 截图）

evidence/typo-verify.mjs：7 项 computed-style 断言全 PASS、console/pageerror 0、
全页截图 typography-full.png。首跑抓到 1 条真 FAIL——measure 断言方法错误
（computed 把 66ch 解析成像素）且 66ch 折算 ≈80 字符属擦边：CSS 收紧至 62ch +
断言改像素折算字数（avg 0.5em/char），复跑 76 字符 PASS。**断言方法错误也是
本轮真实整改**，留痕于 evidence（首跑输出被复跑覆盖前已记入本节）。

## 素材来源

Google Fonts（Fraunces / Public Sans，OFL 开源许可）；零手绘图形；表格样式
沿用仓库排版军规（tabular-nums + 状态色纪律）。

## styleReview 未评声明

排版专项场景的八维即本判据集（字阶/对比度/数字对齐等已逐项断言）——八维其余
维度（布局节奏/动效）未评，理由：单页无动效场景；已如实标注。
