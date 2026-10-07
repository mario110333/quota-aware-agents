# Follow the main agent's speed

The worker follows the main conversation's **current selected speed**, independently of worker model and reasoning effort. Following a user's current Fast or Ultrafast selection is authorized by this policy; it is not permission to enable acceleration on the main agent, change global defaults, or select a faster mode than the main agent. An explicit worker-specific user override prevails. Never silently change model or effort to imitate a speed mode.

## Resolve freshly, at the point of use

Prefer trusted live host metadata or a supported settings read tied to the main conversation. Record the selected mode, source, main session/turn binding where available, observation time, and a host settings revision/event ID when exposed. A current explicit user speed instruction establishes the desired mode, but does not establish that the runtime applied it. Worker-local settings do not identify the main selection.

Refresh immediately before each spawn, continuation, resume, or speed-setting operation, at each new main turn, and as soon as a speed-change event or instruction is observed. A verified main model may be reused within a turn; **speed may not be cached for the whole turn**. Recheck after an asynchronous dispatch/update returns. With a supported live event stream, process change events promptly; without one, use the next available orchestration boundary and disclose that mid-request or instantaneous updates cannot be guaranteed. Do not install a watcher, poll unrelated app state, or repeatedly scan all logs to simulate a missing interface.

Do not infer speed from a model ID, reasoning effort, token generation time, tool availability, old worker messages, a global default, or historical telemetry. The optional `resolve-main-model.mjs` identifies model/effort only and does **not** identify speed. Map transport names such as `priority` or `default` to UI speed modes only when the actual host contract establishes that mapping. Missing, stale, or conflicting live evidence means unknown; retire an older speed snapshot instead of silently reusing it.

## Synchronize through the real tool

1. Resolve the latest main selection and the worker tool's actual speed controls, inheritance semantics, and supported model/mode combinations. Do not pass invented `speed` or `service_tier` arguments. If inheritance is documented or verified for speed, prefer leaving the worker override unset; general session inheritance alone does not prove speed inheritance or later propagation.
2. If a real speed selector exists, apply the latest desired mode through that selector. If speed is inherited, record whether inheritance applies only at spawn, on continuation, or to future requests of running workers. A task-card instruction or `send_message` supplies policy context, not an execution setting.
3. Confirm using the control's documented applied result or fresh worker runtime metadata bound to the operation and latest settings epoch. A requested value or generic success response without documented setting semantics is not proof of application. Record each worker separately as confirmed, pending, unsupported, unknown, or unverified; a successful new spawn does not establish that older workers updated.

If a known mode is unsupported by the selected worker model/tool, do not silently downgrade speed, upgrade to a costlier mode, or swap models. Continue suitable work directly on the main agent, or use a fallback the user already authorized. If the tool cannot set or verify speed, explain the concrete limitation once and continue unaffected authorized work without routine permission requests. Use native inheritance where available, but label it unverified until the relevant host contract or applied result establishes it.

## Repeated switches and existing workers

Maintain a monotonically increasing orchestration **settings epoch**, scoped to the main conversation. Advance it on each observed selection change or changed host revision/event, including `Standard → Fast → Standard`. Repeated reads of the same mode and host revision do not require redundant updates. A late confirmation for an earlier epoch cannot confirm the newest epoch, even if its speed string matches again. Compare every worker with the freshly resolved target as well; comparing only old and new main values misses stale workers and pending updates.

Serialize speed-setting operations per worker. Coalesce unsent obsolete updates to the latest selection; do not queue every intermediate toggle or overlap setters that could apply out of order. If a selection changes during an in-flight operation, its result is historical: reread the current target and reconcile again before declaring that worker synchronized. Do not cancel or duplicate valid package work merely to refresh a speed label.

For running workers, promptly relay the changed policy and use a real live setter if supported. An already executing model request generally cannot be retroactively reconfigured by this skill; the host must establish when the change takes effect. Mark older workers pending/unverified until their next applicable request is confirmed. If only newly spawned workers inherit speed, preserve a concise checkpoint and exclusive ownership before replacing a worker **only when** that path is supported and worthwhile. An interrupt or a fresh spawn alone does not prove the desired mode was applied. Retain completed work and applicable acceptance evidence; prevent the original and replacement from writing simultaneously. Do not routinely restart every worker on every toggle.

Idle or completed workers need no setting operation until reused. Before `followup_task` or equivalent continuation, refresh the main selection and reconcile speed; an old task card must not pin the earlier mode. When reusing a worker that loaded the old Standard-only policy, send the policy delta and latest epoch explicitly. This changes its instruction context, not its runtime setting.

## Compact dispatch/continuation record

```text
Speed policy: follow the main conversation's latest selected speed.
Desired: <Standard / Fast / Ultrafast / unknown>; source: <live host / current user instruction / unavailable>.
Binding: <main session and current turn if exposed>; settings epoch/revision: <current>.
Worker application: <confirmed / pending / unsupported / unknown / unverified>; evidence: <real control/result or inheritance contract>.
Supersession: an old card or acknowledgement never overrides a newer main selection. Notify the parent of missing controls; do not edit global config or claim messaging changed speed.
```

## Evidence and validation boundary

For a policy update, check the entrypoint, routing, cost wording, and both language guides for obsolete fixed-Standard rules; verify reference paths and assess first dispatch, unknown/conflicting evidence, continuation, and running-worker behavior. Exercise `Standard → Fast → Ultrafast → Standard`, unchanged reads, changes while an operation is in flight, and stale/out-of-order confirmations. Rule review or simulated host events establish protocol consistency, not actual paid-mode application or hot updates in Codex. A real speed control and applied-state evidence are required for those claims; do not toggle paid modes just to test the skill without user authorization for that execution.

Official context, checked 2026-10-07: [Speed](https://learn.chatgpt.com/docs/agent-configuration/speed) distinguishes speed modes and supported models; [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) describes model/effort configuration and session inheritance. These pages do not establish that the active local tool exposes a speed setter or that a running child follows every main-speed change. Always use the live tool contract.
