---
name: 积木小工坊
description: 冷色工作台与彩色塑料积木的单页创作界面
colors:
  ink: "#26343d"
  muted: "#61717d"
  paper: "#fafcfd"
  surface: "#f2f5f7"
  line: "#d9e2e7"
  green: "#177656"
  green-soft: "#e7f3ed"
  focus: "#2566c4"
typography:
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
    fontSize: "22px"
    fontWeight: 720
    lineHeight: "28px"
    letterSpacing: "0"
  control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
    fontSize: "13px"
    fontWeight: 570
    letterSpacing: "0"
rounded:
  control: "6px"
  brick-tile: "7px"
  dialog: "8px"
spacing:
  tight: "4px"
  group: "8px"
  panel: "16px"
components:
  tool-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
  tool-button-active:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
---

# 当前视觉系统

## Overview

从实际可玩版源码和浏览器截图提取，由主代理记录。保留用户已批准的明亮玩具工作台方向：
3D 作品主导画面，工具保持安静；不加入参考拼板的解释文字或示例模型。

## Colors

绿色用于当前工具、确认和保存，冷色中性面承载编辑区域。积木使用领域模块的独立 12 色，
不是把绿色套在每个对象上。选中状态同时使用边框、勾选和文字状态。

## Typography

中文系统无衬线；标题、控件、计数与辅助信息有明确比例。手机标题为 18px。
字距为零。紧凑砖型标签在桌面为 11px、手机为 10px；标签换行时撑开网格行，不越出按钮。
这记录实际实现，不把紧凑字号扩大为其他产品的通用规则。

## Layout

桌面为顶部导航、左侧积木盒与主工作台。常用桌面侧栏 252px，中间档 228px，宽屏 268px。
主画布位于工具和编辑栏之间。639px 以下积木盒移到下方，展开会真实减少画布空间并触发相机重构图。
积木列表自身滚动；网格行按内容高度计算，保留默认最小高度。页面不靠横向溢出容纳工具。

## Elevation & Depth

大区域平面分区。对话框和展开操作有柔和阴影，选中标签轻微抬升。
主要空间感来自 Three.js 的有倒角几何体、真实凸点、非金属塑料与接地阴影。

## Shapes

工具为稳定矩形图标按钮，颜色为圆形色板，模式为分段控件。重复积木项保持小圆角；
主工作区不放进装饰卡片，侧栏不是多层浮动卡片。

## Components

工具具备可访问名称、悬停提示和禁用状态；普通工具及色板触控目标至少 44px。
砖型缩略图来自同一个程序化几何体库。选中砖可编辑，候选砖使用半透明预览和有效性状态。
主画布是按需渲染的正交场景，全景、缩放和旋转有显式控件。
确认放置使用短小弹性反馈；减少动效时立即进入最终姿态。
原生 dialog 保护需要确认的操作，并恢复焦点。

## Do's and Don'ts

- 保持作品可检查、控件可操作，状态与动画分离。
- 保持可用空间变化后的完整构图、触屏确认和坐标替代路径。
- 保持同源砖型、几何、颜色与缩略图的一致性。
- 不把网格接合作为真实物理承重，不把本机存档称为云同步。
- 不引入 LDraw 示例模型、木纹截图、营销段落或不相关背景特效。

实际测试范围及未验证项见 `docs/ACCEPTANCE.md`。
