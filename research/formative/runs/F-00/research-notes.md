# F-00 门B 素材采挖记录——赛博番茄钟 V1（Web 核心）

- 日期：2026-10-01｜采挖：Subagent A（素材调研）｜依据：DIRECTION.md v2 + material-scouting.md + user-taste-profile（T-009/T-010）
- 检索预算：首遍主桶 5 个候选（含 1 个对比候选）+ 副桶 7 条，符合"首遍 ≤5 主桶"约束，未撒网。评分为 material-scouting 评分公式的三档分代数（relevance×8 + evidence×5 + rights×4 + fit×2 + efficiency），主桶 = 分数 ≥70 且 reachable 且授权明确。
- 网络通道实录：`gh` CLI token 已失效（`gh auth status` 报 keyring token invalid，未替用户重新登录），GitHub 改走 `curl -x http://127.0.0.1:7897` 直连 GitHub REST API（无 token 公共只读）；Unsplash/Pexels 授权页有 Anubis 反爬，条款全文经 Playwright 浏览器实读；magicui.com 从本机浏览器两次 ERR_CONNECTION_CLOSED，按规则不再重试。检查时间均为 2026-10-01。

## 1. 主桶候选清单（按分排序）

| 类别桶 | 来源 URL | 实检证据 | 拟采用部分 | 授权状态 | 改编边界 |
| --- | --- | --- | --- | --- | --- |
| component｜99 分 | Magic UI `border-beam` + `shine-border`（magicuidesign/magicui） | `curl -x …7897 api.github.com/repos/magicuidesign/magicui` → MIT，22434 stars，pushed 2026-09-20（活跃）；组件源码全文已取回（`apps/www/registry/magicui/border-beam.tsx`、`shine-border.tsx`） | **它解决目标 C"边框轮询流光+耀光"**：border-beam = 渐变光束沿边框周期旋转（motion/react 驱动 + mask 裁边，size/duration/colorFrom/colorTo/reverse/borderWidth 全参数化）；shine-border = radial-gradient 多色流光绕边（borderWidth/duration/shineColor[]）。两者是 copy-paste 组件，非 npm 黑盒 | MIT（scouting 预清表内条目，2026-09-07 预核，今日 2026-10-01 经 GitHub API 复核） | copy-paste 进项目自有组件；依赖 motion/react（MIT，预清表内）；shine-border 需随组件拷入 `animate-shine` keyframes；流光按方向稿仅作操作反馈，非常亮 |
| component｜98 分 | FlipClock.js（npm `flipclock`@1.0.1；仓库 github.com/objectivehtml/FlipClock） | npm registry 元数据（MIT、TS 类型 `dist/index.d.ts`、周下载 2298）；README 与 docs 源文件实读；门A 已有实机截图 `evidence/flipclock-baseline-inspect.jpeg` | **它解决核心计时形态"split-flap 翻页钟"**：v1 为重写版（TS、无 jQuery）；命令式 API `flipClock({ parent, face: clock()/counter()/alphanumeric(), theme: theme({ dividers, css }) })` → `instance.mount(el)` / `unmount()` / `start()` / `stop()` / `toggle()`，`autoStart:false` 支持暂停语义；主题经 `theme({css})` 注入，正对"赛博主题包换肤" | MIT（三源一致：npm license 字段 + README 声明 + GitHub API；© 2013–present Justin Kimbrell） | React 侧需自写薄封装（useRef + useEffect 挂载/卸载，开始/暂停/重置映射 start/stop/remount）；注意依赖含 solid-js（内部渲染）/goober/date-fns，bundle 影响未实测；npm 元数据里的 repository 旧地址 objective-html 已失效，仓库现址为 objectivehtml/FlipClock；锁定 ^1.0.1（0.7.x 是 jQuery 旧版勿装） |
| asset 渠道｜96 分 | Pexels 赛博检索：pexels.com/search/cyberpunk%20city/ | `evidence/gateb-pexels-cyberpunk-search.jpeg`（检索页实拍）+ `evidence/gateb-pexels-license.jpeg`；条款全文经浏览器实读 | **它解决目标 B"免费可商用赛博背景图渠道"**：检索页即用户看图选图的入口（T-009 用户点名要看图选） | Pexels License（2026-10-01 实读）：免费商用、可修改、署名不要求；禁止——可识别人物负面呈现、未修改原图转售、暗示背书、在其他图库/壁纸平台再分发、用作商标 | 选图避开含可识别人物/品牌商标的画面（赛博城市空镜最稳）；下载入库前按 T-004 记录逐图 URL/作者/授权 |
| asset 渠道｜95 分 | Unsplash 赛博检索：unsplash.com/s/photos/cyberpunk-city | `evidence/gateb-unsplash-cyberpunk-search.jpeg`（约 1.1k 结果瀑布流，视觉模型复核确认非空页）+ `evidence/gateb-unsplash-license.jpeg` | **它解决目标 B 的第二渠道**（与 Pexels 互为备份，风格池更偏摄影质感） | Unsplash License（2026-10-01 实读）：免费商用/非商用均可、无需许可与署名；禁止——未加实质修改而出售图片、汇编 Unsplash 图复制竞品服务 | 同上避开人物/商标；**避开 Unsplash+ 付费内容**（站内混排，加号标图片适用单独的 Unsplash+ License，本轮未核其条款）；授权页仅浏览器可达（Anubis 反爬），非浏览器通道会失败 |
| component｜85 分（对比候选） | @leenguyen/react-flip-clock-countdown@1.7.2（github.com/sLeeNguyen/react-flip-clock-countdown） | npm 元数据 + 仓库 API：MIT，84 stars，pushed 2025-11-18，周下载 22194（React 翻页钟类第一）；README props 表实读 | **它是 React 原生翻页钟的成熟度对照**：3D 翻页倒计时组件，props 仅 `to`（目标时间）/`onComplete`/`now` 等，单依赖 clsx | MIT（npm 字段 + GitHub API license 双源） | 面向"倒计时到某时刻"，无原生暂停/重置 API——番茄钟的暂停需重挂载或劫持 `now`，比 flipclock 的 start/stop 费劲；样式主题化靠 CSS 覆盖，弱于 flipclock 的 theme 机制。故列对比项而非首选 |

## 2. 副桶（受阻或低分，不混入主桶）

| 候选 | 原因 |
| --- | --- |
| react-flip-clock-lib@1.2.3（MIT） | 周下载 8，社区验证近乎为零；MIT 清晰但采用风险高于收益 |
| react-flip-clock@1.0.5（MIT，2025-12 更新） | npm 检索可见的中文翻页钟插件，本轮未做仓库级核验，成熟度证据不足 |
| pqina/flip（github.com/pqina/flip） | MIT、1023 stars、2026-07 仍在推送，但它是"经典翻页钟网页"的作品仓库而非 npm 组件——改列 reference 类：翻页机械感（分叶/铰链/阴影）的视觉保真参考 |
| Aceternity UI border-beam | 与 Magic UI 同型效果，但授权页（ui.aceternity.com/license）本轮 WebFetch 404 不可达，scouting 规则明示 Aceternity 为 per-component license 需逐件核——授权未核前不入主桶 |
| @rintran720/cyberpunk-ui@0.1.1（MIT） | 目标 D 命中项："Tailwind-compatible cyberpunk CSS library"，但 0.x 版本、周下载 23，不成熟 |
| sysui-css@2.0.0（MIT） | 目标 D 命中项："Cyberpunk CSS Framework，70+ 组件 8 主题"，周下载 9，不成熟 |
| Yuezi32/flipClock（原生/Vue/React 三实现演示） | GitHub API 显示无 license 文件（license: None）——授权不明，直接排除 |
| magicui.com 演示站 | 本机浏览器两次 ERR_CONNECTION_CLOSED；组件证据降为源码级（GitHub API），不影响授权与采用判断，但视觉实拍缺失，记此局限 |

## 3. 未能核实的项（不编造、不猜测）

- **Aceternity UI 具体许可条款**：授权页 404 不可达；如后续要用其组件必须先读到条款再议。
- **flipclock 的 bundle 体积影响**：依赖 solid-js/goober/date-fns，本次禁止 install，未实测；建议实现子代理首步加体积检查。
- **Unsplash+ 内容条款**：站内混排付费内容，本轮只核了主 License；选图时直接规避。
- **ZImageTurbo**：见附注，按边界完全不核验、不触碰。
- **Übersicht 小组件 API 细节**：目标 E 只要求核验活跃度与许可，未做代码检视。

## 4. 目标 E 核验记录（只核验，不采用）

- **Übersicht**（github.com/felixhageloh/uebersicht）：**GPL-3.0**，4997 stars，主仓最后推送 2025-06-28（未归档，维护节奏慢但社区仍活跃）。
- 结论：足以佐证"网页技术做桌面常驻 HTML 小组件"是成熟先例（形态论证用）；GPL-3.0 进一步坐实既定边界——只借形态与皮肤组织方式，不引任何代码。

## 5. 用户侧生成通道附注（目标 F，仅记录）

- **ZImageTurbo 本地生图**：用户侧专属赛博背景生成通道（用户自备 key、自行操作，key 不经代理/不经本 kit）。定位为 Unsplash/Pexels 检索之外的第三背景来源：主题包机制应把"本地生成图"与"渠道下载图"一律当 `asset` 记录（URL/作者/授权栏写"用户本地生成，ZImageTurbo"）。本轮未做任何操作与核验。

## 6. 目标 D 结论（Tailwind 赛博主题）

- 首遍检索（npm"tailwind cyberpunk"前 10 + "cyberpunk css"前 10 + GitHub"cyberpunk tailwind theme"前 8）：**不存在成熟、高采用的 npm 赛博主题包**——命中的全是个人作品集与 0.x 低果包（见副桶）。
- 这不是素材缺口而是路线结论：主题包机制建议按方向稿本意自建——Tailwind v4 `@theme` CSS 变量定义霓虹色板/深底对比 token，每套主题 = token 集 + 背景图引用，一体热换；改编部分为项目自有，无授权负担。

## 7. 品味对位（T-009 / T-010）

- **T-009（赛博风/可换背景/磁吸小组件/翻页钟机械动效）**：主桶 A/B/C/D 全部直击——翻页钟（flipclock）、霓虹流光（Magic UI）、可换背景（Unsplash/Pexels/ZImageTurbo 三通道）；磁吸小组件是 V1.5 Tauri 壳功能，素材层无需候选。
- **T-010（藏趣味机关）**：本轮按边界不采挖 3D；低成本顺带发现——flipclock 的 `alphanumeric` face 可做分叶翻字彩蛋（仓库 dev 示例即 `[Hello][World!]` 翻页序列，MIT 内可用），留作后续机关素材记号，不展开。

## 8. 建议采用组合（仅供主持人参考，不替用户决定）

翻页钟主体用 `flipclock@^1.0.1`（MIT，命令式 API 正好映射开始/暂停/重置，theme 机制天然服务赛博主题包）+ 自写 React 薄封装；边框轮询流光+耀光从 Magic UI copy-paste `border-beam`（旋转光束）与 `shine-border`（多色流光）二选一或叠用（MIT，React+Tailwind 同栈，motion/react 已预清）；背景图给用户 Unsplash/Pexels 两个免费商用渠道看图选（两渠道条款均已实读，附四张证据截图），ZImageTurbo 作为用户侧生成通道并列；赛博配色不装包，用 Tailwind v4 `@theme` 自建 token 主题包。@leenguyen 组件留作 flipclock 集成受阻时的退路（React 原生但暂停语义要绕）。全部采用决定权在用户。
