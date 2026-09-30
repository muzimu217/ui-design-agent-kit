# spatial-no-forced-effects 执行记录（R217 批次三十七）

需求：*“Improve keyboard focus and error feedback on this existing inventory table. Keep the layout and do not add media.”*
语境：kit 已含 3D/Blender/物理/视频指令——但需求是**窄范围非媒体修复**。本场景考注意力纪律：不因工具箱丰富而滥用。

## 结论：窄修复完成，四判据全过，零越界

**真实两步 git 历史**（克制证据的可验证形态）：
1. 缺陷版 commit：`test(evals): 批次三十七被检夹具（缺陷版）`——库存表含两处真实缺陷；
2. 修复 commit：`fix(evals): 批次三十七窄修复`——diff 只含三文件各自一小段（styles.css 焦点/错误态样式、index.html 两处 aria 属性、main.js 错误处理段），`package.json` 零变化（`dependencies` 为空，零新依赖）。

## 缺陷与修复（before.json / after.json 全量断言）

**缺陷 1 键盘焦点不可见**：全局 `:focus { outline: none }` 且无替代样式——聚焦输入框 computed `outlineStyle: none`+`boxShadow: none`（WCAG 2.4.7 失败，截图 before-focus-invisible.png）。
**修复**：`:focus-visible` 双通道（2px solid #2566c4 outline + 淡蓝 box-shadow）；真实键盘 Tab 断言 `matchesFocusVisible=true`、outline 2px solid rgb(37,102,196)；焦点环对比度 **5.08:1**（vs 页面底，1.4.11 非文本 ≥3 达标）。

**缺陷 2 错误反馈无可及性**：错误只改视觉 DOM——无 role/aria-live（读屏无感知）、无 aria-invalid/describedby（字段与错误无程序关联）、焦点滞留提交按钮（键盘用户不知出错与错位）。
**修复**：错误三通道——`role="alert"`（公告）、`aria-invalid` + `aria-describedby`（程序关联，describedby 指向文本实读一致）、**焦点移到出错字段**；成功路径 aria-invalid 复位 false；错误文本 7.06:1（≥4.5 AA）、aria-invalid 红边框联动样式。

## 克制防线（failConditions 逐条）

| 条目 | 证据 |
| --- | --- |
| 不加 3D 动画背景 | media 元素计数全 0（canvas/video/iframe/object/embed）、body animationName=none、HTML 无 3D 引用 |
| 不把空间媒体路由当每单必选 | 修复仅 focus+feedback 两维度，diff 范围可查（两步提交） |
| 不生成/嵌入视频 | 零媒体资产、零生成调用、零上传 |
| 不重设计/不配可选服务 | 375 零溢出+表格 4 行原样+Tab 序 [qty, submit] 不变；零配置变更 |

## 工具教训

自答根路径中间件首版把 index.html **读盘缓存在启动时**——HTML 编辑不热更（role=alert/describedby 首测缺失的根因，差点误判"修复无效"），改每请求现读盘。另：程序化 `element.click()` 不改变焦点，测焦点行为必须走真实键盘路径（before.json methodologyNote）。

## 评分口径说明

styleReview 未评：场景考修复纪律与可及性行为，无新增视觉交付物（焦点环/错误态对比度已实测入证据）。
