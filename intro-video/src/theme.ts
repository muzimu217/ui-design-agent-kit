// theme.ts — 单一事实来源。禁止在组件里内联颜色/缓动/弹簧配置。
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#0A0A0F",
    bgAlt: "#12121A",
    primary: "#7C3AED", // 唯一主角色——每帧至多一个元素使用
    accent: "#22D3EE",
    text: "#F4F4F5",
    textDim: "#A1A1AA",
    glow: "rgba(124, 58, 237, 0.4)",
  },
  fonts: {
    // 中文走系统 PingFang SC（高质感且渲染零网络依赖），西文走系统 SF 展示字重
    display: `"SF Pro Display", -apple-system, "PingFang SC", "Helvetica Neue", sans-serif`,
    body: `-apple-system, "PingFang SC", sans-serif`,
    mono: `"SF Mono", ui-monospace, Menlo, monospace`,
  },
  // 全片仅用这些缓动曲线。禁线性。
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo — 入场
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // Ken Burns / 位移
    in: Easing.bezier(0.7, 0, 0.84, 0), // 仅用于退场
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 }, // 词、小件
    smooth: { damping: 20, stiffness: 90, mass: 1 }, // 大块
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 }, // logo、点缀
  },
} as const;
