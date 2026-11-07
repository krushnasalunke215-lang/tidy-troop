# Tidy Troop: improvement analysis (Nov 7, 2026)

## How I analysed it
1. **Collected the yardsticks:**
   - the 4 judging criteria (Design, which is also the tiebreaker; Technical; Innovation; Presentation);
   - the hackathon's AR design rules (`.kiro/skills/plan-lens/references/ar-design-rules.md`);
   - your own words from `devpost/planning-notes.md`.
2. **Checked what the Lens does now** against those yardsticks. Evidence: the test screenshots, the scripts (`TidyTroopMain.ts`, `TidyTroopCharacter.ts`, `TidyTroopSpeechBubbleUI.ts`) and the positions measured in `tidy-troop-colorful-home-report.md`. Angles below are worked out from those positions: the start spot is (−498.6, 1.9) and the eyes are 136 cm above the floor.
3. **Wrote down each gap**, with its evidence.
4. **Came up with ideas** for the gaps, and scored each one on:
   - which judging criteria it helps;
   - whether it shows in the video;
   - how well it fits your words;
   - agent time, including the slow preview checks;
   - risk of breaking the working flow.
5. **Picked a short list** that fits before the video has to be recorded.

Time box: the deadline is Nov 10, 3:30 am India time. Changes should stop by **Nov 8 evening** so you record the final build on Nov 9 with time to spare. Every change will be its own Git commit, so any one can be undone.

## What's already strong
- **It uses the glasses well.** Numbers sit on the real things. The reward appears on the exact spot you cleared. Your hands stay free.
- **Hints show only when needed.** Places glow only while you carry something that fits there. The arrow and chime come only when everything left is out of view.
- **The full flow works.** All 5 done criteria pass in the preview, the 10 items are AI 3D models, and there's a second layout ("Around the user").

## Gaps found

| # | Gap | Evidence | Criterion hurt |
|---|---|---|---|
| G1 | **You can miss the main reward.** The buddy salutes on the spot you cleared while you're facing the place you dropped the item. | From the start spot, facing the bed, shirt 1 is 20° to the left and hanger 2 is 79° to the right: about 99° apart. SPECS shows about 32° side to side. The 3 s salute timer starts at the drop (`TidyTroopMain`, `after(saluteSeconds)`), so the buddy is often gone before you turn back. The books and plates go to the desk on the other side, so they're the same. | Design ●●● (the core moment), Presentation |
| G2 | **The big ending happens out of view, low on the floor.** | FloorCenter is 0.55 m in front of the start spot, on the floor. With your eyes 136 cm up, the 2x buddy (50 cm tall) sits 57° to 68° below eye level. SPECS shows about 37° top to bottom, and the rules say to keep main content 0.6 to 1.6 m away, a little below eye level. In screen 08c the camera looks almost straight down, and the bubble covers the buddy's head. When you place plate 10 you're facing the desk, so you may not see the start of the ending at all. | Design, Presentation |
| G3 | **Your best moment isn't in the Lens.** | Your words: "I just put one shirt and one pant to hanger and **the bed is clean** and it felt good." Items 1-3 are on the bed, but clearing the bed gets the same reward as anything else. | Design, Innovation |
| G4 | **After the pick, nothing says what to do.** | After a card is picked, the picker hides and the numbers appear, but no instruction follows. The picker line only says "Your buddy salutes every spot you clear." Your goal was to get a tired person to **start**. | Design |
| G5 | **The praise is the same every time, and both buddies say the same thing.** | One `praiseText`, "You are disciplined!", is used for all 10 items and both characters. The brief's own open question is whether the salute "still motivates on the fiftieth tidy-up". | Design |
| G6 | **The ending doesn't show what you achieved.** | The ending says "Room fresh! 10 of 10" and fades. It gives no time or other sense of how little effort it took. | Design, Presentation |
| G7 | **A carried shirt looks like a thin line.** | Screens 04 and 12a: a carried item keeps its lying-flat pose, so you see it edge-on. | Design (seen in every drag in the video) |
| G8 | **The characters look flat next to the AI items.** | The characters are one flat colour per part (unlit). The AI items have real textures. | Design |
| G9 | **The sparkles look like flat squares.** | Screens 08c and 08d: a light-blue square near the buddy's feet. | Design (small) |
| G10 | **The yellow shirt and book came out orange.** | Screens 11b and 11c. | Small |

## Ideas, scored

Agent time includes preview checks; the preview here lags, so checks are slow.

| Idea | Fixes | Helps | In video? | Fits your words | Agent time | Risk |
|---|---|---|---|---|---|---|
| **J. Salute when you look:** the buddy waits on the cleared spot (with the bugle at the drop), and its 3 s salute and bubble start when the spot comes into view, or after 8 s at most | G1 | Design ●●●, Presentation ●● | Every salute | "you see your room getting clean and clear" (brief) | 1-1.5 h | Low (reuses the in-view check the arrow hint already uses) |
| **A. Final salute on the clear bed:** after item 10 the buddy says "Look at your bed!", the arrow points there if needed, and the big salute and light wave start on the bed where shirt 1 was (about 1.3 m away, 18° to 35° below eye level) once it's in view | G2, G3 | Design ●●●, Presentation ●●● | The climax | "the bed is clean" | 1.5-2 h, after J | Low-medium |
| **C. Buddy briefing:** after the pick, the buddy you chose stays for 3 s where its card was (right where you're looking) and says "10 things out of place. Start with number 1!" while tag 1 pulses | G4 | Design ●●● | Yes, the opening | "get a tired person to start" | 1 h | Low |
| **B. "Bed clear!" moment:** when items 1-3 are all away, that salute says "Bed clear!" with a short shimmer | G3 | Design ●●, Innovation ●● | Yes | Directly your story | 45 min, after J | Low |
| **D. Personal lines:** each line names the job ("Shirt hung!", "Book shelved!") and keeps "You are disciplined!". Sergeant sounds strict, Captain friendly | G5 | Design ●●, Presentation ● | Yes | "you are disciplined" stays | 45 min | Very low |
| **E. Time in the ending:** "Room fresh! 10 of 10 in 2 min 41 s" | G6 | Design ●, Presentation ●● | Yes | "too tired or lazy" (shows it's quick) | 20 min | Very low |
| F. Upright carrying: a carried item turns upright to face you | G7 | Design ●● | Every drag | | 1.5-2 h | **Medium** (touches the grab code) |
| G. Soft shading on the characters, using the shading helper already written for the items | G8 | Design ● | Yes | You chose to keep them (A); this only polishes | 30-45 min | Low |
| H. Star-shaped, fading sparkles | G9 | Design ● | In the ending | | 1 h | Low |
| I. Regenerate the yellow items | G10 | Small | Barely | | 1 h, plus switching to 5.23.2 | Medium (5.23.2 must not touch the project) |

Presentation ideas that cost no build time:
- **Open the video with a photo of your real messy bed.** It shows the problem is real and who it's for.
- **End on the clear bed.** It mirrors your real test.
- **Show 10 seconds of the agent driving the preview through the MCP.** That supports the Technical score.

Ideas I left out, and why:
- Roommates tidying together: Connected Lenses can't be shown in the preview.
- Streaks over several days: you dropped this.
- Recognising real clothes: the preview can't see a real room.
- Voice: out of scope in the brief.
- AI-model characters: they couldn't raise an arm to salute, and you chose to keep the current ones.

## Status (Nov 7, 13:51)
The learner approved all six (J, A, C, B, D, E). All are built and checked in the preview. Results and screenshots: "Improvements from the analysis" in `tidy-troop-new-machine-report.md`. F, G, H and I were not built.

## Recommendation
**Must:** J, A, C. These fix the two moments the judges will look at hardest: seeing the reward, and the ending. They also give a tired person a clear start. About 4 h.

**Should:** B, D, E. They're cheap and make the session a short story that follows your real experience:
1. The buddy tells you where to start.
2. Each job gets its own line.
3. "Bed clear!" when the bed is empty.
4. The final salute on the clear bed, with your time.

About 2 h more.

**If time is left:** G (shading), then H (sparkles).

**Skip:** F (risk to the grab code) and I (low value, needs 5.23.2).

Everything in Must and Should is in the game-flow, character and bubble scripts. The grab and snap code isn't touched, and done criteria 1, 2 and 4 behave as before.

A, B and C change the brief's flow and ending, and D sets the buddies' personalities, which is one of your step 8 choices. So the brief and done criteria 3 and 5 need a small update, which you'd approve along with the rest of the brief.
