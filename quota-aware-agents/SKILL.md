---
name: quota-aware-agents
description: "Plan cost-aware delegation for substantial work with independent deliverables, including implementation, translation, analysis, and batch review. Reassess at phase changes; handle direct answers and one-step edits directly."
license: MIT
metadata:
  author: 'malioe'
  version: '1.0.0'
---

# Cost-aware agent delegation

Meet the user's goal and required quality, then minimize **total completion cost**: main-agent work, workers, context, coordination, verification, and repair. Elapsed time is a secondary tradeoff. Delegation itself is not success, and lower token prices do not prove task savings.

**Speed preference: always Standard (normal speed).** Do not enable, request, or recommend Fast, Ultrafast, or another paid acceleration mode for this workflow. Reasoning effort (high/xhigh/max) is independent of speed mode. When a tool exposes a speed selector, select Standard; when it does not, do not infer the mode or claim it was changed. A future explicit user instruction can revise this preference.

## Decide whether to delegate

Consult before substantial repeated processing or independently deliverable work. Reassess at phase changes, worker completion, or material new evidence. Compare direct execution with framing + worker execution + acceptance + expected repair. Prefer direct work for short, tightly coupled, or deterministic operations.

Delegate only a bounded package with an outcome, acceptance criteria, exclusive ownership, and useful parallel work for the main agent. Usually use one worker; add another only for genuinely independent work within the current tool limit. Do not manufacture parallel work, split a coherent package to fill slots, or recursively delegate.

Different files do not ensure independence. Resolve shared interfaces, data semantics, and interaction contracts first. When those are uncertain, complete and verify a representative end-to-end slice before parallel replication. A component's completion does not establish acceptance of the integrated result.

Read [model routing](references/model-routing.md) when a worker is worthwhile or model choice is requested. Read [cost and usage](references/cost-model.md) only for a material price tradeoff, requested usage accounting, or routing calibration. Reuse already-read, unchanged guidance. Current tool contracts, permissions, and user choices prevail; this skill does not change the main conversation's model or global configuration.

## Assign a complete package

Give the worker investigation, implementation or transformation, ordinary debugging, targeted verification, and related records together. Explicitly scoped integration and authorized delivery can also belong to that worker. Assign one writer per file and one owner per constrained resource, such as a shared app window, build directory, or benchmark environment.

The main agent owns cross-package decisions and final accountability, without repeating routine work. Keep consequential requirement conflicts, architecture choices, disputed meaning, contradictory evidence, and critical experiment design with the main agent when needed; delegate the resulting execution when separable. Delegate no more authority than the user granted.

Default to `fork_turns="none"` with this compact task card:

```text
Goal and deliverable: bounded result and success criteria.
Critical context: user constraints, confirmed decisions, current state and limits.
Originals: precise source/specification/image/data/evidence locations and relevant versions.
Ownership: writable files, exclusive resources, and authorization boundaries.
Acceptance: affected behavior and necessary checks, including material failure paths.
Languages: visible communication follows this conversation; artifact follows user/repository.
Return: result, paths, actual evidence, decisions, unresolved limits; usually 3–6 points.
```

State critical constraints directly; summaries cannot replace indispensable originals. Confirm access and use a limited history fork when needed. Workers should flag gaps affecting correctness or authorization while continuing unaffected work. Relay new requirements and interface changes promptly. For continuation, send the delta only after confirming essential earlier context remains available; use a fresh worker for a new topic, unsuitable model, or excessive history.

## Accept once, against the original request

Inspect the result, relevant differences, and evidence against original user constraints. Distinguish implemented, verified, partially verified, and unverified behavior. Match evidence to the claim: static checks, screenshots, simulated behavior, and native execution establish different things. Inspect material cross-package boundaries and high-risk paths; broaden review for missing or contradictory evidence, not by default. A fresh review is warranted when required or when independence materially reduces error risk.

Reuse passed checks only while their inputs, code, contracts, dependencies, tests, and runtime conditions remain applicable. Changes require checks of affected behavior; reuse does not waive required independent confirmation or planned statistical repetitions. Stop when acceptance is satisfied. Do not inflate completion claims or defer required verification to the user.

Return local corrections to the original worker when practical. Before retrying, distinguish missing context, environment/permission failure, implementation defect, and reasoning difficulty. Retry with new evidence, a correction, or a new hypothesis. Repeated unchanged attempts require a different diagnosis or a specific blocker report; a more expensive model does not fix environment failures. Preserve valid progress and continue unaffected authorized work.
