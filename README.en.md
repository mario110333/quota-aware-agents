[简体中文](README.md) | **English**

# quota-aware-agents — Delegation Skill for Codex / OpenAI Models

A Codex skill for deciding when delegation is worth its total cost. Meet the user's quality requirements first, then compare direct work with a bounded worker package—including context, coordination, acceptance, and repair.

**Author:** malioe · **Skill version:** 1.1.0 · **License:** [MIT](LICENSE) · **Speed preference:** Standard (normal speed)

[Install](#quickstart) · [Usage](#usage) · [Routing](#default-routing) · [FAQ](#faq)

## Supported environment

Designed for **OpenAI models in Codex**, such as GPT-6.1 Sol, GPT-6 Astra, and GPT-6 Luna, using the agent tools available in the current session. This is workflow guidance, not a standalone agent runtime or a grant of model access. Other OpenAI-model environments require adaptation of tool contracts, permissions, model availability, and usage collection.

## What it does

- Reassesses delegation before substantial repeated processing or independent work, and again after phase changes, worker completion, or material new evidence.
- Gives a worker a complete package: investigation, execution, ordinary debugging, targeted verification, and related records, with clear ownership and acceptance criteria.
- Chooses a suitable starting model and reasoning effort using the current tool's supported combinations.
- Keeps the main agent accountable for shared decisions and integration, without repeating routine worker work.

Suitable tasks include implementation, analysis, translation, and batch review with clear boundaries. Short answers, small edits, tightly coupled work, and deterministic operations usually stay with the main agent or a script. Delegation requires useful parallel work for the main agent; using more agents is not the objective.

The skill's instructions and reference files are written in English. This repository provides Chinese and English introductions and installation guides.

## Quickstart

Ask Codex to use its built-in `skill-installer`:

```text
Please use $skill-installer to install this skill from https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents.
```

Automatic installation depends on the installer and permissions available in your session. The [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) describes installation from other repositories and local skill discovery.

Other options:

- **Windows:** download the [main-branch ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip), extract it, and run `./Install.ps1` from the repository root. The script verifies six skill files against [checksums.json](checksums.json), installs for the current user without administrator rights, and stops if the destination already exists.
- **Windows / macOS / Linux:** copy the entire `quota-aware-agents` folder into `~/.agents/skills/`. Back up and move an existing copy outside skill search directories before installing an update.

See [the installation guide](INSTALL.en.md) for commands, updates, removal, and troubleshooting. Use the main-branch ZIP for these bilingual documents; the original 1.0.0 release archive contains its original documentation.

## Usage

Mention `$quota-aware-agents` in your request. Codex can also select the skill when a task matches its description; selecting it still requires a decision about whether delegation is worthwhile.

**Implementation with independent packages:**

```text
Use $quota-aware-agents to implement the two independent import adapters described in this specification. Resolve shared data contracts first, assign exclusive file ownership, and verify the integrated result against the acceptance criteria.
```

**A bounded batch review:**

```text
Use $quota-aware-agents to review these 20 translated documents against the terminology list and source texts. Keep the review read-only, use scripts for deterministic checks, group the work into bounded batches, and report material omissions or meaning changes with source evidence.
```

**Planning only:**

```text
Use $quota-aware-agents to compare direct execution with delegation for this task. Propose work packages, ownership, model choices, and acceptance criteria. Only produce the plan; do not launch workers, edit files, or execute the task.
```

The skill respects the request's scope and current permissions. Installing it does not authorize new mutations, external actions, or recursive delegation.

## Workflow

1. **Decide:** compare direct execution with framing, worker execution, acceptance, and expected repair under the same quality requirement.
2. **Package:** resolve shared contracts, define a bounded result and acceptance criteria, and give each file or constrained resource one owner. Usually start with one worker.
3. **Execute:** let the worker complete its package while the main agent advances useful parallel work. Pass material changes promptly and reassess when evidence changes.
4. **Accept:** inspect the result and evidence against the original request, verify necessary integration boundaries, repair material defects, and stop when acceptance is satisfied.

## What's new in 1.1.0

- With a 6.1 Sol main agent, keep shared contracts, the first integrated slice, and integration with the main agent. Same-model delegation needs independent context or useful parallel progress to justify its overhead.
- With an Astra main agent, delegate separable ordinary execution to Sol. Astra is not an automatic second reviewer, and switching the main model does not restart plans or invalidate applicable checks.
- Verify the complete layout and cross-mode behavior before expanding. Keep tightly coupled controls, state, and command routing under one owner.
- Bound usage reviews by time, cutoff, and thread tree; do not add overlapping cumulative snapshots. Rate scenarios are not actual charges or promises of savings.

## Default routing

Routing baseline: **2026-09-30**. These are starting points for suitable work, not guarantees of equivalent quality or availability.

| Work | Starting point | Selection rule |
| --- | --- | --- |
| Everyday implementation, review, and ordinary debugging; comparable writing, translation, or analysis | `gpt-6.1-sol` / `high` or `xhigh` | Start with high for clear scope and straightforward acceptance; use xhigh for interacting constraints, ambiguity, or difficult semantic judgment. |
| Cross-module implementation or sustained main-agent judgment | `gpt-6.1-sol` / `xhigh` | Stabilize shared contracts before dividing work. Main-agent routing is a recommendation, not permission to switch its model. |
| Simple batch organization, extraction, or checks against explicit rules | Deterministic tools first; otherwise `gpt-6-luna` / `max` | Assign one bounded batch. Move to Sol when ambiguity or repair cost increases. |
| Persistent reasoning difficulty, critical architecture, or data-protection judgment | `gpt-6-astra`, scoped to the concrete question; normally `xhigh` | Diagnose context, tool, and environment failures first; keep separable implementation with Sol. |
| Existing GPT-6 Sol workflows | Prefer migration to `gpt-6.1-sol` | Preserve task constraints and compare affected acceptance evidence; retain old Sol for availability or an observed regression. |

Check the live worker tool's supported model/effort combinations. If 6.1 Sol is unavailable, use supported `gpt-6-sol` / `xhigh` for a suitable package, or continue directly. For other unavailable combinations, choose a supported suitable route or explain the constraint. Explicit user model choices prevail.

**Standard (normal speed)** is the workflow's speed preference. Reasoning effort and speed mode are separate. Select Standard when the tool exposes a speed selector; when it does not, do not infer the active mode or claim it was changed. This workflow does not enable, request, or recommend Fast / Ultrafast or another paid acceleration mode. A later explicit user instruction can revise the preference.

See [model routing](quota-aware-agents/references/model-routing.md) for full selection, fallback, calibration, and tool rules.

## FAQ

**Does it always launch workers?**

No. It first decides whether a bounded package and useful parallel work justify delegation. Direct execution or deterministic tools may be the better choice.

**Will it change my main model, global settings, or permissions?**

No. It can recommend a route, but does not switch the main conversation's model or change global configuration. It grants no additional tool, file, model, or external-action permissions.

**Does it guarantee lower cost?**

No fixed saving is promised. A cheaper model can still cost more overall after coordination, missing context, duplicate work, and repair. Savings require comparable evidence under the same quality requirement.

**What if a suggested model is unavailable?**

Use a suitable combination supported by the current worker tool, or continue directly. Account access, app availability, and worker-tool support can differ; repeated guesses at model IDs are not a fallback strategy.

**Why does the skill not appear after installation?**

Check that the copied folder contains `SKILL.md` at the expected path, avoid duplicate copies in skill search directories, and restart Codex if it is still absent. See [installation troubleshooting](INSTALL.en.md#troubleshooting).

**Does switching the page language change the skill's behavior?**

No. Both guides describe the same rules, with English instructions and references as the execution source. Visible progress and summaries follow the main conversation's language; deliverables follow the user's requested language or repository convention.

## Optional local usage statistics

Ordinary skill use does not require Node.js. The optional [summarize-usage.mjs](quota-aware-agents/scripts/summarize-usage.mjs) collector requires Node.js with `node:sqlite` read-only support; the packaged script was verified with **Node.js 24.21.0**. Run it manually only when statistics are requested or a material routing evaluation needs them, starting with:

```text
node <skill-path>/scripts/summarize-usage.mjs --help
```

It reads local Codex database and rollout records in read-only mode and writes reports to a specified new output directory. It defaults to summary output and does not upload data or export conversation text or credentials. Reports can contain local paths and conversation identifiers; inspect them before sharing. The repository does not include the author's conversations, account configuration, credentials, or historical usage records.

Internal telemetry changes or missing records can make results partial. Token counts, API-equivalent amounts, Codex credits, actual charges, and subscription usage are separate measures. The output is not a bill or proof of savings. The [cost and usage reference](quota-aware-agents/references/cost-model.md) contains a **2026-09-30** rate snapshot and separately dated historical rates; verify applicable rates when a later comparison requires them.

## File guide

| File | Purpose |
| --- | --- |
| [INSTALL.en.md](INSTALL.en.md) | Installation, updates, removal, and troubleshooting |
| [SKILL.md](quota-aware-agents/SKILL.md) | Core delegation and acceptance instructions |
| [model-routing.md](quota-aware-agents/references/model-routing.md) | Model/effort routes, fallback, and calibration |
| [cost-model.md](quota-aware-agents/references/cost-model.md) | Cost accounting and limits of usage evidence |
| [openai.yaml](quota-aware-agents/agents/openai.yaml) | Skill UI metadata and invocation policy |
| [summarize-usage.mjs](quota-aware-agents/scripts/summarize-usage.mjs) | Optional local usage collector |
| [Install.ps1](Install.ps1) / [checksums.json](checksums.json) | Windows installation and integrity manifest |

## Feedback and license

Report documentation issues, reproducible problems, or evidence-backed routing suggestions through [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues). Review reports for private paths, conversation identifiers, and other sensitive information before posting.

Released under the [MIT License](LICENSE). The standalone skill folder includes the same license. Copyright (c) 2026 malioe.
