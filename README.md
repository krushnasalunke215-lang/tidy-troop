# Tidy Troop

A Lens for SPECS (Snap's AR glasses), made for Devpost's [Learn AR with SPECS](https://learn-specs.devpost.com/) hackathon.

Numbers appear on 10 things lying around a shared room: 2 shirts, 2 pants, 3 books and 3 plates. Put one where it belongs, and your buddy (Sergeant Sweep or Captain Fresh) pops up on the spot you just cleared, salutes and says "You are disciplined!". After the 10th item, the room gets a light wave, sparkles and a fanfare. It's for students sharing a room who know where things go but are too tired to start.

- Demo video: **[YouTube link]**
- Write-up: [`devpost/write-up.md`](devpost/write-up.md)
- Plan: [`devpost/design-brief.md`](devpost/design-brief.md) and [`devpost/planning-notes.md`](devpost/planning-notes.md), written with Devpost's `plan-lens` skill

## Run it
1. Open `lens.esproj` in **Lens Studio 5.24.1**. Don't open it in 5.23.2: that re-saves the project, and the interaction kit then fails to compile.
2. In the Preview panel, choose Interactive Preview, the **Colorful Home** scene and the **SPECS 27** device.
3. Walk into the green bedroom with WASD (right-drag looks around), stand at the foot of the double bed facing it, and click the Preview panel's refresh button. The Lens starts from where you stand.
4. Hover over a card or item until it highlights. Click to pick a card. Press and hold to grab an item, and release it over a glowing place.

`TidyTroopMain.placementMode` has a second setting, "Around the user", that puts the whole stand-in room around wherever you start, for other preview scenes.

## What's where
| Path | What it holds |
|---|---|
| `Assets/Scripts/` | All Tidy Troop TypeScript: game flow (`TidyTroopMain.ts`), items, places, characters, UI, sound, celebration |
| `Assets/GeneratedMeshes/` | The 10 item models, made with SPECS text-to-3D |
| `Assets/GeneratedSFX/` | Sounds made with CLAD's sound skills |
| `devpost/` | The planning docs, the write-up and the video plan |
| `TidyTroopReports/` | Build and test reports, with preview screenshots in `screens/` |
| `LeafDrafts/` | LEAF test scenarios for the 5 done criteria (LEAF 4.0.0 needs Lens Studio 5.25, so they haven't run) |
| `tempAssetGen/` | Sound generators, and the prompts and helper scripts for the 3D models |
| `.kiro/` | Snap's CLAD and Devpost's skill pack as installed for the Kiro agent. Licences and changes are in `.kiro/third-party/` |
| `MIGRATION-HANDOFF.md` | Project state and decisions, kept so a new agent session can continue the work |

## How it was built
Planned with Devpost's `plan-lens` skill, then built and tested by the Kiro coding agent with Snap's CLAD skills and agents, working in Lens Studio through the Lens Studio MCP. Interaction uses Spectacles Interaction Kit and Spectacles UI Kit. The pre-existing packages and assets used are listed under "Pre-existing work used" in `devpost/write-up.md`.
