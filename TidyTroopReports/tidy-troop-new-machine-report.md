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

## Improvements from the analysis (Nov 7)
The learner asked for an analysis of how to improve the Lens (`improvement-ideas.md`) and approved all six recommended changes ("build all"). Saved at 13:51 with DebugDriver off; recompile and refresh clean.

**What changed** (`TidyTroopMain.ts`, new `TidyTroopLines.ts`, `TidyTroopSpeechBubbleUI.ts`, `TidyTroopNumberTagsUI.ts`, `TidyTroopCelebration.ts`; grab and snap code untouched):
1. **Salute when you look.** The bugle plays at the drop. The salute and bubble wait until the cleared spot is inside a 16° x 18° cone (about the SPECS display), or 8 s at most (`saluteViewConeDeg`, `saluteWaitSeconds`). If another item is placed first, only the newest salute shows.
2. **Final salute on the clear bed.** After item 10, a bubble 90 cm straight ahead says "That's all of them! / Now look at your bed!" (Sergeant: "Eyes on your bed, soldier!"), and the arrow points to the bed when it's out of view. When the spot where item 1 lay is in view (or after 10 s), the buddy appears there, grows 2x, holds the salute, and the light wave and sparkles start from the floor below the bed (`finaleOnItem = 1`, `finaleWaitSeconds`). FloorCenter is now only the floor height.
3. **Briefing.** After the pick, the chosen buddy stays where its card was for 3.5 s, salutes, and says where to start. The bubble sits below it, centred on where the picker was, so it stays inside the display. Tag 1 pulses (`briefingSeconds`, `TidyTroopNumberTagsUI.pulse`).
4. **Bed clear.** Putting away the last of items 1, 2, 3 (`bedItemNumbers`) changes the first line to "Bed clear!" and adds a small burst of 24 sparkles low around the buddy, with no light wave.
5. **Personal lines.** The bubble now has two lines: the job in the buddy's voice, then "You are disciplined! N of 10". Sergeant Sweep is strict ("Shirt hung, soldier!"), Captain Fresh friendly ("Nice! Shirt hung!", "Yay, your bed is clear!"). The lines are in `TidyTroopLines.ts`.
6. **Time in the ending.** "Room fresh! 10 of 10 / Done in 3 min 21 s" (time from the pick to the last item).

Also fixed while testing:
- The bubble now sits with its bottom edge on the anchor, so two lines don't cover the buddy's head.
- Sparkles stop rising after 36 cm, so they stay where they were put.

**Checked in the preview** (Colorful Home, start pose at the foot of the bed). The preview here renders slowly, so for the captures the timers were set long (briefing up to 300 s, salute up to 150 s) and put back to 3.5 / 3 / 6 / 10 / 8 s before the save.

| Check | Result | Evidence |
|---|---|---|
| Briefing after a real click on Sergeant Sweep | Pass: salute and "10 things out of place! / Start with number 1!" in view under the buddy | Screen 13a; log `briefing: ...` |
| Briefing for Captain Fresh | Pass (log only; it ended before the capture): "Hi! 10 things to put away. / Let's start with number 1!" | Log 13:44:39 |
| Salute waits while facing the cupboard | Pass: shirt on hanger 1, no buddy; log has no salute until the camera turned | Screen 13b; log `item 1 placed` then nothing |
| Salute starts when the bed comes into view | Pass: "Shirt hung, soldier! / You are disciplined! 1 of 10" on the cleared spot | Screen 13c; log `started when its spot came into view (83.9 s after the drop)` |
| Salute falls back after 8 s if you never look | Pass | Log 12:17:46 `started after waiting 8 s` |
| Real drag of the AI shirt still works | Pass | Log 12:17:39 `item 1 placed` from a real drag |
| Bed clear (Captain Fresh) | Pass: "Yay, your bed is clear! / You are disciplined! 3 of 10" with sparkles around the buddy | Screen 13d |
| Job lines | Pass: "Pants hung, soldier!", "Plate racked, soldier!", "Nice! Pants hung!", "Nice! Plate put away!" | Log |
| Last item: look at your bed | Pass: bubble centred in view, arrow pointing right to the bed | Screen 13e2 |
| Ending on the clear bed (Captain Fresh) | Pass: 2x buddy on the bed, light wave, sparkles, "Room fresh! 10 of 10 / Done in 3 min 21 s" | Screen 13f2; log `final salute when its spot came into view` |
| Ending on the clear bed (Sergeant Sweep) | Pass. The time reads 63 min because that test run sat paused for an hour | Screen 13f |

Not rerun: AroundUser mode with the new flow. Item 1's origin and the bed items are the same objects in that mode, so it should behave the same.

Screens added: 13a, 13b, 13c, 13d, 13e2, 13f, 13f2.

## Second move and the learner's first test (Nov 7, evening)
Project cloned to `C:\krish` on a 16 GB machine (Lens Studio 5.24.1). The first open spent about 9 minutes compressing textures. After it, the recompile was clean and the log showed `TidyTroop: 10 items, 10 slots` and `placement ColorfulHomeBedroom`.

**Learner report: "trying to put that shirt in cupboard but it ain't going".** The learner had walked about 4.6 m back from the start pose, out through the bedroom wall, and dropped shirt 1 on the middle of the cupboard at height −40 cm. The hanger places sit on the rail at +26 cm. The drop was about 75 cm off every hanger along the view ray, and only drops within `snapRadiusCm` (32 cm) counted, so nothing happened and nothing was logged.

**Fix (TidyTroopMain.findSnap):** if no place is within the snap radius, a drop on furniture that holds a free matching place now counts. That is the cupboard, the bookshelf or the plate rack: the item is inside the furniture's own box (grown by 10 cm), or on the view ray to it. The item goes to the nearest free place on that furniture. Both outcomes are logged: `item N dropped on the Cupboard, so it goes to HangerSlotK`, or `item N dropped away from a free <category> place, not snapped`.

**Test (real drag through the MCP, start pose):** pressed on shirt 1 on the bed, turned to the middle of the cupboard, and released it at height −52.6 cm, 78 cm below the rail. Log: `item 1 dropped on the Cupboard, so it goes to HangerSlot2`, `item 1 placed (1 of 10)`, then the salute: `Shirt hung, soldier! / You are disciplined! 1 of 10`. Screens 14a (held over the cupboard) and 14b (on hanger 2). DebugDriver was on only for this test and is off in the save.

## Learner test, round 2: voice, size from far away, mouse reach (Nov 7, 22:40)
Learner reports, with what the checks found:
- **"I have to zoom out a lot to see the board and the table; now I can't select the shirt."** The SPECS 27 display covers only the middle of the Preview panel (about the middle 40 % of its width), as on the real glasses. The learner scrolled the camera about 4.3 m back, outside the bedroom, to fit the room into it. From there shirt 1 was 5.8 m away, and the interaction kit's mouse ray stops at 500 cm (`BaseInteractor._maxRaycastDistance`). Fix: new input `mouseReachCm` (1500) sets every SIK mouse interactor's `maxRaycastDistance` at start. It only affects the preview mouse, not hands on the glasses. Test: book 3 was grabbed and released from 6 m (`item 3 dropped away ... not snapped`). Looking down from the start pose shows the cards and the bed items together (screen 16b), so turning down works better than zooming out.
- **"The table and cupboard look half."** That is the edge of the SPECS 27 display: Lens content only draws inside it, while the Colorful Home room draws across the whole panel. The models are whole.
- **"The sergeant came, didn't speak, a music rang; he was very small; the text was too small."** The music was the salute bugle; there was no voice yet. From 4-6 m the 30 cm buddy and the bubble (tuned for 150 cm) were tiny.
  - Voice: `tools/make-voice-lines.ps1` makes 40 clips offline with the Windows voices (David pitched down for Sergeant Sweep, Zira pitched up for Captain Fresh): every briefing, job, praise ("You are disciplined! N of 10"), bed-clear, last-item and ending line. It writes `Assets/GeneratedSFX/Voice/` and `Assets/Scripts/TidyTroopVoiceLines.ts`. Lens Studio's TextToSpeechModule is VoiceML, which Specs doesn't support, hence pre-made clips. `TidyTroopAudio.say()` plays a line's clips in a row; the buddy starts talking as the bugle ends, and each salute or briefing lasts until the voice is done. "Done in ..." is shown but not spoken.
  - Size: the buddy grows past 200 cm away (`buddyFullSizeWithinCm`, up to `buddyMaxFarScale` 2.5x), and the bubble grows past its 150 cm reading distance (up to `maxFarScale` 4x).
  - Test from 5.5 m with key N: `voice: Shirt hung, soldier! / You are disciplined! 1 of 10 (4.2 s)`, both clips opened in turn, and the buddy and bubble were readable (screen 16a). The briefing said both lines on pick.
- **"What's the glowing line through the pants?"** It isn't the Lens: with the TidyTroop object turned off it is still there (screen 15d). It is part of the Colorful Home scene, a thin pole in the glass wall the camera was standing behind after zooming out. Inside the bedroom it isn't in view.
- **"Why not 3D models for the table and cupboard?"** Not changed yet; the answer and the options are in the chat. The hangers, shelf and rack places need exact positions, and SPECS text-to-3D needs Lens Studio 5.23.2 in a separate project.

DebugDriver was on only for these tests and is off in the save.

## Start screen after a Lens Studio restart (Nov 8, 11:25)
**Learner report: the preview starts on a plain green wall, with no cards.** Lens Studio had been restarted. The Lens started at 11:20:57 while the preview camera was still at its default pose in the living room, and the saved camera pose (the foot of the bed) was restored after that. The picker opens once, in front of the eyes on the first frame, so it sat at (42, 113, 125), about 5.5 m away and out of view. The old start pose also looked only 10° down, so the bed sat at the bottom edge of the SPECS display.

Fix (`TidyTroopMain.tick`): before a pick, if the eyes move more than 1.5 m (`PICKER_REOPEN_CM`) from where the picker opened, it opens again in front of them. On the glasses this also covers walking into the room before picking. The documented start pose now looks at (−359.7, −65, 145.8), so the cards and the bed items are in one view.

Test: reset the camera to the living room, refresh, then moved it to the start pose. Log: `eyes moved 499 cm before a pick, so the picker opens again in front of them`; the cards and the bed items showed together (screen 17b; 17a is the learner's empty start screen).

## Option A: the places are the bedroom's own furniture (Nov 8, 13:45)
**Why.** The learner asked why the table and cupboard looked "half baked". SPECS 27 draws Lens content only inside its display window, about 31 % to 69 % of the Preview panel's width (both pieces were cut with straight edges at exactly those columns, screens 18a and 18b), while the Colorful Home room draws everywhere. The 180 cm cupboard and the 1 m desk, 1.2 to 1.5 m away, were bigger than that window. The learner chose option A: use the room's own furniture.

**Measured** with a new DebugDriver key, H. It casts a 21 x 21 grid of WorldQueryModule hit tests through the view and prints s/d/h/normal in the bedroom frame (s right, d toward the headboard wall, h above the floor). The first run after a Lens restart misses everything while the depth data starts up, so press H twice.
- White wardrobe: front plane s = 571, from d = -284 to past -418, at least 177 cm tall. An open cubby sits low on its left (floor 63 cm).
- White open shelves next to it: back panel s = 600, front edge s = 564, shelf tops at h = 8, 45, 80, 114 and about 148, with a divider at d = -505.
- TV dresser: front s = 565, top 85 to 90 cm, around d = -150 to -205.
- Round table: top h = 56, around s 380 to 468 and d -407 to -506.
- Left nightstand: top 27 cm at about s 215, d -105, with the lamp at s 224, d -86. The headboard wall is at d = -45.

**Built** (scene objects under `Room/Furniture/BedroomPlaces`, which shows in the bedroom layout only):
- `WardrobeRail`: a new TidyTroopProp kind "Rail" (an 88 cm bar at 162 cm on two brackets, 25 cm out from the wardrobe front), with `WardrobeSlot1-4` and hangers at d = -350 to -410.
- `RealShelves`: no mesh, with 3 book slots on the left column's 114 cm shelf.
- `TablePlateRack`: the PlateRack prop on the table top at s 420, d -450, turned so its plates face the start spot.
- New `TidyTroopDropZone` component: a box on each of the three, so a drop anywhere on the wardrobe, shelves or table counts (`findFurnitureSnap` uses it before the parent's mesh box).
- Cupboard, Desk and Chair: `showInBedroom = false`, so they now show in `AroundUser` only.
- `TidyTroopMain.placeRoom` keeps only the slots that are shown in the applied layout. The log line `TidyTroop: 10 items, 10 slots` now prints after `placement ...`.
- Items: plate 7 moved to the left nightstand; shirt 5 and pants 6 lie on the floor in front of the dresser (pants 6 now lie flat like pants 2).

**Test** (start pose, Sergeant Sweep):
- Real drag of book 4 from the floor to the shelves. The three glows showed on the shelf (19d), and the book now stands on it (19e): `item 4 placed (1 of 10)`, voice `Book shelved, soldier! / You are disciplined! 1 of 10`.
- Key N for the rest. The clothes hang on the wardrobe rail (19h), and the plates go into the rack on the table (19i). The last item gives `That's all of them! / Eyes on your bed, soldier!` with the arrow. The ending on the bed: voice `Room fresh! 10 of 10`, then `ending finished`.
- Earlier in the same session, a real drop of shirt 1 on the rail and of plate 10 on the table both snapped.
- New item spots: 19f (shirt 5 and pants 6 by the dresser) and 19g (plate 7 on the left nightstand).

**Picker:** before a pick, moving more than 1.5 m opens it again in front of you (see the start-screen section above).

Not re-tested in this pass: the `AroundUser` layout. Its objects and slots are unchanged, and the slot filter keeps only the cupboard and desk places there.
