# 对标洞察：anatomy 技能（用户发现并指令安装）——第四十轮学习循环

- 日期：2026-10-16 ｜ 检视级别：**verified-partial**（仓库安全审查+本地构建最小示例成功——能力已实证；未实机全流程使用）
- 证据：`repo-2026-10-16.png`（仓库页）+ **本地构建产物** `/tmp/anatomy-check/examples/dial-indicator/dial-indicator.html` 渲染实拍（等距仪表图+实时读数验证）
- 对象：wheresryan22/anatomy（MIT，★13.2k，2026-10-16 当日仍活跃）

## ① 机制（审查与实证）

1. **核心主张**："The object is the explanation"——不画框箭头，而是造一台真实机器让工作原理可视化（概念→物理对象映射表：缓存 key→弹子锁、GPU 上下文→龙门绘图仪……）。
2. **工程纪律罕见**：`build.mjs --audit` 几何审计（无穿透/端点真实落座/无压扁弯折/深度排序证明）；WebGL shader 注册到等距平面；8 个完整示例（最大 raptor-engine 240 实体+15 电缆）。
3. **尺寸分级**：Figure（40-80 零件）/Hero（80-150）/Epic——工作量与细节密度成文规定。
4. 安全审查全过：零运行时依赖/无 eval/唯一网络=本机 Chrome 调试端口/child_process 仅测试。

## ② 为什么合适（与 kit 互补）

- kit 的图稿能力此前依赖手绘 SVG 或外部素材；anatomy 补齐**程序化技术插图**（docs/落地页/解释器图稿）——正对"品牌化高端化"路线里的图稿需求（PDF 学术图稿、README 图示、画布页装饰）。
- 与本 kit 同范式（SKILL.md 技能、agents/openai.yaml、evals/ 目录、Node+Chrome 校验链）——接入零摩擦。

## ③ 不抄 / 边界

- 不引入其社区画廊发布（外发渠道，用户未授权）；不 vendor 9.8MB 构建产物（按需重建）。

## ④ 落点

- **已安装**：`.agents/skills/anatomy/`（1.7MB 源码整包）+sources.lock 钉版 `e9488296`+NOTICE.md（安全审查记录）；技能计数锁 22→23 五处同笔。
- 后续：tool-routing 挂接（图稿任务路由到 anatomy）待下轮；PDF/README 图稿翻新可试跑其示例管线。
