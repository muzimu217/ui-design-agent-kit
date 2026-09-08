# UI Design Agent Kit

<p><img src="showcase/products/public/favicon.svg" alt="UI Design Agent Kit 图标" width="64" height="64" /></p>

从口语需求到可运行界面的一套 AI 工作流：整理需求、查找素材、确认设计、实现交互，再用真实浏览器检查结果。

[快速开始](#快速开始) · [产品案例](#产品案例) · [使用说明](docs/usage.md) · [交付标准](.agents/skills/ui-design-agent/references/product-readme.md)

![UI Design Agent Kit 工作流与产品案例展示站的真实桌面截图](showcase/products/screenshots/readme-desktop.webp)

> 项目级智能体工具包，不是独立 AI 客户端，也不是应用脚手架。上图为成果展示站；案例和测试结果各有范围，不代表所有生成任务都已通过验收。[截图记录](docs/readme-media.md)

README 的信息层级参考 [PI-Desktop 的 README](https://github.com/vastsa/PI-Desktop/blob/main/README.zh-CN.md)：先说明产品身份和入口，再给真实界面证据、能力、运行方法、限制与验证记录；不复制它的品牌、文案或许可声明。

## 能做什么

| 从哪里开始 | 工作流会交付什么 |
| --- | --- |
| 一段日常描述 | 需求摘要、第一版范围、关键问题和完整开发提示词 |
| 缺少界面或素材方向 | 实际检索的参考、具体用途、来源证据与授权边界 |
| 已确认的产品方案 | 沿用现有项目的布局、状态、交互和适用动效 |
| 需要 3D 或视频 | 分别路由到实时 3D 或 Remotion 视频流程 |
| 需要检查与交付 | 浏览器证据、已知问题和产品 README，而非只有代码 |

关键决策由用户确认。主工具包不提供模型服务、账户、付费素材或后台业务接口。

## 快速开始

需要 Node.js 20.18.1+、npm，以及能读取项目指令和技能的 AI 宿主。
在仓库根目录运行：

```bash
npm ci --ignore-scripts
npm run verify
npm test
```

然后在此项目的 AI 对话中描述任务：

```text
$ui-design-agent 我想把采购申请集中起来，看谁还没处理。先整理第一版需求，由你联网找参考，再给我完整开发提示词，先不要开发。
```

不知道如何开头时使用[可填写模板](.agents/skills/ui-design-agent/references/plan-execute.md#initial-request-template)。联网、浏览器和生图能力取决于当前宿主的实际工具，不因安装指令而自动获得。

## 产品案例

各产品 README 包含自己的界面、运行方法和边界，独立于 Agent 运行时。

| 产品 | 类型 | 文档 |
| --- | --- | --- |
| 库存运营台 | 库存列表与详情，演示数据 | [查看](demo/inventory-console/README.md) |
| Tempo 今日节奏 | 本机任务管理与专注计时 | [查看](demo/tempo-day/README.md) |
| 积木小工坊 | 3D 自由拼搭与小挑战 | [查看](demo/brick-workshop/README.md) |
| NODEGRID | 虚构云节点网络可视化 | [查看](demo/nodegrid/README.md) |
| 地铁跑酷（展厅名：地铁疾行） | 三车道 3D 跑酷 | [查看](demo/subway-runner/README.md) |
| FORMA One | 虚构手机配置与购买路径演示 | [查看](demo/forma-phone-ui/README.md) |
| 曜石 12 Pro | 双机型配置与意向清单演示 | [查看](demo/phone-demo/README.md) |
| 曜时 X1 | 虚构智能腕表展示 | [查看](demo/product-demo/README.md) |
| 一舟札记 | 虚构作者与文章阅读演示 | [查看](demo/blog-demo/README.md) |
| 竹与墨 | 水墨风技术博客演示 | [查看](demo/zhumu-blog/README.md) |
| AURELIS M2 | 早期腕表材质与表盘概念 | [查看](showcase/README.md) |
| 工作流成果展厅 | 工作流与案例入口 | [查看](showcase/products/README.md) |

生成的产品默认放在仓库外的独立工作区，这些 demo 是已明确收录的案例。根目录不导入产品运行代码。[架构边界](docs/architecture.md) · [展示站配置与历史记录](docs/product-showcase.md)

## 提示词入口

- [主提示词](.agents/skills/ui-design-agent/SKILL.md)：角色、设计原则、技术栈、工具路由、实现和交付标准。
- [口语需求初始模板](.agents/skills/ui-design-agent/references/plan-execute.md#initial-request-template)：可选填的起始信息，以及联网调研后输出的完整开发提示词模板。
- [动效规则](.agents/skills/ui-design-agent/references/motion-contract.md)：三套指定弹簧参数、40-80ms 级联、Hover/Press、减少动效及中断处理。
- [工具路由](.agents/skills/ui-design-agent/references/tool-routing.md)：实际能力探测、候选工具、权限边界和替代路径。
- [设计契约](.agents/skills/ui-design-agent/references/design-contract.md)：面向新界面的可测试视觉方向记录：Mission、语义 token、Do/Don't 规则与质量门，无需 MCP。
- [计划/执行模式](.agents/skills/ui-design-agent/references/plan-execute.md)：先咨询并冻结计划，用户明确确认后才一键生成第一版原型，再进入代码执行。
- [细节批评内环](.agents/skills/ui-design-agent/references/detail-critique.md)：逐组件/逐交互的评估维度、P0/P1/P2 严重度分诊与未修复留痕；每道确认门呈现前先自我批评再交用户。
- [Remotion 提示词](.agents/skills/remotion-video-agent/SKILL.md)：视频帧时间轴、转场、Studio 和渲染验收。
- [动画生态参考路由](.agents/skills/ui-design-agent/references/tool-routing.md)：Remotion、Manim、Vibe Video、VibeFrame、Shotcut、OpenShot 的任务匹配与授权边界。
- [3D 与媒体工作流](.agents/skills/ui-design-agent/references/spatial-media.md)：实时场景、物理引擎、Blender 资产、网页视频和像素验收。
- [鹈鹕骑车案例拆解](docs/tihuqiche-spatial-study.md)：实站与源码证据、可迁移的交互经验、工具选择和学习顺序。

在本项目中可直接使用：

```text
$ui-design-agent 设计并实现一个库存管理界面，使用精致视觉系统和物理弹簧反馈，验证移动端、键盘操作和减少动效模式。
```

需要迁移到其他智能体的系统提示词字段时，生成单文件版本：

```bash
npm ci --ignore-scripts
npm run prompt:build
```

产物为 `output/ui-design-agent.system.md`，内容从唯一维护源自动合成，不手动维护第二份长提示词。单独导入提示词不会自动安装其他平台的 MCP 或 skills；目标环境仍需接入工具，缺失时按提示词中的替代流程执行。

## 能力配置

| 能力 | 本项目配置 |
| --- | --- |
| Motion 官方文档、CSS 弹簧生成 | 已配置公开 MCP |
| Context7 文档检索 | 已配置公开 MCP |
| shadcn 组件检索 | 固定版本本地 MCP |
| Playwright 浏览器操作 | 固定版本、隔离无头会话 |
| UI UX Pro Max、Impeccable、Emil Design Eng、Animation Vocabulary、Pick UI Library、Baoyu Design | 已安装项目级 skill |
| Remotion | 6 个官方 skills + 本地视频编排提示词；不安装已废弃的官方 MCP |
| Three.js / R3F / Rapier | 按需运行库路由与验收规范；不在 kit 根目录安装运行库 |
| Blender 建模与 GLB 导出 | 可选本地 CLI / 第三方 Blender MCP 路由；未安装或配置 Blender MCP |
| Motion+、Figma | 配置已预留，默认关闭，未进行登录 |
| Google Stitch（UI 原型生成） | 可选 MCP，默认关闭；API key 走环境变量 `STITCH_API_KEY`，不内联；免费额度与调用结果需逐次验证 |
| mcp-copy-web-ui、inspire-mcp、ui-expert-mcp、typeui.sh、OpenDesign | 用户指定的候选能力，尚未验证或安装，不虚构调用 |

项目配置位于 `.codex/config.toml`，skill 位于 `.agents/skills`。没有改动全局模型、权限或 MCP 配置，也没有启用自动 hooks。Codex 需要信任项目才能加载项目级配置；新增 skill 下一轮可用，MCP 未刷新时重新打开项目会话。

## 验证

安装完成后依次运行，勿让 `npm ci` 与测试同时执行：

```bash
npm run verify
npm test
npm run doctor
npm run doctor:mcp
```

`doctor` 只检查本地配置；`doctor:mcp` 会访问公开服务并启动配置中的本地 MCP，进行只读调用，不登录付费服务。它不证明某个实际应用已通过视觉验收。

[评测场景](evals/scenarios.json) 覆盖产品类型、动效参数、不可用工具、减少动效、长列表和视频转场；它们是可重复执行的行为评测规范，单元测试只检查其结构，不代表已经逐场景运行了生成任务。

素材检索遵循[候选排序规范](.agents/skills/ui-design-agent/references/material-scouting.md)：
先搜高优先级来源和少量候选，再把 MCP/浏览器结果交给
`npm run material:rank -- --input <candidate-json>`；不可达、低分或未验证来源会
保留在 secondary 区，不会因为一次失败就删除，也不会自动进入实现。

长期目标、五步迭代循环与定时任务机制见[目标与迭代机制](docs/goal.md)，逐轮记录见[迭代日志](docs/iteration-log.md)，思维链质量监控见[质量监控](docs/quality-monitor.md)。

更多调用示例见 [使用说明](docs/usage.md)，版本和修改记录见 [来源锁定](tooling/sources.lock.json) 与 [第三方声明](THIRD_PARTY_NOTICES.md)。Remotion skills 的当前固定版本未找到独立许可证，不把整套产物宣称为可自由再分发的 MIT 项目；发布前需确认上游授权。
