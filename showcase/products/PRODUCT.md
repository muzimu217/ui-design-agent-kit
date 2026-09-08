# UI Design Agent Kit Workflow and Outcomes

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

The primary product is the UI Design Agent Kit workflow, not the brick workshop.
The user explicitly corrected the first page iteration to make the workflow and
its different generated outcomes the subject. Explain the human-confirmed route
from requirements and references to implementation, browser evidence, and delivery.
Present existing outcome screenshots and assembled playable demos without
implying every historical project is deployed or fully verified.

## Users

Developers and designers evaluating the UI design agent workflow through its
process, produced interfaces, and evidence boundaries.

## Capabilities and Constraints

- React 19.2.8, Motion 13.2.0, and Vite 8.2.2, in an isolated package.
- The build supports a caller-supplied Vite base. The workshop lives at
  `BASE_URL + demos/brick-workshop/` in the assembled static site.
- No account, backend, external model service, or new persistence.
- Presentation mode never imports the workspace persistence module.
- Inventory, phone, and blog cases provide historical screenshots only. The
  brick workshop is one peer case and the only playable route in this package.
- NODEGRID and the subway runner are completed, in-repository playable demos
  presented as project cards with their real screenshots; they are not mounted
  as playable routes in this static package, and the cards do not claim they are.
- Four evidence levels are definitions, not blanket success badges.
- The GitHub repository is currently private. Do not claim public source or a
  live deployment before deployment has been verified.

## Brand Commitments

The literal primary name is UI Design Agent Kit, described as a UI design agent
workflow. Main actions browse outcomes and inspect the workflow. Preserve each
case's actual visual world. The brick case retains its approved Three.js geometry,
challenge recipes, names, and screenshots. Do not restyle game mechanics or
replace the old `showcase/src` project.

## Evidence on Hand

`media/SOURCES.md` records the approved historical captures: inventory,
fictional phone product, and fictional blog, plus the two in-repository demos
(NODEGRID, subway runner) shown as project cards with their real screenshots.
The approved workflow cover combines the historical outcomes with the brick
screenshot; it is not a brand photograph.
`../../demo/brick-workshop/src/Scene.tsx` and `domain.ts` are the playable case's
source, with five captured screens imported from its `screenshots` directory.
Only selected visual assets and authored public summaries enter the build; private
instructions, configuration, evidence directories, and whole docs are not copied.
