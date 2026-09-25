# 社区推文草稿（2026-09-25，供发布）

> 用途：agentUniverse 架构吸收版发布 + 测试招募。图文素材全部来自仓库
> main 分支已提交证据（evals/runs/ 真实验收截图），不新造图。
> 发布渠道建议：Linux Do（长文）/ 即刻（短版）。发布人：用户本人。

---

## 长文版（Linux Do / 论坛）

### 我们给 AI 设计智能体装上了"多智能体协作模式"，并向蚂蚁的框架偷了师

**TL;DR**：UI Design Agent Kit（UAK）——一套让 AI 编码智能体真正按设计
流程干活的指令集——刚完成一次架构升级：吸收了蚂蚁集团开源多智能体框架
agentUniverse 的四个机制，全套 71 项测试全绿，实测证据都在仓库里。现招募
首批测试用户。

**UAK 是什么**

现在的 AI 写 UI 很快，但跳过需求确认、跳过素材授权、自嗨式原创、成品
无法验收。UAK 是一个给 AI 智能体用的"设计流程军规"：六道门（方向稿→
素材→原型→契约→验收→留痕），每道门必须停下来等用户裁决；素材必须抄
被验证过的成品而非凭空模仿；每个验收发现必须带实测证据。它是纯提示词
工程，不装运行时、不要 API key。

**这次吸收了什么**

我们调研了 agentUniverse（antgroup/agentUniverse，蚂蚁开源，2.3k★），
把四个机制改造后装进 UAK：

1. **协同模式卡**——它的 PEER 模式（Plan/Execute/Express/Review，
   arXiv:2407.06985）和我们的门径链惊人地同构。现在 UAK 显式提供四张
   模式卡：PEE（单轮交付）、PEER（带验收循环，M/L 任务默认）、
   GRR（生成→反思→修正）、IS（执行+零上下文监督，用于委派子代理）。
2. **Reference 注册表**——学它"一切皆组件+代码配置分离"的思想，19 份
   参考文件全部登记（用途/加载时机/所属门/依赖），配套四方一致性测试，
   文档漂移从此测试说话。
3. **素材管线四层语言**——读取→加工→路由→后置处理，检索素材的每一步
   都知道自己在哪层，跳层即缺陷。
4. **prompt:refine 工具**——评测失败后，机械定位失效条目属于哪份指令
   文件，产出修订建议草稿；草稿只建议、不改指令，裁决权在人。

顺带把 chain-audit（门径机械审计）的违规输出升级成"违规+补法"：
不只告诉你缺门记录，还告诉你去哪个文件、按什么格式补。

**证据，不是口号**

- `npm test` 71/71 绿；`npm run eval -- --check` 台账校验通过
  （16/65 场景已真实执行——覆盖还很低，这正是招募测试者的原因）
- chain:audit 实测已交付工作区：六道门记录齐全，0 违规
- 一次真实全链交付（习惯打卡单页，桌面/移动/空态/降级动效全验收）：

![最终桌面验收](https://raw.githubusercontent.com/muzimu217/ui-design-agent-kit/main/evals/runs/p-habit-2/evidence/acc-10-final-desktop.png)

![移动端 44px 命中区](https://raw.githubusercontent.com/muzimu217/ui-design-agent-kit/main/evals/runs/p-habit-2/evidence/acc-11-mobile-44px-375.png)

![空态](https://raw.githubusercontent.com/muzimu217/ui-design-agent-kit/main/evals/runs/p-habit-2/evidence/acc-6-empty.png)

**招募测试**

如果你在用 Claude Code / ZCode / Codex 这类编码智能体，欢迎拿 UAK 试一次
真实 UI 任务，看它会不会真的停在门口等你裁决。参与方式见仓库 README，
反馈直接开 issue。

仓库：https://github.com/muzimu217/ui-design-agent-kit

---

## 短版（即刻 / 微博）

给 AI 编码智能体立规矩的实验更新：我们的 UI 设计智能体套件吸收了蚂蚁
开源 agentUniverse 的多智能体协作思想（PEER 模式，arXiv:2407.06985）——
方向、素材、原型、验收六道门，每道门停下来等用户裁决，验收发现必须带
实测证据。71 项测试全绿，真实交付截图在此 👇 现招首批测试用户，会停在
门口的 AI，值得你调教一次。
https://github.com/muzimu217/ui-design-agent-kit

（配图同上三张）
