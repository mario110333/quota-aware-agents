[简体中文](安装说明.md) | **English**

# Install quota-aware-agents for Codex / OpenAI Models

**Author:** malioe · **Skill version:** 1.1.0 · **Version date:** 2026-10-01 · **License:** [MIT](LICENSE)

A Codex skill for choosing suitable models, defining complete work packages, managing context, and accepting results while meeting the user's quality requirements. See the [English introduction](README.en.md) for usage examples and routing details. The skill instructions and reference files are written in English.

## Install through Codex

Send this request to Codex:

```text
Please use $skill-installer to install this skill from https://github.com/mario110333/quota-aware-agents/tree/main/quota-aware-agents.
```

This requires the installer and installation permissions to be available in the current session. If automatic installation is unavailable, use one of the methods below. The [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) explains installation from other repositories and local discovery.

## Windows installation

1. Download the [main-branch ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/heads/main.zip), or use **Code → Download ZIP** on the repository's main branch. Extract it first. The main branch contains these bilingual guides; the original 1.0.0 release archive contains its original documentation.
2. Open PowerShell in the extracted repository directory and run:

   ```powershell
   .\Install.ps1
   ```

3. The script checks the SHA-256 hashes of six skill files against [checksums.json](checksums.json), verifies the copied files, and installs to the current user's `.agents\skills\quota-aware-agents`. Administrator rights are not required. If a folder with that name already exists, the script stops without overwriting it; back up and move the old folder before installing again.
4. If your execution policy blocks the script, use manual installation below. You do not need to change the system execution policy.

Run the script from the extracted repository root, where [Install.ps1](Install.ps1), `checksums.json`, and the `quota-aware-agents` folder are together.

## Manual installation: Windows / macOS / Linux

Copy the entire `quota-aware-agents` folder from the package into the current user's `.agents/skills/` directory. The final path must be:

```text
~/.agents/skills/quota-aware-agents/SKILL.md
```

On Windows, `~` is your user profile folder, typically `C:\Users\YourUsername`. Include the skill's `agents`, `references`, `scripts`, and license files; do not copy only `SKILL.md` or nest the entire repository under the skill directory.

If a copy is already installed, back it up outside skill search directories and move it out before copying the new folder. Avoid mixing versions or installing duplicate copies in multiple skill search directories.

Codex detects newly installed skills automatically; if the skill does not appear, restart Codex. This discovery behavior and the user-level `~/.agents/skills/` path are described in the [official documentation](https://learn.chatgpt.com/docs/build-skills).

## Use the installed skill

Send:

```text
Please use $quota-aware-agents for this task: …
```

The skill allows automatic selection when a task matches its description. Explicitly name it when you want to ensure it is considered. Selection does not mean a worker will always be launched: direct execution remains appropriate for short, tightly coupled, or deterministic work.

## Included defaults

- Everyday implementation, review, ordinary debugging, and comparable writing, translation, or analysis: 6.1 Sol high / xhigh.
- Cross-module work or sustained judgment: 6.1 Sol xhigh, after stabilizing shared contracts.
- Simple batches with explicit rules: deterministic tools first; Luna max when a worker is needed.
- Difficult reasoning, critical architecture, or data protection: Astra scoped to the concrete question, normally xhigh.
- Existing 6 Sol workflows: prefer migration to 6.1 Sol, preserving task constraints and affected acceptance evidence.
- Speed preference: Standard (normal speed), with reasoning effort treated separately. Do not enable, request, or recommend Fast / Ultrafast for this workflow. If the tool has no speed selector, do not infer its active mode or claim it was changed. A later explicit user instruction can revise the preference.

The skill does not grant additional permissions or switch the main conversation's model or global settings. Model/effort support depends on the current tool and account. If 6.1 Sol is unavailable, use supported 6 Sol xhigh for a suitable package, or continue directly; other unavailable combinations require a suitable supported route or an explicit statement of the constraint. See [model routing](quota-aware-agents/references/model-routing.md) for the full rules.

## Optional usage statistics

Ordinary skill use has no additional runtime dependency. Running [scripts/summarize-usage.mjs](quota-aware-agents/scripts/summarize-usage.mjs) requires Node.js with `node:sqlite` read-only support; the packaged script was verified with **Node.js 24.21.0**.

Run the collector manually only when needed. Start by checking its options:

```text
node <skill-path>/scripts/summarize-usage.mjs --help
```

It reads local Codex databases and rollout logs in read-only mode and writes reports to the specified new directory. Summary output is the default; it does not upload data or export conversation text or credentials. Reports can contain local paths and conversation identifiers, so inspect them before sharing.

Internal Codex log formats can change. Unsupported or incomplete records must be reported, and statistics are not an actual bill, a measure of subscription allowance consumption, or proof of savings. API amounts, Codex credits, and subscription usage are separate measures. The cost reference's current snapshot is dated **2026-09-30**, with historical rates dated separately; verify applicable rates when needed. The skill does not promise a fixed saving percentage.

The package contains the reusable skill, installation script, documentation, licenses, and checksum information. It does not include the author's conversations, account configuration, credentials, historical usage records, or project source code.

## Troubleshooting

| Symptom | Check or next step |
| --- | --- |
| The skill does not appear | Confirm `~/.agents/skills/quota-aware-agents/SKILL.md` exists without an extra nested directory, check for duplicate copies, and restart Codex. |
| `Install.ps1` reports an existing installation | Back up and move the old folder outside skill search directories, then install again. The script deliberately does not overwrite it. |
| PowerShell blocks the script | Use manual installation; changing the system execution policy is unnecessary. |
| Integrity verification fails | Extract a fresh complete ZIP and keep the skill files with their matching checksum manifest. Do not bypass the check or combine files from different versions. |
| A suggested model or reasoning effort is unavailable | Follow the routing fallback or continue directly. Installing the skill does not add model access. |
| The optional collector cannot load `node:sqlite` | Use a compatible Node.js runtime if you need statistics. The skill itself can be used without the collector. |

## Update or uninstall

Before updating, back up the installed `quota-aware-agents` folder outside skill search directories, then move it out and install the new version. Do not merge files from different versions.

To uninstall a manually installed copy or one installed by `Install.ps1`, remove only its `quota-aware-agents` folder from `.agents/skills/`. If you used `skill-installer`, locate the directory it reported before removing that copy. Other skills, model settings, and project files do not need changes. Restart Codex if discovery has not refreshed.
