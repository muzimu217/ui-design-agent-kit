# Lovable 复试·第四次（学习循环第八十七轮）

- 日期：2026-10-21 ｜ 点档：20（开发线）｜ 检视级别：**verified-partial**（首屏+客户故事区实看；未登录实测生成流）
- 对象：lovable.dev（2026-10-11 复试被 Cloudflare 人机验证拦截列待检池，隔 10 天重试）
- 截图：lovable-home.png（本地留存，ADR-0002）

## 复试结果与十日观察

1. **人机验证解除，待检池清账**：今日正常加载（10-11 IAB 被拦）。learn-loop 对象池的 Lovable 待检条目就此结案。
2. **检查子层再触碰（本轮最重要）**："Safe and secure, as standard——Meet security and compliance requirements with **automatic scans and audit logs**"——与 bolt 的"automatically tests"（六检）同占检查子层。但仍是黑盒：无扫描样例、无审计日志格式、无浏览器实测证据可查。**第四层主位连续 21 轮无对标者**。
3. **规模信任锚**：New projects 1.2M/周、Projects built 60M、Monthly visits to Lovable-built projects 900M——以体量做信任锚。本仓口径不变：百级星不伪造规模感，证据密度代替体量叙事。
4. **范围扩到"整个公司"**："Bring a new product, internal tool, or **entire company** to life" + 200+ 国支付/税务合规——从 app 工具滑向全业务平台。
5. **代码所有权叙事**："Your code and data stay yours. Always."——与 Onlook 的 local-first（82 轮）相向而行；本仓离线导出包+全仓可重建是同一阵营的更彻底形态。
6. 品牌墙：Adidas/Asana/ElevenLabs/Zendesk/Workday/Nvidia（企业信任路径）。

## 判读

1. **检查子层被两家分占、主位仍空置**：扫描+日志是"质检的原料"（日志），不是"质检的判定"（回执+谁签字+不合格怎么办）——本仓"证据链+强制门+浏览器实测"的第四层主位继续独占，且 Lovable 的进入方式（合规叙事）与本仓（验收叙事）不同层。
2. **平台间叙事分化**：bolt 卖模型智力分层（86 轮）、Lovable 卖规模+全业务托管、Onlook 卖 local-first——三家都没有卖"可复核交付"。本仓定位在市场分化中继续被衬托。
3. **不抄**：规模数字不跟（无可复核口径的体量是营销）；"Holy shit"式客户证言不跟（本仓用可重跑证据说话）。

## 借鉴→落地

- 借鉴：代码所有权句式（"Your code and data stay yours"）可佐证本仓"离线复核包"叙事——已立卡（export 对账已有），无需新代码。
- K2：增量 59=60s 音效打点表（把已有契约补齐第二时长的音效层，继续纵向加证据）；learn-loop.md 对象池进度更新（Lovable 清账）。
- KPI4 第十九条：本仓证据链页（canvas workbench 反例墙+守卫回执）vs Lovable 安全合规板块——同为"质量声称"：us 6/6（check 回执）vs them 1/1（板块可读；扫描样例/日志格式不可观测记 null）。
