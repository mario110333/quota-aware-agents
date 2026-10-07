[简体中文](README.md) | **English**

# quota-aware-agents — Delegation Skill for Codex / OpenAI Models

A Codex skill for deciding when delegation is worth its total cost. Meet the user's quality requirements first, then compare direct work with a bounded worker package—including context, coordination, acceptance, and repair.

**Author:** malioe · **Skill version:** 1.3.0 · **License:** [MIT](LICENSE) · **Worker speed:** follows the current main selection

[Install](#quickstart) · [Usage](#usage) · [Routing](#default-routing) · [FAQ](#faq)

## Supported environment

Designed for **OpenAI models in Codex**, such as GPT-6.1 Sol, GPT-6 Astra, and GPT-6 Luna, using the agent tools available in the current session. This is workflow guidance, not a standalone agent runtime or a grant of model access. Other OpenAI-model environments require adaptation of tool contracts, permissions, model availability, and usage collection.

## What it does

- Reassesses delegation before substantial repeated processing or independent work, and again after phase changes, worker completion, or material new evidence.
- Gives a worker a complete package: investigation, execution, ordinary debugging, targeted verification, and related records, with clear ownership and acceptance criteria.
- Chooses a suitable starting model and reasoning effort using the current tool's supported combinations.
- Adapts the strategy to main-model metadata bound to the current conversation and active turn; unknown identification falls back to generic judgment.
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

- **Windows:** download the [main-branch ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip), extract it, and run `./Install.ps1` from the repository root. The script verifies the complete skill manifest against [checksums.json](checksums.json), installs for the current user without administrator rights, and stops if the destination already exists.
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

1. **Decide:** establish quality requirements and compare direct work with total delegation cost, including notification/waiting. Identify the current main model only when a remaining routing choice needs it.
2. **Package:** only after the delegation test passes, resolve shared contracts, define a complete bounded result and acceptance criteria, and give each file or constrained resource one owner. Usually start with one worker then; a Sol main starts with zero.
3. **Execute:** let the worker complete its package while the main agent advances useful parallel work. Pass material changes promptly and reassess when evidence changes.
4. **Accept:** inspect the result and evidence against the original request, verify necessary integration boundaries, repair material defects, and stop when acceptance is satisfied.

## What's new in 1.3.0

- With Sol as main, start with zero workers and complete ordinary or difficult coupled work directly. Steps, files, and a main xhigh setting do not justify dispatch.
- Delegate only a worthwhile complete independent package with useful necessary parallel main work. Include notice/waiting, acceptance, and repair in the tradeoff; avoid duplicate implementation and standing review chains.
- Justified Sol workers normally preserve the verified Sol main effort when supported. Sol/high is an explicitly justified exception, not an automatic downgrade from xhigh.
- Prefer scripts for mechanical batches; retain Luna/max for sufficiently large, explicit-rule, readily verifiable semantic batches. Keep hard coupled reasoning with the main agent.
- Limit Astra to a concrete read-only second opinion. Automatic proposals use a delivered notice and a 30-second feedback window; unanswered execution requires prior explicit authorization, while questions/changes pause the plan. A direct consultation request needs no duplicate approval wait.
- Preserve 1.2.1 speed following and versioned repeated-switch handling. Keep effort, speed, and consultation authorization separate; absent real host controls, do not promise running-worker hot updates.

See [model routing](quota-aware-agents/references/model-routing.md) and [Astra consultation](quota-aware-agents/references/astra-consultation.md). These rules impose no hard spending cap and install no background timer or automation.

## What's new in 1.2.1

- Worker speed follows the main agent's current selection instead of a fixed Standard policy; speed, model, and reasoning effort remain independent.
- Refresh before every dispatch, continuation, and settings operation; invalidate old confirmations when a switch is observed instead of caching speed for an entire turn.
- Use versioned confirmations for repeated switches and late results, preserving valid package work without restarting workers on every toggle.
- Distinguish real controls, spawn-only inheritance, running-worker updates, and unavailable/unverified synchronization. A task card or message cannot change execution speed.

See [speed following](quota-aware-agents/references/speed-following.md). This skill installs no background watcher and cannot guarantee immediate changes to an executing worker request when the host provides no speed control.

## What's new in 1.2.0

- Gives the existing main-model strategy a reliable identification workflow: prefer current host metadata, or use an optional read-only helper that verifies session and active-turn bindings. Unknown identification keeps generic routing available.
- Adds other-model and unknown-model handling. Refresh after a model switch while retaining valid progress, suitable workers, and applicable acceptance evidence.
- Provides conditional guidance for shared runtime resources, observation validity, and evidence-based stopping or diagnosis changes.
- Adds usage start times, multiple explicit roots, and source groups. Period totals and lifetime cumulative diagnostics remain distinct; unknown amounts are not zero.

Complete packages, deterministic tools, and stopping after acceptance remain in place. Fixed Standard from 1.2.0 was replaced by current-main speed following in 1.2.1; 1.3.0 also removes Sol/high as a default route. No fixed savings percentage is promised.

## Adapt to the main model

| Current main model | Strategy |
| --- | --- |
| Astra | Keep consequential decisions with the main agent; worthwhile independent complete packages can use Sol/xhigh, with high only as a reasoned exception. |
| 6.1 Sol | Default zero workers: keep ordinary implementation, hard coupled problems, and integration direct; delegate only worthwhile independent work with useful parallel progress. |
| Old Sol, Luna, or another model | Use evidence about the exact model, supported tools, and task risk; do not classify every non-Astra model as Sol. |
| Unknown or unmapped | Continue generic delegation judgment without guessing or blocking authorized work on routine confirmation. |

The skill guides the current agent to adapt when used. It reuses reliable metadata or falls back according to the environment; it does not install a background model watcher or change main-model settings. See [model routing](quota-aware-agents/references/model-routing.md).

## Default routing

Routing baseline: **2026-10-07**. These are workflow choices, not guarantees of equivalent quality, savings, or availability.

| Work | Starting point | Selection rule |
| --- | --- | --- |
| Simple work, ordinary implementation, or difficult coupled reasoning | Current main agent directly | Preserve user-selected main model and effort; do not manufacture a worker task. |
| Worthwhile independent Sol complete package | Supported Sol; normally verified Sol main effort | Useful parallel main work is required. High is an explicitly justified reduction, not the automatic default from xhigh. |
| Mechanical batches | Deterministic tools/scripts | Counting, hashes, references, and exact extraction do not need a worker. |
| Sufficient explicit-rule, readily verifiable semantic batches | `gpt-6-luna` / `max` | One independent complete batch, with real parallel main work; prefer direct work if ambiguity or repair erases the benefit. |
| Critical reasoning or decision needing a second opinion | `gpt-6-astra`, bounded read-only consultation; normally `xhigh` | Diagnose facts/tools/environment first; apply the notice and authorization rules rather than a standing review chain. |
| Existing GPT-6 Sol workflows | Prefer migration to `gpt-6.1-sol` | Preserve task constraints and compare affected acceptance evidence; retain old Sol for availability or an observed regression. |

Check the live worker tool's supported model/effort combinations. If 6.1 Sol is unavailable, use supported `gpt-6-sol` / `xhigh` for a suitable package, or continue directly. For other unavailable combinations, choose a supported suitable route or explain the constraint. Explicit user model choices prevail.

Worker speed follows the main agent's **current Standard / Fast / Ultrafast selection**, separately from model and reasoning effort. Refresh before each dispatch or continuation and reject stale confirmations after repeated switches. Use real controls or verified speed inheritance; messaging a worker does not change execution speed. If the active tool cannot set or verify speed, report that limit instead of claiming synchronization. See [speed following](quota-aware-agents/references/speed-following.md).

The automatic Astra window starts after successful interactive delivery. Approval may release it early, refusal cancels, and questions/changes pause it. No prior authorization, failed delivery, or an ended task means no automatic dispatch. An old notice cannot authorize a new question; late cancellation stops subsequent consultation but cannot reverse consumed usage. Ordinary Sol/Luna packages do not acquire this window, and users can require explicit approval. See [Astra consultation](quota-aware-agents/references/astra-consultation.md).

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

The instructions themselves do not require Node.js. The optional [resolver](quota-aware-agents/scripts/resolve-main-model.mjs) and [collector](quota-aware-agents/scripts/summarize-usage.mjs) use Node.js with read-only `node:sqlite` support; the validation environment is **Node.js 24.21.0**. Reuse reliable host model metadata, otherwise use the resolver where supported or generic routing. Run statistics only when requested or a material routing evaluation needs them, starting with:

```text
node <skill-path>/scripts/summarize-usage.mjs --help
```

It reads local Codex database and rollout records in read-only mode and writes reports to a specified new output directory. It defaults to summary output and does not upload data or export conversation text or credentials. Reports can contain local paths and conversation identifiers; inspect them before sharing. The repository does not include the author's conversations, account configuration, credentials, or historical usage records.

The collector accepts an exclusive `--since` start, an inclusive `--cutoff` end, and repeated `--thread` roots. It deduplicates shared descendants and reports main, worker, approval, and unknown source groups within the selected scope. Output directories must not already exist. See [cost and usage](quota-aware-agents/references/cost-model.md) for period versus lifetime cumulative diagnostics.

Internal telemetry changes or missing records can make results partial. Token counts, API-equivalent amounts, Codex credits, actual charges, and subscription usage are separate measures. The output is not a bill or proof of savings. The [cost and usage reference](quota-aware-agents/references/cost-model.md) contains a **2026-09-30** rate snapshot and separately dated historical rates; verify applicable rates when a later comparison requires them.

## File guide

| File | Purpose |
| --- | --- |
| [INSTALL.en.md](INSTALL.en.md) | Installation, updates, removal, and troubleshooting |
| [SKILL.md](quota-aware-agents/SKILL.md) | Core delegation and acceptance instructions |
| [model-routing.md](quota-aware-agents/references/model-routing.md) | Model/effort routes, the high exception, fallback, and calibration |
| [astra-consultation.md](quota-aware-agents/references/astra-consultation.md) | Bounded second opinions, 30-second notice, authorization, and cancellation |
| [speed-following.md](quota-aware-agents/references/speed-following.md) | Fresh speed resolution, repeated switches, current confirmations, and host-tool limits |
| [execution-evidence.md](quota-aware-agents/references/execution-evidence.md) | Shared runtime resources, observation validity, and stopping criteria |
| [cost-model.md](quota-aware-agents/references/cost-model.md) | Cost accounting and limits of usage evidence |
| [openai.yaml](quota-aware-agents/agents/openai.yaml) | Skill UI metadata and invocation policy |
| [summarize-usage.mjs](quota-aware-agents/scripts/summarize-usage.mjs) | Optional local usage collector |
| [resolve-main-model.mjs](quota-aware-agents/scripts/resolve-main-model.mjs) | Optional read-only current-model adapter |
| [Install.ps1](Install.ps1) / [checksums.json](checksums.json) | Windows installation and integrity manifest |

## Feedback and license

Report documentation issues, reproducible problems, or evidence-backed routing suggestions through [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues). Review reports for private paths, conversation identifiers, and other sensitive information before posting.

Released under the [MIT License](LICENSE). The standalone skill folder includes the same license. Copyright (c) 2026 malioe.
