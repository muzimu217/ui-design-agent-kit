# 研究架构与首次人工测试整理计划

> **给执行者：** 文档整理完成后，按本计划逐项检查，不把研究规格误报为已实现平台。

**目标：** 在当前 `ui-design-agent-kit` 仓库内恢复完整 UAK 主架构与研究适配层的关系，归档现有文档/工具，并提供一份可直接交给首次测试者的中文测试指南。

**架构：** 保留 `.agents/skills`、`docs/chain-flow.md` 与现有门 A-F 作为产品工作流主架构；新增 `research/architecture.md` 作为总览，将 P1-P5 研究流程、C0/C1 实验条件、会话证据账本接到主架构上。研究层的 `platform-architecture.md` 仅约束实验记录，不替代 UAK 主流程，也不声称 runner 已实现。

**技术栈：** Markdown、现有 Node.js 校验脚本、现有 `scripts/workflow-diagram/` 文档图工具；本轮不添加运行时依赖、不写 P3 代码、不招募或生成虚假研究数据。

## 全局约束

- 当前仓库继续作为唯一工作区，不创建新远端仓库。
- 现有产品架构与门 A-F 不删除、不重命名；研究层作为适配层记录。
- 测试指南必须明确区分：研究流程试跑、P1 形成性访谈、未来 C0/C1 受控实验。
- 不把 `npm test` 或 `npm run verify` 解释为研究 runner 已通过。
- 未发生的访谈、录音、转写、参与者排期和 P1-Gate 不得填造。

---

### Task 1: 建立总架构与边界说明

**Files:**
- Create: `research/architecture.md`
- Modify: `research/platform-architecture.md`
- Modify: `research/README.md`

**Produces:** 一张可读的总架构图；说明 UAK 主架构、研究适配层、证据层和外部产品工作区的边界；明确当前哪些模块已存在、哪些只是规格、哪些尚未实现。

- [ ] 写出 UAK 主架构 → 研究适配层 → 证据账本的流程图。
- [ ] 将 C0/C1 定义为研究条件，不把它们写成新的产品主流程。
- [ ] 在研究入口登记总架构文档和当前实现状态。
- [ ] 在 `platform-architecture.md` 加入“研究适配层，不替代原架构”的关系说明。

### Task 2: 归档文档与工具

**Files:**
- Create: `research/tool-and-document-inventory.md`
- Modify: `research/README.md`

**Produces:** 单一归档索引，按“主架构、研究计划、P1 执行、研究仪器规格、验证工具、尚未实现”分类，避免测试者在根目录和历史文档中自行猜测入口。

- [ ] 为每项列出路径、用途、状态和是否属于首次测试入口。
- [ ] 标出 `npm test`、`npm run verify`、`scripts/workflow-diagram/` 的真实覆盖范围。
- [ ] 明确不存在的 runner、研究者控制台、参与者工作区不作为已完成资产。

### Task 3: 编写首次人工测试指南与记录模板

**Files:**
- Create: `research/formative/first-human-test-guide.md`
- Create: `research/formative/first-human-test-report-template.md`
- Modify: `research/formative/p1-execution-log.md`

**Produces:** 用户可以直接转发或照读的中文测试指南，以及每次测试的结果记录模板。

- [ ] 说明测试目的、参与者角色、时长、录音/录屏与匿名规则。
- [ ] 提供场前、场中、场后清单和明确文件命名。
- [ ] 将首测限定为 P1 访谈材料/研究流程试跑；不得声称是 C0/C1 runner 测试。
- [ ] 定义有效会话、阻断问题和回传包。

### Task 4: 运行文档与仓库验证

**Files:**
- No product code changes.
- Verify: created Markdown files and referenced paths.

- [ ] `git diff --check -- research docs/superpowers/plans`。
- [ ] 检查所有内部 Markdown 链接目标存在。
- [ ] `npm run verify`。
- [ ] `npm test`。
- [ ] 汇报研究平台尚未实现的部分，不把仓库测试结果升级为研究结论。
