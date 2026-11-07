# Tidy Troop: first session on the new machine (2026-11-06 to 07)

Lens Studio 5.24.1.26100516 at `E:/krishna all/lrens studio/`. Project `E:/krishna all/projects/lens/TidyTroop-migration-2026-11-05/lens/lens.esproj`. Preview: Interactive, Colorful Home, SPECS 27. Last save: after the AI-model swap (see "Step 6, second pass" at the end), with DebugDriver off. Refresh at 01:03 on Nov 7 was clean: no errors from Tidy Troop scripts, all 10 items report `uses the model in its ModelSlot`.

## Step 1: connection gate
- Lens Studio MCP tools present; `ListAllPanels` answered.
- The open project is this `lens.esproj`; `LensStudio:App.version` = 5.24.1.26100516.
- The preview was on "Sunlit Room". I switched it to Colorful Home + SPECS 27.
- Not signed in (`isAuthorized = false`), as expected. `QueryLensStudioKnowledgeBase` needs sign-in and is unavailable.

## Step 2: scene cleanup
- Deleted the broken root `AiPreviewAgent Handler` (id `8e22ba33…`): its only component was an `AgentInteractScript` ScriptComponent with no script asset, left from the removed AiPreviewAgentInteract package. No children. The working handler (AgentInspectScript) stays.
- `TidyTroop/Systems/DebugDriver` was on for testing and is **disabled** in the 12:56 save.
- `placementMode` is back to `ColorfulHomeBedroom` in the save.

## Step 3: character picker
**Furniture can't cover it any more.** Reproduced first: starting between the bed and the virtual cupboard (camera at (−555, 0, 89.7) facing the bed), the open left cupboard door hid Captain Fresh's card.

Fix (`TidyTroopMain.ts`, `TidyTroopPickerUI.ts`):
- The picker exposes `getViewSamplePoints()`: a 7 × 7 grid over the panel plus 16 cm above it, where the character previews stand.
- While picking, `TidyTroopMain.clearPickerView()` casts sight lines from the eyes to those points and tests every RenderMeshVisual under Room against them, using each mesh's own local box (so rotated furniture isn't over-counted). Meshes hit up to 15 % past the panel count, which catches things poking through it. Those meshes are switched off until the pick, then switched back on (`restorePickerView()`).
- Reasoning: on real glasses real furniture can't cover virtual UI, so the stand-ins shouldn't either. Hidden meshes also can't take a click meant for a card.
- The debug report now lists `pickerCleared=[…]`.

Results:
- Blocked start: log `hid Cupboard while picking`, both cards fully visible, Captain Fresh highlighted and picked with a real click, cupboard back after the pick. Screens 01, 02.
- Normal start (foot of the bed): nothing hidden (`pickerCleared=[]`), so the check only acts when something is really in the way.

**Bigger card text.** New Inspector input `cardTextScale` on CharacterPicker (default 1.8, slider 1 to 2.5). It scales the card names, the taglines and the line under the title; the title grows by 40 % of that. Text boxes grow with it. Names now read at about the same size as the old title, and taglines wrap to two lines. Screens 01 and 09a show it.

## Step 4: retest in the bedroom layout, and AroundUser
Driven through the Lens Studio MCP (`InjectPreviewGesture` touches and keys, `MovePreviewCamera`), checked with the debug report (key R) and Preview panel captures. LEAF still can't run on 5.24.1.

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Pick a card: picker hides, numbers 1-10 appear | **Pass** (real hover + click, both cards on different runs) | `picked Sergeant Sweep`, `picker=false tags=[1..10]`; screen 03 |
| 2 | Shirt 1 from the bed onto a hanger: snaps, number hides | **Pass** (real drag: press on the shirt on the Colorful Home bed, turn to the cupboard while holding, release over hanger 2) | Hanger glows lit while carrying (screen 04); shirt hanging on hanger 2 (screen 05) |
| 3 | Character on the cleared spot, salutes, "You are disciplined! N of 10", gone in about 3 s | **Pass**, with a capture this time | Screen 06b: Sergeant Sweep saluting on pants 2's cleared spot on the bed, bubble "You are disciplined! 2 of 10". Log: `salute for item 2 ended after 3 s`; screen 06c: gone. (Item 1's salute was missed by the camera because the preview lags about 3 s behind tool calls; 06a shows its cleared spot.) |
| 4 | All remaining items out of view: arrow to the nearest, chime | **Pass** | Items 2-9 placed with key N, facing the bed with only plate 10 behind: `arrow=true chimes=1`, arrow pointing left (screen 07) |
| 5 | 10th item plays the ending | **Pass**, light wave now captured | Key N for plate 10. Sergeant marches to FloorCenter, grows, holds the salute; light-wave rings and sparkles; bubble "Room fresh! 10 of 10" (screens 08a-08d, two timestamps of the animation); `fanfare:1 sparkle:1`, `ending finished` after 6 s |

Items 3 to 10 were placed with debug key N (same `place()` code a real drop uses), not dragged.

**AroundUser mode: works.** Camera at the default reset pose (0, 0, 0) in the Colorful Home living room. The stand-in room (virtual bed included) appears around the start spot; the picker sits in front (screen 09a). Pick → tags 1-10 on the stand-in items (09b) → Sergeant salutes on shirt 1's cleared spot on the virtual bed (09c) → items 2-9 by key N → arrow points right toward plate 10 behind, `chimes=1` (09d) → plate 10 → ending with rings, sparkles and "Room fresh! 10 of 10" (09e), `ending finished`.

## Observations worth knowing
- **Preview lag.** With the Colorful Home scene this machine's preview runs a few seconds behind tool calls, and Lens start takes 3-15 s after a refresh. Wait for `TidyTroop: placement …` in the log before clicking. A click sent earlier is lost, and the picker opens toward wherever the camera points when the Lens actually starts.
- `MovePreviewCamera rotate` with pitch +30 after −30 left the camera at pitch 89°. Use `lookAt` instead.
- The click mapping from the old machine still holds: input x = (screen x + 0.537) / 2.07, y unchanged.
- The light-blue square by the character's feet in screens 08c/08d changes angle between the two captures, so it is most likely one of the celebration sparkles. Not checked further.
- Harmless warnings: `SceneMaterialBatcher … batching retries exhausted` (known), and `adb` timeouts from Lens Studio's device plugin (no device connected).

## Screens (`TidyTroopReports/screens/`)
01 picker at the blocked start, cupboard hidden · 02 after pick, cupboard back · 03 tags on the bed · 04 carrying shirt 1, hanger glows · 05 shirt on hanger 2 · 06a item 1's spot cleared · 06b salute + bubble on pants 2's spot · 06c character gone · 07 arrow to plate 10 · 08a-08d ending · 09a-09e AroundUser run.

## Steps 5 and 7
- `devpost/design-brief.md` now describes the bedroom layout and is set back to `status: draft` until the learner re-approves it.
- Lens Studio 5.25 is not out: the download page (ar.snap.com/download) lists 5.24.1, released October 7, 2026. LEAF 4.0.0 stays blocked, so the write-up should use the preview checks and screenshots above.

## Step 6, first pass: better code-built items (superseded)
I first read the learner's "option 2" as "improve the code-built clothes and plates". The learner then said they want real 3D objects, so this pass is now only the fallback: `TidyTroopProp` still builds these meshes when an item's `ModelSlot` is empty.
Saved at 14:13, recompile clean, Lens starts with no errors. DebugDriver is off in the save.

Why they looked "awful": the vertex-colour material is **unlit**, so every part was one flat colour with no edges, and the clothes were three or four plain boxes.

What changed (`TidyTroopMeshKit.ts`, `TidyTroopProp.ts`; books, furniture and both characters are untouched):
- **MeshKit** got new building blocks: `setShading` (bakes a soft light into the vertex colours; ambient stays at 0.68 or higher so nothing goes dark on the additive display), `prismXY` / `bevelPrismXY` (flat outlines with depth and a soft 45° front edge), `stripXY` / `polyStripXY` (seams, stitches, creases), `discXY` (buttons) and `latheY` (turned shapes). It's opt-in, so props that don't call `setShading` look exactly as before.
- **T-shirts:** shaped body and angled sleeves with soft edges, collar and chest stripe in the accent colour, ribbed cuffs and hem, a chest pocket, fold creases.
- **Jeans:** hips and two tapered legs with a gap, waistband with belt loops and a button, fly seam, pocket scoops, contrast stitching (accent colour), whiskers, lighter knees, turned-up cuffs.
- **Plates:** a lathe-turned plate with a flat well, a fine accent line, a sloped rim, a coloured lip and a foot ring underneath.
- Overall sizes match the old meshes (shirt about 49 × 37 cm, jeans 32 × 87 cm, plate 22 cm × 1.4 cm), so the colliders, tags, hanger offsets and rack slots needed no change.

Checked in the preview: close-ups before and after, and in place (screens 10a shirt and jeans on the Colorful Home bed, 10b two shirts and two jeans on the hangers, 10c plates in the rack next to the books).

Not changed and worth a look: the books (still flat colour, but they read fine), and the plates are small at desk distance, so the rim colour does most of the work.

## Step 6, second pass: AI 3D models for all 10 items
All 10 items (2 shirts, 2 pants, 3 books, 3 plates) are now SPECS text-to-3D models. Furniture and both characters are still code-built.

**How they were made**
- Lens Studio 5.24.1 isn't signed in, so its SPECS and FAST3D tools can't run. Generation ran in **5.23.2** (signed in) in its own temporary default project. `lens.esproj` was not re-saved by 5.23.2, and it recompiled clean in 5.24.1 afterwards (SIK included).
- 5.23.2 has no `SubmitSpecsAssetJobs` tool, so the jobs went through `ExecuteEditorCode` with the build-mesh skill's `text-to-3d-request.ts`. Python and Node aren't installed here, so its helpers were ported to PowerShell.
- Prompts, job ids and the helper scripts are in `tempAssetGen/specs3d/` (see its README). Each model is about 2,000 triangles, 1 mesh, 1 material and 2 textures.
- The Asset Library pack "Interior Props Vol 1" (furniture only) had been installed by mistake. Its scene instance and its `Assets/Interior Props Vol 1.lspkg` folder are both removed.

**How they're wired in (5.24.1)**
- The GLBs are imported as prefabs in `Assets/GeneratedMeshes/` (TT_ShirtBlue, TT_JeansBlue, TT_BookCoral, TT_BookMint, TT_ShirtYellow, TT_PantsLavender, TT_PlateBlue, TT_BookYellow, TT_PlateRose, TT_PlateMint).
- Each model is a child of `ItemNN_Visual/ModelSlot`. When that slot has children, `TidyTroopProp` skips its code-built mesh (log line `ItemNN_Visual uses the model in its ModelSlot`). Grabbing, snapping, tags and colliders stay on the parent `ItemNN_*` objects and didn't change.
- Each model was measured with `GetBoundingBox`, then rotated and scaled to the old code-mesh frame and size: clothes upright with the front toward +Z, plates flat, books with the spine toward +Z.

| Item | Model | Rotation | Scale |
|---|---|---|---|
| 01 shirt | TT_ShirtBlue (generated lying flat) | (90, 0, 0) | (46, 16, 46) |
| 02 pants | TT_JeansBlue | 0 | (54, 87, 17) |
| 03 book | TT_BookCoral | (0, 0, 90) | 22 |
| 04 book | TT_BookMint | ModelSlot (0, 0, 90), model (0, 90, 0) | 22 |
| 05 shirt | TT_ShirtYellow (generated upright) | 0 | (46, 46, 12) |
| 06 pants | TT_PantsLavender (generated lying, legs along Z) | (90, 0, 0) | (55, 17, 87) |
| 07, 09, 10 plates | TT_PlateBlue, TT_PlateRose, TT_PlateMint | 0 | 22 |
| 08 book | TT_BookYellow | ModelSlot (0, 0, 90), model (0, 90, 0) | 22 |

- **Lighting off on the models.** With glTF lighting on, the models looked purple in the Colorful Home preview. `ENABLE_GLTF_LIGHTING` is now `false` on all 10 model materials, so they show their texture colours as generated.

**Checked in the preview**
- Screen 11a: shirt, jeans and book on the Colorful Home bed in true colour.
- Screen 11b: both shirts and both pants on the hangers, upright.
- Screen 11c: books on the shelf, plates in the rack.
- Screens 12a and 12b (Nov 7, 01:04 to 01:08): a real click on Sergeant Sweep's card, then a real drag of the AI shirt from the bed to hanger 2. While it's carried, the hanger targets glow. On release it snaps onto the hanger, its tag hides, and the log shows `item 1 placed (1 of 10)` and `salute for item 1 ended after 3 s`. At this start pose the picker hid nothing, so the new models don't trip the furniture check.
- The ending (criterion 5) wasn't rerun with the models. It doesn't use the item visuals, and items 2 to 10 were placed with key N in the 11b/11c run.

**Known issues**
- The yellow shirt (item 5) and the yellow book (item 8) came out orange. They can be regenerated in 5.23.2 if the learner wants exact yellow.
- While it's carried, the shirt shows as a thin edge (12a): it seems to keep its flat pose from the bed. It turns upright when it snaps onto the hanger. This was the same with the code-built shirt.

`.gitignore` now also covers `spk_debug_key.pem`, `Cache/`, `Workspaces/`, `PluginsUserPreferences/` and the `lens.esproj` lock files.

Screens added: 11a-11c, 12a-12b.
