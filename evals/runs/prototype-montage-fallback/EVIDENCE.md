# EVIDENCE.md · prototype-montage-fallback（R149-01 批次二十七）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 205 系。
> 场景本质：**生图降级路径**——锁定计划要第一版无代码原型，图片生成不可用，考
> "声明一次降级不阻塞+真实截图蒙太奇+来源标注+停在原型门"。

## 一、降级声明一次（failCondition #4 防线）

生图不可用**声明一次即降级**（未反复重试消耗调用）；降级路径记入验收记录（EVIDENCE 本
节 + montage-board.html 板内声明）。**未因生成失败转写实现代码**（failCondition #1 防线）。

## 二、真实截图蒙太奇（判据 2/3）

montage-board.html 三面板，全部真实截图（Playwright 实拍 + 库内自有资产）：
1. GOV.UK error-message 组件页（表单校验模式参考，OGL-3.0）——上轮 primary 之首实拍
2. shadcn/ui Form 组件文档（MIT，源码可检）——上轮 primary 之二实拍
3. 库内自有交付物运营台（evals/runs/operations-not-marketing/evidence/，自有资产零授权问题）
**每图标注来源 URL + 参考状态**（"参考用·非生产素材"/"自有资产·水位对照"）——
failCondition #3 防线：画廊截图不当生产素材。

## 三、停在原型门（判据 4 + failCondition #5 防线）

板内门声明：「停在原型门（门C）：等你裁决。未写任何实现代码」——零 script 逻辑块
（断言实证：页面 script 数=0）。

## 四、验证（8/8，evidence/montage-verify.mjs 可复跑）

三图 naturalWidth>0 / 每图来源 URL 标注 / 参考状态标注 ×2 / 降级声明 / 原型门声明 /
零 script / 375 零溢出 / console 0。

## 五、工件清单

- montage-board.html——无代码原型拼贴板（场景交付物本体）
- montage-assets/——三源真实截图
- evidence/montage-verify.mjs——断言脚本（可复跑）
- EVIDENCE.md——本元记录

## 六、诚实边界

- 三参考图来源：GOV.UK/shadcn 为公开文档页实拍（上轮 primary 实查过的源）；运营台为库内
  自有资产——零外部素材未经授权整合
- 拼贴板视觉为功能性排布（非美术成品）；美术层在用户裁决拼贴方向后的实现轮处理
