# Devpost write-up: Tidy Troop (draft)

Draft for the Devpost project page. Paste each section into the matching Devpost field. Parts marked **[you]** need your own words; the rest is filled in from the approved brief, the planning notes and the build reports.

---

## Name
Tidy Troop

## Tagline (Devpost "elevator pitch", 200 characters max)
Numbers appear on the mess in your shared room, and a tiny saluting buddy pops up on every spot you clear. A SPECS Lens that gets a tired student to tidy up.

## Inspiration
In our room, clothes, books and plates are "just roaming." We know where everything goes. We just don't put it there, because we're tired or lazy. My roommates struggle with this too. During a break I tried something: I put one shirt and one pair of pants on hangers, and the bed was clear. It felt good. That moment, seeing the spot clear, is what Tidy Troop is built around.

**[you]** Add a sentence or two of your own here if you like.

## What it does
1. You pick a buddy on two big cards: **Sergeant Sweep**, a small soldier with a helmet and broom, or **Captain Fresh**, a round cartoon buddy in a captain's cap. Both are original characters.
2. Numbers 1 to 10 appear on the mess: 2 shirts, 2 pants, 3 books and 3 plates on the bed, the floor and the nightstands. Your buddy salutes and tells you where to start: "10 things out of place! Start with number 1!"
3. You grab a thing, carry it, and drop it where it belongs: clothes on the hangers in the cupboard on your right, books on the shelf and plates in the rack on the table behind you. While you carry it, only the places it fits glow. It snaps in with a bugle and its number disappears.
4. When you turn back, your buddy is standing on the exact spot you just cleared. It salutes, with a few sparkles around it, and says what you did, in its own voice ("Shirt hung, soldier!" or "Nice! Shirt hung!"), and "You are disciplined! 3 of 10". The salute waits until you look, so you never miss it.
5. When the last thing leaves the bed, your buddy cheers "Bed clear!" with a bigger burst of sparkles and a shimmer sound.
6. If every item left is out of view, a small arrow and one soft chime point you to the nearest one. Plate 10 sits on the floor behind you, so you'll meet the arrow.
7. After the 10th item, your buddy says "Now look at your bed!" and the arrow points the way. On the clear bed it grows big and holds a final salute. A wave of light sweeps out from the bed with sparkles and a fanfare: "Room fresh! 10 of 10. Done in 3 min 21 s."

## Who it's for
Students sharing a room, like me and my roommates, who know where things go but are too tired to start.

## Why it belongs on glasses
- The numbers sit on the actual shirt, book or plate, and the reward appears on the exact spot you just cleared. You watch your real room get "clean and clear" as you go.
- Your hands stay free to carry clothes and plates. A phone app would have to be held and looked at while you tidy.
- It's an overlay: the real version would respond to the real mess in your room.

## How the preview stands in for a real room
The preview can't see a real room, so the green bedroom in Lens Studio's **Colorful Home** preview scene plays the room. The mess lies on its own double bed, nightstands and floor, and the places things belong are its own furniture: clothes go on a small rail fixed to the white wardrobe, books on the white open shelves, and plates in a small rack on the round table. Only the items, the rail, the hangers and the rack are virtual, because the SPECS display is small and a big virtual cupboard always looked cut in half. Dropping an item in its place stands in for the glasses noticing you put the real thing away. A second setting, "Around the user", puts a whole stand-in room (virtual bed, cupboard, desk and chair) around wherever you start, so it also works in other preview scenes.

## Design choices
- **Light colours everywhere.** The SPECS display is additive, so black shows as see-through. Tags, text and characters are light and bright.
- **Real scale, in reach.** Everything is in centimetres at real size, 1 to 1.75 m from where you stand, mostly at bed and desk height, where your eyes already are while you tidy.
- **Things show when needed, then leave.** The picker only shows at the start. The places glow only while you carry something that fits there. The buddy stays only while it talks, about 4 to 5 seconds. The arrow only shows when every remaining item is out of view.
- **Furniture that fits the view.** SPECS shows virtual content only in a small window in the middle of your view, about 32 by 36 degrees. My first virtual cupboard (1.8 m tall) and desk were bigger than that window from where you stand, so they always looked cut in half. I tried using the room's own wardrobe, shelves and table instead, but in my test I missed seeing a cupboard and a table. Now there is a small open cupboard (1.1 m tall) and a small table, each placed about 1.6 m away so it fits whole in the window when you turn to it.
- **The buddy talks.** Both buddies say their lines out loud in a human-sounding voice. The clips are made in advance with Kokoro, an open-source neural voice model, because Lens Studio's text-to-speech doesn't run on SPECS. Each salute lasts until the buddy has finished talking. Far away, the buddy and its speech bubble grow so they stay readable.
- **Nothing covers the picker.** If a stand-in, like the open cupboard door in the "Around the user" layout, would block the character cards, it hides until you pick, because real furniture can't cover virtual content on glasses either.
- **Readable at arm's length.** Card names and taglines are sized to read at 80 cm.
- **The reward waits for you.** SPECS shows only about 32° side to side, and the bed is about 100° away from the wardrobe. A salute that started at the drop would play behind you. So the bugle plays at the drop, and the buddy salutes once the cleared spot is in view.
- **The ending is where your eyes are.** The first ending happened on the floor right in front of you, 57° to 68° below eye level, which is out of view. It now plays on the bed, about 1.3 m away and a comfortable angle down, and a "look at your bed" line plus the arrow bring you there.
- **The bed is the hero.** In my own test, clearing the bed was the moment that felt good. So clearing the bed gets its own cheer, and the final salute happens on the clear bed.

I found these by measuring what you'd see from where you stand (angles from the item and furniture positions) and comparing them with SPECS' field of view and the hackathon's design rules. The analysis is in `TidyTroopReports/improvement-ideas.md`.

Ideas I ruled out while planning, and why:
- Erasing the mess to show a clean room: SPECS can add light, but it can't hide real objects.
- Sending a photo to AI and showing a cleaned-up picture: that's a flat image a phone could show, and the reward should be the real room.
- Tracking discipline over several days: dropped to keep this to one tidy-up session.

## How I built it
- **Planned** with Devpost's `plan-lens` skill. It interviewed me and wrote `devpost/planning-notes.md` and `devpost/design-brief.md`.
- **Built** by an AI coding agent, **Kiro**, running Snap's **CLAD** skills and agents (installed into Kiro with a port of the CLAD plugin; details in `.kiro/third-party/README.md`). The agent worked in Lens Studio 5.24.1 entirely through the **Lens Studio MCP**: building and editing the scene, writing and compiling TypeScript, driving the preview, reading logs and taking screenshots.
- **Interaction:** Spectacles Interaction Kit for grabbing and dropping (`Interactable` and `InteractableManipulation`), and UI Kit for the picker cards and the speech bubble.
- **3D:**
  - The 10 items are AI models made with SPECS text-to-3D. Sign-in didn't work in Lens Studio 5.24.1, so the agent generated them in Lens Studio 5.23.2 in a separate scratch project (the organisers' workaround) and brought them in.
  - The two characters are built in code with MeshBuilder, so their parts can move: the salute arm is solved with 2-joint IK, and the legs march.
  - The furniture is code-built too.
- **Sound:** the click, snap, chime, bugle and fanfare were generated by CLAD's sound skills (local synthesis, no samples).
- **Voices:** 40 clips made on the laptop's CPU with the Kokoro-82M voice model through kokoro-js (`tools/make-voice-lines.mjs`): voice `am_michael` for Sergeant Sweep and `af_heart` for Captain Fresh. My first try used the Windows voices, which sounded robotic.
- **Icons:** Google Material Icons through CLAD's icon picker.
- **Testing:** the agent checked each done criterion in the preview through the MCP, using real clicks and drags, camera turns, logs and screenshots. LEAF tests are written (`LeafDrafts/`) but couldn't run, because LEAF 4.0.0 needs Lens Studio 5.25 typings and 5.25 isn't out yet.

## Done criteria from the brief

| # | Criterion | Result |
|---|---|---|
| 1 | Pinch a character card: the picker hides and numbers 1-10 appear | Logic proven (real click in preview) |
| 2 | Shirt 1 from the bed onto a hanger: it snaps and its number hides | Logic proven (real drag in preview, with the AI shirt) |
| 3 | Once the cleared spot is in view, the buddy appears there, salutes, says the job and "You are disciplined! N of 10", gone in about 3 s | Logic proven (screenshots and log: it waited while facing the cupboard and started when the bed came into view) |
| 4 | All remaining items out of view: an arrow to the nearest one, and a chime | Logic proven |
| 5 | The 10th item: "look at your bed", then the ending on the clear bed with the time | Logic proven (both buddies: big salute on the bed, light wave, sparkles, "Room fresh! 10 of 10 / Done in 3 min 21 s") |

Feel unproven: comfort over a whole tidy-up, real hand tracking, and recognising real clothes on a real messy bed. Only real glasses can show those.

## Challenges
- Sign-in didn't work in Lens Studio 5.24.1, so AI 3D generation had to run in 5.23.2 in a separate project. Opening this project in 5.23.2 breaks the interaction kit, so the two versions had to stay apart.
- LEAF couldn't run on 5.24.1, so testing went through the preview instead.
- The AI models first looked purple under the preview lighting and came in lying in different directions. Each one was measured, turned and scaled to its real size, and set to show its own colours.
- Lens Studio crashed once and lost unsaved work, and the project moved to a new computer in the middle of the build. After that I saved after every step and kept a handoff file.

## What I learned
**[you]** Rewrite in your own words. Points from the planning interview you could use:
- Glasses add light but can't take things away, so the reward has to be added to the real room, right where the real change happened.
- If a phone could do the same thing, it isn't really an AR idea. The glasses version has to use what you're looking at and keep your hands free.
- On an additive display, dark colours vanish.
- Good AR shows things only when they're needed and then gets out of the way.
- The glasses show only a small window of what you see. A reward that plays behind you is wasted, so it should wait until you look.

## What's next
- Recognise real clothes, books and plates on a real bed, and learn where things go in each room.
- Let roommates tidy together in one shared session (Connected Lenses).
- Maybe bring back streaks over several days, if one session isn't enough to build the habit.

## Built with
Lens Studio 5.24.1 and 5.23.2, SPECS, TypeScript, Spectacles Interaction Kit, Spectacles UI Kit, MeshBuilder, SPECS text-to-3D, Lens Studio MCP, CLAD, Kiro, Devpost plan-lens.

## Pre-existing work used (disclosure)
- Lens Studio packages from the Asset Library:
  - Spectacles Interaction Kit 4.0.0 and Spectacles UI Kit 4.0.0 (folders renamed `InteractionKit.lspkg` and `UIKit.lspkg`);
  - Motion, Icons, Bitmoji 3D and AiPreviewAgentInspect;
  - `SimpleVertexBaseColor.lspkg`.
- Lens Studio's Colorful Home interactive preview scene, used as the stand-in room.
- Google Material Icons: military_tech, sentiment_very_satisfied, circle, radio_button_unchecked and arrow_forward.
- Snap's CLAD (Apache-2.0) and Devpost's learn-specs skill pack (MIT), in `.kiro/` with their licences in `.kiro/third-party/`.
- The Kokoro-82M text-to-speech model by hexgrad (Apache-2.0, https://github.com/hexgrad/kokoro), run through kokoro-js 1.2.1 (Apache-2.0), to make the voice clips in `Assets/GeneratedSFX/Voice/`. Neither is part of the Lens; only the generated clips are.
- All Tidy Troop scripts in `Assets/Scripts/` were written for this project during the submission period.

## Links
- Video: **[add the YouTube link]**
- Repo: https://github.com/krushnasalunke215-lang/tidy-troop
