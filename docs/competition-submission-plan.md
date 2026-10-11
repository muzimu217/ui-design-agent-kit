# 开源大赛参赛提交规划（OSChina）

- 大赛：OSChina 开源创新大赛（组委会邮箱 bjoscc@oschina.cn）
- 截止：**2026-10-31 24:00**
- 参赛作品：UI Design Agent Kit（muzimu217/ui-design-agent-kit）
- 状态：规划 v1（2026-10-10 用户指示：合并参赛分支 + 前期准备；PDF/视频后续撰写）

## 一、提交材料对照表（大赛三件套 → 我方资产）

| 大赛要求 | 我方对应资产 | 状态 |
| --- | --- | --- |
| 01 代码仓库链接（完整可运行） | 主链 `github.com/muzimu217/ui-design-agent-kit`（main 已合并参赛批；一键链路实测；npm test 131/131）；**备选：GitCode** `gitcode.com/muzimu217/ui-design-agent-kit` | ✅ 就绪（README 产品化重写进行中） |
| 02 作品介绍文档（PDF） | 待撰写——大纲已列（见 §二） | ⏳ 规划中 |
| 03 作品演示视频链接 | 现有 intro.mp4 仅 20 秒（偏短）；计划录 2-3 分钟正式演示 | ⏳ 待录制 |

## 二、作品介绍文档 PDF 大纲（参赛赛道：代码类）

1. **项目背景**：AI 生成 UI 的真实痛点——问卷证据（n=4 开发者：越权重写/静默删边界/维护性焦虑）+ 市场信号（B 站 D8-D10、YouTube 88k 对比视频）+ 头部工具谱系（西方四层图谱、国产三强三种 AI 叙事）。
2. **技术架构**：六道门人工确认工作流 + 五级证据等级 + 22 技能指令层 + 一层转换多宿主接入（AGENTS.md/单文件提示词）+ 验收工具族（浏览器六维/对比度实测/131 项测试/73 场景评测台账）。
3. **应用场景**：开发者把口语需求变成可验收界面；任意 AI 宿主（13 家主流宿主接入路径）一键装载 UI 设计纪律。
4. **创新点**：①验证纪律层=行业图谱第四层（前三层工具均未覆盖）；②Change-radius 改动半径纪律（问卷驱动）；③证据链可审计（截图实图复核门/对比度脚本实测/评测台账分数不降才合入）；④开源多端同步+全流程留痕可复核。

## 三、演示视频详细规划（总时长 2:50 ± 10s，1920×1080@30fps，h264）

### 3.1 风格定版（品牌延续：沿用 intro-video 管线既有视觉体系）

| 项 | 定版 | 说明 |
| --- | --- | --- |
| 底色 | 暗夜紫黑 `#0A0A0F` / `#12121A` | 与现有 20s intro 同源，品牌连续 |
| 主色 | 紫 `#7C3AED`（每帧至多一个元素用主色）+ 青 `#22D3EE` 辅 | intro 管线 theme.ts 原封沿用 |
| 字体 | 中文 PingFang SC / 命令 SF Mono | theme.ts fonts 已定义 |
| 动效 | easeOutExpo 入场 + snappy spring（词）/ smooth（大块） | 禁线性；theme.ts ease/spring 已锁定 |
| 音频 | 程序化合成配乐（gen-audio 脚本）+ 烧录中文字幕；中文配音可选（见 3.4） | 与 intro.mp4 同规格 |
| 输出 | 1920×1080@30fps h264 crf16， loudness 正常化 | `remotion render` 现有脚本 |

### 3.2 分镜脚本（8 场景，逐镜到秒）

| # | 时长 | 场景 | 内容与画面 | 素材来源/生产方式 |
| --- | --- | --- | --- | --- |
| S1 | 0:00-0:12 | 片头 | "UI Design Agent Kit" logo + 副题"从一句口语需求，到有证据的可验收界面"；星点粒子入场 | 复用 intro S1 改副题（Remotion） |
| S2 | 0:12-0:32 | 痛点三连 | 三张字幕卡依次砸入：①"改一处，坏另一处" ②"静默删掉边界处理，生产报错" ③"一次改 7 个文件，依赖被换回旧库"——角标注明"来自 4 位开发者问卷原话" | Remotion 字幕卡（Snappy 级联） |
| S3 | 0:32-0:56 | 一键接入实录 | 终端画面打字机效果：`npm install -g github:...` → `uak-init` → "✓ UAK 接入完成（4 actions）" → AGENTS.md 区块特写 | 真实终端执行录屏（Playwright/OS 录屏），命令真实输出 |
| S4 | 0:56-1:16 | 门 A·方向确认 | Agent 会话实录：口语需求输入 → 方向稿要点浮现 → 停在"等待用户确认"（强调人工停点） | 真实会话截图/录屏（ZCode 宿主） |
| S5 | 1:16-1:56 | 浏览器六维验收 | 六宫格同屏递进点亮：桌面 1440 → 移动 390 → 键盘 Tab 高亮 → 对比度实测数字 14.40:1 → reduced-motion → console 0 | Playwright 录屏（demand-insights 或库存台实机） |
| S6 | 1:56-2:14 | 证据与台账 | ACCEPTANCE.md 滚动特写 + 五级证据阶梯 + 评测台账 73/71 数字卡 | 仓库文件实拍截图 + Remotion 数字卡 |
| S7 | 2:14-2:38 | 成果巡览 | 9 案例快剪（每例 ~3s）：brick 3D 搭建 → NODEGRID 地球 → 地铁疾行 → 睿耳 3D → Tempo → 库存台 | 既有 webp/录屏（intro S3 素材复用+补录） |
| S8 | 2:38-2:50 | 片尾 | 三端地址（GitHub/GitCode/Gitee）+ 13 宿主图标带横扫 + "开源 Apache-2.0" | Remotion 片尾（复用 S5Outro 改） |

### 3.3 生成管线（四阶段）

1. **素材采集（A）**：S3/S4 终端与会话实录（真实执行录屏，禁摆拍伪造输出）；S5 Playwright 录屏三段；S7 补录 demo 运行画面。
2. **场景合成（B）**：intro-video/ 管线扩展——新增 scenes/Scene6Pain.tsx、Scene7Install.tsx、Scene8Verify.tsx、Scene9Evidence.tsx（沿用 theme.ts 单一事实源纪律，禁止组件内联颜色）；S2 问卷卡、S8 三端片尾为改造项。
3. **音频（C）**：gen-audio 程序化配乐沿用；中文字幕烧录为默认交付；**中文配音为可选升级**（若派发时视频-agent-kit 云 TTS 可用则加轨，不可用则字幕版交付，不虚构配音能力）。
4. **渲染与 QC（D）**：`remotion render` h264；QC=ffprobe 时长/分辨率核对 + 烧录字幕抽帧检查 + 三端 main 合并后随仓库发布。

### 3.4 验收标准（视频自己的"六道门"）

- [ ] 全片仅第一方素材与真实执行录屏，无摆拍伪造数据
- [ ] 每个数字（131 测试/73 场景/对比度比值）与仓库当前口径一致
- [ ] 字幕烧录完整、无错别字；loudness 无爆音
- [ ] 片尾三端地址与仓库实际一致；13 宿主图标为官方素材
- [ ] reduced-motion 源则：源素材录制时即模拟，不事后伪造

## 四、时间线（三周缓冲）

| 周期 | 事项 |
| --- | --- |
| 10-11 ~ 10-17 | README 产品化重写（仓库门面）；PDF 初稿起草；演示视频脚本+分镜定稿 |
| 10-18 ~ 10-24 | PDF 终稿（评审友好排版）；视频录制与剪辑；三端 main 同步复验 |
| 10-25 ~ 10-31 | 材料打包（仓库链接+PDF+视频链接）；发送 bjoscc@oschina.cn；预留缓冲 |

## 五、打包清单（发送前核对）

- [ ] 代码仓库链接（GitHub 主链接；Gitee/GitCode 镜像备选）
- [ ] 作品介绍 PDF（文件名规范：ui-design-agent-kit-参赛作品介绍.pdf）
- [ ] 演示视频链接（B 站/官方平台）
- [ ] 打包 zip 附邮件正文（报名表回执编号等按组委会邮件指引）

## 六、边界与分工

- PDF 起草/视频剪辑/材料打包：代理执行，**成稿呈用户审定后定版**。
- B 站等平台上传、邮箱发送：**用户本人操作**（账号与邮箱归属用户）。
- 仓库与 main 分支：已由用户指令合并至三端；后续参赛相关改动继续走 dev/auto → 合并流程。

## 六、边界与分工

- PDF 起草/视频剪辑/材料打包：代理执行，**成稿呈用户审定后定版**。
- B 站等平台上传、邮箱发送：**用户本人操作**（账号与邮箱归属用户）。
- 仓库与 main 分支：已由用户指令合并至三端；后续参赛相关改动继续走 dev/auto → 合并流程。

## 七、派发提示词（用户直接复制即可派发执行）

### 7.1 演示视频生成提示词（派发给 remotion-video-agent）

```text
$remotion-video-agent 为 OSChina 开源创新大赛制作参赛演示视频，扩展 intro-video/ 既有 Remotion 管线。

【总规格】1920×1080@30fps，总时长 2:50±10s，h264 crf16，输出 intro-video/out/competition-entry.mp4。分镜脚本、每镜时长、素材来源、验收标准严格遵循 docs/competition-submission-plan.md §3.2 分镜表与 §3.4 验收清单（先读该文档再动工）。

【风格】沿用 intro-video/src/theme.ts 既有视觉体系（暗夜紫黑底 #0A0A0F、紫 #7C3AED 主色每帧至多一元素、青 #22D3EE 辅、PingFang SC、easeOutExpo+snappy spring、禁线性）；禁止在组件内联颜色/缓动，全部走 theme.ts；新增场景文件命名 Scene6Pain/Scene7Install/Scene8Verify/Scene9Evidence。

【素材纪律】全片仅第一方素材：S3/S4 必须使用真实执行录屏（我提供或按脚本实录 npm install -g github:muzimu217/ui-design-agent-kit → uak-init 的真实输出，禁摆拍伪造）；S5 用 Playwright 对 demo/inventory-console 或 demand-insights 实机录制六维验收画面（对比度数字必须是脚本实测值）；S7 复用 showcase/products/media 既有 webp。片尾三端地址：GitHub github.com/muzimu217/ui-design-agent-kit、GitCode gitcode.com/muzimu217/ui-design-agent-kit、Gitee gitee.com/muzimu217/ui-design-agent-kit。

【音频】gen-audio 程序化配乐沿用；中文烧录字幕按分镜表逐句写；云 TTS 配音仅在可用时加轨，不可用则如实按字幕版交付。

【验收】渲染后 ffprobe 核对时长/分辨率；逐场景抽帧检查字幕与数字；所有数字与仓库当前口径一致（131 测试/73 场景台账/71 已入账）；完成后输出帧索引与 QC 报告，停在交付门前等我确认。
```

### 7.2 作品介绍 PDF 生成提示词（派发后执行）

```text
按 docs/competition-submission-plan.md §二 的大纲生成《UI Design Agent Kit 参赛作品介绍》PDF（中文，A4，评审友好排版，10-14 页）。

【结构】封面（项目名+一句话定位+仓库三端地址）→ 项目背景（问卷 n=4 痛点原话+市场信号数据，引 docs/uak-demand-capability-gap-roadmap.md）→ 技术架构（六道门工作流图+五级证据等级+22 技能指令层+一层转换多宿主接入，配 docs/design-logic-map.html 同源架构图）→ 应用场景（13 宿主接入矩阵，引 showcase 工作台）→ 创新点四条（验证纪律层/Change-radius/证据链可审计/多端开源同步）→ 交付与验证（131 测试/73 场景台账/对比度实测方法）→ 团队与开源声明（Apache-2.0，三端地址）。

【数据纪律】所有数字以仓库当前口径为准（131/73/71/22/13），引用问卷原话标注"来自回收问卷忠实转录"；禁止虚构用户数、star 数或任何未发生的事。

【视觉】专业评审向：浅色底、章节编号、图表优先用仓库已有截图与架构图，页脚页码；生成后转 PDF 并逐页渲染检查排版溢出，停在交付门前等我确认。
```

### 7.3 派发方式

两份提示词由用户复制后在本会话（或新会话）发出即派发执行；代理产出停在交付门前，成稿经用户审定后定版上传。
