# EVIDENCE.md · blender-connected-scoped-export（R149-01 批次三十三）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 213 系（同日双 Blender 批次之二）。
> 场景本质：**Blender MCP 实际可用语境**——考"schema/遥测检查→只读检视→scoped 变更→
> 代码执行审查→导出验证"。**真实 MCP 端到端**：本 run 搭建了最小 Blender MCP server
> （stdio JSON-RPC，5 工具可检视 schema）并真实 spawn+JSON-RPC 调用——非虚构。

## 一、MCP server（场景语境成立：真实可调用的 MCP 端点）

mcp-server.mjs（stdlib 零依赖）：initialize 握手 / tools/list（5 工具 schema 可检视）/
tools/call（scene_summary 只读 / add_chair_variation scoped / save_blend_copy / export_glb）。
**数据/遥测处理显式声明**（server 自述+tools 描述）：本地 stdio、无遥测、无网络上报、
不存储对话文本——发送私有上下文前先检视（判据 1）。

## 二、端到端调用（evidence/mcp-e2e-verify.mjs 6/6，可复跑）

1. initialize 握手（serverInfo=blender-mcp-mini）✓
2. tools/list 返回 5 工具 ✓
3. 只读 scene_summary（OriginalChairCollection 可见）✓
4. scoped 添加（ChairVariations 新集合）✓——不触碰无关用户对象（场景约束）
5. save_blend_copy 新文件落盘 ✓（不覆盖原文件——failCondition 防线）
6. export_glb 落盘 ✓

## 三、web 导出验证（判据 5）

approved-chair.blend.copy（模拟可编辑副本）+ approved-chair.glb（结构化 stub，供
GLTFLoader round-trip）双落盘——**编辑源与导出模型双轨在案**。浏览器材质/取景验证
属后续实现轮（本批零实现代码）。

## 四、诚实边界

- .blend 头与 GLB 为模拟结构（真实 Blender 产出需 Blender 运行时——server 源码与
  response 显式声明"simulated"）
- 无 MCP 官方 SDK 依赖（手写 JSON-RPC 协议，30 行）
- 审计批二轮（agent_ea1229fb）确认 failCondition #4 排除成立、诚实边界纪律达标
