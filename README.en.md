# quota-aware-agents

[简体中文](README.md) · **English**

A delegation skill for Codex that first assesses whether delegation is worthwhile, then selects an appropriate model and reasoning effort. Simple work stays direct; complex work is organized around clear boundaries. Delegation must account for context, coordination, waiting, acceptance, and repair.

**Author: malioe** · **Current version: 1.4.0** · **License: [MIT](LICENSE)**

[Install and first use](#install-and-first-use) · [Examples](#examples) · [Delegation rules](#delegation-rules) · [FAQ](#faq) · [Detailed documentation](#detailed-documentation)

Designed for OpenAI models in Codex and the agent tools available in the current session, for implementation, analysis, translation, and batch review. The skill provides workflow guidance; model access and runtime capabilities depend on your environment.

## Install and first use

Enter this in Codex:

```text
Please use $skill-installer to install this skill from https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents.
```

After installation, mention `$quota-aware-agents` in your task. Codex can also select it when a task matches its description; whether to delegate still depends on the actual task.

You can also install manually:

- **Windows:** download the [main-branch ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip), extract it, and run `./Install.ps1` from the repository root. The script verifies the complete skill manifest against [checksums.json](checksums.json), requires no administrator rights, and stops if the destination already exists.
- **Windows / macOS / Linux:** copy the entire `quota-aware-agents` folder into `~/.agents/skills/`. Before updating, back up the old copy and move it outside skill search directories.

See the [installation guide](INSTALL.en.md) for commands, updates, removal, and troubleshooting. Get the current 1.4.0 version from main; [Releases](https://github.com/mario110333/quota-aware-agents/releases) contains historical versions. Installing the skill does not expand authorization for files, tools, or external actions.

## Changes in 1.4.0

The entrypoint keeps core delegation, handoff, and acceptance rules; model identification, speed synchronization, and usage accounting load only when needed. Missing speed controls produce an explicit limitation and suitable continued work, avoiding ineffective probes. Latest-setting confirmation after repeated switches, the Sol/high exception, and the Astra 30-second authorization policy remain.

## Examples

**Implement two independent modules:**

```text
Use $quota-aware-agents to implement the two independent import adapters in this specification and verify the integrated result.
```

The main agent first resolves shared data contracts, then decides whether there is an independently deliverable package and different necessary work it can advance in parallel. Two files or multiple steps alone do not justify delegation.

**Review a batch of translations:**

```text
Use $quota-aware-agents to review these 20 translations against the terminology list and source texts. Keep the review read-only; report material omissions or meaning changes with source evidence.
```

Use scripts first for deterministic checks such as counts, references, and exact matches. A sufficiently large semantic batch with explicit rules and readily verifiable results may suit Luna. If you only want a delegation proposal, specify “plan only; do not launch workers or execute the task.”

## Delegation rules

**Decide whether delegation is worthwhile before choosing a model.** A worker should own a complete package with clear boundaries, acceptance criteria, and exclusive ownership, including necessary investigation, execution, ordinary debugging, verification, and records. The main agent advances different necessary work in parallel and remains responsible for integration and acceptance.

| Work | Approach |
| --- | --- |
| Short answers, small edits, ordinary implementation | Main agent directly; a Sol main starts with zero workers |
| Extremely difficult but tightly coupled problems | Keep reasoning and decisions with the main agent; difficulty alone does not justify splitting the task |
| Worthwhile independent work packages | Sol may help; with Sol as main, normally preserve its verified reasoning effort when the tool supports it. Sol/high requires an explicit justification |
| Mechanical batches | Prefer deterministic tools or scripts |
| Sufficiently large semantic batches with explicit rules and easy verification | Consider `gpt-6-luna` / `max`; work directly if ambiguity or repair erases the benefit |
| Critical decisions needing a second opinion | Consult `gpt-6-astra` on a concrete question, normally at `xhigh`, within a bounded read-only scope |

With Astra as main, worthwhile independent execution packages can use Sol/xhigh. Other or unknown main models require judgment based on actual capabilities and task risk. If a model or effort is unavailable, choose a suitable supported combination or continue directly. Explicit user model choices prevail.

When shared interfaces are unsettled, complete and verify a representative end-to-end slice first. Reassess after phase changes, worker completion, or material new evidence, and stop after acceptance. Avoid duplicate investigation and standing chains of repeated reviews.

### Astra consultation and authorization

Astra provides a second opinion on a specific critical question. The task owner handles implementation and acceptance; consultation does not automatically expand into ongoing supervision or execution.

For an automatic proposal, deliver an interactive notice describing the question, scope, and model, then allow **30 seconds for feedback**. Proceed after silence only if you have previously explicitly authorized that default. Approval can release the plan early, refusal cancels it, and questions or adjustments pause it. A new scope needs a new notice. A direct request for that bounded consultation needs no duplicate wait. See the [Astra consultation rules](quota-aware-agents/references/astra-consultation.md) for authorization, cancellation, and late replies.

### Following the main agent's speed

Treat speed, model, and reasoning effort separately. Refresh the main agent's current Standard / Fast / Ultrafast selection before each dispatch or continuation. Update promptly when a switch is observed; reject confirmations for old settings after repeated switches, while preserving valid work.

Actual synchronization requires host speed controls or verified inheritance. Instructions and messages cannot change execution speed; report limits when the tool cannot set or verify it. The skill installs no background watcher and cannot guarantee immediate speed changes to a running worker. See the [speed-following rules](quota-aware-agents/references/speed-following.md).

## FAQ

**Does a Sol/xhigh main agent need workers?**

Usually, direct work is sufficient. Delegate only when an independent package and necessary parallel work can outweigh handoff, waiting, acceptance, and repair. A main xhigh setting does not automatically warrant a Sol/high worker.

**Will it change the main model, global settings, or permissions?**

No. Installation and use grant no additional model access, file mutations, external actions, or recursive delegation. Automatic Astra consultation also follows the authorization conditions above.

**Does it guarantee lower cost or faster completion?**

No fixed percentage is promised. A cheaper model may increase total cost through coordination and repair; compare actual results under the same quality requirements.

**What if the skill does not appear after installation?**

Check that `~/.agents/skills/quota-aware-agents/SKILL.md` exists, remove duplicate copies from skill search directories, and restart Codex if it is still absent. See [installation troubleshooting](INSTALL.en.md).

**Do the Chinese and English pages describe the same rules?**

Yes. Both READMEs describe the same rules; the skill and reference files are written in English. Visible progress and summaries follow the main conversation's language, while deliverables follow user requirements or repository conventions.

## Detailed documentation

- [SKILL.md](quota-aware-agents/SKILL.md): core workflow, task cards, and acceptance.
- [Model routing](quota-aware-agents/references/model-routing.md): models, reasoning effort, the Sol/high exception, and unavailable routes.
- [Optional model identification](quota-aware-agents/references/model-identification.md): session binding, the helper, and unknown fallback.
- [Astra consultation](quota-aware-agents/references/astra-consultation.md): notice windows, authorization, scope changes, and cancellation.
- [Speed following](quota-aware-agents/references/speed-following.md): fresh settings, repeated switches, and host capability limits.
- [Execution evidence](quota-aware-agents/references/execution-evidence.md): shared runtime resources, observation validity, and stopping criteria.
- [Cost and usage](quota-aware-agents/references/cost-model.md): accounting measures and limits of optional tools.

The skill instructions do not require Node.js. The optional [model resolver](quota-aware-agents/scripts/resolve-main-model.mjs) and [usage collector](quota-aware-agents/scripts/summarize-usage.mjs) require Node.js with read-only `node:sqlite` support. The collector reads local Codex records and writes reports to a new specified directory without uploading data. Reports may contain local paths and conversation identifiers; inspect them before sharing. Tokens, API-equivalent amounts, Codex credits, actual charges, and subscription usage are distinct measures; statistics are not a bill or proof of savings.

## Feedback and license

Report reproducible problems or propose evidence-backed routing improvements through [GitHub Issues](https://github.com/mario110333/quota-aware-agents/issues). Include expected behavior, actual results, and necessary reproduction steps. Remove private paths, conversation identifiers, credentials, and chat content before posting.

Released under the [MIT License](LICENSE). The standalone skill folder includes the same license. Copyright (c) 2026 malioe.
