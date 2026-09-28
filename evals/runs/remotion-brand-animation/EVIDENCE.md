# EVIDENCE.md · remotion-brand-animation（R149-01 批次一）

> 评测语境：`npm run eval -- --next` 轮转指向本场景（如实记录，未跳硬场景）。
> 执行窗口：2026-09-28 轮 177 日间专门 session（轮 168 缓办条件成立）。
> brief 为评测语境下的模拟委托（品牌取 UAK 自身真实标识，非虚构第三方品牌）。

## 一、Brief（场景 context 的实例化）

- **受众**：AI 编程工具（Claude Code/Codex 类）的开发者用户
- **产品行为**：给 AI 代理装六道验收门，逐门留痕，产出可查的评分台账
- **品牌词汇**：门禁 / 证据 / 台账 / 0 违规；七色 token（ink #26343d、muted #61717d、line #d9e2e7、paper #fafcfd、surface #f2f5f7、green #177656、focus #2566c4，取自 showcase/products/src/styles.css:4）
- **画幅/帧率/时长**：16:9 1920×1080，30fps，8 秒（240 帧）
- **交付要求**：**仅预览**（Studio + still 帧检视）——**全程未调用 render，未产出视频文件**（判据 6）

## 二、实现前规划（判据 1：message / scene purpose / pacing / brand motifs / reveal logic）

- **信息**：AI 直出的界面一眼假 → 六道门逐步立起 → 台账证据说话 → 品牌锁定
- **场景目的**：四段式——反面样板（需求建立）→ 门禁（方案）→ 台账（证明）→ 字标（记忆）
- **节奏**：240 帧 = 0-72 反面（54 帧划线否定）→ 58-140 六门依次落下 → 124-200 台账行敲入+绿章 → 184-240 字标升起+保持
- **品牌母题**：**门杠横扫**（6 根 ink/green 横杠依次推入-停留-退场）承担全部转场；「门落下」是门禁隐喻的动效化
- **揭示逻辑**：反面被墨杠划掉 → 门杠幕布盖过换场 → 台账行逐条揭示 → 章盖下 → 幕布拉开露出字标
- **动效曲线**：全片唯一曲线族 = kit motion-contract「Elegant spring (stiffness 100 / damping 20 / mass 1)」——品牌个性（严谨工程）直接编码进曲线参数

## 三、可检视参考基线（判据 2）

- **结构基线**：Remotion 官方 blank 模板（github.com/remotion-dev/templates/tree/main/blank）与官方 registerRoot 文档（remotion.dev/docs/register-root）——仅采纳 `registerRoot(Compositions)` 结构惯例
- **权限核实**：blank 模板 MIT 许可；本交付物**零代码复制**（全部自写，仅 API 用法遵循官方文档），failCondition #5 不适用
- **契约来源**：动效参数抄自家 repo 的 motion-contract（demo 契约在案），非外部示例

## 四、帧数学确定性（判据 3）

- 全部动画仅依赖 `useCurrentFrame()` → `spring({frame,...})` / `interpolate(frame,...)`；无 Date/random/wall-clock/free-running
- 格式保持：Composition 1920×1080@30fps durationInFrames=240（16:9/30fps/8s 与 brief 一致）
- 可复验：任意帧 `npx remotion still` 输出确定（本轮 8 帧两次导出内容一致）

## 五、动效服务叙事（判据 4）

- 反面段刻意用**等时呆滞**入场（批判性表达"AI 直出的死板"），被划线否定后转入品牌 spring 节奏——对比即叙事
- 门杠横扫 = 转场唯一手段（无 generic fade 堆叠；场景切换用 parent opacity 4 帧微渐变仅作辅助）
- 门依次落下 = 门禁逐道生效；台账行逐条敲入 = 证据累积；章 = 裁决落定

## 六、帧检视 + Studio（判据 5）

evidence/ 目录 9 张：
- frame-000（开场）/ **frame-040（反面样板 hold）** / frame-062（划线中点+转场启动）
- **frame-100（六门入场中点：门C 落下中途被抓拍）** / frame-148（门杠幕布扫掠）
- frame-175（台账三章齐备）/ frame-205+210（字标升起+幕布退场）/ **frame-239（末帧锁定）**
- studio-preview.png（Studio 实机：组合加载、四段 Sequence 时间轴、00:08.00 时长正确）

## 七、迭代中的真实修复（内环记录）

1. **BarWipe 三态 bug**：初版 `Math.max(inX, outX)` 使未进场的杠停在屏内（outX 初始 0）——帧检视 frame-040 抓到，改 `inX + outX` 求和
2. **场景未包 Sequence**：内部动画按全局帧跑，六门入场动画在可见窗口前就播完——帧检视 frame-100 修正后门C 中途下落可见
3. **门杠停留窗口过长**：wipe3 盖住字标升起高光段（frame-205 抓到）——exit 212→202 收紧
4. **锁定帧对比不足**（细节粒度自检）：tagline green/ink 2.3:1、URL muted/ink 2.5:1 → 改 #2FA77F（4.2:1 大字达标）/#B8C4CC（7.2:1）
5. `remotion@4.0.370` 不再 re-export `zod`——移除可选 schema

## 八、诚实边界

- 未渲染视频（判据 6）；如需投稿渲染另行走门径与用户授权
- 台账三行文案与仓库实况一致：六道门（chain-flow.md §五）、71 场景（scenarios.json）、20 页×明暗 0 违规（output/a11y-report/）
- 反面样板紫/灰仅用于被否定的"before"，非品牌色
