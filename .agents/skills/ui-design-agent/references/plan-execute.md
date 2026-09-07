# Plan and Execute Modes

Use two explicit modes for a substantial UI task. The mode is a workflow state,
not a second model or a permission to bypass confirmation gates.

## Plan Mode

Plan Mode is consultative and non-destructive. It asks only the questions that
materially change the result, searches a bounded set of references, and keeps
the user at each decision point. It may inspect files and public references, but
it does not write implementation code, download unapproved assets, start a dev
server, or claim that a prototype was generated.

The plan record must freeze:

- mission, audience, primary journey, scope, and non-goals;
- target stack, constraints, content reality, and abnormal states;
- selected reference/component/asset candidates with URLs, evidence, rights
  status, proposed parts, and adaptation boundaries;
- visual direction, information structure, token sketch, motion intent, and
  prototype brief;
- implementation sequence and acceptance checks, including the first prototype
  viewport and the user decision it needs.

Before lock, the agent shows unresolved assumptions and a small decision list.
The user locks the plan with an explicit confirmation such as “确认计划” or
“按计划执行”. A lock has an id or revision and an approval record. Silence,
“看起来可以”, or an old approval from a changed scope does not lock a plan.

## Execute Mode

Execute Mode begins only after a locked plan and an explicit execution request.
The first action for a new substantial UI is to generate the first no-code
prototype from the frozen prototype brief, using the selected material or the
documented image-generation fallback. The result stops at the prototype gate so
the user can accept, reject, or request a bounded revision.

After the prototype gate passes, execute the contract and implementation steps
allowed by the locked plan. Keep the existing MCP, license, browser, and
acceptance gates. “One-click execute” means start this authorized sequence; it
does not auto-approve a direction, material, prototype, contract, or finished UI.

## State transitions

```text
PLAN_DRAFT
  -> PLAN_NEEDS_INPUT      missing decision or unresolved assumption
  -> PLAN_LOCKED           explicit user confirmation + revision record
  -> EXECUTE_REQUESTED     explicit user request to execute that revision
  -> PROTOTYPE_READY       first no-code prototype generated from the plan
  -> PROTOTYPE_REVIEW      user gate C: accept / revise / reject
  -> CONTRACT_READY        contract confirmed when applicable
  -> IMPLEMENTATION        scoped code work
  -> ACCEPTANCE_ROUND      browser evidence and user-selected repairs
```

If the user changes the brand, selected material, scope, prototype brief, or
contract after lock, mark the plan stale and return to the first affected plan
decision. Do not silently execute an old plan. If only an implementation defect
changes, keep the plan locked and use the narrow repair path.

## Required handoff record

```text
Plan revision: P-<id>
Status: draft | locked | stale | executing | stopped
User confirmation: exact message + timestamp
Execution request: exact message + timestamp
First prototype: path/URL or explicit fallback prompt
Blocked gate: C / D / E, if any
Plan change reason: scope/material/contract/evidence or none
```

The record makes a plan resumable and prevents a generated image, a tool
connection, or a prior conversation from being mistaken for user approval.
