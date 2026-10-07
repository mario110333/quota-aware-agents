---
name: quota-aware-agents
description: "Plan cost-aware delegation in Codex using OpenAI models for substantial implementation, translation, analysis, or batch review. Adapt to the verified current main model and reassess at phase changes; handle short answers and small edits directly."
license: MIT
metadata:
  author: 'malioe'
  version: '1.3.0'
---

# Cost-aware agent delegation for Codex / OpenAI models

Designed for Codex with OpenAI models and the live agent tools available in that session. Other OpenAI-model environments require adaptation of tool contracts, permissions, model availability, and usage collection; these instructions do not provide a standalone agent runtime.

Meet the user's goal and required quality, then minimize **total completion cost**: main-agent work, workers, context, coordination, verification, and repair. Elapsed time is a secondary tradeoff. Delegation itself is not success, and lower token prices do not prove task savings.

**Worker speed follows the main agent's current speed selection.** Keep speed (Standard / Fast / Ultrafast), model, and reasoning effort independent. Refresh speed before each spawn, continuation, or configuration update and immediately when a main-speed change is observed; do not reuse a turn-wide speed snapshot. Preserve valid work when the main agent switches back and forth. Read [speed following](references/speed-following.md) before dispatch or reuse: it defines freshness, versioned confirmations, existing-worker handling, and unsupported-tool limits. Use only real host controls or verified inheritance. Instructions and notifications cannot set execution speed; unknown or unverified synchronization must remain explicit. Do not change the main selection or global configuration.

## Decide whether to delegate

Consult before substantial repeated processing or independently deliverable work. Reassess at phase changes, worker completion, or material new evidence. **Decide whether delegation is worthwhile before selecting a worker model or effort. With Sol as main, start with zero workers and complete ordinary work directly.** Multiple steps or files, a main xhigh setting, or consulting this skill are not dispatch reasons. Keep simple work direct, deterministic batches with tools/scripts, and difficult tightly coupled reasoning under one owner.

Delegate only a bounded complete package with acceptance criteria, exclusive ownership, and useful parallel work for the main agent. Be able to name the worker's deliverable, the main agent's different necessary deliverable, shared boundaries/resources, and why framing + worker execution + notification/waiting + acceptance + expected repair improves total completion cost. This is a lightweight judgment, not a mandatory cost report. Shorter context or a lower effort setting alone does not establish savings. Do not manufacture parallel work or duplicate the worker's investigation/implementation. Starting one worker is a concurrency suggestion only after this test passes; add another only for a genuinely independent work line within the current tool limit. Do not split a coherent package to fill slots or recursively delegate.

Different files do not ensure independence. Resolve shared interfaces, data semantics, and interaction contracts first. When those are uncertain, complete and verify a representative end-to-end slice before parallel replication. A component's completion does not establish acceptance of the integrated result. For visual or interactive work, verify the complete representative layout and cross-mode behavior before broad replication or capture; passing isolated component checks is not a substitute.

Only after delegation passes this test, read [model routing](references/model-routing.md) for the worker route. Read [Astra consultation](references/astra-consultation.md) when proposing that specific second opinion: automatic proposals use a successfully delivered notice and a **30-second feedback window**, with default execution only under prior explicit authorization. An explicit request for the bounded consultation already authorizes it and needs no duplicate permission wait. Ordinary Sol/Luna packages do not acquire this window unless the user requests it.

Read [execution evidence](references/execution-evidence.md) only when shared runtime resources, experiments, or observation validity matter, and [cost and usage](references/cost-model.md) only for a material price tradeoff, requested accounting, or calibration. Reuse unchanged guidance. Do not add model probes, long task cards, usage audits, or extra reviews to simple direct work. Current tool contracts, permissions, and user choices prevail.

## Resolve the current main model when routing needs it

Prefer reliable host metadata bound to this conversation and active turn; use the optional read-only [model resolver](scripts/resolve-main-model.mjs) only when identification would affect a remaining routing choice and the adapter is supported. See [model routing](references/model-routing.md) for binding and fallback rules. A worker's own model is not evidence of the main conversation's model.

Refresh a needed identification at a new turn or observed model change; reuse a verified result within the same turn. Defaults, old turns, model lists, and latency cannot establish the current model. If identification fails, continue with generic judgment without guessing or routine confirmation. Sol workers normally use the main agent's verified reasoning effort when supported; **Sol/high is an explicitly justified exception, not the default route**. Effort inheritance is separate from the latest speed policy and is not a runtime capability claim. Do not change the main model or global settings.

## Assign a complete package

Give the worker investigation, implementation or transformation, ordinary debugging, targeted verification, and related records together. Explicitly scoped integration and authorized delivery can also belong to that worker. Assign one writer per file and one owner per constrained resource, such as a shared app window, build directory, or benchmark environment.

The main agent owns cross-package decisions and final accountability, without repeating routine work. Keep a tightly coupled interaction or data path under one owner rather than dividing its controls, state, and command routing among workers. Keep consequential requirement conflicts, architecture choices, disputed meaning, contradictory evidence, and critical experiment design with the main agent when needed; delegate the resulting execution when separable. Delegate no more authority than the user granted.

Default to `fork_turns="none"` with this compact task card:

```text
Goal and deliverable: bounded result and success criteria.
Parallel value: the main agent's different necessary work while this package runs.
Critical context: user constraints, confirmed decisions, current state and limits.
Originals: precise source/specification/image/data/evidence locations and relevant versions.
Ownership: writable files, exclusive resources, and authorization boundaries.
Acceptance: affected behavior and necessary checks, including material failure paths.
Languages: visible communication follows this conversation; artifact follows user/repository.
Speed: follow the latest main selection; give source, settings epoch, and confirmed/unverified application status. An old task-card value is not a permanent override.
Return: result, paths, actual evidence, decisions, unresolved limits; usually 3–6 points.
```

State critical constraints directly; summaries cannot replace indispensable originals. For a broad independent investigation, delegate before doing that entire investigation yourself. Verify current original paths before dispatch, confirm access, and use a limited history fork when needed. Workers flag gaps affecting correctness or authorization while continuing unaffected work. Relay requirement/interface changes promptly to affected workers; obsolete work needs a checkpoint and stop, not an automatic restart of every package. A task-scoped model prohibition persists through later phases unless the user lifts it; do not rename/re-notify the same package to bypass refusal or make a one-time refusal permanent.

For continuation, first recheck whether the remaining work still merits delegation, then refresh main speed and the worker's current application status as well as essential context. Send only the delta; use a fresh worker for a new topic, unsuitable model/effort, or excessive history. Preserve applicable progress/evidence after model switches. Messaging/reuse does not prove speed synchronization. If the main agent finishes useful parallel work first, wait for the needed result instead of reimplementing it. Final integration, coupled diagnosis, and small corrections generally return to direct work; a completed worker does not require a next worker or a separate test worker.

## Accept once, against the original request

Inspect the result, relevant differences, and evidence against original user constraints. Distinguish implemented, verified, partially verified, and unverified behavior. Match evidence to the claim: static checks, screenshots, simulated behavior, and native execution establish different things. Inspect material cross-package boundaries and high-risk paths; broaden review for missing or contradictory evidence, not by default. A fresh review is warranted when required or when independence materially reduces error risk.

Reuse passed checks only while their inputs, code, contracts, dependencies, tests, and runtime conditions remain applicable. Changes require checks of affected behavior; reuse does not waive required independent confirmation, native/data-protection checks, or planned statistical repetitions. Avoid a standing worker → full main re-review → second reviewer chain. Stop when acceptance is satisfied. Do not inflate completion claims or defer required verification to the user.

Return local corrections to the original worker when practical; transfer exclusive ownership before a quicker main-agent correction. Before retrying, distinguish missing context, environment/permission failure, implementation defect, and reasoning difficulty. Retry with new evidence, a correction, or a new hypothesis. Repeated unchanged attempts require a different diagnosis or a specific blocker report; a more expensive model does not fix environment failures. Preserve valid progress and continue unaffected authorized work. If the main agent had to substantially redo the package, treat that as a delegation cost and recalibrate similar work toward direct execution or a better boundary. Record a short outcome only when useful; collect usage when requested or materially needed, not on every dispatch.
