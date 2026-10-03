# Model routing

Routing baseline: 2026-10-03. For workers, first apply the entrypoint's delegation test. Judge ambiguity, error cost, dependence on original sources, verifiability, and expected total completion cost. These are starting points, not proof of equal quality across tasks. Check the live tool's supported combinations; a strategy cannot grant model access.

| Work | Suggested starting point | Selection rule |
|---|---|---|
| Everyday implementation, code review, and ordinary debugging; comparable writing, translation, or analysis packages | `gpt-6.1-sol` / `high` or `xhigh` | Use high for clear scope, known contracts, and straightforward acceptance, even if one independent module has several files; xhigh for more ambiguity, interacting constraints, or difficult semantic judgment. No separate pilot is required for suitable ordinary high work. |
| Cross-module implementation or a main agent needing sustained judgment | `gpt-6.1-sol` / `xhigh` | Stabilize shared contracts before dividing work. For the main agent this is a recommendation, not authority to switch its model or global settings. |
| Simple batch organization, extraction, or checks against explicit rules | Deterministic tools first; otherwise `gpt-6-luna` / `max` | One bounded batch, not one agent per item. Move to Sol when ambiguity or repair cost increases. |
| Persistent reasoning difficulty, critical architecture, or data-protection judgment | `gpt-6-astra`, limited to the concrete question; normally `xhigh` | First diagnose context, tool, and environment failures. Scope Astra to the difficult decision; leave separable implementation with Sol. A separate worker still needs useful parallel work and independent value. |
| Existing GPT-6 Sol worker workflows | Prefer `gpt-6.1-sol` for suitable packages | Preserve task constraints and compare affected acceptance evidence; retain old Sol for availability or an observed regression. Main-model settings remain the user's choice. |

## Adapt to the main model

Resolve the actual main model from metadata bound to the current conversation and active turn, then choose the corresponding row. Apply task independence, risk, and total completion cost as well; model identity alone does not justify delegation.

| Main model | Keep with the main agent | Delegate when separable |
|---|---|---|
| GPT-6.1 Sol | Ordinary cross-module judgment, shared contracts, the first integrated slice, tightly coupled fixes, and final integration; xhigh is a recommendation for sustained judgment, not permission to change user settings | Sol high for clear complete packages; xhigh for interacting constraints. Same-model workers have no model-rate advantage: independent short context or useful parallel progress must justify framing, acceptance, and repair. |
| GPT-6 Astra | Consequential tradeoffs, disputed evidence, critical experiment design, and cross-package decisions | Sol high/xhigh for suitable ordinary execution and local verification. Do small or tightly coupled work directly; do not manufacture a task merely to escape the parent rate. |
| GPT-6 Sol | Appropriate existing work, task constraints, shared decisions, and valid progress; check current tools and any observed regression | Suitable complete packages can use 6.1 Sol when supported. Do not silently treat the main model as 6.1 Sol or change it. |
| GPT-6 Luna or another known model | Tasks supported by evidence about that model's capability and the available tools; retain ownership of the user's goal | Use an appropriate supported worker for a verifiable independent package. A lower price does not establish equal quality; do not classify all non-Astra models as Sol. |
| Unknown or unmapped model | Generic direct-work/delegation judgment, current permissions, and required acceptance | Delegate only for a bounded independent outcome and useful parallel work. Do not claim a main-model price advantage or block authorized work on routine model confirmation. |

Usually start with one worker after shared contracts are stable; add another only when ownership and execution resources are independent. Do not use Astra as an automatic second reviewer of Sol work. Escalate a concrete unresolved reasoning problem after ruling out context and environment faults. Where supported, deterministic scripts remain preferable to model delegation for counting, hashes, references, and exact extraction.

A user model switch preserves task scope, valid progress, suitable workers, and applicable evidence. Refresh identification and reassess the remaining package ownership and main-agent responsibilities; do not restart planning or rerun unchanged checks. With Sol as main, ordinary implementation and integration can stay direct. With Astra as main, separable ordinary packages can move to Sol when the main agent has useful parallel work. Same-model delegation has no model-rate advantage; compare its shorter context and parallel value against framing, acceptance, and expected repair.

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
- Do not default every task to max. Further reductions, such as Sol / medium for simple bounded work or Luna / high for easily checked repetition, are calibration candidates beyond the table. Try a representative low-risk package with unchanged acceptance; retain a lower-effort route only for the task class supported by evidence. Record first-pass acceptance, omissions, repair, main-agent duplication, and usage when available. Roll back if quality fails or repair erases savings. Change model and effort separately when measuring their effects.
- Escalate effort or model for a specific unresolved reasoning problem after checking context and tools. Neither price nor effort justifies extra prose, unnecessary tests, or a standing review chain.
- Main-agent model choice can dominate cost. Recommend a suitable model when requested or materially useful, but do not alter the current model or global settings. Do not delegate trivial actions merely to move them away from an expensive parent.

The [2026-09-29 Artificial Analysis evaluation](https://artificialanalysis.ai/articles/gpt-6-1-sol-replaces-gpt-6-sol-after-just-7-days-with-near-astra-intelligence) supports 6.1 Sol as a general-worker candidate: its xhigh coding result exceeded its max result in that evaluation. Benchmarks do not prove project quality, visual judgment, subscription savings, or universal superiority. Refresh this baseline when relevant evidence or availability changes, not on every dispatch.

## Tool mechanics

- Use the current subagent tool for subtasks; user-owned chats are not substitute workers. Follow its live schema. When specifying model/effort, `spawn_agent` currently requires `fork_turns="none"` or a limited count rather than `"all"`.
- Use `send_message` for material updates to active work and `followup_task` for suitable continuation or repair. The latter cannot change model/effort; use a fresh worker when that must change. Reuse does not guarantee a cache hit. Interrupt obsolete work and avoid frequent polling or repeated logs.
- Visible task cards, progress, and returns follow the main conversation's language unless requested otherwise. Deliverables follow the requested language or repository convention, preserving identifiers, quotations, and original logs.
