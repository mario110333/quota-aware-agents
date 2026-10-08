---
name: quota-aware-agents
description: "Decide whether and how to delegate substantial work in Codex, considering task independence, current tools, and total completion cost."
license: MIT
metadata:
  author: 'malioe'
  version: '1.4.0'
---

# Cost-aware delegation for Codex

Meet the user's goal and required quality, then minimize **total completion cost**: main work, workers, context, coordination, waiting, acceptance, and repair. Time is a secondary tradeoff. Lower model prices or shorter instructions do not establish actual savings. Use the live Codex agent tool contract; this skill supplies guidance, not a runtime or additional permissions.

## Choose direct work, scripts, or delegation

Consult for substantial repeated processing or independent deliverables. Reassess at substantive phase changes, worker completion, or material new evidence; reuse unchanged guidance and valid work. **Decide whether delegation is worthwhile before choosing a model or effort. Sol main starts with zero workers.** Short answers, small edits, ordinary work, and difficult tightly coupled reasoning stay direct. Several files/steps or main xhigh do not justify a worker. Use tools/scripts for deterministic batches.

Delegate only when you can name all four:

- A bounded complete deliverable with acceptance criteria and exclusive ownership.
- The main agent's different necessary work during its execution.
- Stable shared contracts and non-conflicting files/runtime resources.
- A plausible benefit after framing, execution, waiting, acceptance, and repair.

This is lightweight judgment, not a mandatory cost report. Do not manufacture parallel work, repeat the worker's investigation, fill slots, or recursively delegate. When shared interfaces, data semantics, or interaction contracts are uncertain, first verify a representative end-to-end slice. For visual/interactive work, verify the complete representative layout and cross-mode behavior before broad replication or capture. Isolated component completion does not establish integrated or visual/interaction acceptance.

## Load only the guidance the decision needs

| Condition | Read |
|---|---|
| Delegation is worthwhile and a worker route is needed | [Model routing](references/model-routing.md) |
| Knowing the active main model/effort would change that route, and reliable host metadata is absent | [Optional model identification](references/model-identification.md) |
| Real speed controls or verified speed-specific inheritance are available; or the task concerns speed synchronization | [Speed following](references/speed-following.md), before dispatch/reuse |
| Proposing a concrete Astra second opinion | [Astra consultation](references/astra-consultation.md), before notice/dispatch |
| Shared runtime resources, experiments, or observation validity affect acceptance | [Execution evidence](references/execution-evidence.md) |
| Material price tradeoff, requested accounting, or calibration | [Cost and usage](references/cost-model.md) |

Prefer current turn-bound host metadata when identification matters. Otherwise use generic judgment, without guessing from defaults, latency, old turns, or a worker's model. Do not run routine model/log probes or change the main model/global settings. Sol workers normally preserve the verified supported main effort; **Sol/high is a justified exception**, not an automatic downgrade from xhigh. Meaningful rule-based semantic batches may suit Luna/max.

**Speed follows the latest main selection independently of model and effort.** Check the live tool's observation/control/inheritance contract first. If it cannot expose or confirm speed, state the relevant limitation once and continue suitable authorized work; do not invent setters, infer Fast from `priority`, or claim messages changed runtime settings. With supported controls, refresh before each dispatch/reuse and after observed switches, reject stale confirmations after repeated toggles, and preserve valid work. Executing requests cannot be retroactively reconfigured. No background watcher or global-setting change.

**Astra is a bounded read-only second opinion, not standing supervision.** For automatic proposals, successfully deliver an interactive notice and allow **30 seconds** for feedback. Unanswered execution requires prior explicit authorization for that default; installing/loading this skill is not consent. Questions/adjustments pause, refusal cancels, material scope changes require a new notice, and host approvals still apply. An explicit request for the bounded consultation needs no duplicate wait. Ordinary Sol/Luna work has no such window unless requested.

## Assign and maintain one complete package

Give one owner investigation, execution, ordinary debugging, affected verification, and related records. Integration/delivery may be included only within explicit scope and existing authorization. Keep consequential cross-package decisions and final accountability with the main agent. One writer per file and one owner per constrained runtime resource; keep coupled state, controls, and command paths together.

Default to `fork_turns="none"`; use a limited history fork only when needed. Keep the task card compact:

```text
Goal / acceptance: bounded deliverable, affected behavior and necessary failure paths.
Parallel value: the main agent's different necessary work.
Context / originals: critical constraints, confirmed decisions, precise current source/spec/data paths.
Ownership / authority: writable files, exclusive resources, permissions and exclusions.
Language: visible communication follows this conversation; artifact follows user/repository.
Speed: latest-main policy; current source/application status only when actually observable.
Return: result, paths, actual evidence, decisions and unresolved limits, usually 3–6 points.
```

Verify needed originals are accessible; indispensable originals cannot be replaced by a leading summary. Workers flag gaps affecting correctness/authority while continuing unaffected work. Relay material requirement/interface changes promptly; checkpoint and stop obsolete work. Reuse only if the remaining package still merits delegation and the worker/tool remains suitable. Send essential deltas, including changed skill rules to a worker that read the old version. Messaging does not prove runtime model/effort/speed changes. Replace only when necessary and worthwhile, preserving valid progress and transferring ownership first. Wait for needed results when useful main work ends; do not reimplement them. Task-scoped model prohibitions persist until lifted, and refusals cannot be bypassed by renaming/re-notifying.

## Accept against the original request and stop

Inspect relevant differences and actual evidence against original constraints, material boundaries, and high-risk paths. Distinguish implemented, verified, partial, and unverified; static checks, screenshots, simulations, and native execution prove different things. Reuse passed checks only while their inputs/code/contracts/dependencies/runtime remain applicable, without waiving required independent/native/data-protection checks or planned repetitions.

Broaden review for missing/contradictory evidence or a required/materially useful independent check, not a standing worker → full main review → second reviewer chain. Stop when acceptance is satisfied. Return local repair to the owner when practical; transfer exclusive ownership before a main-agent correction. Before retrying, distinguish missing context, permission/environment/tool failure, implementation defects, and reasoning difficulty. Retry with new evidence or a changed hypothesis; expensive models do not repair environment failures. Substantial main rework is a delegation cost: improve the boundary or prefer direct work next time. Record/calibrate outcomes or collect usage only when useful/requested.
