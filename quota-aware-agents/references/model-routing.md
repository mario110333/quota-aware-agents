# Model routing

Routing baseline: 2026-10-07. Apply the entrypoint's direct/delegation test before selecting a worker. Sol main starts with zero workers; ordinary work and difficult coupled problems stay direct. A lower effort, a shorter context, several files, or a main xhigh setting does not itself justify delegation. Check ambiguity, error cost, original-source dependence, verifiability, useful parallel work, and total completion cost. These are workflow choices, not guarantees of model quality or savings; the live tool determines availability.

| Work | Suggested starting point | Selection rule |
|---|---|---|
| Small edits, short answers, ordinary work, or difficult tightly coupled reasoning | Current main agent directly | Do not change the user's main settings or manufacture a worker task. For a hard problem, diagnose missing evidence/tools/environment before treating it as reasoning difficulty. |
| Worthwhile independent implementation, review, writing, translation, or analysis package | Supported Sol; for a Sol main, normally its verified current effort | Keep the complete package with one owner. With a main xhigh setting, do not automatically downgrade the worker to high. Interacting constraints or difficult semantic judgment may warrant xhigh; main settings remain the user's choice. |
| Explicitly justified lower-effort Sol execution | `gpt-6.1-sol` / `high`, an exception | Use only for a substantial independent complete package with clear contracts, direct acceptance, and a concrete reason that high is adequate and worthwhile. State that reason briefly, not in a cost audit. Known scope alone is insufficient; see the exception below. |
| Mechanical batches | Deterministic tools/scripts | Counting, hashes, reference checks, and exact extraction do not need a model worker. |
| Sufficient semantic batch organization, extraction, or checks against explicit rules | `gpt-6-luna` / `max` | Keep one complete independently verifiable batch, with useful parallel main work; never one agent per item. Prefer direct Sol when ambiguity, risk, or repair/acceptance cost erases the benefit. |
| Concrete critical reasoning ambiguity, architecture, or data-protection decision needing a second opinion | `gpt-6-astra`, bounded read-only consultation; normally `xhigh` | Diagnose context/tools/environment first; provide originals and reasonable initial Sol analysis. Follow [Astra consultation](astra-consultation.md), including prior authorization and the 30-second notice window for automatic proposals. Important independent analysis need not wait for repeated failures. |
| Existing GPT-6 Sol worker workflows | Prefer `gpt-6.1-sol` for suitable packages | Preserve task constraints and compare affected acceptance evidence; retain old Sol for availability or an observed regression. Main-model settings remain the user's choice. |

## Adapt to the main model

Resolve the actual main model from metadata bound to the current conversation and active turn, then choose the corresponding row. Apply task independence, risk, and total completion cost as well; model identity alone does not justify delegation.

| Main model | Keep with the main agent | Delegate when separable |
|---|---|---|
| GPT-6.1 Sol | Default zero workers: ordinary implementation/analysis, shared contracts, the first integrated slice, difficult coupled problems, and final integration | Only genuinely worthwhile independent packages. Sol workers normally use the verified main effort when supported; high is not the automatic downgrade from xhigh. Same-model workers have no model-rate advantage: useful parallel progress must cover coordination, acceptance, and repair. |
| GPT-6 Astra | Consequential tradeoffs, disputed evidence, critical experiment design, and cross-package decisions | Supported Sol/xhigh for worthwhile independent execution and local verification; high only with the exception's reason. Small or tightly coupled work stays direct; do not manufacture tasks merely to escape the parent rate. |
| GPT-6 Sol | Default zero workers: appropriate direct work, shared decisions, and valid progress; check exact capabilities and any observed regression | Suitable worthwhile packages can use supported Sol with the main's verified effort, subject to availability and the high exception. Do not identify the main as 6.1 Sol or change it. |
| GPT-6 Luna or another known model | Tasks supported by evidence about that model's capability and the available tools; retain ownership of the user's goal | Use an appropriate supported worker for a verifiable independent package. A lower price does not establish equal quality; do not classify all non-Astra models as Sol. |
| Unknown or unmapped model | Generic direct-work/delegation judgment, current permissions, and required acceptance | Delegate only for a bounded independent outcome and useful parallel work. Do not claim a main-model price advantage or block authorized work on routine model confirmation. |

After a package passes the delegation test and shared contracts are stable, usually start with one worker; add another only for a different independent work line and resources. Do not use Astra for routine second review, planning approval, or ongoing supervision. A specific unresolved reasoning problem or important independent decision analysis may justify consultation; ordinary complexity, many files, or one failed test does not.

A user model switch preserves task scope, valid progress, suitable workers, and applicable evidence. Refresh a needed identification and reassess remaining ownership and responsibilities; do not restart planning, rewrite accepted packages, or rerun unchanged checks. A completed worker does not automatically trigger another package; coupled integration returns to the main agent. A same-model worker has no model-rate advantage; compare real parallel value against framing, notifications/waiting, acceptance, and expected repair.

## Sol effort inheritance and the high exception

For a justified Sol worker under a Sol main, normally preserve the main's verified current effort when the selected model/tool supports it. Use real inheritance or a supported effort argument; do not infer it from speed, latency, or a model name. A user-selected main high setting can naturally yield high workers, and explicit worker instructions prevail. Unknown effort does not authorize guessing: use a supported task-appropriate effort (normally Sol/xhigh for complex work), briefly label the fallback, or continue directly without routine confirmation.

Keep Sol/high available as an exceptional deliberate reduction from a higher main effort, not a usual route. Require a substantial independent complete execution package, clear contracts, straightforward acceptance, useful parallel work, and a concrete adequacy/efficiency reason. Use relevant acceptance history where available; do not require a paid pilot or extra reviewer on every package. Lower effort is an efficiency hypothesis, not a guarantee of lower actual usage, faster delivery, or equal quality. Do not downgrade an otherwise unnecessary task to rationalize delegation. If significant main-agent rework erases the benefit, revise the package boundary or prefer direct work next time.

At a needed dispatch/continuation after a main model/effort change, reconsider the desired effort and whether the existing worker still fits. Follow the actual tool: messages and `followup_task` do not change model/effort in the current collaboration schema. Preserve valid work and exclusive ownership; use a fresh worker only when a necessary change cannot be made in place and replacement is worthwhile. An executing request cannot be retroactively reconfigured. Independently follow the latest main **speed** under [speed following](speed-following.md); effort alignment is not proof of speed synchronization.

## Identify the active model

Prefer accurate host metadata explicitly tied to this conversation and active turn. If it is already reliable, reuse it rather than running an extra probe. A generic model-family name is insufficient for a specific-model route.

For local Codex, the optional [resolve-main-model.mjs](../scripts/resolve-main-model.mjs) uses the current session binding and reads only that session's database entry and rollout metadata. It verifies session identity and the active turn before accepting model/effort. This is an adapter for internal metadata, not a public model-discovery API; unsupported schemas return unknown. Use a compatible Node runtime with read-only `node:sqlite` support only when the local adapter is needed.

```text
node <skill>/scripts/resolve-main-model.mjs
node <skill>/scripts/resolve-main-model.mjs --help
```

The helper's result contains identification status, model, known effort, source, session/turn binding, a strategy key, and a short reason. `astra_main` and `sol_main` select the corresponding rows; `other_known` requires the exact model's row; `unknown` uses generic judgment. A reliably observed but unmapped model may retain its identifier while using the unknown strategy. No output is a recommendation to change the current main model.

Use an explicitly supplied host metadata file only when its producer is trusted to describe the active session; a manually written model name is not discovery evidence. Inspect `--help` for the binding contract. If host and current local metadata disagree, do not silently select one. Defaults, historical database model fields, available-model lists, old assistant statements, latest files in a work directory, and response speed are not current-model evidence.

The host-file contract is `thread_id`, `turn_id`, `active_turn_id`, and `model`, with `active_turn_id` equal to `turn_id`; `effort` is optional and remains null when unavailable. `--thread` and `--turn` assert bindings rather than override contradictory current environment information. `--codex-home` and `--db` choose source locations. The main agent should invoke the helper in its own bound session; do not pass a worker's identity as the main identity.

Missing binding, a stale or mismatched turn, absent fields, an unsupported schema, or conflicting sources must remain unknown with a short reason. Continue unaffected authorized work. Refresh on a new turn or model change; do not rescan logs on every tool call. Workers follow the main agent's task card and must not substitute their own session identity for the main session.

## Availability and adjustment

- Check the live worker tool's model/effort combinations. An official release or model in the app does not establish worker-tool availability. If 6.1 Sol is unavailable, use supported `gpt-6-sol` / `xhigh` for a suitable package, or continue directly. For another unavailable combination, choose a supported suitable route or state the constraint; do not repeatedly probe IDs or silently substitute an older family. Explicit user model choices prevail.
- Do not default every task to max. Keep Luna/max for justified semantic batches; do not silently lower its effort. Additional Sol reductions are calibration candidates beyond this policy, not new defaults: use a representative low-risk package only when authorized and worthwhile, preserve acceptance, and keep only the task class supported by evidence. Record acceptance, omissions, repair, duplication, and usage when materially useful. Change model and effort separately when measuring effects.
- Escalate effort or model for a specific unresolved reasoning problem after checking context and tools. Neither price nor effort justifies extra prose, unnecessary tests, or a standing review chain.
- Main-agent model choice can dominate cost. Recommend a suitable model when requested or materially useful, but do not alter the current model or global settings. Do not delegate trivial actions merely to move them away from an expensive parent.

The [2026-09-29 Artificial Analysis evaluation](https://artificialanalysis.ai/articles/gpt-6-1-sol-replaces-gpt-6-sol-after-just-7-days-with-near-astra-intelligence) supports 6.1 Sol as a general-worker candidate: its xhigh coding result exceeded its max result in that evaluation. Benchmarks do not prove project quality, visual judgment, subscription savings, or universal superiority. Refresh this baseline when relevant evidence or availability changes, not on every dispatch.

## Tool mechanics

- Speed follows the latest main selection under [speed following](speed-following.md), independently of this model/effort table. Refresh before spawn and reuse, invalidate old confirmations after switches, and verify each worker through supported controls or speed-specific inheritance. Do not assume general settings inheritance supplies running-worker hot updates. The model resolver does not resolve speed.
- Use the current subagent tool for subtasks; user-owned chats are not substitute workers. Follow its live schema. When specifying model/effort, `spawn_agent` currently requires `fork_turns="none"` or a limited count rather than `"all"`.
- Use `send_message` for material updates to active work and `followup_task` for suitable continuation or repair. The latter cannot change model/effort; use a fresh worker when that must change. Reuse does not guarantee a cache hit. Interrupt obsolete work and avoid frequent polling or repeated logs.
- Visible task cards, progress, and returns follow the main conversation's language unless requested otherwise. Deliverables follow the requested language or repository convention, preserving identifiers, quotations, and original logs.
