# 对标学习循环（Learn Loop）——学习→研究→开发→验证→对照→反馈

- 设立：2026-10-07 用户裁定 ｜ 适用：开发线每轮（无人值守与交互一致）
- 一句话：每轮向市场学一点真东西，改一点真东西，留一份可复核的证据。

## 循环六步（每轮至少完整走一遍小循环）

| 步 | 做什么 | 产出 |
| --- | --- | --- |
| ① 学习 | 选定本轮对标对象（外部产品/需求信号），轮换不重复 | 对象声明 |
| ② 研究 | 浏览器实看：机制、流程、用户吐槽/需求信号 | 截图 ≥1 张 + 笔记 |
| ③ 开发 | 提炼一条可执行改进并落地（代码/文档），或立卡说明暂缓原因 | diff 或卡号 |
| ④ 验证 | 改动过三连（verify/test），界面类改动浏览器实拍 | 三连绿 + 实拍 |
| ⑤ 对照 | 与对标机制逐点比对：抄什么/不抄什么/为什么 | 对照表（insight.md 内） |
| ⑥ 反馈 | 知识卡入 iteration-log；下轮研究对象预告 | 日志行 |

## 每轮 KPI（三条，缺一即轮次不合格）

- **K1 知识卡 ≥1**：对标对象、观察到的机制、可借鉴点、来源链接、检视级别如实标注（未实机深用只许标 unverified-partial，不得越级）。
- **K2 优化 ≥1**：落到本仓的 diff；确实不该落的，写明理由立卡（防"为改而改"）。
- **K3 证据归档 ≥1**：`docs/competitive-insights/<YYYY-MM-DD>-<对象>/` 目录：截图 + `insight.md`（含①-⑤步产物），路径入 iteration-log。

## 证据纪律

- 截图必须来自本轮真实浏览器访问（playwright/chrome-devtools），文件名含对象与页面；禁止拿记忆或搜索摘要充当"看过"。
- 对标是**学机制不是抄外观**：借鉴关系写清（如"借鉴其版本对比的并排布局，不抄其配色"）；外观借鉴走素材门。
- 竞品截图仅作内部研究证据，**不上 showcase、不外发**（版权克制）。

## 对象池（轮换起点，持续扩充）

v0.dev（Vercel）｜ bolt.new ｜ Lovable ｜ GitHub Copilot（原独立产品 Workspace 已被吸收为桌面端统一工作区，92 轮实测原 URL 404）｜ Figma Make ｜ ~~Motiff~~（全线关服，90 轮实测：导出窗口至 10-31）｜ 即时设计 AI ｜ B站 AI 编程吐槽向视频（需求信号）｜ YouTube 评测视频 ｜ GitHub awesome-*/trending（需求聚类）｜ cloudflare/security-audit-skill（审计 skill 新信号，89 轮深访）

第一 sweep 9 项已于 2026-10-07~08 完成首轮检视（v0/bolt/Lovable/Copilot/Figma Make/Motiff/GitHub trending/B 站信号/即时设计）。第二 sweep 候选（2026-10-08 第九轮追加）：Pixso ｜ MasterGo ｜ goflygen（B 站推广出现的国产 Agent 全栈框架，痛点真实方案存疑）｜ claude-mem 型跨会话记忆信号 ｜ Figma Make 季度更新复检。**进度：第二 sweep 5/5 已于 2026-10-09 全部收官**（Pixso/MasterGo/GoFlyGen/Figma Make 复检/claude-mem 深检；合计两 sweep 14 项）。国产三强格局图已收官（即时设计=插件型 AI/Pixso=生成前置型/MasterGo=Agent 代跑型，三卡互链）。**10-10 起转入自由轮换模式**：第一检=Base44（2026-10-10，即兴立题；西方分层图谱补全：v0 前端生成/Lovable 全栈生成/Base44 全栈预装+增长（Wix 旗下）/**kit 门控工作流=第四层验证纪律层**，前三层均未覆盖）；第二检=GitHub trending 三日增量复访（2026-10-10，新面孔 context-mode——上下文预算家族第五收敛者；复访粒度=3 天增量合适）；第三检=Onlook（2026-10-11，UI 专项锚定后首个对标：开源可视化编辑器，版本回滚收敛×4 + 品牌提取候选 + AGENTS.md 约定再收敛 + "agent 推荐榜"渠道叙事）；第四检=妙多关服公告页补拍复检（2026-10-11，首检 K3 降级修复：官方时间线实拍——05-13 通知→07-31 停服→11-01 数据永久删除，生存位立卡落地入 identity）；第五检=v0 复检（2026-10-11，9 天增量盯层间渗透：Agentic by default 上首屏+设计系统家族收敛×4+ChatGPT 计划互通，第四层仍无人占据）；第六检=bolt.new 复检（2026-10-11，"98% less errors—automatically tests"上首屏=第四层外围首次被触碰但为黑盒形态，立 D14；设计系统专题区确认家族×4）；第七检=B 站痛点新 sweep（2026-10-13，距上轮 5 天：「测试全绿=产品能用？」与五级证据逐字同构立 D15、自欺焦虑立 D16、D8 小白印证）；**Lovable 列待检池**（lovable.dev Cloudflare 人机验证 IAB 不过，2026-10-11 实测）——已清账（2026-10-21 第四次复试通过：检查子层 automatic scans + audit logs 再触碰仍黑盒，规模信任锚 60M 项目不跟，代码所有权叙事与 local-first 同阵营）；Google Stitch 列待检池（IAB 不走代理不可直达 Google 服务，2026-10-11 实测）；**学习循环降频为隔日粒度**（连续高强度后消化优先），存量复检（Figma Make 下次 2026-11）+ 新信号即兴接入（EigenFlux 网络信号可实时供料），无学习对象时轮次可转投 evals 语料/技能完善等"其余任务"；幸存者普查三弹（2026-10-23~24，90/91/94/95 轮）：Motiff 全线关服除名，即时设计/Pixso/MasterGo 三强复检存活——反锁定行为跨品牌收敛（互操作+历史版本/离线/私有化，MasterGo 另开放 MCP 双向写回=把 AI 编码工具变成分发入口），design.md 生成输入格式=design-as-contract 行业收敛信号，MasterGo=蓝湖系与幽澜妙多实体消歧钉死（95 轮页脚证据）；妙多实体闭环（96 轮一手验证）：miaoduo.com=已关停妙多本体（横幅逐字命中官方时间线+页脚 ICP 北京看云软件有限公司），"仍在投放"实为营销页定格第三例，MCP 通路生死对照（死者主张与 MasterGo 现役同款=通路不死产品死）。trending 复访第四次（97 轮，93 轮预注册复测点）：security-audit-skill #10/日增 +2874 全场最高="持续在位"第三次复测成立（排名与星速分开读）；上游本尊 impeccable 87.5k 爆款=选型确认+22 天漂移实测（checkedOn 刷新与 re-vendor 分离：前者新鲜度维护、后者待批次裁决）。v0 复检第三次（98 轮，隔 14 天）：标题实拍"Build Full-Stack Web Apps with AI"=定位扩张完成时点，模板市场占首屏主体（like 热度分发 vs 证据分发分野），第四层连续 28 轮无对标者。bolt.new 复检第三次（99 轮，隔 14 天）：D14 'automatically tests' 原句存续 14 天仍无口径（免验证营销=稳态非疏忽），Agent 按订阅分档（Standard/Max 自报矩阵）=agent 能力成为可定价物，第四层连续 29 轮无对标者。Onlook 复检第四次（100 轮，隔 6 天）：主标语实拍 'free, local-first editor'=local-first 升格为竞品定位词——生存位判断三段证据链闭环（90 轮死亡案例推出→幸存者收敛→竞品定位采纳）。B 站 sweep 第八次（101 轮，隔 12 天）：171.7 万播放'一键生成原型'=百万级需求体量，'UI UX Pro Max Skill'进 B 站标题=skill 生态大众化（97 轮 trending 侧跨平台互证）；检索词与供给错位如实记录（痛点诉说在评论区层，下次 sweep 校准入口）。翻车词系 sweep（103 轮，三级校准收官）：'驯服 AI'37.3 万+'降低 AI 浓度'33.3 万=通道二次验证，平台治理痛点（生成可检测性→限流→去 AI 味）首次记录为纯生成路线的结构性成本。评论区层校准 sweep（102 轮）：机采样两策略 0 命中（shadow DOM 懒加载+无头门禁）=attempted-failed-partial 首用，通道三级校准定型（标题层测流量/翻车词系测痛点/评论区人工目验）；'灵光'首位搜索结果即'有多离谱'翻车视频=翻车词系方向获证。YouTube 首检（104 轮，对象池补白）：DESIGN.md 三源定型（95 MasterGo+97 hallmark+104 英文区内容），英文区'品质反思先于生成能力'时序特征。GoFlyGen 复检（105 轮，隔 17 天）：存活 v3.0.0+三大主张逐字存续——同题不同层互补印证复验（框架层约束 AI 代码 vs 指令层约束工作流），双层案例配对入论文叙事库。Base44 复检（106 轮，Lovable 被 CF 拦截后按纪律改道）：'AI shows previews before it touches anything'=第四层外围最接近的触碰（机制级预对齐 vs 此前四次黑盒宣称）——第四层判读更新为'空位+首个机制级邻居'，差异化句式更新为 they stop at preview, we continue to receipts。claude-mem 复检（107 轮，隔 17 天）：103k★ 高热持续+17 轮立卡触发条件达成（references 61>40）——立卡=带条件的承诺，索引层当日落地（第一层；二三 层按实际痛点再启）。Figma Make 季度复检（108 轮，窗口提前 5 天有判读依赖注明）：/figmake/ 路由 404 实录+404 页页脚一手矩阵——Weave/Motion/Specs/Sites/Buzz 五新线+'Figma agent'独立产品=巨头产品化（第四层外围烈度再升级）。Motiff/miaoduo 导出窗口终局前笔录（109 轮，窗口前 5 天）：双域横幅逐字一致于 90/96 轮记录、定格营销 26 天、四笔时点双域背书=死亡时间线完整性纪律；11-01 后关窗终验已排程（如期删除=判读最终一笔/延期=窗口承诺失信同样入册）。即时设计四检（110 轮，隔 3 天）：反锁定三件套逐字存续（出得去=导出 Sketch 实体动作）+AI 退潮复验——三强 AI 密度光谱定型（即时设计零 AI—Pixso 从属—MasterGo 四能力+MCP），kit='AI 主体+门控缰绳'第四态。Figma 新线可达性专项+Lovable 六检（111 轮）：Lovable CF 拦截转持续态（10 天节奏重试入池注记）、Figma 新线登录墙=结构性不可达（Weave 链接无 href，待登录态条件）——通道分型管理落地；404 页再挖出 'AI workflows' 官方分组（AI 线独立编制=组织层佐证）。Coze 首检（112 轮，池扩充）：代跑叙事极端形态（工作交给扣子/AI 同事编制/真机执行边界/1 亿 agent 在岗）——代跑光谱两极闭合（Coze↔kit），信任锚形态学四型定型（企业墙—星数—agent 数—回执，kit 独一份回执锚）。trending 48h 复访（113 轮）：audit-skill 完整生命周期首次全程观测（首见→峰值→跌出 ≈1 周，衰减≠失败）——判读三阶段演进后改三段记录法；hallmark 登顶 #1+impeccable #6=设计 skill 品类头部化。Pixso 四检（114 轮，线路恢复）：'配置 MCP'一级入口（94 轮无）=MCP 化扩散 2 天/家——**AI 密度光谱修正为动态面板**（110 轮'定型'撤回，每检必重测）；供给端标配化不改消费端门禁。即时设计 MCP 核查（115 轮，光谱第三点）：首屏 MCP 零提及（AI mentions 0→11）——三强光谱 2/3 明示补全，三强全部向 AI 移动（连续第三例移动=定态判读寿命以天计，盯守节奏由对象速度决定）。即时设计 MCP 第二读数（116 轮，隔 31h）：MCP 0/AI 11 与首次完全一致=稳定零确认（✗ 升级为已确认），观察点降为随检。NVIDIA SkillSpector 首检（117 轮，113 轮留观执行）：skill 安全扫描器（71 漏洞模式/安全基率 26.1% 含漏洞 5.2% 恶意/Verified Skills 签名管线/Pi extension）——第四层外围巨头安全形态（安装侧门禁），用其扫描 kit 技能库已立卡待用户裁决（引入依赖属环境变更）。NVIDIA skills catalog 输出端未公开可达（118 轮 ×3 如实记录）→按降频条款转投 usage.md 命令示例全量核验（5 命令+uak-init 6/6 零缺陷，零缺陷记录与 reg-007 从未检查类显式区分）。SkillSpector Pi extension 深看（119 轮）：确认边界设计与 kit 门控第四次同构（外部需确认/不可确认即拒绝/别名透明化/symlink 拒绝/YARA include 禁用）——四族收敛=时代常识而非单项发明，kit 独特性在组合成完整工作流；PI-Desktop 增强候选入待裁决清单。OpenCode extension 对照（120 轮，同构收敛第五例）：能力清单制（调用前声明五类能力，拒绝则子进程不启动=least-privilege invocation）+凭据永不进权限请求（输出自动脱敏）——**确认粒度光谱发现**：方向收敛（fail-closed）粒度按宿主适配（kit 阶段级最细/Pi 逐项/OpenCode 调用级）；kit 六道门本质也是能力清单制（声明-审批-拒绝，粒度到工作流阶段）。SUPPRESSION.md 对照（121 轮，同构深化）：抑制三原则（逐条 reason/SARIF 保留标记/重扫只浮新增）+部分覆盖不洗白（incomplete 状态保留=reg-007 类同纪律）+自指排除（=reg-002 的他人解法，跨团队双解法互证）+写路径 fail-closed 颗粒度远细于 kit（不照搬备引）。thinkrail 首检（123 轮，113 轮留观执行，48h 星数翻倍+）：JetBrains 基于 pi 的 agentic IDE（thin host 跑 pi in-process/pi 包 npm 分发/读 ~/.pi/agent）=pi 生态商业级样板；spec-first 同笔更新与 kit 演进同步纪律完全同构（SPEC.md 随模块+边界契约决策同笔更新规格）——演进同步纪律第五次跨团队互证（最强：大厂产品哲学级）；MCP 确认边界第六例（repo 定义 server 默认关闭待批准）；诚实纪律产品化（never assembles prompts behind your back）。 进度：第二 sweep 已检 2/5（Pixso 10-08、MasterGo 10-09，国产三强格局图补完：即时设计=插件型 AI/Pixso=生成前置型/MasterGo=Agent 代跑型，三卡互链）。

## 版本记录

- v1（2026-10-07）：用户裁定设立；六步循环 + 三 KPI + 证据纪律 + 对象池。
