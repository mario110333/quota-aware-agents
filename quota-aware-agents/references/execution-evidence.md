# Runtime resources and execution evidence

Read only when work shares a runtime resource, runs an experiment, or relies on observations whose validity is uncertain. Adapt these criteria to the task; they do not require a standard form, a new lock system, or a full test matrix.

## Shared runtime resources

Different files can still share a development server and hot reload, build output, application profile or window, device, or benchmark environment. Establish one owner and a compatible state before concurrent work uses those resources. Freeze the necessary source/runtime state for a measurement or final package; if it is changing, serialize that stage and continue independent work.

Use the task's existing state and ownership evidence. Routine work does not need a repository-wide hash scan or file locks. Shared-resource ownership does not authorize messages to other user-owned chats, new system changes, or extra external actions. Preserve user data and unrelated processes.

## Make an observation capable of answering the question

For a consequential experiment, identify the competing hypotheses, the one condition to change, the observable metric and its meaning, the observation channel and valid time window, restoration, and the decision or stopping condition. Keep this concise and proportional to risk.

First confirm that collection covers the actual trigger. A missing reload, wrong window, stale build, overwritten ring buffer, or stopped collector makes the outcome inconclusive. A negative result requires valid coverage; absence of a captured event alone is not proof that the event did not occur. A model upgrade cannot repair invalid collection or unavailable permissions.

Separate static evidence, simulations, actual execution, and user observations. Each supports only the matching claim. A candidate appearing in a low-level list, for example, does not establish that the user-facing flow worked. Record the unresolved target rather than repeating an already successful proxy check.

## Stop or change diagnosis with evidence

Classify a failure as missing context, environment/tool/permission failure, an implementation defect, reasoning difficulty, or changed requirements. Retry with a correction, new evidence, hypothesis, or condition. When unchanged attempts add no useful information, change diagnosis or state the specific unresolved limit; do not escalate the model by retry count or invent a negative result.

Retain valid progress and restore authorized temporary changes as required by the task. Keep tightly coupled behavior under one owner. Select affected checks for the actual change, including relevant failure/recovery paths; do not replace required data-protection evidence with a screenshot or deferred user testing.

## Accept evidence at the right scope

Use a short record when needed: change → affected behavior → applicability of earlier evidence → necessary additional check → remaining unknown. Check representative complete interactions, such as close/reopen, idle/continuous feedback, or save/recovery, only when affected by the change.

Implementation, a proposal, a demonstration, integration, and actual validation are different delivery states. Reuse checks while their inputs and runtime remain applicable, complete required acceptance, then stop. Do not count versions, tests, agent count, output length, or lower token prices as proof of successful outcomes.
