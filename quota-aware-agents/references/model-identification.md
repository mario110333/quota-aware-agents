# Optional main-model identification

Use this diagnostic when the user asks to identify the active main model or effort. Ordinary worker selection uses the task requirements and the live worker options.

Prefer host metadata explicitly bound to this conversation and active turn. Reuse a verified result within the same turn; refresh when needed at a new turn or observed model change. A generic family name cannot establish a specific-model route. Defaults, historical database fields, model lists, old statements, the latest work-directory file, and latency are not current-model evidence.

For local Codex, [resolve-main-model.mjs](../scripts/resolve-main-model.mjs) reads only the bound current session's database entry and rollout metadata, checking session identity and active turn. It adapts internal formats rather than exposing a public discovery API. Unsupported schemas return unknown. Use compatible Node.js with read-only `node:sqlite` support only when this adapter is needed.

```text
node <skill>/scripts/resolve-main-model.mjs
node <skill>/scripts/resolve-main-model.mjs --help
```

The result includes identity status, model, effort when available, source and session/turn binding. A verified current ID is known even when it appeared after this skill was written. The optional adapter retains its historical `strategy` labels for existing consumers and returns `other_known` for other verified IDs. These labels carry no selection or override authority. The live worker tool determines availability.

Use an explicitly supplied host file only when its producer is trusted to describe the active session. A manually written model name is not discovery evidence. The host contract is `thread_id`, `turn_id`, `active_turn_id`, and `model`, with `active_turn_id` equal to `turn_id`; optional `effort` remains null when absent. `--thread` / `--turn` assert bindings rather than override contradictory environment evidence. `--codex-home` / `--db` choose source locations. Invoke in the main agent's own bound session; workers must not substitute their identities for the main's.

Missing binding, stale/mismatched turns, absent fields, unsupported schemas, or conflicting host/local evidence remain unknown with a short reason. Continue unaffected authorized work using generic judgment. Do not scan all logs, repeatedly probe at every tool call, or block on routine user confirmation. Speed uses a separate live contract and freshness policy.
