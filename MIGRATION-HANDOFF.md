# Tidy Troop: migration handoff

Rewritten on 2026-11-07 at about 20:00 IST, before the second move. The first move (Nov 5) went from the original machine to a laptop with 7.8 GB RAM. That laptop can't run Lens Studio for long, so the project moves again. A new Kiro chat starts with no memory, so this file, `TidyTroopReports/` and `devpost/` hold everything earlier chats knew. Older detail is in the Git history and the reports.

## Deadline and what judges score
- Learn AR with SPECS (Devpost). Submissions close **November 9, 2026, 5:00 pm Eastern Time, which is November 10, 3:30 am India time**.
- To submit:
  - a video under 3 minutes of the Lens running in Lens Studio's preview, public on YouTube;
  - a public repo with the Lens Studio project and `devpost/` (done: https://github.com/krushnasalunke215-lang/tidy-troop);
  - a text description (drafted in `devpost/write-up.md`).
- The four judging criteria count equally: Design (also the tiebreaker), Technical implementation (including how well it uses CLAD, Lens Studio and the Lens Studio MCP), Innovation, and Presentation (who it's for, what problem it solves, why it matters).

## The Lens (finished and tested)
**Tidy Troop**, for students sharing a room who know where things go but are too tired to put them back. The brief, `devpost/design-brief.md`, is **approved** (Nov 7). The learner kept all the defaults: the name, Sergeant Sweep and Captain Fresh with their lines, and the ending on the clear bed.

The flow in the preview (Colorful Home bedroom):
1. Pick a buddy on two cards.
2. The buddy salutes and says where to start, and tag 1 pulses.
3. Numbers 1 to 10 appear on 2 shirts, 2 pants, 3 books and 3 plates (AI 3D models).
4. Grab each item and drop it in its place: hangers on the right, the shelf and the rack on the desk to the left.
5. The bugle plays at the drop. When you look back at the cleared spot, the buddy salutes there with the job in its own words and "You are disciplined! N of 10".
6. Clearing the bed gets "Bed clear!" with sparkles.
7. An arrow and a chime point to items out of view (plate 10 is behind you).
8. After item 10: "look at your bed", then the big salute, light wave and fanfare on the clear bed, with "Room fresh! 10 of 10 / Done in 3 min 21 s".

State of the saved project (Nov 7, 13:51, Lens Studio 5.24.1, pushed to GitHub):
- `DebugDriver` is **disabled**. It enables the test keys P/N/R; turn it on only for agent tests.
- `placementMode` is `ColorfulHomeBedroom`.
- The timers are at their normal values: briefing 3.5 s, salute 3 s, salute wait 8 s, ending 6 s, final wait 10 s.
- All 5 done criteria pass in the preview, with screenshots: `TidyTroopReports/tidy-troop-new-machine-report.md` and `TidyTroopReports/screens/` (latest run: 13a to 13f2).
- The improvement analysis behind the latest changes is in `TidyTroopReports/improvement-ideas.md`.

## What's left, in order
1. **Gate on the new machine.** The Lens Studio MCP tools are present, `ListAllPanels` works, and the open project is this `lens.esproj` in Lens Studio **5.24.1**. Then recompile and refresh the preview from the start pose; expect no errors and the log lines `TidyTroop: 10 items, 10 slots` and `placement ColorfulHomeBedroom`.
2. **The learner tests it by hand.** On the old laptop Lens Studio froze before they could. Help them through the steps under "How to run it" below. Fix anything they report, test it in the preview, save, then commit and push.
3. **"What I learned"** in `devpost/write-up.md` needs the learner's own words. If they give points, write them up in plain language.
4. **Video** (under 3 minutes), following `devpost/video-script.md`. Restart Lens Studio just before recording. Put the preview camera at the start pose for them (below), and keep DebugDriver off. Record in one take, because "Done in ..." counts from the pick.
5. **YouTube link.** The learner uploads the video as **Public**. Add the link to `devpost/write-up.md` ("Links") and `README.md` ("Demo video"), then commit and push.
6. **Devpost form.** The learner pastes the write-up, the video link and the repo link, then submits before the deadline.

Optional, only if time is left:
- Re-test the `AroundUser` layout with the new flow. It passed before the Nov 7 changes, and the new code doesn't depend on the layout.
- The yellow shirt and yellow book came out orange. Regenerating them needs Lens Studio 5.23.2 in a separate scratch project (see rules). This is low value.

## Setting up the new machine
1. **Machine:** Windows 11 (or macOS 12+), **16 GB RAM or more**, and a dedicated GPU if possible. The 7.8 GB laptop froze: after 15 hours of tests, Lens Studio held 10.9 GB.
2. **Install:**
   - Lens Studio **5.24.1**: https://ar.snap.com/download/v5-24-1
   - Kiro
   - Git for Windows (it includes Git Credential Manager for the GitHub sign-in). Git LFS isn't needed.
   - Lens Studio 5.23.2 is only for making new AI models. If you install it, use a separate folder, never open this project in it, and run only one Lens Studio at a time, because both use MCP port 50040.
3. **Get the project** into a **short folder path** (at most 110 characters; the longest file path inside the repo is 147 characters):
   `git clone https://github.com/krushnasalunke215-lang/tidy-troop.git D:\TidyTroop`
   The repo root is the Lens Studio project folder. It already contains CLAD and plan-lens under `.kiro/`, so the CLAD-for-Kiro kit isn't needed.
4. Open `D:\TidyTroop\lens.esproj` in Lens Studio **5.24.1**. The first open rebuilds `Cache/` and takes a few minutes. In the Preview panel, choose **Interactive Preview**, the **Colorful Home** scene and the **SPECS 27** device.
5. **Start the MCP server:** AI Assistant > AI Model Context Protocol (MCP) > Configure Server. Lens Studio writes `.mcp.json` in the project folder.
6. **Connect Kiro.** In PowerShell, in the project folder, run:
   `powershell -NoProfile -ExecutionPolicy Bypass -File tools\connect-kiro-mcp.ps1`
   It should say `lens-studio (http://localhost:<port>/mcp) written to .kiro\settings\mcp.json`. Run it again whenever Lens Studio restarts its MCP server, because the port and token change.
7. Open the project folder in Kiro. In the MCP Servers panel, check that `lens-studio` is connected.
8. Start a new chat and paste the first message at the end of this file.

The repo leaves out these local files: `Cache/`, `Workspaces/`, `PluginsUserPreferences/`, `.mcp.json`, `.kiro/settings/mcp.json`, the agent configs under `.claude/`, `.codex/`, `.cursor/` and `.vscode/` (they hold the MCP token), `spk_debug_key.pem`, `ls-live-instance.json` and the lock files. Lens Studio and `tools\connect-kiro-mcp.ps1` create fresh ones.

## How to run it (for the learner's test and the video)
1. Start pose: the foot of the double bed in the green bedroom, facing the bed. Get there with WASD (right-drag to look around), or ask the agent to use `MovePreviewCamera`: `setPosition (-498.6, 0, 1.9)`, then `lookAt (-359.7, -65, 145.8)`. This looks slightly down, so the cards and the bed items are both in view (screen 17b). Don't scroll to zoom out: scrolling moves the camera back out of the bedroom. If the cards aren't in front of you, walk into the bedroom: before a pick they reopen in front of you once you have moved 1.5 m.
2. Click the Preview panel's refresh button. Wait for the two cards (up to 15 s); a click sent earlier is lost.
3. Hover over a card until it highlights, then click.
4. To move an item: hover until it highlights, press and hold, keep holding while you turn to its place (it glows), then release.
5. After each drop, turn back to the spot the item came from to see the salute.

## Git (commit and push)
- Repo: https://github.com/krushnasalunke215-lang/tidy-troop, branch `main`, remote `origin`. The latest commit before this move is the one that adds this file.
- Author for commits: `krushna salunke <247086676+krushnasalunke215-lang@users.noreply.github.com>`. This is the learner's GitHub noreply address. Pass it with `git -c user.name=... -c user.email=...`, and don't change the global Git config.
- Helpers: `tempAssetGen/repo-commit.ps1 -Name ... -Email ... -Message ...` stages everything, refuses to commit if it finds the MCP token, a Bearer token, a `.pem` file or a Git LFS pointer, and then commits. `tempAssetGen/repo-push.ps1 -Url https://github.com/krushnasalunke215-lang/tidy-troop.git` pushes. The first push on a new machine opens a GitHub sign-in window for the learner.
- Lens Studio writes a `.gitattributes` that routes `Assets/` and `Packages/` through Git LFS. The repo deliberately has no LFS, so GitHub's "Download ZIP" contains real files. The file is git-ignored, and `repo-commit.ps1` writes a `.git/info/attributes` override that switches those rules off. Plain `git commit` without that override could store LFS pointers.

## Rules learned the hard way
- **Open this project only in Lens Studio 5.24.1.** 5.23.2 re-saves it, and the interaction kit (SIK 4.0.0) then fails to compile ("Cannot find namespace 'SpecsInteractionModule'"). Use 5.23.2 only for a separate scratch project.
- Sign-in in 5.24.1 sends you to the SPECS developer portal, which hasn't opened sign-ups, so SPECS text-to-3D and FAST3D only work from 5.23.2. 5.23.2 has no `SubmitSpecsAssetJobs`; use `ExecuteEditorCode` with `.kiro/skills/build-mesh/tools/text-to-3d-request.ts`. PowerShell ports of the helpers are in `tempAssetGen/specs3d/`.
- LEAF 4.0.0 doesn't compile on 5.24.1 (it needs 5.25 typings), and 5.25 isn't out. Don't install it. The scenarios are drafted in `LeafDrafts/`; testing is done in the preview through the MCP.
- For clicks and drags, use `InjectPreviewGesture` touch events; `PreviewInteractTool` Pinch/Hover returns "unknown command" in this project.
  - A click is: move, end, then start, end.
  - Lens x = 2.07 × input x − 0.537, with y unchanged.
  - Sergeant Sweep's card is at input (0.413, 0.634) from the start pose.
  - Don't send camera moves and clicks in the same batch.
- The preview can lag far behind tool calls. Check what happened in the log, not in screenshots. To capture short moments, set the timers long for the test and restore them before saving.
- The package folders are renamed `InteractionKit.lspkg` and `UIKit.lspkg`, and the scripts import those names.
- The AI item models sit under `ItemNN_Visual/ModelSlot`; `TidyTroopProp` skips its code mesh when that slot has a model. glTF lighting is off on their materials, because lit they looked purple. The characters stay code-built, because their arm salutes and their legs march.
- Save after every stage (`pluginSystem.findInterface(Editor.Model.IModel).project.save()`). Lens Studio has crashed and lost unsaved work.
- Watch memory on long sessions: restart Lens Studio after many preview reloads. Close idle agent terminals in Kiro (Ctrl+Shift+P, "Terminal: Kill All Terminals").
- Keep secrets out of the repo. `.gitignore` covers them; never force-add ignored files.
- "Mr. Clean" is a trademark. Both characters are original and must stay that way.

## Decisions the learner has made
- Two original characters, kept code-built (option A).
- The mess lies on the Colorful Home bedroom's own bed (option B).
- The 10 items are AI 3D models.
- All six improvements from the analysis (Nov 7).
- The brief is approved, with the defaults kept.
- Dropped: discipline over several days.
- Parked: an alphabet Lens for the learner's younger sister. Specs are for ages 18 and up.

## First message for the new Kiro chat
> Read MIGRATION-HANDOFF.md, devpost/design-brief.md, devpost/write-up.md and the reports in TidyTroopReports/. We moved this Lens Studio project to another new machine. Check the Lens Studio connection first, then continue from "What's left", starting at step 1. The deadline is November 9, 5:00 pm Eastern (November 10, 3:30 am India time).
