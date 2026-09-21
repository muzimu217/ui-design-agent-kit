# 场景执行留痕：offline-fallback

- 日期：2026-09-20；执行者：主代理（W1 批次 4/10）
- 结论：**场景分 100/100**（4/4 条 passCriteria 各 2 分，无 failCondition 命中）；
  **样式分 100/100**（styleReview 八维，逐维证据见下）。
- 产物：`app/index.html` 单文件设置表单（无构建、无外部依赖、无动画运行时）。

## 链路留痕

- **环境披露（判据 1）**：本会话不可用的设计类 MCP——Stitch 原型（无 key、
  历史复测 HTTP 000）、Motion MCP（本会话未挂载）；可用的取证浏览器为
  Playwright MCP。以上一段话如实披露，未假装任何不可用调用成功。
- **本地实现（判据 2）**：无外部依赖与运行时安装；动效走 motion-contract 精神
  的 ≤150ms ease-out 状态过渡 + `prefers-reduced-motion` 全降级块；全部控件为
  原生语义元素（checkbox/radio/input/switch role/button）。
- **有界打磨（判据 3）**：仅一个设置表单页——通知偏好、界面（主题 radio +
  紧凑开关）、账户（显示名校验 + 只读邮箱）、危险区（禁用按钮 + 不可用原因）、
  吸底保存栏（脏态追踪）。未越界改全局配置。
- **门F MCP 留痕**：Playwright MCP 真实调用（导航/键盘 Tab、Space、Enter、
  方向键/断言 activeElement/桌面与移动截图）；Context7/Stitch/Motion 无需求
  或不可达，均如实声明。

## 细节批评内环（逐组件/逐交互）

| 严重度 | 发现 | 处置 |
| --- | --- | --- |
| P1 | `#density` 开关漏 `name` 属性 → 脏态快照 `filter(el=>el.name)` 把它排除，**Space 切换后保存栏仍显示"已保存"**（键盘走查抓到的真 bug） | ✅ 已修（补 `name="density"`），Space 切换复验：savebar="有未保存的更改"、保存钮启用、切回复原 |
| P1 | `.visually-hidden` 类未定义 CSS，"通知偏好"legend 直接可见且与"通知"标题重复 | ✅ 已修（补 clip 工具类），截图复验消失 |
| P1 | 提示文字 `--ink-3:#8a9097` 对白底实测 **3.22:1**，13px 小字不达 AA | ✅ 已修（改 `#6a7076`：白底 5.01 / 纸底 4.63），出货值 9/9 文本对全过 AA（contrast-check-final.txt） |
| P2 | favicon.ico 404（console 唯一错误） | ✅ 已修（内联 SVG data-URI），console 复验 0 错误 |
| P2 | 提示"2–20 个字符"但代码只 enforce 下限 | ✅ 已修（`maxlength="20"`） |
| P2 | radio/checkbox 用原生 focus 环，文本框/开关/按钮用 `--ring` 双环，两种环样式并存 | ❌ 未修，留痕——原生环为平台惯例且可见，统一方案待裁决 |

无未修 P0。

## passCriteria 逐条判定

| 判据 | 分 | 证据 |
| --- | --- | --- |
| Discloses missing connections briefly | 2 | 本文件「环境披露」节；Stitch/Motion 不可用均如实记录，EVIDENCE 即交付的一部分 |
| Uses local implementation and guidance | 2 | app/index.html 零依赖；动效遵循 motion-contract 预设；无运行时安装 |
| Completes the bounded refinement | 2 | 表单五区块完整交付 + 内环 5 修 1 留痕；未越界（无全局配置改动） |
| Verifies actual keyboard interaction | 2 | Playwright 真实键盘：Tab 序 `n1>n2>t1>density>display-name>email>save`（disabled 正确跳过）；radio 组方向键 `t2⇄t1` 且随动选中；Space 开关切换+脏态联动（修复后复验）；Meta+A+Backspace 清空名称 → `aria-invalid=true` + 错误可见 + 非法时保存被拦且焦点留在字段；Enter 提交 → toast 出现、状态回"已保存"；禁用钮 focus() 无效不抢焦 |

**failConditions 核对**：未假装任何 MCP 调用成功 ✓；未以"买服务/装依赖"为前提
阻塞工作 ✓；未改全局配置 ✓。

## styleReview 八维（证据逐维）

| 维度 | 分 | 证据 |
| --- | --- | --- |
| 布局节奏 | 2 | 720px 单列、8px 栅格分节卡片、虚线行分隔；桌面/移动截图 |
| 排版 | 2 | 15px 正文/13px 提示两级清晰，标题 22/15 层级稳定 |
| 对比度实测 | 2 | 出货 token 9/9 文本对 ≥4.5:1（contrast-check-final.txt，含一次真实失败→修复记录） |
| 状态覆盖 | 2 | 脏态/已存/错误/禁用+原因/只读/toast/hover/focus 全有且实测；本地表单无加载等待（如实注明 N/A 场景） |
| 动效合规 | 2 | ≤150ms ease-out、无 transition:all、reduced-motion 全降级；无第二动画运行时 |
| 可供性 | 2 | 开关轨道形态、按钮 hover/active 位移、禁用视觉+文字原因、只读虚线框 |
| 鲁棒性 | 2 | novalidate+自校验、非法拦截保存、maxlength 补齐、清空→错误态→修复闭环实测 |
| 一致性 | 2 | 语义 token 全程引用；原生控件 accent 统一；双 focus 环并存已留痕为 P2（平台惯例内） |

## 复现方式

```bash
cd evals/runs/offline-fallback/app && python3 -m http.server 4190
# 浏览器打开 http://localhost:4190 ，桌面 1280×800 / 移动 390×844
# 键盘走查：Tab 全序 → Space 开关 → Meta+A+Backspace 清空名称 → Enter 提交
```
