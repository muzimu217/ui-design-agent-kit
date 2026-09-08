# FORMA One Motion Plan

## Intent

Motion should make the phone feel like a material object being handled, not a
collection of animated decorations. The interaction language is kiln work:
heat gathers, glaze travels, and the finished object settles into its shelf.

## Presets

```ts
snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }
playful: { type: 'spring', stiffness: 280, damping: 18, mass: 1.2 }
elegant: { type: 'spring', stiffness: 100, damping: 20, mass: 1 }
```

## Choreography

| Trigger | Initial -> final | Properties | Preset | Interrupt / reduced motion |
| --- | --- | --- | --- | --- |
| First viewport enters | opacity 0, y 20, scale .98 -> settled | opacity, y, scale | elegant | Motion preserves current state; reduced motion keeps opacity only |
| Product finish changes | previous finish -> selected glaze | backgroundColor, rotate, y, scale | elegant | New selection retargets the active spring; reduced motion changes color immediately |
| Finish/capacity choice | plain control -> selected recipe | shared `layoutId` indicator, subtle lift | snappy | Keyboard/touch gets same feedback; reduced motion removes lift |
| Price/config summary changes | old line -> new line | `AnimatePresence` opacity/y/blur | snappy | New values replace immediately when reduced motion is on |
| Add to bag | CTA -> confirmation state | exit/enter opacity, y, scale; bag count pop | playful | Reversible at any time; reduced motion uses instant state swap |
| Highlights enter viewport | opacity 0, y 24 -> visible | opacity, y, blur | elegant | One-time viewport reveal; reduced motion opacity only |
| Kiln video loop | glaze bands drift behind the object | video pixels only, 6s loop | deterministic media | Paused and held on first frame when reduced motion is requested |

## Video contract

`public/assets/forma-kiln-loop.mp4` is a local, muted, 6-second, 30fps,
960x640 material loop generated with FFmpeg. It is intentionally abstract: the
CSS phone remains the inspectable product object and the video supplies a slow
glaze movement behind it. The first frame is a valid static fallback.

## Acceptance

- Normal mode visibly shows product entrance, finish continuity, selection
  indicators, summary transition, add-to-bag confirmation, and viewport reveals.
- Rapid finish changes do not block input or leave stale summary data.
- `prefers-reduced-motion: reduce` pauses the video, removes spatial movement,
  and keeps all semantic state changes immediate.
- No animated layer changes hit-area dimensions or creates horizontal overflow.
