# EVIDENCE.md · motion-free-tier（R149-01 批次五）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 181 日间。
> 场景语境核验：**Motion MCP 本会话不可达**（工具列表一手核查，如实披露，failCondition #2 防线——
> 不声称连接）；**Motion+ 未启用**（.codex/config.toml motion_plus disabled）——不索取 premium 源码、
> 不跑不报 MotionScore（failCondition #1/#3 防线）。

## 一、公开文档资源（判据 1：一手阅读，引用在案）

库内 vendored motion skill（sources.lock d1c5c26f，官方上游）：
- `best-practices/react.md:42-52`——**Reduced motion**：`MotionConfig reducedMotion="user"`
  （关闭 transform/layout 动画，保留 opacity/colour）→ 夹具顶层采用
- `best-practices/base-ui.md:23-38`——**AnimatePresence + exit** 退出动画模式 → 夹具采用
- SKILL.md:16——MotionScore/Motion+ 能力边界（本场景不触发）

## 二、实现（判据 2/3：语义与焦点保持 + 公共 API 原创转场）

fixture/（Vite+React 18+motion 12，MIT；vite build 通过）：
- **语义**：role=dialog + aria-modal + aria-labelledby + Esc + scrim 点击关 + Tab 圈（一次性实现，
  测试全程未替换焦点系统——failCondition #4 防线）
- **转场（原创公共 API）**：AnimatePresence + initial/animate/exit（opacity/y/scale）+ 单一 spring 族
  （stiffness 100/damping 20=kit motion-contract）；`MotionConfig reducedMotion="user"` 顶层包裹
  + variants 内 `reduced ? 0 : 18` 双保险
- 品牌：token 同库（--brand 绿/--ink/--paper 系）

## 三、验证（判据 4：reduced motion + 快速开关，7/7）

evidence/motion-verify.mjs（可复跑）：
- 模态打开+aria-modal=true；**打开后焦点在对话框内** ✓
- 转场由 Motion 驱动（transform 计算值非 none）✓；Esc 关闭+回焦触发钮 ✓
- **快速开关 ×10 无 scrim 残留**（AnimatePresence 卸载干净）✓；console 0 错误 ✓
- **reduced motion**（emulateMedia reduce）：80ms 时面板位移已就位（computed transform ty=0.00——
  transform 动画被 MotionConfig 关闭，仅 opacity）✓
- 截图：modal-open.png

## 四、内环：真缺陷修复（验证的价值）

首跑 3 FAIL 根因链=**Modal 缺"打开即聚焦"effect**——焦点从未进入对话框 → 面板上的 Esc 处理器
永不触发 → 对话框关不掉 → scrim 残留 → 后续点击全超时。补 `useEffect(()=>{open&&panelRef.focus()})`
后 7/7。次生教训：验证断言的时序要与动效收敛匹配（exit spring ~0.8s，450ms 断言假阴性）、
期望值要按实际布局算（面板居中 top≈310 而非想当然的 400）。

## 五、诚实边界

- 仅预览层验证（真鼠标点击路径由 scrim onClick 覆盖）；触屏拖拽不适用
- Motion MCP/Motion+ 状态如实披露于文首，全程未声称连接
