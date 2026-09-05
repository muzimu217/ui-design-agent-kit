# Remotion Workflow

## Mode selection

Use the narrowest mode that matches the request:

| Request | Read next | Primary output |
| --- | --- | --- |
| New video, scene, or composition | `remotion-create`, then `remotion-markup` | Editable source and Studio preview |
| Current API, package, or migration question | `remotion-docs` | Evidence-backed answer or patch |
| “Make the transition cooler” | `remotion-docs` for current transitions, then this file | A justified presentation/timing change |
| Preview or inspect a video | `remotion-studio` | Actual Studio URL and inspected frames |
| Explicit MP4/WebM/still render | `remotion-render` | Verified media artifact |
| Captions, maps, multimedia, SaaS, or interactivity | `remotion-best-practices` router and the matching official skill | Focused implementation |

Do not load every official Remotion reference for a small task. Do not copy the
official skills into this custom skill; their revisions are pinned in the kit's
source lock.

## Composition contract

Use a small data model for scenes when a video has repeated structure:

```ts
type Scene = {
  id: string;
  durationInFrames: number;
  title: string;
  accent: string;
};
```

Keep the composition's `fps`, `width`, `height`, and total duration explicit or
derived through `calculateMetadata()` when the inputs truly determine them.
For an editorial sequence, write the scene frame ranges down before coding.
For a data-driven sequence, compute them once and use the same source for the
timeline, labels, and any progress indicator.

Use `AbsoluteFill` for full-frame layers, `Sequence` for local timelines, and a
stable layout grid for type and media. Avoid viewport units, percentage heights
that depend on a browser viewport, and DOM APIs that behave differently in the
renderer.

## Frame math

Use these relationships explicitly:

```text
frames = round(seconds * fps)
seconds = frames / fps
transitionedTotal = sum(sceneFrames) - sum(transitionFrames)
overlayTotal = sum(sceneFrames)
```

For `TransitionSeries`, the first formula applies to transitions that overlap
scenes. Overlays do not remove time. Check both adjacent scene lengths and keep
the transition duration no longer than either one.

A practical 30fps opening beat might be:

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const reveal = spring({
  frame,
  fps,
  delay: 4,
  durationInFrames: 20,
  config: {damping: 200},
});
const y = interpolate(reveal, [0, 1], [48, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

Use a spring driver for one semantic beat, then map it to multiple related
properties. Do not create separate springs for opacity, position, and scale
unless those effects intentionally have different physical behavior.

## Transition pattern

The current official API uses this shape:

```tsx
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <Intro />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    timing={linearTiming({durationInFrames: 18})}
    presentation={fade()}
  />
  <TransitionSeries.Sequence durationInFrames={120}>
    <Feature />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    timing={linearTiming({durationInFrames: 24})}
    presentation={wipe({direction: 'from-left'})}
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <Outro />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

Confirm presentation options against `remotion-docs`; the example is a shape,
not a promise that every version has the same option names. Name scenes in the
timeline when debugging. Do not use two transitions in the same slot or place
an overlay next to a transition.

For “炫酷转场”, ask what should carry across the cut: direction, shape, color,
subject position, or rhythm. A good default is one signature transition plus
quieter cuts elsewhere. If a custom transition is needed, implement it as one
progress-driven presentation and test progress 0, 0.5, and 1.

## Media and dynamic content

Use local or authorized assets and preserve aspect ratio. Reserve image space so
loading does not move type. For remote data or media metadata, use Remotion's
documented async primitives, surface errors, and keep a deterministic fallback.
Do not use a live API response as the hidden source of truth for a reproducible
render unless the user explicitly wants that behavior.
