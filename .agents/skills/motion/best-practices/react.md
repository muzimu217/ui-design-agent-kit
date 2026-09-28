# Motion for React

Rules for using Motion in React and TypeScript projects. Framer Motion is now called Motion for React — all Framer Motion knowledge applies.

## Importing

-   **Never** import from `framer-motion`.
-   Import from `motion/react` in client components.
-   In server components, import `motion` like: `import * as motion from "motion/react-client"`
-   `motion/react-client` only provides `motion` elements. Hooks, `AnimatePresence` and `MotionConfig` need a client component (`"use client"`).
-   Files marked `"use client"` must import from `"motion/react"`.
-   The `animate` function: import from `"motion/react"` in React files, from `"motion"` elsewhere.

## MotionValues

-   **Never** read from a `MotionValue` in a render. Only read in effects/callbacks.
    -   OK: `useTransform(() => value.get())`
    -   Bad: `propName={value.get()}`

## React Patterns

-   Compose chains of `useTransform`, `useSpring`, `useMotionValue`, and `useVelocity` rather than complex imperative logic
-   Prefer `willChange` over `transform: translateZ(0)`
-   When animating MotionValues:
    -   Use `animate()` to animate the source MotionValue directly
    -   Don't use the `transition` prop when values are driven by MotionValues via `style`
    -   Derived values (via `useTransform`, `useSpring`) automatically follow the source animation

## `useTransform`

Two current syntaxes:

1. `useTransform(value, inputRange, outputRange, options)` — prefer this
2. `useTransform(() => otherMotionValue.get() * 2)` — function syntax

**Deprecated** (never use): `useTransform(value, (latestValue) => newValue)`

## Versions

Motion for React v12 and v13 have the same API. The only breaking change in v13: `motion` components no longer detect `@emotion/is-prop-valid` on their own. With styled-components or Emotion, pass it to `MotionConfig` as `isValidProp`, or wrap the styled component with `motion.create()`.

## Reduced motion

Put one `MotionConfig` near the app root:

```jsx
<MotionConfig reducedMotion="user">
    <App />
</MotionConfig>
```

`reducedMotion="user"` turns off transform and layout animations for people who ask for reduced motion, and keeps opacity and colour animations.

## `AnimatePresence`

-   Keep `AnimatePresence` mounted. Put the condition inside it, and give each direct child a stable, unique `key`.
-   `mode="wait"` finishes the exit before the next child enters. Use it when content swaps in one place.
-   `mode="popLayout"` takes exiting children out of the layout at once, so siblings with `layout` move into the space. The parent needs a `position` other than `static`. A custom component child must pass its `ref` to the DOM element.

## Layout animations

-   Add `layout` to an element whose size or position changes after a render. Motion animates the change with transforms.
-   For one element that moves between two places (for example a tab indicator), give both the same `layoutId`. Render it in the new place and remove it from the old place in the same update.
-   When a component can appear more than once on a page, make its `layoutId` unique per instance, for example with `useId()`. Otherwise all instances share one indicator.

## Height to and from `auto`

Animate `height` between `0` and `"auto"` inside `AnimatePresence`, with `overflow: hidden` on the animating element:

```jsx
<AnimatePresence initial={false}>
    {isOpen && (
        <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            style={{ overflow: "hidden" }}
        />
    )}
</AnimatePresence>
```

This animates `height`, which runs layout every frame. Keep it for small content.

## Drag to reorder

`Reorder.Group` and `Reorder.Item` only respond to pointer drag. Give keyboard users another way to move items, for example the arrow keys.

## Radix Integration

When integrating with Radix:

-   Add animations via `asChild` + a `motion` component child (`motion.div`, `motion.li`)
-   For exit/layout animations, hoist Radix state into `useState` (`open`/`onOpenChange`, `value`/`onValueChange`)
-   Conditionally render the Radix component as child of `AnimatePresence`
-   The component accepting `forceMount` is what goes inside `AnimatePresence`, and `forceMount` must be set
-   Only apply `forceMount` on Radix components, never on DOM elements

## API guidance

The latest docs are available via the Motion MCP. Check the [Codex](../codex/index.md) documentation.
