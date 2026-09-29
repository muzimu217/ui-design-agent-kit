# EVIDENCE.md · remotion-render-scope（R149-01 批次十二）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 188 日间。
> 场景：竖屏可编辑视频（戏剧性转场），**仅预览——不导出、不部署**。

## 一、官方文档 skills（判据 1）

库内 vendored Remotion skills 一手使用（sources.lock 在册）：
- `remotion-best-practices`（帧时钟契约）、`remotion-studio`（Studio 预览）、`remotion-render`
  （still/渲染边界——本批仅 still 不渲染）
- **废弃 @remotion/mcp 未安装**（.codex/config.toml 明确 absence，如实保持——failCondition #1 防线）
- **Motion+ 订阅无关联**：转场为原创公共 API（clipPath 斜切+帧插值），零 UNLICENSED 元数据依赖
  （failCondition #2 防线）

## 二、版本对齐（判据 2）

remotion 4.0.370 / @remotion/cli 4.0.370 / react 18.3.1——teaser 工程 package-lock 在册，
复用批次一运行时零版本漂移、零新安装。

## 三、竖屏格式与转场端点/中点检视（判据 3）

PortraitStory composition：**1080×1920 竖屏** @30fps 120 帧（4 秒）。
evidence/ 四帧检视（含转场端点/中点）：

- portrait-000.png：幕 A「晨光」起（MORNING SERIES + 渐变卡）
- **portrait-060.png：转场中点**——三道斜条（ink/green/ink）以 clipPath 斜切推过晨光幕
- portrait-090.png：幕 B「谷底」推入（CANYON SERIES + 墨底图形卡）
- portrait-119.png：末帧收敛

转场实现：纯帧插值 clipPath 斜切（45-72 帧，三道错帧 4 帧）——**零 Motion hover 替代帧时钟**
（failCondition #4 防线）；媒体为品牌图形卡（授权本地媒体以图形模拟，评测语境披露）。

## 四、实际 Studio URL（判据 4）

`http://localhost:3011/portrait-story`（Studio 实机运行截图：
evidence/studio-portrait-url.png）——组合在 Studio 中可编辑、时间轴可见。
**全程未导出、未部署、未产出 MP4**（failCondition #3 防线）。

## 五、诚实边界

- 授权本地媒体以品牌图形卡模拟（评测语境披露；真实委托替换为授权照片/视频素材）
- 斜切转场为 clipPath 硬边戏剧风（转场中点帧检视确认）；柔和风格变体属后续可编辑方向
