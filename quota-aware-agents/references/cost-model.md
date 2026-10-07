# Cost and usage accounting

Use for a material price comparison, requested usage accounting, or routing calibration. Routine delegation does not require browsing prices or scanning logs. Refresh rates when the model, tier, billing surface, known pricing, or request for a current quote requires it. Unknown rates or usage remain unknown.

## Official rate snapshot: 2026-09-30

API Standard, short context, USD per million tokens:

| Model | Uncached input | Cached input | Cache writes | Output |
|---|---:|---:|---:|---:|
| `gpt-6-astra` | 10.00 | 1.00 | 12.50 | 50.00 |
| `gpt-6.1-sol` | 2.00 | 0.10 | 2.50 | 10.00 |
| `gpt-6-luna` | 0.10 | 0.01 | 0.125 | 0.50 |

Source: [OpenAI API pricing](https://developers.openai.com/api/docs/pricing). Long context has different rates. For historical `gpt-6-sol` accounting, the 2026-09-24 snapshot was 2.00 / 0.20 / 2.50 / 10.00 respectively; verify an applicable historical rate before presenting a bill. Do not apply 6.1 prices to earlier Sol usage without labeling a hypothetical repricing.

Codex Standard, credits per million tokens:

| Model | Input | Cached input | Output |
|---|---:|---:|---:|
| `gpt-6-astra` | 250 | 25 | 1,250 |
| `gpt-6.1-sol` | 50 | 2.5 | 250 |
| `gpt-6-sol` | 50 | 5 | 250 |
| `gpt-6-luna` | 2.5 | 0.25 | 12.5 |

Source: [Codex pricing](https://learn.chatgpt.com/docs/pricing). The tables are Standard-rate reference scenarios; worker speed follows the current main selection under [speed following](speed-following.md). For current or historical accelerated usage, consult the applicable official rates and distinguish purchased credits from included usage; never apply Standard silently to an unknown or different tier. A selected or requested mode does not establish the applied tier of every worker/request. Tokens, API-equivalent dollars, credit equivalents, actual charges, and subscription usage percentages are separate measures. Do not derive task subscription consumption from API prices or account-wide balance changes.

## Calculate without double counting

`cost = sum(tokens in each mutually exclusive billing category × its applicable rate) / 1,000,000 + separate tool fees`

Cached input is generally included in input, and reasoning output in output: do not add either twice. Resolve cache-write semantics before pricing records with writes. Include all relevant parent and worker requests, coordination, acceptance, and observed retries once. Report missing model, tier, cache, tool fees, or telemetry as limits rather than zero. For a forecast, include expected repair; for measured use, count actual repair only.

Compare total delegated cost with the direct alternative under the same quality requirement. Parent reimplementation, duplicate checks, and long repeated context can erase worker savings. Fixed-token repricing changes prices only, not success, token volume, caching, or retries; label it hypothetical and never present its percentage as measured savings or a next-task budget promise. Benchmark cost per task is neither project cost nor cost per successful outcome. Define wall-time boundaries and how parallel work is counted before claiming speedups.

For a main-model price comparison, keep the same known request set and worker costs, replacing only the main requests' applicable model rates. Present before/after observed averages separately, with their task and phase differences. Assess comparable delivery quality before discussing successful-outcome efficiency; model prices, version counts, test counts, and request counts cannot supply that assessment.

## Scope a usage review

State the time range, timezone, thread tree, and cutoff before presenting totals. Do not call a single update tree an entire day's account usage. Cumulative snapshots overlap: select one cutoff or deduplicate request records rather than adding snapshots. Earlier reports may span previous days or other threads; inspect their bounds before combining them. Reuse sufficient existing evidence and avoid a new worker or repeated collection merely to perform deterministic accounting.

Separate parent and worker totals, as well as historical model totals. Parent cost can dominate even when workers are well routed. Attribute repair or coordination costs only where records support that separation; observations of late defects alone do not establish their exact token cost. An expensive package may contain necessary data-protection checks or statistical repetitions, not redundant work.

Use source metadata and reliable spawn relationships to distinguish user/main conversations, deliberate workers, automatic approval reviews, and unknown sources. An explicitly selected root is not automatically a main agent. Include only selected roots and reliably linked descendants; do not assign all account-wide approval activity to one project. Public rates for an approval model may be unavailable: show its usage separately with unpriced cost, not zero. ChatGPT, background work, image/tool fees, or missing local records require explicit coverage limits.

For dollar or credit comparisons, establish per-request context bands and applicable historical rates. If the service tier is unavailable, report it as unknown; an explicitly labeled Standard-rate scenario is permissible, but not an actual bill. Keep subscription allowances, credit equivalents, API equivalents, and cash charges separate. Do not reconstruct missing request attribution from a mismatching cumulative counter.

## Optional local usage collector

Run [summarize-usage.mjs](../scripts/summarize-usage.mjs) only when the user requests statistics or a material routing evaluation needs them. It uses Node's built-in `node:sqlite`; use an available compatible runtime. It reads the local Codex database and rollout files without exporting conversation text or credentials. The internal telemetry schema may change; unsupported or incomplete sources must be reported, not silently replaced with another accounting method.

```text
node <skill>/scripts/summarize-usage.mjs --thread <root-thread-id> --cutoff <ISO-time-with-timezone> --out <new-output-directory>
node <skill>/scripts/summarize-usage.mjs --thread <root-1> --thread <root-2> --since <ISO-start> --cutoff <ISO-end> --out <new-output-directory> --ledger
```

Use `--codex-home <directory>` or `--db <database-file>` for explicit source locations; otherwise the Codex home environment variable or the user's `.codex` directory is used. Consult `--help` for output options. Use a fixed cutoff to avoid including the accounting task itself. `--since` is optional and excludes the start instant; `--cutoff` includes the end instant. Without `--since`, retain the legacy available-history scope. Both times need explicit timezones. Repeated `--thread` values select multiple explicit roots; repeated roots and shared descendants are counted once, with requested and effective scopes reported.

Time filtering applies to usage, not to the context needed to attribute it. A context recorded before the start may correctly describe a request inside the period. The collector identifies descendants, excludes inherited foreign-thread records, deduplicates response IDs, and assigns historical model/effort from matching turn context. Period totals must not be subtracted from lifetime cumulative counters; cumulative diagnostics retain their separate coverage scope. Never fill missing usage from a counter difference.

Timestamp comparison and normalized UTC output use JavaScript millisecond precision, including accepted ISO inputs with longer fractional seconds. Do not claim submillisecond accounting precision. Spawn scope comes from the selected database's current edges, not reconstructed historical topology; provide a missing descendant as an explicit root when its inclusion is required and justified.

The summary keeps existing names and core totals, and adds a format version, requested/effective roots, start/end semantics, and source groups. A multi-root result has no single root identity. Missing records, unknown attribution, conflicts, and mismatches make the result partial; they are not proof of complete use. Legacy counters and current database model fields cannot replace request-level history. Unknown model, source, service tier, or billing remains unknown.

Output directories must be new and separate from Codex/source locations. The collector rejects existing or overlapping targets and does not overwrite logs or earlier reports. It does not fetch prices, upload records, export database titles or conversation/tool bodies, or infer actual billing. Keep machine paths and thread identifiers local unless sharing them is authorized.

Keep a concise record in existing task evidence when useful: model/effort, first-pass acceptance, material defects and repair, parent duplication, checks, and measured/estimated/unknown usage. Retain one necessary report and validation evidence rather than duplicate ledgers or dashboards. Without comparable alternatives, say savings were not measured; small trials support local routing adjustments, not a universal savings percentage.
