# Tidy Troop build report (first build)

Restored on 2026-11-05 from the copy the orchestrator read on 2026-11-04, after the `.agents` folder was deleted. The content is unchanged. This is the first build, with the stand-in room placed at the world origin. The bedroom layout that replaced it is described in `tidy-troop-colorful-home-report.md`, and the current state is in `MIGRATION-HANDOFF.md`.

Lens Studio 5.24.1, project `lens.esproj`, target Spectacles. The scene was saved at 16:56 on 2026-11-04.

## 1. What was built

The full loop from `devpost/design-brief.md` works in Interactive Preview:
1. You pick a character on two big cards.
2. Numbers 1 to 10 appear over the mess.
3. You grab an item and drop it on its place. It snaps in, its number disappears, and your character pops up on the spot you cleared. The character salutes and says "You are disciplined! N of 10" with a bugle, then leaves after 3 s.
4. Places of the right kind glow while you carry an item.
5. If you turn away from every remaining item, an arrow and a chime point you to the nearest one.
6. After the 10th item, the character marches to the middle of the floor, grows to twice its size and holds a salute. A light wave and sparkles spread across the room, a fanfare plays, and the bubble says "Room fresh! 10 of 10". This lasts 6 s, then everything fades.

Both characters are built: Sergeant Sweep (a small soldier with a helmet and broom) and Captain Fresh (a round cartoon buddy in a captain's cap). Both are original designs and the name "Mr. Clean" is not used anywhere.

### Where things live (scene)

```
TidyTroop
  TidyTroopMain              game flow (TidyTroopMain.ts), all wiring and tuning in the Inspector
  Systems/SoundCues          TidyTroopAudio.ts
  Systems/EndingCelebration  TidyTroopCelebration.ts (light wave + sparkles)
  Systems/DebugDriver        TidyTroopDebugDriver.ts (preview test keys P/N/R)
  UI/CharacterPicker         TidyTroopPickerUI.ts (UIKit BackPlate + 2 UIKit Buttons)
  UI/NumberTags              TidyTroopNumberTagsUI.ts
  UI/SpeechBubble            TidyTroopSpeechBubbleUI.ts (UIKit BackPlate)
  UI/HintArrow               TidyTroopHintArrowUI.ts
  Characters/SergeantSweep, Characters/CaptainFresh   TidyTroopCharacter.ts
  Room
    Furniture/Bed, Cupboard (+HangerSlot1-4 with Hanger1-4), Desk (+Bookshelf/ShelfSlot1-3,
              PlateRack/RackSlot1-3), Chair          TidyTroopProp.ts / TidyTroopSlot.ts
    Mess/Item01_Shirt ... Item10_Plate_BehindYou     TidyTroopItem.ts (+ child visual)
    Anchors/FloorCenter (ending spot), UserStart
```

Every position, size, color, text, timing and volume is an Inspector input on those objects, so design changes can be made without code.

### Scripts (`Assets/Scripts/`)
- `TidyTroopMain.ts`: game flow.
- `TidyTroopState.ts`: game state.
- `TidyTroopItem.ts`: grab with SIK `Interactable` + `InteractableManipulation`.
- `TidyTroopSlot.ts`: a place an item belongs, with its glow.
- `TidyTroopProp.ts`: code-built furniture and item meshes.
- `TidyTroopCharacter.ts`: both characters, with an articulated salute arm, march and grow.
- `TidyTroopMeshKit.ts`: MeshBuilder helpers.
- `TidyTroopAudio.ts`, `TidyTroopCelebration.ts`.
- `TidyTroopPickerUI.ts`, `TidyTroopNumberTagsUI.ts`, `TidyTroopSpeechBubbleUI.ts`, `TidyTroopHintArrowUI.ts`, `TidyTroopTypeScaleUI.ts`: UI.
- `TidyTroopAssets.ts`: asset references.
- `TidyTroopDebugDriver.ts`: preview test keys.

### Assets
- **Sounds** (`Assets/GeneratedSFX/`): PickClick, SnapPlace, HintChime, SparkleShimmer (sound effects), plus SaluteBugle and Fanfare (short jingles). The generators are in `tempAssetGen/` so they can be re-run.
- **Icons** (`Assets/Icons/`): military_tech (Sergeant card), sentiment_very_satisfied (Captain card), circle and radio_button_unchecked (number tags), arrow_forward (hint arrow).
- **Materials**: `Materials/ImageMaterial.mat` (with Image.png and flat.graphShader), plus the vertex-color material in `SimpleVertexBaseColor.lspkg/`.

## Substitutions and assumptions
- **Meshes are code-built.** The furniture, the 10 items and both characters use MeshBuilder with vertex colors in light, simple shapes, at real sizes. SPECS and FAST3D generation was not used, because Lens Studio sign-in isn't available.
- **Captain Fresh's card icon** is `sentiment_very_satisfied` instead of `star`. The `star` icon resolves to a texture inside the UIKit Icons package, which can't be referenced from the script's path.
- **Package folders renamed** to `InteractionKit.lspkg` and `UIKit.lspkg`. The 4.0 packages and the preview agent import them under those names, and so do the scripts.
- **Hanging clothes** turn 70° from the rail so they read from the front.
- **Snapping:** an item snaps if released within 32 cm of a free place of its kind, or over it along your line of sight.
- **Out-of-view hint:** the view cone is 30° horizontal and 65° vertical. All remaining items must stay out of view for 0.6 s before the arrow and chime show. When the nearest item is behind you, the arrow points left or right, whichever is the shorter turn.
- **No background music**, only the click, snap, salute bugle, chime and fanfare.
- **Bigger final salute:** for the ending the character grows to 2x its size.

## 2. LEAF results per done criterion

**LEAF: blocked, so no LEAF scenario ran.** LEAF 4.0.0 is the only version in the Asset Library. Its own source fails to compile on 5.24.1 (`TS2352`, `Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator.ts:91`), and its comment says it targets the Lens Studio 5.25 typings. A compile error in any package stops the whole Lens, so `Leaf.lspkg` was removed. `AiPreviewAgentInteract.lspkg` imports LEAF, so it was removed too. `AiPreviewAgentInspect.lspkg` compiles and is kept. LEAF scenarios for all 5 criteria are drafted in `LeafDrafts/` (outside `Assets/`); `LeafDrafts/README.md` explains how to enable them.

**Preview verification instead (not LEAF),** driven through the Lens Studio MCP tools: real mouse clicks and drags, camera turns, and the debug-driver state report.

| # | Done criterion | Result | How it was checked |
|---|---|---|---|
| 1 | Pinch a card: picker hides, numbers 1-10 appear | **Pass (logic proven)** | A real click on the Sergeant card picked Sergeant Sweep: the picker hid, tags 1-10 showed, and the click played. A real click on the Captain card picked Captain Fresh in another run. |
| 2 | Shirt 1 from the bed onto a hanger: snaps, number hides | **Pass (logic proven)** | Real drag from the bed to the cupboard (the 4 hanger glows lit up), released over hanger 2: it snapped on, tag 1 hid and the glows turned off. |
| 3 | Character on the cleared bed spot, salutes, "You are disciplined! 1 of 10", gone within about 3 s | **Pass (logic proven)** | The character stood where shirt 1 lay; the bubble said "You are disciplined! 1 of 10" and the bugle played. Captures show the salute for both characters. The 3 s hide is a code timer. |
| 4 | Turn away from all remaining items: arrow to the nearest, chime | **Pass (logic proven)** | Turned the preview camera 90° right: within about 1 s the arrow showed and the chime played once. Turning back hides it. |
| 5 | 10th item plays the ending | **Pass with caveat** | Items placed with debug key N (same placement code as a drop, not a drag). The character marched to FloorCenter, the fanfare and sparkles played, and the bubble said "Room fresh! 10 of 10". The 2.2 s light-wave ring was not caught in a capture. |

The "feel" is unproven for all five (real hand tracking, comfort, real recognition).

## 3. Known issues at the time
1. LEAF can't run on 5.24.1 (see above).
2. A project saved in 5.24.1 may not open cleanly in an older version, and SIK, UIKit, Motion and Icons 4.0.0 may need 5.24+. (Confirmed on 2026-11-05: opening it in 5.23.2 breaks SIK compilation.)
3. To use AI meshes later: put the GLB under each item's `*_Visual` or furniture SceneObject and switch off its `TidyTroopProp` script. Item behaviour lives on the parent `ItemNN_*` objects.
4. A card press registers reliably once the mouse has hovered the card first.
5. The speech bubble is tuned for about 200 cm reading distance, and the picker taglines are small.
6. Not visually confirmed: the light-wave ring, pants hanging on a hanger, and plate 10 snapped by a real drag after turning around.
7. The room was placed relative to the world origin, so in the Colorful Home preview it sat about 6 m from where the user stands. Fixed later by the bedroom layout.
8. Harmless log warnings: "SceneMaterialBatcher ... batching retries exhausted" for text and tag visuals.
