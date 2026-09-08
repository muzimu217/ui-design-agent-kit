# Plan and Execute Modes

Use two explicit modes for a substantial UI task. The mode is a workflow state,
not a second model or a permission to bypass confirmation gates.

## Plan Mode

Plan Mode is consultative and non-destructive. It asks only the questions that
materially change the result, searches a bounded set of references, and keeps
the user at each decision point. It may inspect files and public references, but
it does not write implementation code, download unapproved assets, start a dev
server, or claim that a prototype was generated.

The plan record must freeze:

- mission, audience, primary journey, scope, and non-goals;
- target stack, constraints, content reality, and abnormal states;
- selected reference/component/asset candidates with URLs, evidence, rights
  status, proposed parts, and adaptation boundaries;
- visual direction, information structure, token sketch, motion intent, and
  prototype brief;
- implementation sequence and acceptance checks, including the first prototype
  viewport and the user decision it needs.

For a plain-language intake, compile this record into the development prompt
below. It is a view of the same plan revision, not a separately approved plan.
Unanswered business decisions and unselected candidates stay explicitly pending;
drafting a prompt does not lock the plan or authorize generation.

Before lock, the agent shows unresolved assumptions and a small decision list.
The user locks the plan with an explicit confirmation such as “确认计划” or
“按计划执行”. A lock has an id or revision and an approval record. Silence,
“看起来可以”, or an old approval from a changed scope does not lock a plan.

## Execute Mode

Execute Mode begins only after a locked plan and an explicit execution request.
The first action for a new substantial UI is to generate the first no-code
prototype from the frozen prototype brief, using the selected material or the
documented image-generation fallback. The result stops at the prototype gate so
the user can accept, reject, or request a bounded revision.

After the prototype gate passes, execute the contract and implementation steps
allowed by the locked plan. Keep the existing MCP, license, browser, and
acceptance gates. “One-click execute” means start this authorized sequence; it
does not auto-approve a direction, material, prototype, contract, or finished UI.

## State transitions

```text
PLAN_DRAFT
  -> PLAN_NEEDS_INPUT      missing decision or unresolved assumption
  -> PLAN_LOCKED           explicit user confirmation + revision record
  -> EXECUTE_REQUESTED     explicit user request to execute that revision
  -> PROTOTYPE_READY       first no-code prototype generated from the plan
  -> PROTOTYPE_REVIEW      user gate C: accept / revise / reject
  -> CONTRACT_READY        contract confirmed when applicable
  -> IMPLEMENTATION        scoped code work
  -> ACCEPTANCE_ROUND      browser evidence and user-selected repairs
```

If the user changes the brand, selected material, scope, prototype brief, or
contract after lock, mark the plan stale and return to the first affected plan
decision. Do not silently execute an old plan. If only an implementation defect
changes, keep the plan locked and use the narrow repair path.

## Required handoff record

```text
Plan revision: P-<id>
Status: draft | locked | stale | executing | stopped
User confirmation: exact message + timestamp
Execution request: exact message + timestamp
First prototype: path/URL or explicit fallback prompt
Blocked gate: C / D / E, if any
Plan change reason: scope/material/contract/evidence or none
```

The record makes a plan resumable and prevents a generated image, a tool
connection, or a prior conversation from being mistaken for user approval.

## Initial request template

Offer this fillable starter when requested or when the user needs help starting.
Otherwise extract the same information from their ordinary message. Optional
fields may be left blank. The conversation workflow is owned by SKILL.md; this
is its user-facing input template, not another system prompt.

```text
请作为能调用联网工具的 AI，帮我把日常表达整理成可执行的开发提示词。
使用当前环境实际可用的检索和浏览器工具；缺少能力时说明，不虚构结果。

我的原话：
【我想解决什么问题，现在怎么做，希望变成什么样】

使用的人和场景（选填）：
【谁会使用，什么时候使用，电脑还是手机】

已有项目或资料（选填）：
【项目路径、现有网址、已有功能或资料；不要填写账号密码或私密业务数据】

喜欢的参考（选填，没有就由 AI 查找）：
【具体页面、截图或录屏，以及喜欢其中哪一点】

必须保留或不能做的事（选填）：
【已有风格、第一版范围、时间预算、不能改动的部分】

这次希望推进到哪里（选填，默认先整理方案和提示词）：
【整理需求 / 联网调研 / 生成完整开发提示词 / 执行已确认的计划编号】

先总结我的需求与假设，只追问会改变结果的关键问题。
由你主动查找具体参考和素材，说明解决什么问题、用在哪里及授权状态。
展示完整开发提示词和待确认项；仅编写提示词不代表允许直接生成或开发。
```

## Development prompt template

Populate this in the user's language, without leaving unexplained placeholders.
Use `不适用` with a reason for irrelevant sections and `待确认` for unknowns.
Retain the user's exact constraints; do not turn a suggested feature into an
approved requirement. This template can be handed to another network-capable
AI, but actual tools, files, access, and authorization must be checked there.

```text
任务与范围
计划编号/修订：【沿用当前 plan revision】
本次任务类型与允许阶段：【内部工具/用户应用/官网；仅方案或已授权的下一阶段】
原始需求摘要：【保留用户意图，不添加未请求的功能】
使用者、场景与成功标准：【谁在什么情况下完成什么事】
首版必须完成：【功能范围】
明确不做：【边界】

页面与业务
核心流程：【入口 -> 操作 -> 结果；取消、返回和失败后的处理】
页面与组件：【每页服务的任务；必要的数据字段与校验】
角色与数据权限：【已确认规则；未知项待确认】
关键状态：【与任务相关的加载、空、失败、成功、禁用与权限不足状态】
数据与集成：【真实数据/API/持久化依赖；哪些仅为演示，不能声称已接通】

参考与素材
已选清单：【具体 URL/本地路径、证据、授权状态、采用位置、改编边界】
参考拆解：【可观察的布局、层级、交互与响应式关系；推测单独标注】
待选或不可用项：【未获选择/授权或访问失败；替代方案；不进入实现】
素材不足时：【使用实际可用的联网工具继续核查，提交新增候选供确认】

实现与验收
现有项目与技术约束：【沿用已检查的栈、组件、设计系统和资产】
视觉与交互方向：【已确认方向及适用的动效/减少动效约束】
实施顺序：【与当前授权阶段一致，不跨过原型或契约确认】
验收方法：【主流程、异常状态、必要的权限/数据检查；桌面、手机、键盘等适用检查】
交付物：【提示词、原型或代码的实际范围；可运行产品的 README、真实截图、运行方法与测试证据】

确认与执行
当前假设和待确认项：【关键选择及影响】
用户确认与执行请求：【沿用同一计划的原消息记录；缺失写未授权】
下一步允许做什么：【只推进当前已授权阶段；提示词不是自动执行许可】
```
