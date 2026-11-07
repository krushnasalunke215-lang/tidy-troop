# Tidy Troop LEAF drafts (not compiled)

These scenarios cover the 5 done criteria in `devpost/design-brief.md`. They live outside
`Assets/` on purpose: LEAF 4.0.0 (the only LEAF in the Asset Library) does not compile on
Lens Studio 5.24.1 (`TS2352` in `Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator.ts:91`;
its own comment says it targets the 5.25 typings), and a package compile error stops the whole Lens.

To use them once a compatible LEAF is installed:
1. Install LEAF, then recompile and confirm there are no errors.
2. Move this folder to `Assets/Tests/` and change the imports `../Assets/Scripts/...` to `../Scripts/...`.
3. Add a root SceneObject `LeafIndex` with a ScriptComponent using `TidyTroopLeafIndex.ts`.
4. Run in order: c1, c2c3, c4, c5 (they share one Lens session).

The scene names used (`Card_SergeantSweep`, `Item01_Shirt`, `HangerSlot2`, `Tag_1`, `SpeechBubble`,
`HintArrow`, `FloorCenter`, `LightWave`, `Sparkle_0`, `Camera Object`) were checked in the live scene.
`TidyTroopMain` exposes `phase`, `placedCount`, `items`, `slots`, `chosenCharacter`, `lastMessage`,
`hintShowing`, `hintChimes`, and `audio.playCount` for these asserts.
