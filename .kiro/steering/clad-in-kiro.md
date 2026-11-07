---
inclusion: always
---

# CLAD in Kiro (runtime glue)

This project has Snap's CLAD toolkit (the `ls-clad` plugin from github.com/lens-studio-devs/ls-extensions, commit 8adedd5) installed as Kiro files, plus Devpost's `plan-lens` skill. CLAD is written for Claude Code, Codex, and Cursor and tells you to apply runtime-specific steps by intent (`lens-studio-field-notes`: Hard Rule 2 and "Cross-runtime orchestration"). This file is the Kiro column for those rules. It changes mechanics only. On Lens Studio content, CLAD's text wins.

## Where CLAD lives
- In CLAD text, `ls-clad/`, `${CLAUDE_PLUGIN_ROOT}`, `<ls-extensions>/plugins/ls-clad/` and `<ABSOLUTE_PATH_TO_PROJECT>/<repo>/plugins/ls-clad/` all mean this project's `.kiro/` folder:
  - skills: `.kiro/skills/<skill>/` (example: `ls-clad/skills/scene-construction/references/virtual-scene.md` is `.kiro/skills/scene-construction/references/virtual-scene.md`)
  - agents: `.kiro/agents/<agent>.md`; agent references: `.kiro/agents/references/`
  - `.claude/skills/<any path>/<skill>/SKILL.md` is `.kiro/skills/<skill>/SKILL.md`
- `.claude/docs/lens-studio/*.md` (named by script-author) is not part of CLAD. If those files are missing, continue without them.

## Lens Studio MCP tools (Hard Rule 2, Kiro row)
- The tools come from the `lens-studio` server in `.kiro/settings/mcp.json`. install-clad-kiro.ps1 copies it from the `.mcp.json` that Lens Studio writes. Kiro does not read `.mcp.json`.
- Kiro shows the tools as `@lens-studio/<Tool>`. The callable name can be a sanitized form such as `mcp_lens_studio_<tool>`. Match by the bare tool name (`ExecuteEditorCode`, `VirtualScene`, `scene-graphql`).
- Kiro has no `ToolSearch` step. Skip every "On Claude Code, ToolSearch(...)" line. Kiro loads MCP tool definitions itself.
- If no lens-studio tools exist, follow CLAD's "MCP not connected" stop path. Tell the user to open this project in Lens Studio, start the server (AI Assistant > AI Model Context Protocol (MCP) > Configure Server), re-run install-clad-kiro.ps1 for this folder to refresh the URL and token, and reconnect `lens-studio` in Kiro's MCP Servers panel. That is what CLAD's "restart the session so MCP is picked up" means in Kiro.
- If the "CLAD: Lens Studio MCP liveness gate" hook blocks a lens-studio call, Lens Studio is not reachable. Stop, ask the user to relaunch it, and do not retry.

## Orchestration (Cross-runtime orchestration, Kiro row)
- Spawn a subagent: `ls-clad:<name>` is the Kiro custom agent `<name>` in `.kiro/agents/`. Delegate to it with Kiro's sub-agent tool by name, passing CLAD's payload (for example HANDOFF_PAYLOAD) as the task. If you cannot spawn sub-agents, take CLAD's inline path: read `.kiro/agents/<name>.md` and follow it in this context.
- Continue a subagent (`SendMessage`): no Kiro equivalent. Spawn a fresh one.
- Invoke a skill (`ls-clad:<skill>`, `/<skill>`, the `Skill` tool): activate the Kiro skill `<skill>`. If skill activation is not available to you, read `.kiro/skills/<skill>/SKILL.md` and follow it inline. `$ARGUMENTS` in a skill body means the text supplied with the request; the Kiro IDE does not substitute it.
- Ask the user (`AskUserQuestion`): ask in plain text and end your turn (CLAD's Cursor path). A sub-agent cannot reach the user, so return the question and its options as your result for the main agent to ask.
- Show progress (`TaskCreate`/`TaskUpdate`/`TaskList`): use CLAD's fallback of short inline status lines per phase.
- Claude Code commands in CLAD or plan-lens text: `/mcp` means Kiro's MCP Servers panel; `/plugin` means nothing here, because CLAD's files are in `.kiro/skills` and `.kiro/agents`; `/clear` means start a new Kiro chat session; "auto mode" means Kiro's tool-approval settings.

## Shell on Windows
Kiro runs shell commands in PowerShell on Windows. CLAD's snippets assume bash on macOS:
- Use `python` when `python3` is not found.
- `jq` is usually missing. Read `.virtual-scene.json` with the file tools or `ConvertFrom-Json`.
- `.sh` scripts need Git Bash (`bash <script>`). `lens-js-debugger` ships `lsdbg.cmd` for Windows.
- macOS steps (`open -a`, `/Applications/...`) do not apply. Ask the user to open Lens Studio and the project.
