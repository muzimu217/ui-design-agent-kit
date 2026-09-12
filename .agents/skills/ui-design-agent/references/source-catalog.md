# 灵感库·素材条目记录（Source Catalog）

灵感库（inspiration library）是本 kit 的素材检索知识库，三层结构中的
**第②层**：每站一条的素材条目，含功效分析、使用场景示例、截图示例、
镜像替代与可达性授权。第①层"分类路由索引"（需求类型 → 网站）与
第③层检索机制、扩充流程在
[inspiration-library.md](inspiration-library.md)。

条目中的截图存于 `references/screenshots/`，是**参考数据**：帮助 AI 与
用户回忆该站长什么样、提供什么。截图版权归原站所有，不进入生产、
不作为可复用资产。所有可达性状态都是实测快照，时间敏感，使用前复验。

## 条目模板（新素材按此格式写入）

```markdown
### <站点名称>（<主需求类型>）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://… |
| 功效分析·提供什么 | <该站实际提供的内容与检索方式> |
| 功效分析·适合任务 | <哪些需求类型/任务阶段用它> |
| 功效分析·视觉特征 | <站内作品的普遍风格与质量水位> |
| 功效分析·内容形态 | <截图 / 组件源码 / 提示词 / 视频录像 / 模板> |
| 使用场景示例 | <一个具体任务 → 在该站怎么查 → 产出什么> |
| 截图示例 | screenshots/<file>（<拍摄日期>，Playwright 实拍）或"无截图：<原因>，用 <镜像条目> 截图替代" |
| 镜像替代 | <不可达/限流/反爬时改用哪些已收录条目，按贴合度排序> |
| 适用类型 | <匹配的分类路由索引需求类型，1 到多个> |
| 可达性与授权 | <curl/浏览器实测状态 + 日期；许可证/反爬说明> |
| 加入日期 / 来源 | <YYYY-MM-DD> / <用户提议 | AI 发现 | 规划批次> |
```

---

### Landing Love（动效 / Motion）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.landing.love |
| 功效分析·提供什么 | 落地页动效灵感库：整页视频录像（full-page video recordings）+ 截图画廊，首页实测标称 2146 个动画网站，支持 `⌘K` 搜索与分类浏览 |
| 功效分析·适合任务 | 落地页动效与滚动叙事参考：开场节奏、section 转场、hover 细节 |
| 功效分析·视觉特征 | 现代产品/工作室落地页为主，动效完成度高 |
| 功效分析·内容形态 | 整页视频录像、截图画廊、分类与搜索 |
| 使用场景示例 | "SaaS 定价页要滚动叙事动效" → 站内按 Animation 类别筛 SaaS 案例 → 看整页录像的章节转场与节奏 → 挑 2-3 个候选带截图回确认门 B |
| 截图示例 | screenshots/shot-landing-love.jpeg（2026-09-07，Playwright 实拍首页画廊） |
| 镜像替代 | Godly（动效画廊）、Awwwards（评审级动效案例） |
| 适用类型 | 动效 / Motion |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-07 实测）；灵感参考用途，作品版权归原站 |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### Land Book（审美 / Aesthetics）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://land-book.com |
| 功效分析·提供什么 | 按行业/类型分类的网站设计画廊，审美基调与视觉情绪参考 |
| 功效分析·适合任务 | 定视觉方向前的审美基调采样：配色情绪、版式气质 |
| 功效分析·视觉特征 | 覆盖面广的精选站点，行业分类检索是核心价值 |
| 功效分析·内容形态 | 截图画廊 + 行业/类型筛选 |
| 使用场景示例 | "教育产品官网要有温和高级感" → 按行业筛 Education/Landing → 对比 5-8 个案例的留白、字重、色温 → 提炼方向词进设计契约 |
| 截图示例 | 无截图：Cloudflare 反爬（curl 403、无头浏览器停"请稍候…"挑战页，不绕过），用 Lapa Ninja 条目截图作同类型替代参考 |
| 镜像替代 | Lapa Ninja（同为落地页画廊，直连可用）、Best Website Gallery |
| 适用类型 | 审美 / Aesthetics |
| 可达性与授权 | curl 403、无头浏览器被挑战页拦截（2026-09-07 实测）——需真实交互浏览器人工通过；不绕过反爬 |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### Awwwards（创意 / Creativity）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.awwwards.com |
| 功效分析·提供什么 | 获奖网站陈列 + 趋势观察：按 design/usability/creativity/content 等维度评审的标杆案例，含专家评审与年度榜单 |
| 功效分析·适合任务 | 创意上限校准：品牌官网、作品集、campaign 页的非常规解法 |
| 功效分析·视觉特征 | 实验性强、完成度极高，常含复杂动效与定制排版 |
| 功效分析·内容形态 | 案例截图 + 评审分数 + 文章趋势分析 |
| 使用场景示例 | "作品集站点要有记忆点" → 按 creativity 维度翻高分案例，看开场钩子与滚动结构 → 记录 2 个可改编的交互关系（不是像素拷贝）回门 B |
| 截图示例 | screenshots/shot-awwwards.jpeg（2026-09-07，Playwright 实拍首页） |
| 镜像替代 | Godly、Best Website Gallery |
| 适用类型 | 创意 / Creativity；设计感 / Design quality |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-07 实测）；展示用途，属研究型参考（库内 band: Research-only） |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### One Page Love（精致 / Refinement）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://onepagelove.com |
| 功效分析·提供什么 | 单页网站灵感与模板库：polished 单页案例 + 可购模板，section 级结构参考强 |
| 功效分析·适合任务 | 单页落地页/活动页的精致度参考：section 编排、留白、细节打磨 |
| 功效分析·视觉特征 | 干净、完成度高、商业可用的单页设计 |
| 功效分析·内容形态 | 案例截图 + 模板（模板有独立授权条款） |
| 使用场景示例 | "活动单页结构怎么排" → 浏览 One Page 分类案例 → 拆 3 个高赞页的 section 顺序（hero→social proof→CTA…）→ 用于结构草案，视觉另取素材 |
| 截图示例 | screenshots/shot-onepagelove.jpeg（2026-09-07，Playwright 实拍首页） |
| 镜像替代 | Landingfolio（库内已验证 200）、SaaS Landing Page |
| 适用类型 | 精致 / Refinement |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-07 实测；此前 525 已恢复）；案例可参考，模板复用前逐个查条款 |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### Lapa Ninja（酷炫 / Bold）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.lapa.ninja |
| 功效分析·提供什么 | 落地页设计例库，首页实测标称 7300+ 最佳落地页，按类别（SaaS、金融、AI 等）与风格筛选 |
| 功效分析·适合任务 | 高冲击、大视觉方向的快速采样；也适合替代被反爬的同类画廊 |
| 功效分析·视觉特征 | 大胆用色/大字排版/强对比居多，类别检索效率高 |
| 功效分析·内容形态 | 截图画廊 + 类别/风格筛选 |
| 使用场景示例 | "AI 工具站要酷炫首屏" → 按 AI/SaaS 类别筛 → 对比 5 个首屏的大标题排布与主视觉处理 → 产出首屏方向拼板进门 C |
| 截图示例 | screenshots/shot-lapa-ninja.jpeg（2026-09-07，Playwright 实拍首页） |
| 镜像替代 | Land Book（需真实浏览器）、SaaS Landing Page |
| 适用类型 | 酷炫 / Bold；审美 / Aesthetics（Land Book 不可达时的替位） |
| 可达性与授权 | curl 200（2026-09-07 实测；历史记录 403 反爬，状态有波动，使用前复验）、浏览器正常加载；灵感参考用途 |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### 21st.dev（现成 / Ready-made）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://21st.dev |
| 功效分析·提供什么 | React 组件/模板/主题注册表，首页实测标称 12,000+ 精工 UI；shadcn 兼容组件可直接装配 |
| 功效分析·适合任务 | 装配优先路径的现成组件层：需要现成交互组件（hero 动效、卡片、命令面板等）时第一站 |
| 功效分析·视觉特征 | 现代 shadcn/Tailwind 风格，工程质量高 |
| 功效分析·内容形态 | 可复制组件源码 + 模板 + AI 生成组件入口 |
| 使用场景示例 | "首页要一个动画 hero" → 搜 hero/animated → 逐个看组件 demo 与依赖 → 挑 1-2 个候选，**逐组件核对许可**后进门 B 给用户勾选 |
| 截图示例 | screenshots/shot-21st-dev.jpeg（2026-09-07，Playwright 实拍首页） |
| 镜像替代 | React Bits（预清组件层，许可已实测）、shadcn registry、Uiverse（需真实浏览器） |
| 适用类型 | 现成 / Ready-made |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-07 实测）；**许可逐组件检查，不入预清层**（见 docs/quality-monitor.md 第六轮记录） |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### SiteInspire（设计感 / Design quality）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.siteinspire.com |
| 功效分析·提供什么 | 精选设计感网站画廊，按风格/主题/类型多维筛选，气质偏工作室与文化类 |
| 功效分析·适合任务 | "要有设计感"类模糊需求的具象化：找克制的、设计主导的版式参考 |
| 功效分析·视觉特征 | 精致克制、排版驱动，少俗套模板气 |
| 功效分析·内容形态 | 截图画廊 + 风格/主题/类型筛选 |
| 使用场景示例 | "品牌站要有格调不落俗" → 按风格筛 minimal/editorial 类 → 对比字版排布与图片节奏 → 提炼 token 关系进设计契约 |
| 截图示例 | screenshots/shot-siteinspire.jpeg（2026-09-07，Playwright 实拍首页） |
| 镜像替代 | Best Website Gallery、Godly |
| 适用类型 | 设计感 / Design quality |
| 可达性与授权 | curl 429 限流、**浏览器正常加载**（2026-09-07 实测）——脚本侧限流属正常，用真实浏览器访问即可 |
| 加入日期 / 来源 | 2026-09-06 / 分类路由规划批次（用户冲刺） |

### Realtime Colors（配色 / Color）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.realtimecolors.com |
| 功效分析·提供什么 | 在真实网页布局上实时预览配色与字体组合的工具站：文本/背景/主色/次色/强调色即时切换，可导出 Tailwind 配置与 CSS 变量，附 Figma 插件与模板 |
| 功效分析·适合任务 | 设计契约的语义色板定稿：在类真实组件上验证 token 关系，而不是只看色卡 |
| 功效分析·视觉特征 | 工具本身即精致落地页示范，默认演示布局为现代营销页 |
| 功效分析·内容形态 | 交互式工具 + 导出配置，非画廊 |
| 使用场景示例 | "产品主色定不下来" → 输入 3 组候选色板 → 在真实布局上看对比度与层级 → 导出 Tailwind 变量进设计契约 |
| 截图示例 | screenshots/shot-realtime-colors.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Coolors（同类配色工具）、ui-ux-pro-max（本地色板数据） |
| 适用类型 | 配色 / Color |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；站方标称核心功能免费，产出为自选色值无素材版权问题 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Coolors（配色 / Color）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://coolors.co |
| 功效分析·提供什么 | 快速配色生成器：空格键刷色板、图取色、对比度检查、按主题/风格浏览百万色板，Palette Visualizer 可在真实 UI/品牌/排版样机上预览 |
| 功效分析·适合任务 | 色板快速发散与收敛；对比度可达性初查；给候选方案配辅助色板 |
| 功效分析·视觉特征 | 工具型站点，色板社区内容质量参差需自筛 |
| 功效分析·内容形态 | 交互式工具 + 色板库 + 导出（PNG/SCSS/SVG/PDF 等） |
| 使用场景示例 | "暗色主题要一组功能性辅助色" → 生成器锁定主色刷变体 → Contrast Checker 过 WCAG → Visualizer 上样机确认 → 记录色值进契约 |
| 截图示例 | screenshots/shot-coolors.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Realtime Colors（真实站点预览更强）、ui-ux-pro-max（本地色板数据） |
| 适用类型 | 配色 / Color |
| 可达性与授权 | curl 403（脚本拦截）、**浏览器正常加载**（2026-09-11 实测）；免费为主，Pro 付费解锁高级功能（freemium） |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Typewolf（字体 / Typography）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.typewolf.com |
| 功效分析·提供什么 | 字体趋势索引：流行字体推荐、单字体的搭配建议与免费替代、Top 10 分类清单（无衬线/衬线/等宽等）、真实网站用字案例 |
| 功效分析·适合任务 | 排版方向定稿：主字体选型、标题/正文配对、为付费字体找 Google Fonts 平替 |
| 功效分析·视觉特征 | 编辑质量高、克制，字体选购链接含联盟推广需自辨 |
| 功效分析·内容形态 | 编辑型索引 + 清单 + 付费 lookbooks/课程 |
| 使用场景示例 | "品牌站要衬线标题+无衬线正文" → 查目标字体的 pairing 页 → 抄配对关系与字号节奏 → 免费替代列里选 Google Fonts 落地 |
| 截图示例 | screenshots/shot-typewolf.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Fonts In Use（真实案例更丰富）、ui-ux-pro-max（本地字体数据） |
| 适用类型 | 字体 / Typography |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；浏览免费，lookbooks/课程为付费内容；字体本身授权归各厂牌，落地前逐字体核对 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Fonts In Use（字体 / Typography）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://fontsinuse.com |
| 功效分析·提供什么 | 真实项目用字档案库：按字体/行业/格式检索的商业与文化传播案例，每条记录标注使用的字体家族与场景 |
| 功效分析·适合任务 | 验证某字体在真实成品中的观感；为品牌气质找同类行业用字证据 |
| 功效分析·视觉特征 | 档案库气质、覆盖印刷与数字，编辑与社区提交混合 |
| 功效分析·内容形态 | 案例截图 + 字体标注 + 检索 |
| 使用场景示例 | "金融产品想用 GT Alpina" → 站内搜该字体看真实案例 → 观察小字号可读性与搭配 → 决定是否进契约 |
| 截图示例 | screenshots/shot-fontsinuse.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Typewolf（配对建议更强） |
| 适用类型 | 字体 / Typography |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；案例图片版权归原权利方，仅作参考研究，不入生产 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Iconify（图标 / Icons）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://iconify.design |
| 功效分析·提供什么 | 开源图标集聚合框架：首页实测标称 300,000+ 开源矢量图标、150+ 集合（Lucide/Phosphor/Tabler/Material Symbols 等），统一组件按需加载，支持 React/Vue/Svelte/Web Components/Figma/Tailwind |
| 功效分析·适合任务 | 跨集合图标检索与一致性拼装；项目需要多家族图标但不想装多个包时的第一站 |
| 功效分析·视觉特征 | 聚合检索工具，图标风格随所选集合 |
| 功效分析·内容形态 | 可复制组件 + 图标检索 + 各集合元数据 |
| 使用场景示例 | "仪表盘要补一套状态图标且风格须贴现有 Lucide" → 站内按集合筛 Lucide/Tabler 对比 → 复制组件代码 → 逐图标核对所属集合许可 |
| 截图示例 | screenshots/shot-iconify.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Phosphor Icons（单集合多字重）、本地 Lucide（kit 默认图标库） |
| 适用类型 | 图标 / Icons |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；Iconify 工具开源（MIT），各图标集合保留自身许可（多为 MIT/ISC/Apache），商用前逐集合核对 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Phosphor Icons（图标 / Icons）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://phosphoricons.com |
| 功效分析·提供什么 | 单一风格的连贯图标家族：六种字重（thin/light/regular/bold/fill/duotone）数千枚图标，SVG/Font 双格式，React/Vue/Svelte 等一等支持 |
| 功效分析·适合任务 | 需要字重渐变表达层级的产品图标系统；与 Lucide 二选一的替代系 |
| 功效分析·视觉特征 | 圆润几何、字重系统完整，风格一致性强 |
| 功效分析·内容形态 | 可复制 SVG/组件 + 网页检索 |
| 使用场景示例 | "移动端底部导航要 active 用 fill、默认用 regular" → 站内按字重筛选预览 → 落地对应字重包 |
| 截图示例 | screenshots/shot-phosphor.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Iconify（跨集合聚合）、本地 Lucide（kit 默认） |
| 适用类型 | 图标 / Icons |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；MIT 许可，可商用免署名 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### unDraw（插图 / Illustration）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://undraw.co |
| 功效分析·提供什么 | 开源插画库：500+ 现代扁平场景插画（科技/商务/沟通/抽象概念），输入品牌色即时全套换色，SVG/PNG 免费下载 |
| 功效分析·适合任务 | 空状态/引导页/落地页需要成套插画且颜色须贴品牌时的第一站 |
| 功效分析·视觉特征 | 现代扁平、人物比例统一，成套使用一致性好；风格常见需靠换色与场景挑选避俗 |
| 功效分析·内容形态 | 可下载 SVG/PNG 素材（开源许可） |
| 使用场景示例 | "SaaS 空状态要成套插画且主色 #2F27CE" → 站内设主色 → 挑 search/empty/file 类场景 → 下载 SVG 入生产 |
| 截图示例 | screenshots/shot-undraw.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | toools.design（插图类别下更多备选库清单） |
| 适用类型 | 插图 / Illustration |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；开源许可、免署名、可商用（站方明示"open license"）；"不要照抄 unDraw 本站设计"为站方唯一限制 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Poly Haven（3D 素材 / 3D assets）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://polyhaven.com |
| 功效分析·提供什么 | 公共 3D 素材库：2026-09 公开 API 实测 2,370 项资产——521 模型、856 套 PBR 贴图、993 张 HDRI，全部 CC0，照片扫描 8K+ 贴图与 16K+ HDRI |
| 功效分析·适合任务 | 3D 场景的真实感光照（HDRI）、材质与道具；需要可入生产且授权零负担的素材 |
| 功效分析·视觉特征 | 照片级真实感，质量水位极高 |
| 功效分析·内容形态 | 可下载 3D 模型/贴图/HDRI（CC0） |
| 使用场景示例 | "R3F 产品展示要摄影棚光" → HDRI 分类挑 studio 类 → 下载 4k-8k 版本 → 场景 environment 直接挂载，无署名义务 |
| 截图示例 | screenshots/shot-poly-haven.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Kenney（风格化游戏向）、ambientCG（同类 CC0 贴图站，未收录） |
| 适用类型 | 3D 素材 / 3D assets |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；**全部 CC0**，商用/修改/再分发均无需署名 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Kenney（3D 素材 / 3D assets）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://kenney.nl |
| 功效分析·提供什么 | 游戏就绪素材库：60,000+ 风格化资产、200+ 打包（3D 模型/sprite/UI/音频），风格内聚成套，另有游戏模板与工具 |
| 功效分析·适合任务 | 玩法类 demo/游戏化界面的成套素材；需要同风格大量道具快速拼装（本 kit 地铁跑酷案例已实测用过 Kenney 素材） |
| 功效分析·视觉特征 | 低多边形卡通风、色彩明快、成套一致 |
| 功效分析·内容形态 | 可下载素材包（CC0） |
| 使用场景示例 | "跑酷 demo 要成套障碍与载具" → Assets 按分类挑 pack → 一次性打包下载 → glTF 直接进场景 |
| 截图示例 | screenshots/shot-kenney.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Poly Haven（写实向） |
| 适用类型 | 3D 素材 / 3D assets |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；**全部 CC0**；All-in-1 打包为付费便捷选项但资产本身免费 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Tripo AI 画廊（3D 素材 / 3D assets · 成品模型下载）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://studio.tripo3d.ai/3d-model-gallery/（生成工具主站 www.tripo3d.ai，本条目以画廊为主） |
| 功效分析·提供什么 | 公开成品 3D 模型画廊（站方标称"millions"）：免登录浏览，按类别/标签/搜索检索（动物/角色/载具/建筑/家具等 20+ 类）；**导出需免费账号登录（2026-09-12 实测 Export 弹注册框）**；格式覆盖 STL/3MF（3D 打印）、FBX/OBJ（PBR）、**GLB/USDZ（Web 3D / Three.js / Vision Pro AR 直接可用）**；模型页带作者署名、顶点数、生成提示词与算法版本 |
| 功效分析·适合任务 | 不自己跑生成、直接取成品 3D 资产做网页展示（GLB 进 Three.js/R3F 场景）、原型占位、3D 打印；生成能力只是次要用途 |
| 功效分析·视觉特征 | 社区生成质量参差，按推荐排序筛；覆盖写实与低多边形风格 |
| 功效分析·内容形态 | 可下载 3D 模型文件（需账号）+ 分类画廊 + 每模型元数据 |
| 使用场景示例 | "落地页要一个可旋转 3D 模型但不想自己生成" → 画廊按类别/搜索挑 2-3 个候选 → 登录导出 GLB → 场景挂载并在 SOURCES.md 记录模型页 URL、作者署名与非商用边界 |
| 截图示例 | screenshots/shot-tripo3d.jpeg（2026-09-12，Playwright 实拍主站首页；画廊页另有核验留痕） |
| 镜像替代 | Poly Haven（写实 CC0 无署名义务）、Kenney（风格化 CC0 成套）、Sketchfab CC0 筛选（未立条） |
| 适用类型 | 3D 素材 / 3D assets |
| 可达性与授权 | 浏览免登录、**导出需免费账号**（2026-09-12 实测）；curl 000（TLS 拦脚本）浏览器正常。**授权边界（定价页 2026-09-12 现行口径）**：免费档产出为"公开模型 · 非商业使用"，Tripo 官方博客/帮助中心称公开模型 CC BY 4.0（署名可从模型页作者名获得）；**画廊下载物默认按非商用+署名处理，涉商用或私有须专业档（¥140/月起）**。站方口径存在"帮助中心 CC BY 4.0"与"定价页非商业"并行的模糊带，入生产前以导出当时条款为准 |
| 加入日期 / 来源 | 2026-09-12 / 用户提议（tripo3d.ai，用户明确要画廊成品而非生成工具） |

### ScreensDesign（移动端 / Mobile patterns；原 UI Sources / Design Vault）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://screensdesign.com（uisources.com 与 designvault.io 均已 301 至此，勿重复立条） |
| 功效分析·提供什么 | 头部 iOS 应用设计库：首页实测标称 2,634 个榜首应用，完整会话录像（首屏→引导→付费墙→购买后）、付费墙/引导流拆解、收入信号与分类筛选；另带 AI 屏幕生成器 |
| 功效分析·适合任务 | 移动端转化路径研究：onboarding 节奏、付费墙话术与结构、留存模式 |
| 功效分析·视觉特征 | 商业导向强，案例为真实上榜产品 |
| 功效分析·内容形态 | 流程视频录像 + 截图 + 拆解文章 + AI 生成入口 |
| 使用场景示例 | "订阅制 App 的付费墙怎么设计" → 按 paywall 类别筛高收入案例 → 看完整录像的步骤数与升级点 → 拆 2-3 个结构回门 B |
| 截图示例 | screenshots/shot-screensdesign.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Mobbin（库内索引站，部分付费）、Pttrns（库内索引站） |
| 适用类型 | 移动端 / Mobile patterns |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；免费浏览为主，深度内容或需注册/付费，逐条使用前核验；案例版权归原 App |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Nicelydone（流程 / UX flows）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://nicelydone.club |
| 功效分析·提供什么 | Web 应用 UX/UI 模式灵感库：按模式分类的真实 SaaS 交互示例（onboarding、账单、设置、空状态等），可按产品类型检索 |
| 功效分析·适合任务 | 后台/工具类产品的交互模式选型；Pageflows 被拦时的 web 端流程替位 |
| 功效分析·视觉特征 | 现代 SaaS 产品为主，模式切片粒度细 |
| 功效分析·内容形态 | 交互模式截图/录像 + 分类检索 |
| 使用场景示例 | "工作台要设计团队邀请流" → 按 onboarding/invites 类别筛 → 对比 3 个真实产品的步骤与默认值 → 产出流程草案 |
| 截图示例 | screenshots/shot-nicelydone.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Pageflows（库内索引站，403 需真实浏览器）、ScreensDesign（移动端向） |
| 适用类型 | 流程 / UX flows |
| 可达性与授权 | curl 403（脚本拦截）、**浏览器正常加载**（2026-09-11 实测）；freemium，部分内容需注册/会员，逐条核验；案例版权归原产品 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### DesignSystems.one（设计系统 / Design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.designsystems.one |
| 功效分析·提供什么 | 真实设计系统目录：107 个系统（Carbon/Polaris/shadcn/Ant/GOV.UK 等），每条含工程侧写（技术栈、token 管线、源码模型）、截图与可下载 design.md，锚定系统带编辑深拆 |
| 功效分析·适合任务 | 设计契约写作的对照库：看成熟系统如何组织 token 与组件层次；为契约找同规模系统的结构模板 |
| 功效分析·视觉特征 | 目录型站点，收录对象为企业级与开源系统并重 |
| 功效分析·内容形态 | 系统条目 + 截图 + design.md 下载 + 编辑拆解 |
| 使用场景示例 | "给中后台写设计契约" → 筛 dashboard/enterprise 类系统 → 读 Carbon 的 token 管线侧写 → 下载 1-2 份 design.md 对照结构 |
| 截图示例 | screenshots/shot-designsystems-one.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Design Systems Repo（库内索引站）、awesome-design-md（库内索引仓库） |
| 适用类型 | 设计系统 / Design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；目录免费；各系统内容授权归原组织，改编关系而非照搬文本 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### toools.design（工具索引 / Tools directory）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.toools.design |
| 功效分析·提供什么 | 设计工具与资源总目录：按类别（开源插画、图标集、渐变/背景、形状/纹理、排版等）维护的大型清单，免费/付费分栏标注 |
| 功效分析·适合任务 | 某类素材/工具在库内没有条目时的发散查找入口；为具体任务发现新的候选站再走扩充流程 |
| 功效分析·视觉特征 | 目录聚合站，收录质量有筛选但深度参差，须逐链接核验 |
| 功效分析·内容形态 | 链接清单 + 分类导航 |
| 使用场景示例 | "需要 3D 插画但库内无条目" → 站内开 3D Illustration 分类 → 挑 2-3 个候选 → 逐站功效分析后按扩充流程决定是否立条 |
| 截图示例 | screenshots/shot-toools-design.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Awesome-Design-Tools（库内索引仓库） |
| 适用类型 | 工具索引 / Tools directory |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；目录免费，所链工具/素材各自授权自核 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（用户定向网络调研批次） |

### Ant Design（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://ant.design（仓库 ant-design/ant-design） |
| 功效分析·提供什么 | 蚂蚁集团企业级 UI 设计语言与 React 组件库，GitHub 99k+ star 的中后台事实标准；首页实测已到 v6.6（React 19 支持、AI 友好、官方 MCP 服务），设计规范/组件文档/物料市场齐全，中英双语 |
| 功效分析·适合任务 | 中后台/运营系统选型基线；表格、表单、列表等数据密集场景的交互规范参考 |
| 功效分析·视觉特征 | 克制、密度高、规范文档极完整，设计价值观与 token 体系可直接对照 |
| 功效分析·内容形态 | 设计规范文档 + 可复制组件代码 + 设计资源（Figma/Sketch） |
| 使用场景示例 | "审批后台要复杂表格的筛选/批量操作规范" → 查 Design 模块 Table 规范与 demo → 摘交互规则进契约 → 组件层按许可直接用 |
| 截图示例 | screenshots/shot-ant-design.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | TDesign、Arco Design（同类企业级体系） |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；MIT，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### TDesign（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://tdesign.tencent.com（仓库 Tencent/tdesign） |
| 功效分析·提供什么 | 腾讯开源企业级设计体系，仓库自述即 "Enterprise Design System"；一次体系覆盖 React/Vue/Web/移动端/小程序多技术栈，含设计指南与 Figma 资源 |
| 功效分析·适合任务 | 需要多端统一规范的项目；国内企业语境下的中后台基线 |
| 功效分析·视觉特征 | 现代、中性、规范文档按端分站，体系完整度高于多数同类 |
| 功效分析·内容形态 | 设计指南 + 多栈组件代码 + 设计资源 |
| 使用场景示例 | "同一套后台要 Web+小程序两套实现" → 按端进对应子站 → 对比同一组件在两端的规范差异 → 契约里写通用规则与端内例外 |
| 截图示例 | screenshots/shot-tdesign.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Ant Design、Arco Design |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；MIT，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Semi Design（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://semi.design（仓库 DouyinFE/semi-design） |
| 功效分析·提供什么 | 抖音前端开源的现代设计系统与 React 组件库：3,000+ Design Tokens、Design-to-Code、主题化工具 DDS，官方自述 AI-friendly |
| 功效分析·适合任务 | 需要深度定制主题 token 的产品；研究 token 驱动与 AI 时代设计系统的实现方式 |
| 功效分析·视觉特征 | 现代轻盈、动效细腻，与 Ant Design 气质差异化 |
| 功效分析·内容形态 | 设计规范 + 组件文档 + 主题工具（交互式站点） |
| 使用场景示例 | "要为产品做深色+品牌色双主题" → 站内体验 DDS 主题编辑 → 参考 token 分层命名 → 契约里落 token 结构 |
| 截图示例 | screenshots/shot-semi-design.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Arco Design、Ant Design |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；GitHub 许可识别为 NOASSERTION（LICENSE 含附加条款），**作为依赖引入前逐条核对 LICENSE**，参考研究不受限 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Arco Design（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://arco.design（仓库 arco-design/arco-design） |
| 功效分析·提供什么 | 字节跳动企业级产品设计解决方案：React/Vue/移动端多栈组件库 + 图标库 + 主题商店 + 物料市场 |
| 功效分析·适合任务 | 中后台系统基线；需要现成物料/模板拼装时 |
| 功效分析·视觉特征 | 现代中性、信息密度适中，字节系产品同源 |
| 功效分析·内容形态 | 设计规范 + 组件代码 + 物料/模板 |
| 使用场景示例 | "数据看板要折线/柱状图表规范" → 查组件与物料里的图表区块 → 摘布局与配色规则 → 按许可装配 |
| 截图示例 | screenshots/shot-arco-design.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Semi Design、TDesign |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；MIT，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Carbon Design System（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://carbondesignsystem.com（仓库 carbon-design-system/carbon） |
| 功效分析·提供什么 | IBM 开源设计系统：设计指南（含 AI 公平、数据可视化专项指南）、token 体系、Web Components/React/Vue 等多栈实现与 Figma 工具链 |
| 功效分析·适合任务 | 企业级规范方法论研究：guidelines 深度（图表、空状态、内容指导）是标杆；大型系统 token 架构参考 |
| 功效分析·视觉特征 | IBM 平面网格风、对比强烈、文档教育性极强 |
| 功效分析·内容形态 | 设计指南 + token + 多栈组件代码 + Figma 库 |
| 使用场景示例 | "后台图表配色没把握" → 查 Carbon Data Visualization 指南 → 摘系列色顺序与语义色规则 → 契约落 token |
| 截图示例 | screenshots/shot-carbon.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Fluent UI、DesignSystems.one（目录） |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；Apache-2.0，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Fluent UI（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://developer.microsoft.com/en-us/fluentui（仓库 microsoft/fluentui；react.fluentui.dev 为组件 Storybook） |
| 功效分析·提供什么 | 微软官方设计系统实现：React v9 组件库 + Web Components，Microsoft 365 同源，跨平台设计指南（web/iOS/Android/macOS） |
| 功效分析·适合任务 | 企业办公场景组件规范；需要平台横贯（Win/Mac/移动）一致性的参考 |
| 功效分析·视觉特征 | Fluent 2 语言：柔和深度、圆角、光效克制 |
| 功效分析·内容形态 | 设计指南 + 组件代码 + 平台规范文档 |
| 使用场景示例 | "桌面端产品要有 Office 质感" → 查 Fluent 2 指南的 depth/elevation 规则 → 摘层次与圆角体系 → 契约落 token |
| 截图示例 | screenshots/shot-fluent-ui.jpeg（2026-09-11，Playwright 实拍官方门户） |
| 镜像替代 | Carbon、Primer |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | 浏览器正常加载（2026-09-11 实测；microsoft.github.io/fluentui 旧路径已迁）；仓库许可 GitHub 识别为 NOASSERTION（主流认知为 MIT+附加声明），**引入前读 LICENSE 核实** |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Primer（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://primer.style（仓库 primer/react，体系总仓 primer/primer） |
| 功效分析·提供什么 | GitHub 官方设计系统：primitives token + React 组件 + 设计文档，开发者工具语境的标杆 |
| 功效分析·适合任务 | 开发者产品/文档站风格参考；暗色模式与色板功能层的工程化做法 |
| 功效分析·视觉特征 | 紧凑、功能色语义清晰、暗色模式成熟 |
| 功效分析·内容形态 | 设计文档 + token + React 组件代码 |
| 使用场景示例 | "代码托管类产品要功能色语义" → 查 Primer foundations 的 color 角色 → 摘 success/danger/muted 用法 → 契约落语义 token |
| 截图示例 | screenshots/shot-primer.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Blueprint、Polaris（见 Polaris 条目） |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；MIT，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Polaris（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://shopify.dev/docs/api/polaris（polaris.shopify.com 已 301 至此；原 Shopify/polaris-react-archive 仓库已归档） |
| 功效分析·提供什么 | Shopify 设计体系：merchant/admin 后台的设计规范、组件与 token 文档；React 实现已并入 Shopify 私有 monorepo，公开文档与已发布包仍可用 |
| 功效分析·适合任务 | 电商后台/B 端管理界面规范参考：表单、资源列表、卡片式布局的成熟范式 |
| 功效分析·视觉特征 | 友好克制、内容优先，admin UI 范式教科书 |
| 功效分析·内容形态 | 设计指南 + 组件 API 文档 + token |
| 使用场景示例 | "管理后台要资源列表+筛选器范式" → 查 Polaris 的 Resource list/Index table 指南 → 摘分页、批量、空状态规则 → 契约引用范式 |
| 截图示例 | screenshots/shot-polaris.jpeg（2026-09-11，Playwright 实拍 shopify.dev 文档页） |
| 镜像替代 | Primer、Ant Design |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；已发布包 MIT；React 实现仓 2026 年归档（Deprecated），新代码在私有仓，跟踪以官方文档为准 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Lightning Design System 2（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://www.lightningdesignsystem.com（React 实现 salesforce/design-system-react，BSD-3） |
| 功效分析·提供什么 | Salesforce 企业 CRM 设计系统：SLDS 2 文档站实测持续更新（Summer '26 v3.3），含组件规范、Styling Hook（CSS 变量）体系、平台设计指南；注意旧主仓 salesforce-ux/design-system 已归档，文档站为权威源 |
| 功效分析·适合任务 | 企业级 CRM/业务平台规范；CSS 变量换肤（Styling Hooks）与 Color Modes 的工程做法 |
| 功效分析·视觉特征 | 平台化企业风、规范颗粒度极细 |
| 功效分析·内容形态 | 设计规范 + Styling Hook 索引 + React 组件库（design-system-react） |
| 使用场景示例 | "SaaS 要主题换肤方案" → 查 Styling Hook Index 与 Color Modes → 摘 CSS 变量分层与主题注册做法 → 契约落主题机制 |
| 截图示例 | screenshots/shot-slds.jpeg（2026-09-11，Playwright 实拍 SLDS 2 首页） |
| 镜像替代 | Carbon、Fluent UI |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | 浏览器正常加载（2026-09-11 实测；注意域名是 lightningdesignsystem.com 一整词）；文档站内容参考用途；design-system-react 为 BSD-3 且活跃 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Blueprint（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://blueprintjs.com（仓库 palantir/blueprint） |
| 功效分析·提供什么 | Palantir 开源的桌面端 React UI 工具库：22k+ star，专为数据密集、复杂交互的企业应用设计（表格/日期时间/树/多选等重组件） |
| 功效分析·适合任务 | 数据密集桌面端后台；需要重型交互组件（可编辑表格、时间线）时 |
| 功效分析·视觉特征 | 紧凑深色友好、工具气质浓，专为密屏设计 |
| 功效分析·内容形态 | 组件文档 + 代码 + 图标库 |
| 使用场景示例 | "风控台要可编辑大表格+日期区间" → 查 Table 与 DateRange 组件能力边界 → 决定复用或重写 → 契约记录取舍 |
| 截图示例 | screenshots/shot-blueprint.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Ant Design、EUI |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；Apache-2.0，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### React Spectrum（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://react-spectrum.adobe.com（仓库 adobe/react-spectrum） |
| 功效分析·提供什么 | Adobe 设计系统实现：React Spectrum（组件）、React Aria（无障碍行为钩子）、React Stately（状态逻辑）三库分层；行为与样式分离的架构样本 |
| 功效分析·适合任务 | 无障碍与自适应架构研究：任何技术栈都能借鉴 React Aria 的行为规范；Adobe 系产品气质参考 |
| 功效分析·视觉特征 | Adobe 品牌风、设计细腻，文档对 a11y 行为逐条说明 |
| 功效分析·内容形态 | 设计文档 + 组件/行为库代码 |
| 使用场景示例 | "自研组件库要把 a11y 行为抽离" → 读 React Aria 的 hooks 文档 → 摘键盘/焦点/ARIA 规则 → 自家 hook 层照此实现 |
| 截图示例 | screenshots/shot-react-spectrum.jpeg（2026-09-11，Playwright 实拍首页） |
| 镜像替代 | Carbon、Fluent UI |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | curl 200、浏览器正常加载（2026-09-11 实测）；Apache-2.0，可商用 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |

### Elastic EUI（企业级设计系统 / Enterprise design systems）

| 字段 | 内容 |
| --- | --- |
| 站点 URL | https://eui.elastic.co（仓库 elastic/eui；elastic.github.io/eui 301 至此） |
| 功效分析·提供什么 | Elastic 官方 UI 框架（Kibana 同款）：6k+ star，面向数据可视化与可观测性场景的组件体系，图表/时序/日志类组件齐备 |
| 功效分析·适合任务 | 可观测性/数据分析产品界面参考；暗色数据密集场景 |
| 功效分析·视觉特征 | 数据密集、暗色优先、工程感强 |
| 功效分析·内容形态 | 组件文档 + 代码 + 设计指南 |
| 使用场景示例 | "日志平台要时间范围选择+直方图联动" → 查 EUI 的 DatePicker 与 Stat 组件 → 摘联动规则 → 契约记录交互边界 |
| 截图示例 | screenshots/shot-eui.jpeg（2026-09-11，Playwright 实拍文档首页） |
| 镜像替代 | Blueprint、Primer |
| 适用类型 | 企业级设计系统 / Enterprise design systems |
| 可达性与授权 | 浏览器正常加载（2026-09-11 实测）；仓库许可 GitHub 识别为 NOASSERTION（Elastic 系双许可），**作为代码依赖前必须核对 LICENSE**，参考研究不受限 |
| 加入日期 / 来源 | 2026-09-11 / AI 发现（企业级批次） |
