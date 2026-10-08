# Model routing

Routing baseline: 2026-10-08. Read after the entrypoint's delegation test passes. These are starting choices, not guarantees of quality, savings, or tool availability. Main model/effort selection remains the user's choice.

| Work | Starting route | Selection rule |
|---|---|---|
| Short answers, small edits, ordinary work, difficult coupled reasoning | Current main directly | No worker merely because the task has several steps or the main uses xhigh. Diagnose missing facts/tools/environment before calling a problem reasoning difficulty. |
| Worthwhile independent implementation, writing, translation, review, or analysis | Supported Sol; under Sol main, normally its verified supported effort | Complete package with useful main parallel work. Main xhigh does not automatically yield worker high. |
| Deliberately reduced Sol effort | Supported `gpt-6.1-sol` / `high`, exception | Require stable contracts, direct acceptance, useful parallel value, and a concrete adequacy/efficiency reason; see below. |
| Mechanical batches | Tools/scripts | Counting, hashes, exact extraction, and reference checks need no model worker. |
| Sufficient rule-based, independently verifiable semantic batch | `gpt-6-luna` / `max` | One complete batch, not one agent per item. Prefer direct work when ambiguity, risk, acceptance, or repair erases the benefit. |
| Concrete critical architecture, reasoning, evidence, or data-protection question | `gpt-6-astra`, normally `xhigh`, read-only | Enough originals and reasonable initial analysis; [Astra consultation](astra-consultation.md) governs scope and authorization. An important independent decision analysis need not wait for repeated failures. |

## Adapt only when main identity matters

Prefer reliable host metadata bound to this conversation and active turn. If unavailable and identification would change a remaining route, see [model identification](model-identification.md); otherwise use generic judgment. A worker's own identity, defaults, old turns, and latency do not identify the main.

| Main | Responsibilities and suitable delegation |
|---|---|
| GPT-6.1 Sol | Start with zero workers; retain shared decisions, representative integrated slice, coupled problems and final integration. Delegate only worthwhile independent packages, normally preserving supported verified main effort. Same-model workers have no model-rate advantage. |
| GPT-6 Astra | Retain consequential tradeoffs, disputed evidence, experiment design and cross-package decisions. Worthwhile independent execution/local verification may use supported Sol/xhigh; high requires the exception below. Small/coupled tasks stay direct. |
| GPT-6 Sol | Preserve valid direct work and decisions; do not relabel it 6.1 Sol. Suitable independent work may use supported Sol with the main's verified effort and the high exception. |
| Luna / another known model | Judge its evidenced capability, task risk and live tools. Do not classify every non-Astra model as Sol or assume lower price implies equivalent quality. |
| Unknown / unmapped | Generic direct/delegation judgment, permissions and acceptance. No invented main-rate advantage, guessed identity, or routine confirmation blocking authorized work. |

For suitable existing 6 Sol worker workflows, prefer supported 6.1 Sol while retaining old Sol for availability or observed regression. Compare affected acceptance evidence; do not change the main setting. Model switches preserve scope, valid progress, suitable ownership, and applicable checks. Refresh needed identity and reassess remaining work; they do not restart planning, accepted packages, or unchanged tests. Normally start with one worker after delegation qualifies; add only a distinct independent line within tool limits.

## Sol effort and the high exception

Under Sol main, normally preserve its verified current effort through real inheritance or supported arguments. User-selected main high naturally permits high workers; explicit worker instructions prevail. Unknown effort does not permit guessing: use a supported task-appropriate fallback (normally Sol/xhigh for complex work), identify that fallback briefly, or continue directly.

Reducing a higher main effort to Sol/high requires a substantial independent complete execution package, stable contracts, straightforward acceptance, necessary parallel work, and a concrete reason high is adequate and worthwhile. Known scope alone is insufficient. Use relevant acceptance history when available; no mandatory paid pilot or extra reviewer. Lower effort is an efficiency hypothesis, not proof of lower usage, speed, or equal quality. Do not downgrade an unnecessary package to rationalize delegation. Significant main rework calls for a better boundary or direct execution next time.

At necessary dispatch/reuse after a main model/effort change, reassess worker suitability. Follow the live schema: current `send_message`/`followup_task` cannot change model/effort. An executing request cannot be retroactively reconfigured. Preserve work and ownership; replace only for a necessary worthwhile change unavailable in place. Speed is separate: use the entrypoint's capability gate and, when supported, [speed following](speed-following.md).

## Availability and tool mechanics

- Check supported worker model/effort combinations. App availability or an official release does not establish worker-tool support. If 6.1 Sol is unavailable, use supported 6 Sol/xhigh for a suitable package or continue directly. For other unavailable combinations choose a suitable supported route or state the limit; no repeated ID probes or silent old-family substitution. Explicit user choices prevail.
- Do not default everything to max or silently lower Luna/max. Further Sol reductions are evidence-based calibration candidates, not defaults: only worthwhile authorized representative packages, preserving acceptance. Measure model and effort separately; record omissions, repair, duplication, and usage only when useful.
- Escalate only for a specific reasoning problem after checking context/tools. Astra is not routine review, planning approval, or ongoing supervision. Model choice does not justify unnecessary prose or tests.
- Use subagent tools for subtasks, not user-owned chats. Current `spawn_agent` overrides require `fork_turns="none"` or limited history, not `"all"`. Read current contracts rather than assume this remains permanent.
- Send material updates to active workers and only essential deltas for continuation. Interrupt obsolete work; wait for needed results without busy polling or repeated logs. Reuse does not guarantee a cache hit.
- Visible task cards/progress/returns use the main conversation's language; artifacts follow the requested language or repository convention. Preserve necessary identifiers, logs and quotations.

The [2026-09-29 Artificial Analysis evaluation](https://artificialanalysis.ai/articles/gpt-6-1-sol-replaces-gpt-6-sol-after-just-7-days-with-near-astra-intelligence) supports 6.1 Sol as a general-worker candidate; its xhigh coding result exceeded max in that evaluation. This does not establish project quality, visual judgment, subscription savings or universal superiority. Refresh when relevant evidence/availability changes, not at every dispatch.
