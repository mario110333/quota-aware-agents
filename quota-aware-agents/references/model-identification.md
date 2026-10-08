# Optional main-model identification

Read only when identifying the active main model/effort would change a remaining routing decision and accurate current host metadata is absent. Direct work, scripts, and generic routing do not require a probe. This adapter does not identify speed or change settings.

Prefer host metadata explicitly bound to this conversation and active turn. Reuse a verified result within the same turn; refresh when needed at a new turn or observed model change. A generic family name cannot establish a specific-model route. Defaults, historical database fields, model lists, old statements, the latest work-directory file, and latency are not current-model evidence.

For local Codex, [resolve-main-model.mjs](../scripts/resolve-main-model.mjs) reads only the bound current session's database entry and rollout metadata, checking session identity and active turn. It adapts internal formats rather than exposing a public discovery API. Unsupported schemas return unknown. Use compatible Node.js with read-only `node:sqlite` support only when this adapter is needed.

```text
node <skill>/scripts/resolve-main-model.mjs
node <skill>/scripts/resolve-main-model.mjs --help
```

The result includes status, model, known effort, source, session/turn binding, strategy and a short reason. `astra_main` / `sol_main` select the corresponding routing rows; `other_known` requires the exact model's row; `unknown` uses generic judgment. An observed unmapped identifier may remain present with unknown strategy. No result recommends changing the main model.

Use an explicitly supplied host file only when its producer is trusted to describe the active session. A manually written model name is not discovery evidence. The host contract is `thread_id`, `turn_id`, `active_turn_id`, and `model`, with `active_turn_id` equal to `turn_id`; optional `effort` remains null when absent. `--thread` / `--turn` assert bindings rather than override contradictory environment evidence. `--codex-home` / `--db` choose source locations. Invoke in the main agent's own bound session; workers must not substitute their identities for the main's.

Missing binding, stale/mismatched turns, absent fields, unsupported schemas, or conflicting host/local evidence remain unknown with a short reason. Continue unaffected authorized work using generic judgment. Do not scan all logs, repeatedly probe at every tool call, or block on routine user confirmation. Speed uses a separate live contract and freshness policy.
