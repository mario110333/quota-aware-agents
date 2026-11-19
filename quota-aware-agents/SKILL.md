---
name: quota-aware-agents
description: "Choose and brief a Codex worker when preparing an independent assignment or when the user requests delegation or independent review."
license: MIT
metadata:
  author: 'malioe'
  version: '1.7.0'
---

# Delegating work in Codex

Start with the user's deliverable and acceptance criteria. Keep tightly coupled decisions in the main chat. Use a tool for a deterministic batch. When delegation is authorized, give a worker a complete piece whose independent contribution justifies briefing, verification and possible repair. For a proposed parallel assignment, identify what necessary work the main can advance at the same time. An explicitly requested independent opinion can be valuable even on the critical path.

## Choose the worker

Choose the worker family and effort for the task. Favor lighter models for readily checked work and stronger reasoning when errors are subtle and costly. For a new worker, prefer the newest available stable version in that family that meets the requirements. Inherit only when the configuration fits. A task-based choice needs no main-model identification.

Honor user pins, exclusions and host permissions. If a pinned version is unavailable, use only an authorized fallback or do the feasible work directly. Without a pin, an earlier suitable version is reasonable for compatibility, reproduction or when the latest suitable stable version is unavailable. The automatic-selection exclusions for `gpt-6-sol` and `gpt-5.6-luna` also apply to inheritance and reuse. See [model routing](references/model-routing.md) for ambiguous version labels and existing workers. Keep main and global settings under the user's control.

Worker speed follows the latest main selection through supported controls or verified speed inheritance. Where controls exist or synchronization is at issue, use [speed following](references/speed-following.md). Report an unverified setting once if it affects the task.

## Hand off and accept

Pass the goal, constraints, accessible originals and the decision or artifact needed. Prefer a short brief and file locations for bulky evidence. Include history when reconstructing earlier decisions would cost more or drop an essential constraint. Choose a context mode compatible with the tool and any model override. Use subagents for subtasks within this chat. Keep recursive delegation outside the assignment and external actions within existing authorization.

Give each changed file and constrained runtime resource one owner at a time. Let that owner investigate, implement and check the affected result. Reuse the worker while its evidence and actual configuration still fit. Relay changed requirements, preserve valid progress and wait for needed results when other useful work ends. For an interrupted writer, unknown side effect or suspect observation, consult [execution evidence](references/execution-evidence.md) before acting on it.

Ask for the result, decisive evidence and unresolved issues. Verify the material claims against the original acceptance criteria. A fresh opinion can challenge an inference; independent factual corroboration requires independent evidence. Reuse passed checks. Before escalating, distinguish a reasoning gap from missing facts, a tool failure or an invalid observation. End the package when its result meets acceptance.

Reuse guidance already in context. For requested accounting or a consequential cost comparison, use [cost and usage](references/cost-model.md).
