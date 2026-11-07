# Third-party files in this .kiro folder

Most files under `.kiro/skills/`, `.kiro/agents/` and `.kiro/hooks/clad/` were not written for this project. They come from the two repositories below and were installed by `install-clad-kiro.ps1` from the CLAD-for-Kiro kit (`clad-kiro-port`).

## Sources

| Repository | Commit | Commit date | License | Files taken |
|---|---|---|---|---|
| https://github.com/lens-studio-devs/ls-extensions (Snap's CLAD, plugin `plugins/ls-clad/`) | `8adedd5d5b93f9dbe55f31c6be4264a4f8a608b3` | 2026-09-01 | Apache-2.0, Copyright 2026 Specs Inc. | `skills/` (56 skills) -> `.kiro/skills/`; `agents/*.md` (8) -> `.kiro/agents/`; `agents/references/` (5) -> `.kiro/agents/references/`; `hooks/mcp-liveness-check.ps1` and `.sh` -> `.kiro/hooks/clad/` |
| https://github.com/challengepost/learn-specs (Devpost's skill pack) | `5d8bc0800346d38e468c29b15afcb7ca92280005` | 2026-10-13 | MIT, Copyright (c) 2026 Devpost | `skills/plan-lens/` (with `references/` and `templates/`) -> `.kiro/skills/plan-lens/` |

## Changes made (Apache-2.0 section 4(b))

Only the 8 CLAD agent files were changed. In each one the Claude Code frontmatter was replaced with Kiro custom-agent frontmatter, and this notice line was added right after it:

`<!-- Modified for Kiro by clad-kiro-port: frontmatter converted from the Claude Code plugin format (see .kiro/third-party/README.md). Everything below this line is unchanged from ls-clad. -->`

The `name` and `description` lines are copied verbatim and the agent body (system prompt) is byte-identical to upstream. Per agent:

| Agent | Removed keys / tools | Added or replaced |
|---|---|---|
| editor-api-specialist | `model: inherit`, `skills: [editor-api]` | `tools` mapped to Kiro selectors; `includeMcpJson: true`; `resources`: steering file + `file://.kiro/skills/editor-api/SKILL.md` |
| live-lens-tester | `model: inherit` | `tools: ["*"]` (upstream had no `tools`, which means all tools); `includeMcpJson: true`; `resources`: steering file + all skills |
| perf-attribution-runner | `model: inherit`; tool `ToolSearch` | `tools` mapped; `includeMcpJson: true`; `resources`: steering file + all skills |
| perf-fix-applicator | `model: inherit`; tool `ToolSearch` | `tools` mapped; `includeMcpJson: true`; `resources`: steering file + all skills |
| script-author | `model: inherit` | `tools` mapped; `includeMcpJson: true`; `resources`: steering file |
| specs-experience-builder | `model: inherit`; tools `ToolSearch`, `AskUserQuestion`, `TaskCreate`, `TaskUpdate`, `TaskList` | `tools` mapped; `includeMcpJson: true`; `resources`: steering file + all skills |
| specs-project-migrator | `model: inherit` | `tools` mapped; `resources`: steering file |
| specs-sync-kit-validator | `model: sonnet` | `tools` mapped (upstream was a comma string); `includeMcpJson: true`; `resources`: steering file |

Tool mapping: `Read`/`Grep`/`Glob` -> `read`, `Edit`/`Write` -> `write`, `Bash` -> `shell`, `Skill` -> `disclose_context`, `mcp__lens-studio__<Tool>` -> `@lens-studio/<Tool>`.

New files written for Kiro (not from upstream):
- `.kiro/steering/clad-in-kiro.md`: maps CLAD's Claude-Code-specific instructions to Kiro.
- `.kiro/hooks/clad-lens-studio-liveness.json`: Kiro v1 hook that replaces CLAD's `hooks/hooks.json`.
- `.kiro/hooks/clad/kiro-liveness-gate.ps1`: adapter that runs CLAD's unchanged `mcp-liveness-check.ps1` and turns its Claude Code JSON into Kiro's exit codes.
- `.kiro/third-party/README.md`: this file.

Every other file from the sources above is byte-identical to the upstream commit.

## Not included

- `plugins/ls-clad/.claude-plugin/plugin.json` (Claude Code manifest, no version field) and `plugins/ls-clad/.cursor-plugin/plugin.json` (Cursor manifest, version 1.0.0).
- `.claude-plugin/marketplace.json` (marketplace `ls-extensions`, version 1.0.0).
- `plugins/ls-clad/hooks/hooks.json` (Claude Code hook config; Kiro would try to read it as a v1 hook file).
- The upstream `README.md` and `.gitignore` files.

## Licenses

- CLAD (ls-extensions): Apache License 2.0, full text in `ls-extensions.LICENSE.txt`. Upstream ships no NOTICE file. As that license file says, use of Lens Studio, Lens Studio APIs, and other Snap products stays subject to Snap's terms.
- plan-lens (learn-specs): MIT License, full text in `learn-specs.LICENSE.txt`.
- "CLAD", "Lens Studio", "Specs", "Spectacles" and "Snap" are trademarks of their respective owners (Snap and Specs Inc.). They are used here only to describe where these files came from (Apache-2.0 section 6). This port is not made or endorsed by Snap or Devpost.

## More detail

See `PORTING.md` in the CLAD-for-Kiro kit for the full inventory, every modification with its reason, and the verification that was run.
