# Tidy Troop: migration handoff

Written on 2026-11-05 at about 20:15, on the old machine (Windows; project at `E:\Work\Hackathons\learn ar with specs\lens`). A new Kiro chat on the new machine starts with no memory of the old one. This file, `TidyTroopReports/` and `devpost/` hold everything the old chat knew.

## Deadline and what judges score
- Learn AR with SPECS (Devpost). Submissions close **November 9, 2026, 5:00 pm Eastern Time**. Winners are announced around November 19.
- To submit: a video under 3 minutes of the Lens running in Lens Studio's preview, public on YouTube; a public repo with the Lens Studio project and `devpost/`; a text description.
- The four judging criteria count equally: Design (also the tiebreaker), Technical implementation (including how well it uses CLAD, Lens Studio and the Lens Studio MCP), Innovation, and Presentation (who it's for, what problem it solves, why it matters).

## The Lens
- **Tidy Troop**, for students sharing a room (the learner and their roommates) who know where things go but are too tired or lazy to put them back.
- The approved brief is `devpost/design-brief.md`. Interview notes, in the learner's own words, are in `devpost/planning-notes.md`.
- The flow: you pick a character (Sergeant Sweep or Captain Fresh), and numbers 1 to 10 appear on 2 shirts, 2 pants, 3 books and 3 plates. You grab each item and drop it in its place. The character appears on the cleared spot, salutes and says "You are disciplined! N of 10". An arrow and a chime point to items out of view. After the 10th item comes the ending: a final salute, a light wave with sparkles, a fanfare and "Room fresh! 10 of 10".

## Update 2026-11-06 to 07 (new machine, first session)
Steps 1 to 4 and 6 of "Remaining work" are done, step 5 is waiting on the learner, and step 7 is checked. Details and screenshots: `TidyTroopReports/tidy-troop-new-machine-report.md` and `TidyTroopReports/screens/`.
- New machine: Lens Studio 5.24.1 at `E:/krishna all/lrens studio/`, 5.23.2 at `E:\krishna all\lens 2\` (scratch use only; both use MCP port 50040, so run one at a time). Project at `E:/krishna all/projects/lens/TidyTroop-migration-2026-11-05/lens/`. Last save: after the AI-model swap on Nov 7.
- The broken `AiPreviewAgent Handler` is deleted. `DebugDriver` is **disabled** in the save. Enable it only while testing.
- The picker now hides any room mesh that would cover it until you pick. The card text has a new Inspector input, `cardTextScale` (1.8).
- Criteria 1 to 5 pass in the bedroom layout, with screenshots. `AroundUser` mode passes the same run.
- The design brief is updated for the bedroom layout and set to `status: draft`. It needs the learner's re-approval.
- Lens Studio 5.25 is not released yet (download page: 5.24.1, October 7, 2026), so LEAF stays blocked.
- The "still wrong" and "seen in a screenshot" lists below are fixed.
- **Step 6 is done: all 10 items are AI 3D models.** They were generated with SPECS text-to-3D in Lens Studio 5.23.2 (signed in, its temporary default project), imported in 5.24.1 as prefabs in `Assets/GeneratedMeshes/`, and placed under each `ItemNN_Visual/ModelSlot`. `TidyTroopProp` skips its code-built mesh when the slot has a model, so the improved code meshes (saved 14:13 on Nov 6) are only a fallback now. glTF lighting is off on the model materials (`ENABLE_GLTF_LIGHTING = false`), because lit they looked purple. Prompts and job ids: `tempAssetGen/specs3d/README.md`. Transforms and checks: "Step 6, second pass" in the report.
- Checked on Nov 7: a real click on a card and a real drag of the AI shirt from the bed to hanger 2 work (screens 12a, 12b). The models were also checked on the bed, the hangers, the shelf and the rack (11a to 11c). The yellow shirt and yellow book came out orange; they can be regenerated if wanted.
- The mistaken Asset Library pack "Interior Props Vol 1" is removed (scene instance and `Assets/Interior Props Vol 1.lspkg`).
- 5.23.2 opened `lens.esproj` twice on Nov 6 but didn't re-save it. The project recompiled clean in 5.24.1 afterwards, SIK included.
- `.gitignore` now also covers `spk_debug_key.pem`, `Cache/`, `Workspaces/`, `PluginsUserPreferences/` and the `lens.esproj` lock files.
- The project is saved with DebugDriver **disabled**.
- The learner chose to keep both characters code-built (option A), because AI models can't move their arm to salute.
- Step 9 prep (Nov 7):
  - Drafts written: `devpost/write-up.md` (Devpost page text; the **[you]** parts need the learner's words) and `devpost/video-script.md` (shot list, lines, recording steps). There's also a root `README.md`.
  - Local Git repo (`main`), first commit `5da06f2`. It holds 772 files, checked for the MCP token, Bearer tokens and `.pem` files (none found).
  - Author: krushna salunke `<247086676+krushnasalunke215-lang@users.noreply.github.com>` (the learner's GitHub noreply address). It was passed with `git -c`; the global Git config is unchanged.
  - GitHub: https://github.com/krushnasalunke215-lang/tidy-troop (public, created by the learner on Nov 7). Remote `origin`, branch `main`. To publish later changes: commit, then `git push`.
- Improvements (Nov 7, saved 13:51, DebugDriver off): from the analysis in `TidyTroopReports/improvement-ideas.md`, which the learner approved in full. The salute waits until you look at the cleared spot, there's a briefing after the pick, "Bed clear!" with sparkles, a line per job and per buddy (`Assets/Scripts/TidyTroopLines.ts`), and the ending plays on the clear bed with the time taken. The brief, done criteria 3 and 5, the write-up and the video script are updated to match. Checks and screens 13a-13f2: "Improvements from the analysis" in the report.
- Still open: step 5 re-approval and step 8 choices (both the learner's), then the video and the Devpost form.
- The "Current state" section below describes the old machine on Nov 5 and is kept for history.

## Current state (checked against the saved files at about 20:10)
- The scene was last saved at 18:36 in Lens Studio 5.24.1 (`lens.esproj` says 5.24.1.26100516). At 18:41 it recompiled with zero errors, and a preview refresh showed no runtime errors.
- `TidyTroopMain.placementMode = ColorfulHomeBedroom`:
  - Shirt 1, pants 2 and book 3 lie on the Colorful Home preview bedroom's own bed. The other items are on the floor, a nightstand, the virtual chair and the virtual desk. Plate 10 is on the floor behind the start spot.
  - The virtual cupboard (rail and 4 hangers) is to the right of the start spot. The virtual desk, with a 3-slot bookshelf and a 3-slot plate rack, is to the left. The virtual bed is hidden.
  - A second mode, `AroundUser`, places the original stand-in room around wherever the user starts. Its code is in place but it has not been tested.
- These settings are correct in the saved scene: `saluteSeconds = 3`, `tagDiameterCm = 12`. The builder's `TEMP_` test objects and their scripts are gone.
- **These are still wrong in the saved scene:**
  - `TidyTroop/Systems/DebugDriver` is **enabled**. It turns on the test keys P/N/R, so disable it before recording.
  - There are two root objects named `AiPreviewAgent Handler`. One has a ScriptComponent with no script asset. Delete that one.
- **Seen in a Preview panel screenshot at 18:41:**
  - The virtual cupboard's open door stands in front of the view and hides Captain Fresh's card.
  - The card names and taglines are too small to read at 80 cm.
- All furniture, items and both characters are code-built with MeshBuilder, because AI 3D generation needs sign-in. The characters look decent. The clothes are flat blue cut-outs, and the learner said the items "look awful".

## Done criteria (from the brief)
| # | Criterion | Status |
|---|---|---|
| 1 | Pinch a character card: picker hides, numbers 1-10 appear | Pass in the bedroom layout (real hover and click) |
| 2 | Shirt 1 from the bed onto a hanger: snaps, number hides | Pass in the bedroom layout (real drag) |
| 3 | Character on the cleared bed spot, salutes, "You are disciplined! 1 of 10", gone in about 3 s | Partial in the bedroom layout: the log shows the salute and bubble text, but there's no screenshot. It passed in the original layout. |
| 4 | Turn away from all remaining items: arrow to the nearest, chime | Passed in the original layout. Not retested in the bedroom layout. |
| 5 | 10th item plays the ending | Passed in the original layout using debug key N (the light-wave ring wasn't caught on camera). Not retested in the bedroom layout. |

LEAF tests could not run (see below). Evidence so far comes from preview checks driven through the Lens Studio MCP. The full reports are in `TidyTroopReports/`.

## Decisions the learner has made
- Keep the choice of two characters: Sergeant Sweep (a small soldier with a helmet and broom) and Captain Fresh (a round cartoon buddy in a captain's cap). Both are original designs. "Mr. Clean" is a trademark and must not be used.
- **Bedroom option B:** use the Colorful Home preview bedroom's own bed for the mess.
- **3D option A:** generate AI 3D models in Lens Studio 5.23.2, where sign-in works (the organizers' workaround on the hackathon forum). Do it in a **separate new SPECS Base Template project**, never in this one. Then copy the GLBs into Tidy Troop and, in 5.24.1, swap them in for the code-built visuals. Item behaviour lives on the parent `ItemNN_*` objects, so the visuals can be swapped without touching gameplay.
- Still the brief's defaults, not yet chosen by the learner: the Lens name, the character names and personality, and the ending.
- Dropped: discipline over several days.
- Parked: an alphabet Lens for the learner's 4-year-old sister. It's undecided, and Snap's Specs are for ages 18 and up.

## Rules learned the hard way
- **Open this project only in Lens Studio 5.24.1.** 5.23.2 re-saves it, and the interaction kit (SIK 4.0.0) then fails to compile ("Cannot find namespace 'SpecsInteractionModule'"). Use 5.23.2 only for a separate scratch project.
- Lens Studio sign-in in 5.24.1 sends you to the SPECS developer portal, which hasn't opened sign-ups. Don't wait for sign-in in 5.24.1.
- LEAF 4.0.0, the only version in the Asset Library, doesn't compile on 5.24.1. It needs 5.25 typings (TS2352 in `Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator.ts:91`). Don't install it into this project. The scenarios are drafted in `LeafDrafts/`. `AiPreviewAgentInteract` imports LEAF, so only `AiPreviewAgentInspect` is installed. For interaction tests, use `InjectPreviewGesture` touch events (`PreviewInteractTool` Pinch/Hover returns "unknown command" here).
- The package folders are renamed `InteractionKit.lspkg` and `UIKit.lspkg`, and the scripts import those names.
- Lens Studio picks a new port and token each time its MCP server restarts. When that happens, re-run `install-clad-kiro.ps1 -ProjectPath <project folder>` and reconnect `lens-studio` in Kiro's MCP Servers panel.
- Something on the old machine kept deleting the `.agents` folder. Keep reports in `TidyTroopReports/`.
- Save after every stage. Lens Studio crashed once (13:01 on Nov 5) and lost unsaved work.
- **How to see the mess in the preview:** Interactive Preview, the Colorful Home scene, the SPECS 27 device. Walk into the green bedroom with WASD, stand at the foot of the double bed facing it, then click the Preview panel's refresh button. The Lens starts from there. Hover over a card or item until it highlights, then click (pick) or press and hold (grab).

## Remaining work, in order
1. Run the gate on the new machine: Lens Studio MCP tools are present, `ListAllPanels` works, and the open project is this `lens.esproj` in 5.24.1. Skip the sign-in check.
2. Delete the broken `AiPreviewAgent Handler`. Leave `DebugDriver` enabled only while testing, then disable it. Save.
3. Fix the character picker so furniture can't block it, and enlarge the card names and taglines so they read at 80 cm.
4. Retest criteria 3 to 5 in the bedroom layout, and test `AroundUser` mode. Save screenshots to `TidyTroopReports/screens/`.
5. Update `devpost/design-brief.md` to match the bedroom layout (it still describes a virtual bed), then ask the learner to re-approve it.
6. AI 3D models: make them in a separate 5.23.2 project, copy the GLBs in and swap them in 5.24.1 (decision above). If generation fails, fall back to improved MeshBuilder shapes or to CC0/CC-BY models with credit.
7. LEAF: check whether Lens Studio 5.25 is out and whether its sign-in works. Otherwise, document the preview checks with screenshots in the write-up.
8. The learner's own choices: the ending, the character names and the Lens name.
9. Video (under 3 min, problem and audience first), write-up, and public repo. Keep secrets out of the repo: `.mcp.json`, `.kiro/settings/mcp.json`, `spk_debug_key.pem`, and the agent configs under `.claude/`, `.codex/`, `.cursor/` and `.vscode/` that hold the MCP token. Check `.gitignore` covers them.

## Setting up the new machine
1. Install **Lens Studio 5.24.1** from https://ar.snap.com/download/v5-24-1. Install 5.23.2 (https://ar.snap.com/download/v5-23-2) only into a separate folder, and only for the AI-model scratch project.
2. Install Kiro. Optional: Python 3 (re-runs the sound generators in `tempAssetGen/`) and Git for Windows (Git Bash for CLAD's `.sh` scripts, and version history).
3. Unzip the migration package to a **short path**, for example `D:\TidyTroop\`. Long paths make `install-clad-kiro.ps1` fail with exit code 1.
4. Open `lens\lens.esproj` in Lens Studio **5.24.1**. In the Preview panel, choose Interactive Preview, the **Colorful Home** scene and the **SPECS 27** device.
5. Start the MCP server: AI Assistant > AI Model Context Protocol (MCP) > Configure Server. Lens Studio writes a new `.mcp.json`.
6. In PowerShell, run:
   `powershell -NoProfile -ExecutionPolicy Bypass -File "<package>\clad-kiro-port\install-clad-kiro.ps1" -ProjectPath "<package>\lens"`
   It should report `lens-studio` written into `.kiro\settings\mcp.json`.
7. Open the `lens` folder in Kiro, open the MCP Servers panel, and check that `lens-studio` is connected.
8. Start a new chat and paste the first message below.

## Left out of the package, and why
- `Cache/`: Lens Studio rebuilds it.
- `Workspaces/` and `PluginsUserPreferences/`: local editor layout and preview settings, with paths from the old machine. Re-select Colorful Home and SPECS 27 in the preview.
- `.mcp.json`, `.kiro/settings/mcp.json`, `.claude/settings.local.json`, `.codex/config.toml`, `.cursor/mcp.json`, `.vscode/mcp.json`: they hold the old machine's MCP port and token. Lens Studio and the installer write fresh ones.
- `spk_debug_key.pem`: a private debug key. Lens Studio creates a new one.
- `ls-live-instance.json`, `lens.esproj.*.lock`: old-machine runtime files.
- `.icon_tmp/`: the builder's temporary files.

## First message for the new Kiro chat
> Read MIGRATION-HANDOFF.md, devpost/design-brief.md and the reports in TidyTroopReports/. We moved this Lens Studio project to a new machine. Check the Lens Studio connection first, then continue Tidy Troop from "Remaining work", starting at step 2. The deadline is November 9, 5:00 pm Eastern.
