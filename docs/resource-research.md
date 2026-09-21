# awesome-ui-design 候选池研究（Resource Research）

> 大师轮 20 建议的溯源链补全：66 条上游策展数据的台账与分批入册账。
> 上游：chrichuang218/awesome-ui-design（MIT；数据文件 `src/resources.js`
> 带逐条 Linux.do 溯源 `sources` 字段；其数据整理日期 2026-08-31，非实时核验）。
> 本地提取件：`output/awesome-resources.js`（gitignored，可按上游重取）。
> 用途规则：候选 ≠ 入册；入 source-catalog 前逐条过
> `catalog-efficacy-before-add`（功效分析+使用场景+截图+镜像替代+双通道实测）。

## 全量台账（r1…r66，防静默缩水）

- inspiration ×18：r1 Godly、r2 Dribbble、r3 Landingfolio、r4 Awwwards、
  r5 Land-book、r6 SaaS Landing Page、r7 One Page Love、r8 Mobbin、
  r9 60fps.design、r10 Detail Design、r11 Best Website Gallery、
  r12 Landing Love、r13 SaaSpo、r14 Navbar Gallery、r15 CTA Gallery、
  r16 Spotted in Prod、r17 CodePen、r18 Reeoo（上游标注已停维护）
- tools ×11：r19 StyleKit、r20 Design Prompts、r21 UI Style Prompt、
  r22 UI Prompt Art、r23 GetDesign / DESIGN.md、r24 UI UX Pro Max、
  r25 Impeccable、r26 Google Stitch、r27 Variant、r28 Jitter、r29 Quiver AI
- assets ×10：r30 Lucide、r31 React Bits、r32 Vue Bits、r33 Coolors、
  r34 Color Hunt、r35 Google Fonts、r36 Iconfont、r37 Hugeicons、
  r38 Component Gallery、r39 图像工作台
- examples ×13：r40 Radar Laboratory、r41 Good Fella、r42 AVA SRG、
  r43 Nfinite Paper、r44 Follow Art、r45 Max Milkin、r46 Digilab、
  r47 Stefan Vitasović、r48 Bürocratik 18、r49 Shyi、r50 Yamds Blog、
  r51 Stripe、r52 daijinfeng.top
- skills ×14：r53 frontend-design（Anthropic）、r54 ui-ux-pro-max、
  r55 claude-design、r56 frontend-design-prompts、r57 impeccable、
  r58 design-taste-frontend（Taste Skill）、r59 high-end-visual-design、
  r60 Uncodixfy、r61 Hallmark、r62 web-design-guidelines（Vercel）、
  r63 Emil Kowalski Skills、r64 GSAP Official AI Skills、r65 stylekit、
  r66 app-shell-ui

## 与 source-catalog 重合（无需重复入册，约 14 条）

r2（Dribbble 类画廊已有替代）、r4 Awwwards、r5 Land-book、r7 One Page Love、
r12 Landing Love、r17 CodePen、r24 UI UX Pro Max（已装 skill）、
r25 Impeccable（已装 skill）、r26 Google Stitch（已有 stitch-mcp 参考）、
r30 Lucide、r31 React Bits（预清层，许可另核）、r33 Coolors、
r53/r54/r57/r58/r64（已内化或已装）

## 批次账

| 批次 | 范围 | 状态 |
| --- | --- | --- |
| 第一批（2026-09-21） | examples r40-r52 共 13 条 → source-catalog「案例样板批次」，双通道实测+13 张实拍 | **已入册**（commit 5f90009） |
| 第二批（待排期） | tools 提示词/风格类 r19-r23、r27-r29、r38-r39 约 10 条；入册前先双通道实测+逐条核许可 | 候选 |
| 第三批（待排期） | inspiration 补缺 r1、r3、r6、r8-r11、r13-r16、r37-r38 约 12 条 | 候选 |
| 不入册 | skills 类（已内化/已装/许可逐案核）；r18 已停维护 | 关闭 |

## 方法论吸收（挂 D7/B4 搁置注记）

"任务→3 步路线→可复制提示词"的导航范式与"逐条溯源 sources 字段"规范，
待页面方向重启时随 B4 一并裁决。
