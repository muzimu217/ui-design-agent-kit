# Tempo Day Design Contract

## Mission and Surface

Operate mode. Make the current task and its remaining time the clearest actionable unit. This is a daily planning tool, not a landing page.

## Reference Baseline

- Local UI Agent Kit `references/motion-contract.md`: documented Snappy and Elegant physical state transitions. This is process guidance, not copied product material.
- Motion public AnimatePresence and shared-layout documentation: https://motion.dev/docs/react-animate-presence and https://motion.dev/docs/react-layout-animations. Adaptation is use of documented APIs and authored components, not copying an external product or premium template.
- Local UI UX Pro Max searches returned flat-design accessibility guidance, but twice suggested an irrelevant marketing section structure. The marketing structure and typography mismatch are rejected; the actual working screen follows the explicit brief.
- No third-party product imagery, proprietary screens, or premium source code is incorporated. Lucide icon package and installed libraries retain their package licenses.
- Impeccable concept seed `feaf7b8c` was inspected. Its expressive challenger worlds (film bench, ASCII scene, fashion label, etc.) do not fit the brief's work-focused first screen. This task's explicit functional structure and isolated direct-implementation scope take priority. No choice or confirmation from the user is invented.

## Foundations

- Canvas #f6f7f8; surface #ffffff; ink #202725; muted #5e6964; line #dce2df.
- Action #286447 with white text; action-soft #eaf2ed; info #315f91 with info-soft #e9f0f8; break #896226 on #f8f0dd.
- Typography: local system sans for Chinese reading; tabular numerals for time. Body 16px, secondary 14px, task title 24px, screen title 30px, timer 72px. Letter spacing 0.
- Spacing 4/8px rhythm; 8px framed tools, 6px inputs, 44px minimum controls; borders separate regions without elevated page cards.
- One grid becomes one column on phones. Desktop queue 320px, focus tool flexible, summary 220px. Tablet summary becomes an inline footer band.

## Component and State Contract

- Task queue uses native buttons; selected and completed are text/icon plus color, never color alone.
- Timer and controls have reserved dimensions. Countdown numbers do not shift surrounding content.
- Editor uses a native dialog and labeled inputs. Cancel preserves state; validation stays by its fields.
- Local save failures are surfaced without blocking the in-memory workflow.
- Empty and all-done states retain a clear task-creation action.

## Motion Contract

- Shared mode indicator: trigger view switch; `layoutId`; Snappy 400/30/0.8; reversals retarget immediately.
- Current task copy: keyed AnimatePresence, 8px vertical translation plus opacity; Snappy; current controls remain stable.
- Task status and progress: layout animation where geometry changes; no re-entry choreography per second.
- Buttons: 0.98 press; keyboard active equivalent; fixed hit area.
- Toast: opacity and 8px translation; non-blocking; undo stays semantic before animation finishes.
- Reduced motion: spatial transforms, layout animation, and entrance stagger removed; state appears immediately.

## Writing and Accessibility

Chinese functional copy with English brand only. No AI-process text in the product. Native keyboard behavior and visible 3px focus outline. No remote fonts or images. Reduced-motion preference is respected in both CSS and Motion. Contrast is checked on final tokens; no accessibility certification is claimed.

## Quality Gates

Task CRUD, timer, completion/undo, persistence, mode reversal, empty/all-done, 390/768/1440 layouts, focus, reduced motion, build, and browser console. Evidence in artifacts and README, with unverified scope stated explicitly.
