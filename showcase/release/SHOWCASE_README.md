# UI Design Agent Kit Showcase

UI Design Agent Kit 的**公开反馈与作品提交中心**。

**主产品是 UI 设计智能体工作流，demo 是工作流的成果案例。**

- [工作流与成果展示站](https://agent.kcos.club/)
- [参与测试](TESTING.md)
- [提交测试反馈 / 产品建议 / 作品](https://github.com/muzimu217/ui-design-agent-showcase/issues/new/choose)

## 这个仓库做什么

1. 收集**测试反馈**：展示站与在线 demo 的可复现问题。
2. 收集**产品建议**：能验证工作流能力的下一批产品实验想法。
3. 收集**作品提交**：外部作者的界面作品，审核通过后加入成果展示页。

这个仓库只保存 issue 模板、测试说明与公开指引。它不包含私有 Agent 指令、
原始应用源码、MCP 凭证或内部评测资料，也没有为整个项目重新声明开源许可证。
展示站与可玩 demo 的依赖许可见
[THIRD_PARTY_LICENSES.txt](https://agent.kcos.club/THIRD_PARTY_LICENSES.txt)。

## 可体验案例

- [积木小工坊](https://agent.kcos.club/demos/brick-workshop/)：3D 拼搭、撤销、本机保存。
- [库存运营台](https://agent.kcos.club/demos/inventory-console/)：演示数据、搜索、筛选、排序、详情。
- [NODEGRID](https://agent.kcos.club/demos/nodegrid/)：交互地球、节点搜索、地图与详情，数据均为演示设定。
- [地铁疾行](https://agent.kcos.club/demos/subway-runner/)：3D 跑酷、键盘与触屏输入、资源加载重试。

其他标注为历史截图或「源码已入库」的案例不代表已经上线或全面验收。体验 demo 不等于运行了 Agent 工作流。
工作流源码已公开；执行时仍须使用有权访问的模型、服务和数据。提交反馈或作品不会自动授予任何额外权限。

## 作品提交规范

通过 [作品提交表单](https://github.com/muzimu217/ui-design-agent-showcase/issues/new/choose)（需 GitHub 账号）提交，表单会引导填写以下必填项：

| 项目 | 要求 |
| --- | --- |
| 作品名称 / 作者 GitHub 主页 | 用于署名与沟通 |
| 作品类别 | 运营工具 / 产品展示 / 内容站点 / 3D 交互 / 游戏 / 数据可视化 / 其他 |
| 作品形态 | 在线可访问 / 开源源码 / 两者 / 仅截图 |
| 链接 | 在线网址或源码仓库；仅截图时填「无」 |
| 截图 | 1–5 张，直接粘贴；遮盖个人信息 |
| 简介与技术栈 | 说明这是什么、为谁做的、亮点在哪 |
| 第三方素材许可 | 逐项列出非自制素材的来源与许可证；全部自制则写明 |
| 数据构成 | 全部演示数据，或真实数据已脱敏并有权公开 |

提交时需确认三点：有权公开、演示数据已在界面标注、素材许可证允许该展示方式。

## 审核流程

1. 收到 issue 后，维护者检查**完整性、素材许可、诚实标注**（不虚构部署状态、不误导为真实产品）。
2. 需要补充时直接在 issue 中回复说明缺什么。
3. 审核通过：作品以项目卡片加入[成果展示页](https://agent.kcos.club/)（含署名与真实截图），在 issue 中通知作者后关闭。
4. 未通过：说明原因后关闭，改进后可重新提交。

此处没有用户数据服务、付费调用或自动私信邀请；issue 内容公开可见。
