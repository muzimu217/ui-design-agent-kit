# UI Design Agent Kit

面向现代前端的 UI/UX 智能体配置：视觉系统、物理弹簧、空间微编排，以及经过实际调用检查的 MCP 工作流。另附 Remotion 视频编排能力。这里维护提示词与工具配置，不是应用脚手架。

本仓库本身是智能体架构产品。生成的产品 UI 默认放在仓库外的独立工作区；仓库内的 `showcase/` 仅用于展示架构能力，不会被 agent runtime 导入。`output/`、`.playwright-*` 等只是可重建的临时产物。详细边界见[架构说明](docs/architecture.md)。

## 提示词入口

- [主提示词](.agents/skills/ui-design-agent/SKILL.md)：角色、设计原则、技术栈、工具路由、实现和交付标准。
- [动效规则](.agents/skills/ui-design-agent/references/motion-contract.md)：三套指定弹簧参数、40-80ms 级联、Hover/Press、减少动效及中断处理。
- [工具路由](.agents/skills/ui-design-agent/references/tool-routing.md)：实际能力探测、候选工具、权限边界和替代路径。
- [设计契约](.agents/skills/ui-design-agent/references/design-contract.md)：面向新界面的可测试视觉方向记录：Mission、语义 token、Do/Don't 规则与质量门，无需 MCP。
- [细节批评内环](.agents/skills/ui-design-agent/references/detail-critique.md)：逐组件/逐交互的评估维度、P0/P1/P2 严重度分诊与未修复留痕；每道确认门呈现前先自我批评再交用户。
- [Remotion 提示词](.agents/skills/remotion-video-agent/SKILL.md)：视频帧时间轴、转场、Studio 和渲染验收。
- [动画生态参考路由](.agents/skills/ui-design-agent/references/tool-routing.md)：Remotion、Manim、Vibe Video、VibeFrame、Shotcut、OpenShot 的任务匹配与授权边界。

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

更多调用示例见 [使用说明](docs/usage.md)，版本和修改记录见 [来源锁定](tooling/sources.lock.json) 与 [第三方声明](THIRD_PARTY_NOTICES.md)。Remotion skills 的当前固定版本未找到独立许可证，不把整套产物宣称为可自由再分发的 MIT 项目；发布前需确认上游授权。
