# SkillSpector OpenCode extension 对照（学习循环第一百二十轮）——能力清单制与同构收敛第五例

- 日期：2026-10-27 ｜ 点档：10（开发线）｜ 检视级别：**verified-partial**（docs/OPENCODE_EXTENSION.md 一手全文实读；未安装运行）
- 对象：NVIDIA/SkillSpector OpenCode extension（119 轮 Pi extension 的姊妹文档对照——验证确认边界是否同款）
- 截图：本轮为 raw 文档实读（无页面截图必要）

## 机制观察

1. **能力清单制（capability request，比 Pi 版更精细的边界）**：调用 CLI 前，工具先向 OpenCode 请求本次调用的**全部能力清单**——"target reads (and remote fetches), report writes, external paths, and the CLI subprocess"——**A denied request stops the invocation before the subprocess starts**（拒绝则子进程根本不启动）。Pi 版是逐项确认；OpenCode 版是**least-privilege invocation**（最小权限调用声明制）。
2. **凭据永不进权限请求**：LLM 语义分析需配置 provider，但"never puts credentials in a permission request"，模型可见输出有界并**自动脱敏 provider 凭据值与名称**——凭据与权限请求分离。
3. **仪器自测纪律**：纯工具助手放无依赖 `.ts` 文件、stdlib `node --test` 覆盖（"zero new dependencies"）——负自测家族的第 N 例（117/119 轮后持续）。
4. 时限同款（静态 120s/LLM 630s，配置不放大、会话取消即停）；差异点：OpenCode 版无 provider/model/yaraRulesDir 参数（LLM 配置走环境）。

## 判读

1. **同构收敛第五例 + 粒度光谱发现**：确认边界的收敛第五次确认（kit 六道门/Pi 逐项确认/OpenCode 能力清单/…），且新增**粒度维度**：kit=六道门+素材门+验收门分级（最细）、Pi=逐项确认、OpenCode=调用级能力清单——**边界设计收敛于方向（fail-closed），粒度按宿主能力适配**。第四层光谱的三子方向（对齐预览/质量回执/安装安全）之外，"确认粒度适配"成为新的观察维度候选。
2. **凭据-权限分离**：OpenCode 版"权限请求不含凭据、输出自动脱敏"是 kit 未显式处理的子问题（kit 无凭据场景所以天然免疫，但若未来接入需扫描鉴权目标的仪器，此设计先例可引）。
3. 能力清单制与 kit 六道门的映射：kit 的六道门本质也是"能力清单制"——门 A 方向稿声明范围（做/不做）、素材门声明素材、验收门声明证据——**声明-审批-拒绝**三段与 OpenCode 的 capability request 完全同构，只是 kit 的粒度到"工作流阶段"而 OpenCode 到"单次调用"。

## 不抄什么

OpenCode 目录拷贝式安装（kit 技能分发走 sources.lock 钉版）。

## 借鉴→落地

- K2：增量 91=对照记录入册（本文档）+ learn-loop 光谱注记（确认粒度维度新增）。
- KPI4：沿第四十四条口径（对照轮无新产物对照面）。
- evals +2：opencode-capability-request-least-privilege / confirmation-granularity-spectrum。
