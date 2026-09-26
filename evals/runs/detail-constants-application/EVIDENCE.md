# EVIDENCE · detail-constants-application（2026-09-26 执行）

门径：门A passed（docs/gates.md §六 2026-09-26 行；DIRECTION.md 裁决行"门禁通过"）。
无外部素材引入 → 门B 不适用（M 档规则）。实现后 detail-critique 内环 + 浏览器实测。

## 逐判据证据（passCriteria → 常量引用 → 实测）

1. **tabular-nums**（常量：detail-constants.md「计数器用等宽数字」条 + font-feature "tnum"）
   实测：`#v1` computed `font-variant-numeric: tabular-nums`、`font-feature-settings: "tnum"`。
   计数器每 1.2s 真实刷新（app 内 setInterval），等宽保证无横向抖动。
2. **同心圆角**（常量：detail-constants.md「同心圆角：外 = 内 + padding」）
   实测：`.card` radius 20px / padding 12px；`.card-inner` radius 8px——20 = 8 + 12 ✓（compute 断言 concentricOk=true）。
3. **按压 preset + 命中区**（权威：motion-contract.md press preset，R104-01 裁定动效数值唯一权威；命中区 detail-constants ≥44px）
   实测：`.btn:active { transform: scale(0.98) }`（cssRules 扫描命中；键盘 Enter/Space 激活同效）；
   `.btn` computed `min-height: 44px`（触屏 44 / 密集桌面 40 地板之上）。
4. **逐属性过渡**（常量：detail-constants.md「禁 transition: all」）
   实测：`.btn` computed `transition-property: transform, background-color`（无 all）；`will-change: auto`（未设置）；
   高频计数更新无 stagger、无入场动画（规则：高频交互不做自定义动画）。

## 对比度实测（WCAG 比率，Python 亮度计算）

| 文字对 | 比率 | 结论 |
| --- | --- | --- |
| ink #26343d / card #ffffff | 12.80:1 | AA ✓ |
| muted #61717d / card #ffffff | 5.04:1 | AA ✓ |
| ink / surface #f2f5f7 | 11.69:1 | AA ✓ |
| white / 按钮 green #177656 | 5.58:1 | AA ✓ |

## 截图

- `evidence/acc-desktop-1280.png`（1280 桌面）
- `evidence/acc-mobile-390.png`（390 移动，单列布局）

## 遗留（如实）

- 200% 文本缩放未做专项检查（styleReview 鲁棒性记 1）。
- reduced-motion 块已加（.btn 过渡/按压归零）。
