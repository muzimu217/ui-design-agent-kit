# Tempo Day

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated implementation brief: Vite, React, TypeScript, Lucide, and Motion for React. This is an independent product experiment, not part of the UI Agent Kit runtime.

## Users

Freelancers planning an individual workday. They need to select a next task, work for a bounded session, and see what has actually been completed.

## Product Purpose

把一天切成可执行的节奏，让自由职业者知道现在该做什么。

## Capabilities and Constraints

- Create, edit, delete, select, start, pause, resume, and finish tasks.
- A compact focus view retains only the current task and essential controls.
- Task state and timer deadlines are saved in browser localStorage. No accounts, backend, cloud sync, or notifications are claimed.
- All product code, dependencies, screenshots, and documentation stay in `/Users/blackevil/Documents/ChatGPT/tempo-day`.
- `/Users/blackevil/Documents/ChatGPT/ai` is read-only guidance for this experiment.

## Evidence on Hand

Only the one-sentence brief exists. The initial plan is explicitly sample data and can be replaced by the user. No customer claims or impact metrics exist.

## Product Principles

- One active task at a time.
- Actions are reversible where useful; completing a task offers undo.
- Progress describes recorded work, not an invented productivity score.
- Local storage is an explicit limitation, not a simulated cloud integration.

## Assumptions

- Chinese-language web interface, individual daily planning, no collaboration.
- Sessions use minutes (1–180), with a default 25-minute task.
- The current day is shown from the device clock. Tasks persist until the user changes them; no destructive midnight reset.

## Accessibility & Inclusion

Native controls, visible focus, keyboard-complete primary workflow, and reduced-motion support. Automated and browser checks are evidence, not a claim of conformance certification.
