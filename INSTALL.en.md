[简体中文](安装说明.md) | **English**

# Install quota-aware-agents for Codex / OpenAI Models

**Author:** malioe · **Skill version:** 1.7.0 · **Version date:** 2026-11-19 · **License:** [MIT](LICENSE)

A Codex skill for choosing suitable models, defining complete work packages, managing context, and accepting results while meeting original quality and authorization requirements, reducing omissions/repair, shortening total completion time and controlling resource use. See the [English introduction](README.en.md) for usage examples and routing details. The skill instructions and reference files are written in English.

## Install through Codex

Send this request to Codex:

```text
Please use $skill-installer to install this skill from https://github.com/mario110333/quota-aware-agents/tree/v1.7.0/quota-aware-agents.
```

This requires the installer and installation permissions to be available in the current session. If automatic installation is unavailable, use one of the methods below. The [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) explains installation from other repositories and local discovery.

## Windows installation

1. Download the [1.7.0 release ZIP](https://github.com/mario110333/quota-aware-agents/archive/refs/tags/v1.7.0.zip), or download **Source code (zip)** from the [latest stable Release](https://github.com/mario110333/quota-aware-agents/releases/latest). Extract it first. Each archive contains the complete files at its fixed tag; main is for ongoing development.
2. Open PowerShell in the extracted repository directory and run:

   ```powershell
   .\Install.ps1
   ```

3. The script checks the complete skill manifest against [checksums.json](checksums.json), verifies the copied files, and installs to the current user's `.agents\skills\quota-aware-agents`. Administrator rights are not required. If a folder with that name already exists, the script stops without overwriting it; back up and move the old folder before installing again.
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

Consult the skill when preparing an independent assignment or when independent review is requested. Choose the worker and effort for the task, preferring the latest suitable stable version in its family. See [model routing](quota-aware-agents/references/model-routing.md) for pins, unavailable models and reuse.

## Optional helper scripts

The instructions themselves have no additional runtime dependency. The optional [model resolver](quota-aware-agents/scripts/resolve-main-model.mjs) and [usage collector](quota-aware-agents/scripts/summarize-usage.mjs) use Node.js with read-only `node:sqlite` support; the validation environment is **Node.js 24.21.0**. The resolver is optional when the user asks which model is active.

The resolver verifies the current session and active turn, returning minimal model metadata without changing settings. Missing bindings, conflicts, or unsupported internal formats return unknown and do not block independent authorized work. Inspect `node <skill-path>/scripts/resolve-main-model.mjs --help` and [optional model identification](quota-aware-agents/references/model-identification.md).

Run the collector manually only when needed. Start by checking its options:

```text
node <skill-path>/scripts/summarize-usage.mjs --help
```

It reads local Codex databases and rollout logs in read-only mode and writes reports to the specified new directory. Summary output is the default; it does not upload data or export conversation text or credentials. Reports can contain local paths and conversation identifiers, so inspect them before sharing.

Use optional `--since` (exclusive start), required `--cutoff` (inclusive end), and repeated `--thread` for multiple explicit roots. Shared descendants are counted once; source groups and cumulative scopes are explained in [cost and usage](quota-aware-agents/references/cost-model.md). The output directory must not already exist.

Internal Codex log formats can change. Unsupported or incomplete records must be reported, and statistics are not an actual bill, a measure of subscription allowance consumption, or proof of savings. API amounts, Codex credits, and subscription usage are separate measures. The cost reference's historical snapshot is dated **2026-09-30**, with historical rates dated separately; verify applicable rates when needed. The skill does not promise a fixed saving percentage.

The package contains the reusable skill, installation script, documentation, licenses, and checksum information. It does not include the author's conversations, account configuration, credentials, historical usage records, or project source code.

## Troubleshooting

| Symptom | Check or next step |
| --- | --- |
| The skill does not appear | Confirm `~/.agents/skills/quota-aware-agents/SKILL.md` exists without an extra nested directory, check for duplicate copies, and restart Codex. |
| `Install.ps1` reports an existing installation | Back up and move the old folder outside skill search directories, then install again. The script deliberately does not overwrite it. |
| PowerShell blocks the script | Use manual installation; changing the system execution policy is unnecessary. |
| Integrity verification fails | Extract a fresh complete ZIP and keep the skill files with their matching checksum manifest. Do not bypass the check or combine files from different versions. |
| A suggested model or reasoning effort is unavailable | Use an authorized fallback for a pinned version, or handle the feasible work directly. Installing the skill does not add model access. |
| The optional collector cannot load `node:sqlite` | Use a compatible Node.js runtime if you need statistics. The skill itself can be used without the collector. |

## Update or uninstall

### One request to Codex

```text
Please update my installed quota-aware-agents from https://github.com/mario110333/quota-aware-agents to the latest stable Release: pin its tag and commit, locate the actual installation, back it up outside skill search directories, preserve local customizations and directory links, verify the complete package, update the original location, and report the version; skip reinstalling if it is already current.
```

### Update flow

1. Locate the actual installation and its source. It may be in `.agents/skills/`, `.codex/skills/`, or a project directory. Keep that location; check duplicate copies and the real target of symlinks or Junctions. An update does not require changing the main model or global settings.
2. Query the latest stable Release and resolve its tag to one pinned commit and download the complete repository at that commit into a temporary directory outside skill search locations. Verify the complete file manifest and SHA-256 values with that commit's `checksums.json`, then compare the installed version and complete files. If both match, report that it is current and stop. Also skip deployment when local customizations match the previous preservation record and upstream skill files have not changed; customized hashes differing from the original package do not by themselves mean the installation is outdated.
3. Back up the entire existing installation outside skill search directories and verify the backup. Merge local customizations using the original upstream baseline and the new version, preserving explicit preferences; ask only when an actual conflict cannot be resolved. Distinguish the verified upstream package from a locally adapted result: upstream hashes cannot establish that customized files are identical.
4. Prepare and check the complete replacement in the temporary directory before deployment. `skill-installer` and `Install.ps1` reject existing destinations, so use them for a temporary installation check first rather than repeatedly targeting the installed copy. Replace an ordinary directory after backup; preserve a linked installation and update its verified real target. Remove obsolete upstream package files only according to the old manifest, preserving files of unknown local origin. Restore the verified backup if deployment fails.
5. Verify the deployed complete files, or the merged result when customized. Report the version, upstream commit, installation path, backup path, and retained customizations. Use the updated skill on the next turn; if it does not appear, restart Codex as described in the [official documentation](https://learn.chatgpt.com/docs/build-skills). An update need not interrupt other work by restarting the app automatically.

Manual updates follow the same backup, package verification, and original-location replacement process. To uninstall, remove only the located skill directory or link; preserve a link's real target unless its removal is also explicitly requested. Other skills, model settings, and project files remain unchanged. Restart Codex if discovery has not refreshed.
