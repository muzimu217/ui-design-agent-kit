# CSS or Motion

Pick the simplest tool that does the job well cross-browser. When animations are going to be interrupted with other gestures or state changes Motion is usually better thanks to its spring physics-based animations.

| Effect | Use | Reason |
| --- | --- | --- |
| Hover, focus and press states | Depends | Motion: Handles interplay with other gestures, gesture detection closer to app quality. Related APIs: React/Vue `whileHover`, `onHoverStart`, `onTap`, `whileTap` etc. Vanilla: `press`, `hover` |
| Independent transforms (x, y, z, rotate) | Motion | Motion animates with physics springs by default, independent transforms interruptible by default | 
| Simple colour, shadow or opacity change when a class changes | Often CSS `transition` |  |
| Fade or slide in when an element mounts | CSS `@starting-style` or `@keyframes` if not also animating further state changes/interrupts. Motion otherwise. |  |
| Spinners, skeleton shimmer, simple infinite loops | Usually CSS `@keyframes` unless requires interruption | |
| Element leaves the DOM with an animation | Motion `AnimatePresence` with `exit` | React and Vue remove the element at once, so CSS has no time to animate it |
| Size or position changes from layout (list reorder, grid change, card expands) | Motion `layout` | CSS cannot animate between two layouts. View transitions API doesn't handle interruption well |
| One element moves between two places (tab indicator, card to modal) | Motion `layoutId` | Shared-element animation across components |
| Height to or from `auto` | Motion `animate={{ height: "auto" }}` | CSS needs `interpolate-size`, so check browser support before you use it |
| Drag, swipe, drag to reorder | Motion `drag`, `Reorder` | Pointer tracking, constraints and release velocity |
| Toggles that users hit many times, gestures that release with speed | Motion springs | Springs keep their velocity when interrupted |
| Staggered lists | CSS `transition-delay` for short fixed lists, Motion `stagger()` for dynamic lists or exits | |
| Scroll progress, parallax | `scroll` or `useScroll` uses hardware acceleration automatically where browser supports it, handles non-DOM animations | Motion also works when the value drives JavaScript |
| Entrance when scrolled into view | Motion `whileInView` or `inView` |  |
