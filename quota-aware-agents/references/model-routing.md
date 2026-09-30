# Model routing

Routing baseline: 2026-09-30. For workers, first apply the entrypoint's delegation test. Judge ambiguity, error cost, dependence on original sources, verifiability, and expected total completion cost. These are starting points, not proof of equal quality across tasks.

| Work | Suggested starting point | Selection rule |
|---|---|---|
| Everyday implementation, code review, and ordinary debugging; comparable writing, translation, or analysis packages | `gpt-6.1-sol` / `high` or `xhigh` | Use high for clear scope, known contracts, and straightforward acceptance, even if one independent module has several files; xhigh for more ambiguity, interacting constraints, or difficult semantic judgment. No separate pilot is required for suitable ordinary high work. |
| Cross-module implementation or a main agent needing sustained judgment | `gpt-6.1-sol` / `xhigh` | Stabilize shared contracts before dividing work. For the main agent this is a recommendation, not authority to switch its model or global settings. |
| Simple batch organization, extraction, or checks against explicit rules | Deterministic tools first; otherwise `gpt-6-luna` / `max` | One bounded batch, not one agent per item. Move to Sol when ambiguity or repair cost increases. |
| Persistent reasoning difficulty, critical architecture, or data-protection judgment | `gpt-6-astra`, limited to the concrete question; normally `xhigh` | First diagnose context, tool, and environment failures. Scope Astra to the difficult decision; leave separable implementation with Sol. A separate worker still needs useful parallel work and independent value. |
| Existing GPT-6 Sol workflows | Prefer migration to `gpt-6.1-sol` | Preserve task constraints and compare affected acceptance evidence; retain old Sol only for availability or an observed regression. |

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
