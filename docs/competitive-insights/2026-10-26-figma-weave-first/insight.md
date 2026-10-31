# Figma 新线可达性专项（学习循环第一百一十一轮）——Lovable 连续拦截改道 + AI workflows 官方分组发现

- 日期：2026-10-26 ｜ 点档：10（开发线）｜ 检视级别：**attempted-failed-partial**（两页一手实看；Make/Weave 产品页本体因路由断链+链接无 href 未直达）
- 对象：Lovable 六检重试（被 Cloudflare 连续第二次拦截）→ 改道 Figma 新线可达性专项（108 轮遗留）
- 截图：lovable-home.png、figma-weave.png（本地留存，ADR-0002）

## 机制观察

1. **Lovable 拦截转入持续态**：8 秒等待后仍 "Just a moment..."（Ray ID 在册）——连续两次拦截，按 10-11→10-21 先例改为 **10 天节奏重试**（下次 ~11-05），不再每轮空试。
2. **Figma 新线系统性不可达（结构性，非偶发）**：/figmake/ 路由 404（108 轮）+ 本轮页脚 "Figma Weave" 链接**无 href**（文本带 NEW 徽标后缀，锚点非链接形态）——两次实测指向同一结论：**新线产品页在无登录层不可达**（登录墙后或 JS 路由），机器深检需要 Figma 登录态（本环境无账号=真实边界）。列为"待条件"（用户提供登录态则升级执行）。
3. **AI workflows 官方分组发现（本轮增量证据）**：404 页页脚的三分组结构——"Design and explore / Build and ship products / **AI workflows**"——Figma 官方把 agent/Make/Weave 归入独立"AI workflows"产品组。108 轮记录了产品线扩容，本轮补上**组织学证据**：AI 线不只是加产品，而是有了自己的分组编制（与 UI 设计/交付并列的第三编制）。
4. 第四层连续 37 轮无存活对标者。

## 判读

1. **可达性边界要如实入册而非反复撞墙**：Lovable（CF）与 Figma 新线（登录墙）是两类结构性障碍——前者按节奏重试，后者等条件。通道管理从"每轮硬试"进化为"分型管理"（102 轮三级校准的通道管理延伸）。
2. "AI workflows"独立编制=设计巨头的 AI 产品线有了组织承诺（产品分组是资源分配的宣言）——第四层邻居判读（106/108 轮）再获组织层佐证；kit 的"对齐后的证据"差异化持续。
3. Figma 新线的产品页本体（Weave 是什么/agent 能力）继续 needs_validation——矩阵与编制是可信证据，产品能力在登录墙后不猜。

## 不抄什么

无（可达性专项轮，无外观话术对象）。

## 借鉴→落地

- K2：增量 83=对象池分型注记（Lovable 10 天节奏重试/Figma 新线待登录态/Weave-Motion-Specs-Sites-Buzz 五线入池待条件——通道分型管理落地）。
- KPI4 第四十一条沿用+第四十二条沿用（本轮无新产物对照面，沿两条最近口径不变——增量为池管理非产物）。
- evals +2：figma-ai-workflows-org-unit / channel-typology-retry-cadence。
