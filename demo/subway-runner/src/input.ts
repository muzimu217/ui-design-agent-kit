/** 输入层：键盘 + 触屏/指针滑动（分类逻辑在 swipe.js，可被 node --test 直测）。 */
import { classifySwipe } from "./swipe.js";

export type Action = "left" | "right" | "up" | "down" | "pause";

const KEY_MAP: Record<string, Action> = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up", Space: "up",
  ArrowDown: "down", KeyS: "down",
  Escape: "pause", KeyP: "pause",
};

export function createInput(onAction: (a: Action) => void, surface: HTMLElement): { dispose(): void } {
  const onKey = (e: KeyboardEvent) => {
    const a = KEY_MAP[e.code];
    if (!a) return;
    if (e.repeat && a !== "pause") return; // 按住不放不连发（换道/跳都是离散动作）
    if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
    onAction(a);
  };
  addEventListener("keydown", onKey);

  let sx = 0, sy = 0, tracking = false;
  const down = (e: PointerEvent) => {
    tracking = true;
    sx = e.clientX;
    sy = e.clientY;
  };
  const up = (e: PointerEvent) => {
    if (!tracking) return;
    tracking = false;
    const dir = classifySwipe(e.clientX - sx, e.clientY - sy, 28);
    if (dir) onAction(dir as Action);
  };
  surface.addEventListener("pointerdown", down);
  addEventListener("pointerup", up);
  addEventListener("pointercancel", () => { tracking = false; });

  return {
    dispose() {
      removeEventListener("keydown", onKey);
      surface.removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
    },
  };
}
