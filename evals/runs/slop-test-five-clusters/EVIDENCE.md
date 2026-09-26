# EVIDENCE · slop-test-five-clusters（2026-09-26 执行）

门径：门A passed（docs/gates.md §六 2026-09-26 行）；**门B**：named proven
baseline 实机检视完成——source-catalog 在册条目 **Yamds Blog**（
https://blog.yamds.cafe，2026-09-26 Playwright 实测 + computed style 采样）：
奶油底 oklch(0.97 0.015 45) + LXGW WenKai/Cormorant 衬线 + 暖黑文字
oklch(0.25 0.025 45)、display 96px/500。**采的关系**：暖奶油基底与衬线
display 的字号/行高对比关系；visual-reference-only，未复制内容与字体文件。
DIRECTION 的 unverified 标记就此消除。

## 五类逐裁记录（detail-critique.md 五类校准，验收轮显式表态）

| # | Cluster | 判定 | 证据锚点 |
| --- | --- | --- | --- |
| 1 | 奶油底 + 衬线 drama + 赤陶 accent | **命中 = brief 要求** | brief 原文要求奶油底营销页+衬线标题+赤陶按钮；实测 body bg rgb(244,241,234)=#F4F1EA、h1 96px 衬线、CTA 赤陶族 #b85c3e。命中显式归因 brief 措辞，非静默默认 |
| 2 | 暗底 + 酸性 accent | clean | 无暗表面；accent 为暖赤陶族（非酸绿/朱红） |
| 3 | Broadsheet cosplay | clean | 组件带圆角（CTA 999px）；分节用单条 top rule 非满版 hairline；无报纸多栏文本网格 |
| 4 | SaaS 卡片套件 | clean | 无同半径卡片阵列（双栏文本区非卡片）；无 rgba(0,0,0,.1) 统一灰影；gradientUse=0 实测 |
| 5 | Template chrome | clean | eyebrowLike=0、dotChain=0、monoFonts=0（computed 扫描）；ink 为暖深棕 #2b2620 非 #0B0B0B；无箭头后缀按钮 |

一条 cluster-1 命中显式归因 brief；其余四类无未要求命中（无漏报误报）。

## P1 修复记录（对比度实测）

白字 / 赤陶 #D97757 实测 **3.12:1**——15px 按钮文字不属大字，AA（4.5）不过。
修复：CTA 底色改深赤陶 **#b85c3e（4.53:1 ✓）**、hover #a04a2c（5.98:1）；
色相族保持赤陶，brief 的"赤陶按钮"仍成立。修复后重截双视口截图。

## 对比度实测（修复后）

| 文字对 | 比率 | 结论 |
| --- | --- | --- |
| ink #2b2620 / cream #f4f1ea | 13.29:1 | AA ✓ |
| muted #6f6558 / cream | 5.06:1 | AA ✓ |
| white / CTA #b85c3e | 4.53:1 | AA ✓（原 #D97757=3.12 P1 已修） |

## 截图

- `evidence/five-cluster-desktop-1280.png` / `evidence/five-cluster-mobile-390.png`（CTA 修复后重截）
- 门B 实检对象：blog.yamds.cafe（URL+实测值在上，随时可复检）
