# Tidy Troop: demo video plan (under 3 minutes)

The rules ask for a public YouTube video under 3 minutes that shows the Lens working end to end. Judges won't run the project, so the video is the proof. Start with the problem and who it's for. If you can, also show the planning docs, the agent building, and the design ideas.

Target length: about 2:45. The spoken lines are drafts in your voice. Change any words you like.

## Before you record
1. Open `lens.esproj` in **Lens Studio 5.24.1** (not 5.23.2).
2. In the Preview panel, choose Interactive Preview, the **Colorful Home** scene and the **SPECS 27** device. Make the Preview panel as big as you can.
3. Stand at the foot of the double bed in the green bedroom, facing the bed. Either walk there with WASD (right-drag looks around), or ask Kiro to put the preview camera at the start spot.
4. Click the Preview panel's refresh button and wait until the two character cards appear. The preview here lags a few seconds, and a click sent before the cards show is lost.
5. Do one practice run before recording:
   - Hover over a card or an item until it highlights. Click to pick a card. Press and hold to grab an item.
   - Keep holding while you turn toward its place. Release over a glowing place.
   - Shirts and pants go on the hangers on the white wardrobe on your **right**. Books go on the white open shelves next to it (right, a little behind you). Plates go in the rack on the round table **behind** you on the right. Plate 10 is on the floor **behind** you.
   - Don't scroll to zoom out: scrolling moves the camera back out of the bedroom. Look around with right-drag instead.
6. Recorder: Windows Snipping Tool (Win+Shift+R, then drag a box around the Lens Studio window) or OBS Studio. Record your voice at the same time, or add it afterwards.
7. Have ready: `devpost/design-brief.md` open in an editor, and this Kiro chat (or the reports) to show the agent's work for a few seconds.

## Shot list

| Time | On screen | Say (draft) |
|---|---|---|
| 0:00-0:15 | A photo or short clip of your real room with clothes on the bed (optional), or the Lens title card | "In our room, clothes, books and plates are just roaming. We know where everything goes. We're just tired, or a bit lazy. My roommates have the same problem." |
| 0:15-0:30 | The preview at the foot of the bed, the messy bed in view | "Once, I put just one shirt and one pair of pants on hangers, and the bed was clear. It felt good. Tidy Troop is built around that moment, for students sharing a room." |
| 0:30-0:45 | Scroll `devpost/design-brief.md`: "The one spatial moment", "Why it belongs on glasses" | "I planned it with Devpost's plan-lens skill. On glasses, the numbers sit on the real shirt or plate, the reward shows up on the exact spot I cleared, and my hands stay free to carry things." |
| 0:45-0:55 | Kiro chat or a report: the agent building through CLAD and the Lens Studio MCP | "An AI agent, Kiro with Snap's CLAD, built and tested it in Lens Studio through the Lens Studio MCP." |
| 0:55-1:05 | Preview: the two character cards. Hover, then click Sergeant Sweep. He salutes: "10 things out of place! Start with number 1!" | "First I pick my buddy. He tells me where to start." |
| 1:05-1:10 | Numbers 1-10 on the items, tag 1 pulsing | "Numbers appear on ten things lying around." |
| 1:10-1:25 | Grab shirt 1 on the bed, turn right, the hangers glow, drop it on a hanger (bugle) | "I grab the shirt. Only the places it fits light up. I drop it on a hanger and it snaps in." |
| 1:25-1:35 | Turn back to the bed: the buddy appears on the cleared spot, "Shirt hung, soldier! / You are disciplined! 1 of 10" | "When I look back, my buddy is standing where the shirt was. It waits until I look, so I never miss it." |
| 1:35-1:55 | Pants 2 to a hanger, book 3 to the shelves on the right, then face the bed: "Bed clear, soldier!" with sparkles | "When the bed is empty, that's the moment that felt good in real life, so it gets its own cheer." |
| 1:55-2:05 | A plate to the rack. With only plate 10 left, face the bed: the arrow appears and the chime plays | "When everything left is out of view, an arrow and a soft chime point me to it." |
| 2:05-2:35 | Turn around, grab plate 10, drop it in the rack: "That's all of them! / Eyes on your bed, soldier!", the arrow points to the bed. Turn to the bed: big salute, light wave, sparkles, fanfare, "Room fresh! 10 of 10 / Done in ..." | "The tenth one finishes the room, and my buddy sends me back to see the clear bed." |
| 2:35-2:50 | Back to the clear bed, or the brief's done criteria | "The logic is tested in the preview. What only real glasses can tell is comfort and real recognition. That's next: spotting real clothes on a real bed, and tidying together with roommates." |

## Tips
- Use real drags for every item you show. The scene's `DebugDriver` test keys are off in the saved project; leave them off for the recording.
- You don't need to show all 10 drags. Show 4 or 5, cut the rest, and say so in the video ("skipping ahead").
- After each drop, turn back toward the spot the item came from. The salute starts when that spot is in view (or after 8 s). If you place another item first, only the newest salute shows.
- The ending shows "Done in ..." with the time since the pick. If you pause while recording, that time includes the pause.
- If the preview stutters, keep the camera still for a second before each click or drop.
- Keep it under 3:00. YouTube shows the exact length after upload.

## Upload
- YouTube visibility: **Public** (the rules say public on YouTube).
- Title idea: "Tidy Troop: a SPECS Lens that salutes you for tidying (Learn AR with SPECS)".
- In the description: one line on the problem, the repo link, and "Built with Lens Studio, CLAD, the Lens Studio MCP and Kiro".
- Paste the link into `devpost/write-up.md` and the Devpost form.
