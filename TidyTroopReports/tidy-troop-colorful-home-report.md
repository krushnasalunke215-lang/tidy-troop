# Tidy Troop: mess on the Colorful Home bedroom bed (report)

Restored on 2026-11-05 from the copy the orchestrator read at about 17:00, after the `.agents` folder was deleted. The content below is unchanged. Later changes are in `MIGRATION-HANDOFF.md` at the project root:
- The saved scene now has `saluteSeconds = 3` and 12 cm tags.
- The `TEMP_` objects and scripts are gone.
- `DebugDriver` is still enabled.

Status: **incomplete, blocked**. Lens Studio crashed at about 13:01 (`CrashLog-2026-11-05-13-01-20-656-e15cb.txt`) and was relaunched at 16:33. After that, the Lens Studio MCP tools were no longer available to the Kiro session, so I could not finish verification, cleanup or the user's new feedback. Everything below up to "Remaining work" was done and checked before the crash. The scene on disk was saved at 12:33:31.

## 1. Measurements and how I found them

| What | Value | How |
|---|---|---|
| Default preview start pose | position (0, 0, 0), rotation (0, 0, 0), facing world −Z | `MovePreviewCamera reset` then `getPose`. Runtime "Camera Object" read back at (0,0,0). |
| Lens start pose in practice | wherever the preview camera is when the Lens restarts | Refreshing the preview keeps the camera pose (checked: refresh at (-420,0,-160) kept that pose). |
| Colorful Home floor | world y = −136 (136 cm below the default eye height) | WorldQueryModule hit tests from a temporary probe script: every floor hit had normal (0,1,0) and y = −136.0. |
| Bedroom orientation | walls at 45°: "forward" f = (0.6947, 0, 0.7193) toward the headboard wall, "right" r = (−0.7193, 0, 0.6947) | Hit-test height map plus a bright temporary floor grid drawn in that frame, checked in Preview panel screenshots from above and at eye level. |
| Colorful Home bed | mattress/cover top 41 cm above the floor (world y ≈ −95). Centre ≈ world (−366.6, −136, 135.8), yaw 134° (headboard toward +f). Cover outline in the bedroom frame: s = 268…448, d = −265…−50 (s = position·r, d = position·f) | Hit-test grid over the bed (most hits at 41 cm, range 40…46 with the pillows) and a cyan outline drawn at 41 cm, which matched the black cover edge in top-down screenshots. |
| Right nightstand top | 27.3 cm above the floor (world y ≈ −108.7) around s 500, d −110; lamp base at about s 495, d −80 | Dense hit-test grid looking straight down. |
| Recommended user start | world (−498.6, 0, 1.9), looking at (−359.7, −25, 145.8): foot of the bed, facing it | Chosen as open floor at the foot of the bed, checked in eye-level screenshots in all four directions. |

## 2. New world positions (ColorfulHomeBedroom mode)

Distances are from the recommended start spot. Heights are above the Colorful Home floor.

| Object | World position (x, y, z) | Yaw | Where it sits |
|---|---|---|---|
| 1 Shirt | (−379.4, −93.0, 60.6) | −121° | on the bed cover, left half (1.3 m) |
| 2 Pants | (−430.4, −92.8, 144.6) | −136° | on the bed cover, right half (1.6 m) |
| 3 Book | (−377.0, −92.0, 127.8) | −106° | on the bed cover, middle (1.75 m) |
| 4 Book | (−422.9, −134.0, 1.1) | −161° | floor, left of the bed foot (0.8 m) |
| 5 Shirt | (−513.1, −90.0, 224.5) | −156° | on the virtual chair seat, by the dresser |
| 6 Pants | (−529.6, −91.5, 240.4) | −46° | draped by the virtual chair (stand offset (0, 0.5, −23)) |
| 7 Plate | (−427.4, −60.3, −66.8) | −136° | on the virtual desk top |
| 8 Book | (−429.0, −106.7, 271.2) | −136° | on the right nightstand top, next to the lamp |
| 9 Plate | (−448.0, −135.3, 224.2) | −136° | floor, right of the bed |
| 10 Plate (behind you) | (−530.8, −135.3, −60.2) | −136° | floor behind the start spot (0.7 m) |
| Cupboard (rail + 4 hangers) | (−592.6, −136, 120.5) | 134° | open floor right of the start, front facing the user (1.5 m) |
| Desk (bookshelf + plate rack, 3 slots each) | (−415.9, −136, −78.0) | −46° | open floor left of the start, in front of the doorway, facing the user (1.15 m) |
| Chair | (−513.1, −136, 224.5) | 134° | kept: fits on open floor between the bed and the dresser |
| Virtual bed | (−366.6, −136, 135.8), hidden | 134° | lies on the real bed as an editor reference, disabled in this mode |
| CharacterPicker | runtime: 80 cm ahead of the start pose, 22 cm below eye level, facing the user | — | measured at (−443.0, −22.0, 59.5) for the recommended start (80.0 cm horizontal) |
| FloorCenter | (−460.4, −136, 41.5) | — | open floor between the bed foot and the start spot (0.55 m ahead) |
| UserStart anchor | (−498.6, −136, 1.9) | 44° | the recommended start spot on the floor |

Room sits at (0, 0, 0) with no rotation, so the Scene transforms of these objects are their world positions.

## 3. What changed

Scripts (all compiled with zero errors at 12:21):
- **New `TidyTroopLayoutSpot.ts`**: per-object placement for both modes. `showInBedroom`, `showAroundUser`, `aroundUserPositionCm`, `aroundUserRotationDeg`. In ColorfulHomeBedroom mode the object's own Scene transform is its placement.
- **`TidyTroopMain.ts`**: new Inspector option `placementMode` (Colorful Home bedroom (fixed), default / Around the user (any room)). `placeRoom()` runs on the first tracked frame. AroundUser moves the Room root to the user's floor spot and start heading and applies every LayoutSpot's AroundUser pose. ColorfulHomeBedroom keeps the authored world positions. `eyeHeightCm` default 136 (matches Colorful Home), used only by AroundUser. The debug report now starts with `mode=`. A log line marks when each salute ends.
- **`TidyTroopItem.ts`**: `standOffsetCm` now turns with the item, so the character's spot is right in both modes.

Scene:
- Room moved to (0,0,0). Bed, Cupboard, Desk, Chair, all 10 items, FloorCenter and UserStart moved to the world positions above, and each got a TidyTroopLayoutSpot holding its original stand-in layout as the AroundUser pose. The virtual Bed is hidden in bedroom mode.
- Item08 moved onto the nightstand top (it overhung the front edge at first). Item06 got rotation −46° and stand offset (0, 0.5, −23).

## 4. Done criteria (checked before the crash)

| # | Result | How it was checked |
|---|---|---|
| 1 | **Pass** | Real SIK mouse input: hover over the Sergeant Sweep card, release, click (InjectPreviewGesture touch events). Log: `picked Sergeant Sweep`. Debug report: `picker=false tags=[1,…,10]`. Screenshot showed tags 1, 2, 3 above the bed items. |
| 2 | **Pass** | Real drag: hover over shirt 1 on the Colorful Home bed, press, move, turn the camera to the cupboard while holding (the hanger glow rings lit), release over hanger 2. Log: `item 1 placed (1 of 10)`. Report: tag 1 gone (`tags=[2,…,10]`). Screenshot showed the shirt hanging on hanger 2. |
| 3 | **Partial** | Log and report: salute sound played (`salute:1`), bubble text `You are disciplined! 1 of 10`, and the salute ended on its timer. I did not get a screenshot of the character on the cleared bed spot: the screenshots folder was deleted (see Known issues) and the crash followed. |
| 4 | Not tested | Planned: place items 2 to 9 with the debug driver (key N), face the bed so only plate 10 (behind) remains out of view, and check arrow plus `chimes=1`. |
| 5 | Not tested | Planned: key N for the 10th item, then check the march to FloorCenter, the light wave and `Room fresh! 10 of 10`. |
| AroundUser mode | Not tested in preview | Code is in place. |

Screenshots: I captured the start view, after-pick view and shirt-on-hanger view into `.agents/tasks/screens/`, but the whole `.agents` folder was deleted by something outside this session between 12:16 and 12:27, and the crash came before I could retake them. **There are no screenshot files to point to.**

## 5. Known issues and state to fix first

The 12:33:31 scene save contained test settings that had to be undone. Status as of the 18:36 save:
- `TidyTroopMain.saluteSeconds` was 25 (test value). It is now 3.
- `Systems/DebugDriver` is still **enabled**. Disable it.
- The temporary objects `TEMP_TouchLog`, `TEMP_Probe` and `TEMP_Markers` and their scripts are gone.

Other known issues:
- The Colorful Home bedroom is about 5 m from the default reset pose. In bedroom mode the user must walk into the bedroom before (re)starting the Lens. If they start elsewhere, the picker still appears in front of them, but the mess is in the bedroom.
- The SPECS 27 preview shows Lens content only inside the simulated display area (a narrow vertical band of the panel), so items near the edge of the view are clipped. Turn the head toward them.
- `PreviewInteractTool` Pinch/Hover fail in this project ("unknown command"), because only AiPreviewAgentInspect is installed. Interaction tests use `InjectPreviewGesture` touch events instead. In the panel, Lens x ≈ 2.07 × input x − 0.537 (y is unchanged). A click = move to the target, `end`, `start`, `end`. A drag = hover, `end`, `start`, several `move`s (the camera may turn while held), `end`.

## 6. Remaining work

See "Remaining work" in `MIGRATION-HANDOFF.md`, which supersedes this list.

## 7. Steps for the user

1. In the Preview panel, use Interactive Preview with the **Colorful Home** scene and the SPECS 27 device.
2. Reset the camera, then walk to the green bedroom with W A S D (Q and E go down and up; right-drag or Shift looks around). Walls don't block you. Stand at the foot of the double bed, facing it.
3. Click the Preview panel's refresh button. The Lens restarts from where you stand.
4. Two character cards appear about 80 cm in front of you. Move the mouse over a card until it highlights, then click.
5. Numbers 1 to 10 appear on the shirts, pants, books and plates on the bed, the floor, the nightstand and the desk.
6. To move a thing: move the mouse over it until it gets slightly bigger (highlighted). Press and hold the mouse button. Keep holding while you move the mouse (and turn with right-drag if needed) to its place: shirts and pants to the hangers in the cupboard on your right, books to the bookshelf and plates to the rack on the desk on your left. The matching places glow while you carry something. Release over a glowing place and the item snaps in.
7. Plate 10 is on the floor behind you. When nothing is left in front of you, an arrow and a chime point you to it.
