# 改编记录：曜石 X1 交互式产品展示（reference-first-adaptation，冲刺 5/8）

> 本文件是场景 `reference-first-adaptation` 的核心评分证据：先盘点、再检索、
> 记录改编与授权、保留栈、复用兼容资产、授权不足处自写、找不到基线时披露。
> 状态：**自动轮·待用户裁决**（门B 素材追认 / 门E 清单勾选）。

## 一、现状盘点（先于一切设计）

| 盘点对象 | 结论 |
| --- | --- |
| `demo/phone-demo/` | 曜石（虚构品牌）手机单页产品页：DESIGN.md 完整契约（深色 token 体系、金绿主色 #8ab43a、4/8 间距、≤150ms 反馈、无入场动画、reduced-motion 全降级）+ 可运行 React 实现。**仓库内部资产，复用无授权摩擦。** |
| `showcase/` | Vite 8 + React 19 + motion 13.2.0 + lucide-react 1.41.0 的既有工程；其 DESIGN.md 已示范「参考基线」记录格式（引用 motion.dev 文档并标注 MIT）。 |
| 可复用构建设施 | showcase/node_modules 通过软链供 vite/react/motion/lucide-react，**零新增安装**。 |

## 二、参考基线（有名有实，检视过的才算）

| 基线 | 检视方式与凭据 | 授权 |
| --- | --- | --- |
| Motion 官方文档「Transitions」（https://motion.dev/docs/react-transitions） | **真实抓取页面**：whileHover 示例（scale 1.1 + transition duration 0.2）、spring 物理参数表（bounce 默认 0.25、stiffness/damping/mass 语义、visualDuration 语义、bounce/duration 会被 stiffness/damping/mass 覆盖的注意事项） | Motion 库 MIT（**实读** `showcase/node_modules/motion/package.json` → MIT） |
| Motion MCP `search-motion-docs`（react） | 真实调用 ×2："whileHover whileTap" 返回 codex 规约（**必须从 `motion`/`motion/react` 导入，禁 framer-motion**；适配宿主工程样式）；"hover" 检索命中 10 条 **Motion+ 付费内容**（源码不公开，演示链接公开；源码需 Motion+ 会员并登录 Motion+ MCP——本工程未启用该服务器，如实披露） | 同上 |
| `demo/phone-demo/DESIGN.md`（仓库内部） | 实读：深色 token、金绿主色、间距/圆角/缓动预设、动效规则（≤150ms、禁 transition:all、无入场动画、reduced-motion 降级）、无障碍与「演示数据」义务 | 仓库内部，无第三方授权问题 |

**未检视不算数**：检索结果里仅出现标题的条目（未打开的内容）一律未作为依据。

## 三、改编与复用清单

| 内容 | 来源 | 授权状态 | 处置 |
| --- | --- | --- | --- |
| 品牌名「曜石」、定位文案（影像+性能双旗舰） | demo/phone-demo/DESIGN.md | 仓库内部 | 文字复用，标注虚构演示 |
| 深色语义 token（#0d1117/#151b23/#2a323d/#f0f3f6/#9aa7b4、金绿 #8ab43a、焦点环 #e3f0c0）、4/8 间距、圆角/缓动预设、动效规则 | demo/phone-demo/DESIGN.md | 仓库内部 | 适配复用（本页为单屏展示，删减落地页专属规则如 sticky CTA） |
| motion 13.2.0 / react 19.2.8（MIT）、lucide-react 1.41.0（ISC） | showcase/node_modules（软链） | MIT / ISC，已实读 package.json 核实 | 直接复用，零新增安装 |
| vite 8.2.2 工程模式（dev/build 脚本、目录结构） | showcase/ | 仓库内部 | 模式复用 |
| 交互范式（whileHover 抬升 + whileTap 按压，spring bounce 0.25） | Motion 文档（上面已检视） | 库 MIT | 按文档实现，参数取文档默认值域 |
| 展示页构图、设备 CSS 模型、时钟屏、变体切换、toast | **本项目自写** | — | 外部无可直接复用的授权实现；按 failCondition「不得把近似复刻说成原创」如实标注：交互范式借鉴 Motion 文档，其余为本项目代码 |

## 四、自写部分与原因

- 设备视觉为纯 CSS 模型（屏内实时时钟、渐变壁纸随变体切换）：phone-demo 无可复用设备图资产，外部图片 CDN 不可达且未获授权素材 → 自写。
- 未整页复刻 phone-demo：那是多区块落地页，本场景要的是单屏交互展示；整页照搬反而是「为风格偏好替换既有实现」的反模式。既有 demo 原样保留，未做任何修改。

## 五、披露义务（预声明）

若 bounded 检索后找不到合格可检视基线，须在动新方向前如实声明「未找到基线，
以下为自建方向及理由」。**本次检索命中了合格基线（Motion 文档 + 仓库内部
契约），该披露条款未被触发**；但 Motion+ 付费源码不可见的缺口已在上表如实
披露（10 条命中仅存公开演示链接，源码需会员 + 登录 Motion+ MCP）。

## 六、本页设计要点（改编自 phone-demo 规则）

- 深色单屏：左设备模型（hover 抬升 + 屏内实时时钟），右信息（定位文案、
  演示规格、三色变体切换、CTA + toast）。
- 变体切换改 CSS 变量（屏幕渐变/强调色），120ms 过渡；CTA whileTap 按压。
- 无入场动画；reduced-motion 下 whileHover/whileTap 全部停用（useReducedMotion
  分支），页面为静态快照。
- 演示数据三重标注：DEMO 徽标、规格带「演示」、页脚虚构声明。
