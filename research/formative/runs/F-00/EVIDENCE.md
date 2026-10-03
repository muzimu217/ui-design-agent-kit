# F-00 门E 验证记录（第 1 轮）——诚实分级

> **⚠️ 第 2 轮追加披露（2026-10-01）**：本文件第 1 轮"已验证"表中经浏览器通道取得的项（V1 结构/V4 console/V6 溢出，及"桌面运行态视觉"），在第 2 轮被发现**通道失信**——倒计时标题出现只增不减（22:49→24:41，物理不可能）、端口漂移、伪造代码回显。按 D10（截图实图复核门）与如实呈报原则：**凡本会话经浏览器工具通道取得的"已验证"结论一律作废**，仅保留源码级可核验项（V7 tsc+build、V8 token 逐值、V9 代码评审——这些可由任何人读文件复验）。用户实机观察为唯一采信标准。
>
> **源码级修复清单（可读码核验，不依赖截图）**：
> 1. `app/vite.config.ts` — `server.host: true` + `preview.host: true`（修复"启动没成功"根因：vite 默认只绑 ::1，IPv4 访问被拒）
> 2. `app/src/index.css` `.leaf-bottom > span` — 补 `top: -0.75em`（修复翻页钟上下半叶错位：下叶窗口原本渲染数字上半的复制品）
> 3. `app/src/index.css` `.bg-tint` — neon-city/magenta-rain 两主题 overlay alpha 0.55/0.82→0.38/0.68（修复背景霓虹城市被压得过暗）

- 日期：2026-10-01 ｜ 验证者：主代理（IS 模式独立评审）｜ 构建产物：app/dist（tsc 零错 + build 成功）
- 取证环境：vite preview @4192 + Playwright（Chromium 单内核）｜ 现场已清理（服务已关）

## 一、已验证项（本人亲自、结果自洽，证据可溯）

| # | 契约项 | 方法与结果 | 证据 |
| --- | --- | --- | --- |
| V1 | 翻页钟三层叶结构 | DOM 检查：topLeaf/bottomLeaf/flipLeaf/digit-edge/digit-seam 全部存在 | 会话内 evaluate（自洽） |
| V2 | 对比度硬指标 | 实算：主文字/底 15.06:1（≥12✓）；次文字/卡面复合色 6.16:1（≥4.5✓）；强调/底 12.21:1（≥7✓） | 同上（公式与rgba复合计算在会话留痕） |
| V3 | 键盘链 | Space 开始→标题实时倒计时（24:56→24:19）→失焦后 Space=已暂停→再 Space 恢复计时；T 聚焦输入→Enter 入列（任务行"验证链测试任务 0/1 ×"入 DOM） | 按键序列+标题/快照自洽 |
| V4 | Console | 0 errors / 0 warnings | 会话查询 |
| V5 | 桌面运行态视觉 | 霓虹城市照片背景、翻页卡厚度/中缝/投影、**卡片截在翻页中途**（动画真实运行）、青色流光边框、模式胶囊/按钮/轮次点/任务卡齐全、文字无重叠截断 | `evidence/gatee-desktop-running-verified.jpeg`（Read 通道亲眼复核） |
| V6 | 横向溢出（当前视口） | scrollWidth ≤ clientWidth | 会话 evaluate |
| V7 | 静态工程门 | `tsc --noEmit` 零错误；`vite build` 成功（434 模块，JS 373KB/gzip 119KB） | 子代理报告+本代理结构复核 |
| V8 | token 逐值一致性 | 两套主题 9 token 与 DESIGN.md 表格逐项一致（含 rgba→hex-alpha 换算核对） | 代码评审（index.css 28-54 行） |
| V9 | 代码评审 | FlipClock（三层叶/中断处理/直切分支）、usePomodoro（endAt 对表防漂移/visibilitychange）、App（键盘排除/aria 通告/持久化）逐行读过，符合契约 | 本代理评审记录 |

## 二、未验证项（通道失信或环境限制——**如实挂起，不冒充通过**）

| # | 项 | 原因 | 处置建议 |
| --- | --- | --- | --- |
| U1 | reduced-motion 条件渲染传播 | emulateMedia 后 matchMedia matches=true，但重渲染后 beam 仍在 DOM——后续工具返回出现端口漂移/字段不一致/快照失真，**无法区分真缺陷与通道噪声** | 下轮会话干净环境复验（P1） |
| U2 | 移动端 360px 布局与横向溢出 | 同上，返回失信 | 复验（P1） |
| U3 | WebKit/Safari 翻页动画 | Playwright 通道为 Chromium 单内核；offset-path: rect() 在旧 WebKit 有已知退化（子代理已注明） | 用户 Safari 手测或下轮补（P1） |
| U4 | 流光 6s 周期稳定性 | 需连续观测，通道噪声下不可采信 | 复验（P2） |
| U5 | 完成提示音 | 无头环境无音频捕获 | 用户实机听（P2） |

## 三、问题清单（P0/P1/P2，供用户勾选）

| 级别 | 项 | 说明 | 建议处置 |
| --- | --- | --- | --- |
| P0 | （已验证范围内未发现） | — | — |
| P1 | U1 reduced-motion 传播存疑 | beam 疑似在 reduce 下未卸载；若复验坐实为真缺陷则修复 `reduced` 条件渲染 | 复验→坐实即修 |
| P1 | U2 移动端未验 | 360px 布局未实证 | 复验 |
| P1 | U3 WebKit 未验 | 双内核契约项未完成 | 用户手测/下轮补 |
| P2 | 任务提交后焦点滞留输入框 | Space 不触发全局快捷键=契约行为正确，但 UX 可优化为提交后自动失焦 | 用户裁决是否改 |
| P2 | U4/U5 流光周期、提示音 | 待复验/实听 | 复验 |

## 四、证据文件

- `evidence/gatee-desktop-running-verified.jpeg` —— 桌面运行态（Read 通道亲验）
- 其余取证图见 evidence/ 索引（门A/B/C 基线与蒙太奇验证）
- 会话内自洽 evaluate/按键序列结果已在上表注明方法

## 五、门E 裁决请求

- 状态：**部分验证**（9 项过 / 5 项挂起 / P0 零发现）
- 请用户：①勾选 P1/P2 修复项；②裁决"复验后验收"或"按现状验收"或"驳回返工"
