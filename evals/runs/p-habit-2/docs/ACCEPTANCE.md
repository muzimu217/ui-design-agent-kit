# ACCEPTANCE.md · 门E 第一轮验收记录（P-habit-2 · 2026-09-20）

目标：index.html（习惯打卡单页工具，单文件自包含）
实现：打卡/撤销、周七列（周一起）、补卡（切周）、增删改（删除确认）、连续统计（当前/最佳）、
localStorage 持久化、示例数据+一键清空、空状态教学、今日列高亮圈出、Lucide 内联图标。

## 已跑检查与证据（evidence/acceptance/）

| 检查 | 方法与结果 | 证据 |
| --- | --- | --- |
| 打卡/撤销/持久化 | Playwright 真点：aria-pressed 切换、reload 后一致、localStorage 写入确认 | acc-1/2/3、走查输出 |
| 连续口径 | 喝水 14/14、阅读 2/2（今天未打则从昨天起算）、概要 14/21 与最长连续 14 计算正确 | 走查输出、acc-10 |
| 键盘 | 焦点打卡（Enter）、焦点保持在原格、空态添加按钮回车开对话框、对话框聚焦名称输入 | 走查输出 |
| 周导航/补卡 | 上一周无今日列、上周喝水 7/7 可查看、回本周、下一周按钮在当前周禁用 | acc-4、走查输出 |
| 增/删/改 | 长名称（12 字）添加换行不破格、删除确认（取消/确认两路）、编辑清 sample 标记 | acc-5、走查输出 |
| 示例/空态 | 首次种子 3 条带示例标、清空确认→空态、空态再导入 | acc-6、走查输出 |
| 视口 | 320/375/768/1440 横向滚动全部 0（修复后） | acc-7-mobile-v2、acc-8、acc-10 |
| 减动效 | emulateMedia reduce：transition 0s、语义即时、快速连点 4 次语义正确 | acc-9、走查输出 |
| 对比度 | tools/contrast.mjs（WCAG 公式）：16 对全过（文字 ≥4.5、非文字 ≥3） | 本轮输出（4.54–14.38:1） |
| Console | 0 error / 0 warning（favicon 内联后） | console 检查输出 |

## 问题清单（本轮）

| # | 级别 | 问题 | 状态 |
| --- | --- | --- | --- |
| 1 | P1 | 移动端 375px 横向滚动 34px（隐藏连续列但网格轨道未同步删） | **已修**：移动端改两行布局（名称行+格子行），复测 4 视口全 0（acc-7-mobile-v2） |
| 2 | P1 | 移动端名称列挤压致竖排断行、连续数一字一行 | **已修**：随 #1 布局重构解决 |
| 3 | P1 | 空打卡格边界对比度 2.02:1（<3:1，空格辨识仅靠边界） | **已修**：新增 --cellline #8f8d80，实测 3.34:1 |
| 4 | P2 | favicon 404 造成 1 条 console error | **已修**：内联 data-URL SVG 图标，console 0/0 |
| 5 | P2 | 移动端格子触达约 34px（<44px 理想值） | **已修（门E 代行裁决：#5 修一轮）**：移动端格子加高 44px，复测 375 格 45×44、320 格 37×44、两视口横滚 0、打卡冒烟正常（acc-11-mobile-44px-375/320.png） |
| 6 | P2 | 编辑示例习惯后"示例"标记移除（视为采纳该习惯） | **接受留痕（代行裁决）**——行为说明写入 DESIGN.md |
| 7 | P2 | 桌面文字按钮 hover 发丝边 #b9b7aa 仅 2:1 | **接受留痕（代行裁决）**——按钮辨识靠文字（≥4.5:1），边为装饰，按 WCAG 1.4.11 不强制 |

## 门E 裁决与收尾复测（2026-09-20）

- 第一轮代行裁决：**有条件通过**——#5 修一轮后收尾；#6/#7 接受留痕。
- #5 复测：移动端 `.cell` 高度 38→44px；375×812 格 45×44px、横滚 0；320×700 格 37×44px、
  横滚 0；打卡冒烟正常；console 0/0。证据：evidence/acceptance/acc-11-mobile-44px-375.png、
  acc-11-mobile-44px-320.png。
- 状态：E=passed（代行裁决标注）；已归档至 kit 仓库 evals/runs/p-habit-2/（EVIDENCE.md 为链路摘要）。
- 归档后终审计由主会话执行（npm run chain:audit）。

## 如实声明（未验证/限制）

- 触屏真机未测（环境无设备）：仅 Playwright 视口仿真 + 触达尺寸推算。
- 自动化无障碍扫描未跑（环境无 axe 等内置）：键盘/ARIA/对比度为人工走查+脚本实测。
- 浏览器缩放/系统大字号未测：如需我补测请指出。
- localStorage 跨会话已验（reload），跨浏览器/无痕模式未逐一验证（机制决定各自隔离，属预期）。
- 键盘 Enter 触发按钮时部分浏览器不显示 :active 按压态（Space 会显示）：记为观察项。

## 交接记录（handoff）

```text
Target: uak-chain-test/index.html（P-habit-2，2026-09-20）
Implemented: 打卡/撤销/补卡/增删改/连续统计/localStorage/示例与空态/今日高亮
Automated: node tools/contrast.mjs -> 16/16 通过；console 0/0
Browser: 1440/768/375/320 -> 全旅程交互走查 -> 全部通过（问题清单见上，P1 已修）
Motion: 常规+reduced -> 语义即时、快速连点正确
Evidence: evidence/acceptance/*.png（9 张）+ 本文件
Unverified: 真机触屏、自动化 a11y 扫描、浏览器缩放（见上）
Try it: 直接双击打开 uak-chain-test/index.html（离线可用）
```

## 门F · MCP/工具调用留痕

| 环节 | 调用 | 结果 |
| --- | --- | --- |
| 动效 | Context7 resolve-library-id(Motion) | **失败：Invalid API key**（如实记录）；降级：kit motion-contract.md 已批准曲线 cubic-bezier(0.16,1,0.3,1)，无运行时依赖（A5） |
| 动效 | Motion MCP | 本会话工具目录不存在该服务器，未调用、未伪造 |
| 图标 | curl unpkg lucide-static v1.47.0 ×10 | 成功，ISC 声明随文件取得并保留于 HTML 头 |
| 对比度 | kit scripts/contrast-check.mjs | 该脚本 PAIRS 为固定评测产品硬编码，不适用 → 按同一 WCAG 公式落地 tools/contrast.mjs，16 对实测 |
| 浏览器取证 | Playwright MCP：navigate/resize/click/type/emulateMedia/screenshot/console | 全部成功，截图 11 张；临时服务 4190 已停，MCP 会话文件已清理 |
