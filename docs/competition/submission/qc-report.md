# 参赛材料生成 QC 报告（2026-10-11）

## 一、演示视频 out 竞赛成片

- 文件：`intro-video/out/competition-entry.mp4`（37.6 MB）
- ffprobe 实测：**166.25s（2:46）**、1920×1080、30fps、h264 + AAC 48kHz 立体声
- 分镜对照（8/8 完成，7 个关键帧逐帧亲验通过）：
  - S1 片头（Spark+主标）✓ 3s 帧
  - S2 问卷痛点三连卡 ✓ 20s 帧（含"非统计样本"如实角标）
  - S3 一键接入终端重演 ✓ 40s 帧（角标"文本取自真实执行记录"）
  - S4 门 A 方向稿+停点横幅 ✓ 65s 帧
  - S5 六维验收宫格（demand-insights 实测截图+对比度 14.40:1）✓ 90s 帧
  - S6 证据阶梯+131/73/71 计数（f110 抽验）
  - S7 八案例快剪 KenBurns ✓ 140s 帧
  - S8 三端地址+11 宿主官方图标带 ✓ 160s 帧
- 已知限制（如实）：① 配乐为 20s 主题循环 9 遍，节拍不追剪点；② S3 为终端重演（非录屏），已加角标声明；③ 无配音旁白（中文信息由画面文字承载）。
- 复渲命令：`cd intro-video && npm run gen-audio && npx remotion render src/index.ts CompetitionEntry out/competition-entry.mp4 --codec h264 --crf 16`

## 二、作品介绍 PDF

- 文件：`out/competition/ui-design-agent-kit-competition-intro.pdf`（17 页 / 4.1 MB / A4）
- 源文件：`out/competition/entry.html`（改后重打印：仓库根 `python3 -m http.server 4210` → Playwright 打印 PDF）
- 结构：封面 → 背景（问卷原话+市场信号）→ 架构×2（六道门/五级证据/13 宿主/一层转换）→ 应用场景 → 创新点四条 → 验证数据（含两页实测截图）→ 案例×2（8 图）→ 诚实边界+开源声明
- 抽验：封面/架构/案例三节截图亲验排版正常；全部截图为第一方资产；数字口径 131/73/71 与仓库一致
- 未做：逐页人工通读（待用户审定）；PDF 内链接为文本（大赛要求"链接"可为文本）

## 三、代码改动清单（留在 dev/auto 工作区，未提交——按用户指示由用户提交）

- 新增 `intro-video/src/scenes/Scene6Pain.tsx` ~ `Scene12Outro.tsx`（7 个场景）
- `intro-video/src/Root.tsx`：新增 CompetitionEntry Composition（4986 帧）
- `intro-video/public/media/`：新增 9 张一方 webp + 2 张实测 png + hosts/ 11 图标（均为仓库内资产拷贝，无外部素材）
- 生成物（gitignore 内，不入库）：competition-entry.mp4、sfx/、out/competition/*.pdf|html

## 四、用户待办

1. 亲验视频（建议全片看一遍，重点 65s/90s 两段）与 PDF（17 页）
2. 视频上传 B 站取链接；PDF 直接作为附件
3. 邮件打包发送 bjoscc@oschina.cn（截止 10-31 24:00）
