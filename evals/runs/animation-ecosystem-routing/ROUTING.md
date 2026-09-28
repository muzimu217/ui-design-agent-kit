# ROUTING.md · animation-ecosystem-routing（R149-01 批次三）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 179 日间。
> 本场景考「按 brief 把 medium 映射到正确生态」的决策流程；preview 为选型落地的最小证明。

## 一、Brief（评测语境模拟委托）

「UAK 品牌需要一支 **6 秒品牌循环动画，最终导出为视频文件**用于社交卡片与文档嵌入；
要求确定性——同代码重渲染必须逐帧一致；技术栈 React；先出预览再谈渲染。」

- medium 判定：**React 技术栈视频合成**（要导出视频文件、要帧数确定性）
- 交互目的：品牌展示（非页面内交互动效）

## 二、路由矩阵（判据 1-4）

| 候选 | 适配 medium？ | 本机状态 | 裁决 |
| --- | --- | --- | --- |
| **Remotion 4.0.370** | React + 帧数精确合成 + 视频导出——**完全命中** | 已安装已验证（R149-01 批次一 teaser 工程，MIT，3 连绿在案） | **主路线** |
| motion/react | 页面内 UI 动效（brick/ruiear 已用）——medium 不符（要导出视频文件，非页面动画） | 已用于库内 demo | 排除：medium 不匹配 |
| GSAP（9 个 skills 在册） | 同上，页面时间线动效 | skills 在册 | 排除：medium 不匹配 |
| Manim | 数学/科学可视化专用——brief 非数学 medium | **未安装**（CLI 不在 PATH、无依赖，一手核查） | 排除：medium 不符 + 引入即"无任务理由加工具链"（failCondition #5） |
| Shotcut/OpenShot | 桌面多轨剪辑——brief 非多轨工作流 | 未安装 | 排除：medium 不符；且"桌面编辑器当 Remotion 运行时"属 failCondition #3 |
| Vibe Video / VibeFrame | 场景标注为 verified agent-workflow **参考名录** | 本机无 skills、无安装（一手核查） | **不假设可用**——仅作名录记录，不声称连接（failCondition #2 防线） |

选型依据非星数（failCondition #1）：Remotion 的裁决点是 medium 匹配（React+帧精确+视频导出）+ 本机已验证运行时（运行成本最低）。

## 三、复用前检查（判据 5）

- 版本：remotion 4.0.370 / react 18.3.1（teaser/package-lock 在案）
- 许可：Remotion MIT（许可证文件随包）； brand token 复用自家 showcase styles.css（自有，无第三方许可问题）
- 依赖：零新增（复用批次一 teaser 工程运行时，不重复安装、不加工具链——failCondition #5 防线）
- 数据处理：composition 无外部数据、无网络请求、无用户数据
- 运行时复用声明：evals/runs/remotion-brand-animation/teaser/ 为 R149-01 批次一已验证工程，本批次新增 composition 挂入同一 Root（跨批次复用已在两份 EVIDENCE 互相声明）

## 四、品牌/目的/确定性显式化（判据 6）

- 品牌：七色 token（同批次一 C 常量）+ motion-contract 弹簧族
- 交互目的：品牌循环展示（社交卡片场景，静音循环）
- 确定性：全帧数学（spring(frame)/interpolate(frame)），无 wall-clock/random——同帧同输出

## 五、Preview 实现（判据落地证明）

BrandLoop composition：180 帧 @30fps（6 秒），1920×1080——
进度环 0→360°（spring）+ 门杠母题三划 + 字标淡入，循环点回归初始构图（loop-safe）。
证据：evidence/brandloop-000/090/179.png 三帧 + still 命令记录。**仅预览未渲染**（brief 说明先预览后谈渲染）。

## 六、诚实边界

- 未安装/未验证的生态（Manim/Vibe Video/VibeFrame/Shotcut/OpenShot）一律只作名录引用，不声称连接
- 本路由裁决绑定本 brief；若 medium 改为数学可视化，主路线应重估 Manim（需先安装并过许可/成本检查）
