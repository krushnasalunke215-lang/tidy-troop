---
status: approved
---

# Design brief: Tidy Troop

> **Approved by the learner on 2026-11-07**, after both revisions below. The approval also keeps the default Lens name (Tidy Troop), character names (Sergeant Sweep, Captain Fresh), their lines and the ending. Those are still marked (default) where they appear, to show the agent proposed them and the learner accepted them.

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

> **Revised on 2026-11-06.** The first version was approved for a fully virtual room. Since then the learner chose "bedroom option B": the mess lies on the Colorful Home preview bedroom's own bed. What changed here: "Stand-in for the preview", "Where things live" (bed, cupboard, desk, chair and item spots, tag size), the picker rule in "When things show", and a new line about the second layout.
>
> **Revised again on 2026-11-07** after the improvement analysis (`TidyTroopReports/improvement-ideas.md`), which the learner asked for and approved ("build all"). What changed: a briefing after the pick, the salute waits until you look at the cleared spot, a "Bed clear!" moment, a line per job and per buddy, and the ending now happens on the clear bed with the time taken. See "When things show", "Characters" and done criteria 3 and 5.
>
> **Revised on 2026-11-08** after the learner's own test. The learner chose "option A": the places things belong are now the Colorful Home bedroom's own furniture, because the big virtual cupboard and desk didn't fit inside the SPECS display and always looked cut in half. The buddies also say their lines out loud now. What changed: "Stand-in for the preview", "Where things live" (wardrobe rail, shelves, table rack, and the spots of items 5, 6 and 7) and the character line in "When things show".

## The one spatial moment
You come home tired to your shared room, where clothes, books and plates are "just roaming." Numbers appear on 10 things lying around, and your chosen character tells you where to start. Each time you put one in its place, the character pops up on the spot that just got clear, gives a salute and says what you did and "You are disciplined." When the bed is empty it says "Bed clear!" with sparkles. When the 10th thing is in its place, it sends you back to look at your clear bed, where it gives the big final salute (default ending, see below).

For: students sharing a room, like the learner and their roommates, who know where things go but are too tired or lazy to put them there.

## Why it belongs on glasses
- Uses: draws in the world, and leaves your body free.
- Why it's better than the phone or laptop version: the numbers sit on the actual shirt, book or plate, and the reward appears on the exact spot you just cleared, so you see your room getting "clean and clear" as you go. Your hands stay free to carry clothes and plates. A phone would have to be held and looked at while you tidy.

## Product or overlay
- Type: overlay. It responds to the real mess in your room.
- What the real version would sense: the real clothes, books and plates lying around, where each one belongs, and when you've put it there.
- Stand-in for the preview: the green bedroom of Lens Studio's Colorful Home preview scene plays your room. Its own double bed, nightstands and floor hold the mess. The places things belong are its own furniture: the white wardrobe (with a small virtual clothes rail and 4 hangers fixed to its front), the white open shelves, and the round table (with a small virtual plate rack on it). Only small things are virtual, so they fit inside the SPECS display. 10 virtual items lie around: 2 shirts, 2 pants, 3 books and 3 plates. You grab each item and drop it in its place. Dropping it in its place stands in for the glasses noticing you put the real thing away.
- Second layout (default): an "Around the user" setting puts a whole stand-in room (virtual bed, cupboard, desk and chair) around wherever the user starts, for any other preview scene.

## Where things live
- Where the user is looking during the main task: at the item in hand and the place it goes, from bed height up to chest height, 1 to 2.6 m away.
- User start (default): standing on the open floor at the foot of the Colorful Home double bed, facing the bed. The Lens starts from wherever you stand when the preview refreshes.
- Bed: the Colorful Home bedroom's own double bed, cover top 41 cm above the floor, 1.3 to 1.75 m straight ahead. The right nightstand (top 27 cm high) is next to it.
- Clothes rail (default): the Colorful Home bedroom's white wardrobe, about 1.9 m to your right. An 88 cm virtual rail is fixed to its front at 162 cm, sticking out 25 cm, with 4 empty hangers.
- Bookshelf (default): the bedroom's own white open shelves, next to the wardrobe, about 2.6 m away to the right and a little behind you. Books stand on the left column's shelf at 114 cm.
- Plate rack (default): a small 3-slot virtual rack on the bedroom's round table (top 56 cm), about 1.25 m away behind you on the right.
- The 10 items (default): shirt 1, pants 2 and book 3 on the bed; book 4 on the floor left of the bed's foot; shirt 5 and pants 6 on the floor in front of the dresser; plate 7 on the left nightstand by the lamp; book 8 on the right nightstand by the lamp; plate 9 on the floor right of the bed; plate 10 on the floor behind your start spot, so the out-of-view hint gets used. Shirts and pants go on the hangers, books on the shelf, plates in the plate rack. A drop anywhere on the wardrobe, the shelves or the table counts and goes to the nearest free place there.
- Number tags (default): light-colored circles, 12 cm across, with numbers 1 to 10, floating above each item and facing the user.
- Character (default): about 25 cm tall, standing on the spot that just got clear.
- Character picker (default): two big cards side by side, 80 cm ahead, a little below eye level, shown only at the start.

## Hands and input
- Choose a character: pinch one of the two big character cards.
- Put a thing away: grab the item, carry it, and release it over its place. It snaps neatly into place (default).
- Dropped somewhere else: the item stays where you dropped it and keeps its number (default).
- Targets are big and highlight when aimed at.
- Voice commands: none. (The buddies speak, but you don't talk to them.)

## When things show
- Character picker: shows at the start; hides once a character is picked. Card names and taglines are sized to read at 80 cm. If a virtual stand-in (for example the open cupboard door) would cover the cards, it stays hidden until you pick (default), since real furniture can't cover virtual content on the glasses either.
- Number tags: appear on all 10 items once a character is picked. Each tag disappears when its item is in its place.
- Briefing (default): right after the pick, the chosen character stays where its card was for about 3.5 seconds, salutes, and says where to start ("10 things out of place! / Start with number 1!"). Tag 1 pulses.
- Places (hanger, shelf slot, rack slot): glow softly only while you're carrying an item that belongs there (default).
- Character: the salute sound plays when the item snaps in. The character then waits until the spot that just got clear is in view (or 8 seconds at most), because you're usually facing the wardrobe, shelves or table at that moment. Then it appears on the cleared spot, salutes with a few sparkles around it, shows a two-line speech bubble and says both lines out loud in a human-sounding voice: what you did ("Shirt hung, soldier!") and "You are disciplined! 3 of 10" (the count is a default). It stays until it has finished talking, about 4 to 6 seconds. Far away, the character and the bubble grow so they stay readable.
- Bed clear (default): when the last of the 3 things on the bed is put away, the first line says "Bed clear!" and a bigger burst of sparkles shows around the character on the bed, with a shimmer sound. This is the learner's own good moment: "the bed is clean and it felt good."
- Ending after the 10th item (default, the learner should decide): a bubble right where you're looking says "That's all of them! / Now look at your bed!", and the arrow points to the bed if it's out of view. Once the bed is in view (or after 10 seconds), the character appears on the bed where shirt 1 lay, grows to twice its size and holds a big salute. A soft wave of light sweeps out from the bed with sparkles and a short fanfare, and the bubble says "Room fresh! 10 of 10 / Done in 2 min 41 s" (the time since the pick). It stays for about 6 seconds, then fades.
- If something needs attention out of view: when every remaining item is out of view, a small arrow points toward the nearest one and a soft chime plays once (default).

## Characters
- The learner kept a choice of characters. Both are original, not known cartoons, because the rules ban third-party trademarks. "Mr. Clean" is a real brand, so it can't be used.
- Personality (default, built from the learner's words): a strict little drill sergeant of cleanliness who is proud of you every time a spot gets clear.
- Character 1 (default): Sergeant Sweep, a small soldier. Strict: "Shirt hung, soldier!", "Bed clear, soldier!", "Eyes on your bed, soldier!"
- Character 2 (default): Captain Fresh, a cartoon-style buddy with the same salute. Friendly: "Nice! Shirt hung!", "Yay, your bed is clear!", "Now look at your bed!"
- Both keep the learner's line, "You are disciplined!", on every item.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. At the start, pinching a character card picks that character, the picker disappears, and numbers 1 to 10 appear on the 10 items.
2. Grabbing the shirt numbered 1 from the bed and releasing it over a hanger in the cupboard snaps it onto the hanger, and its number disappears.
3. After that, as soon as the cleared spot on the bed is in view (or 8 seconds at most), the chosen character appears there, salutes, shows "Shirt hung" (in its own words) and "You are disciplined! 1 of 10," and disappears within about 3 seconds.
4. Turning away from all remaining items shows an arrow pointing to the nearest one and plays a chime.
5. Putting the 10th item in its place says "look at your bed" where you're looking. Once the bed is in view, the ending plays there: the final salute, the light wave with sparkles, and "Room fresh! 10 of 10" with the time taken.

## Out of scope
- Recognizing real clothes, books or plates, or the real room.
- Erasing the mess, or an AI photo of the clean room.
- Discipline over several days: streaks, history, reminders.
- Roommates sharing one session (Connected Lenses can't be shown in the preview).
- Voice commands.

## Risks and open questions
- The choice of characters means CLAD has to build and animate two characters instead of one. The learner chose to keep it. If time runs short, finish Character 1 first.
- The Lens name, character names, personality and ending were proposed as defaults. The learner accepted them when approving this brief on 2026-11-07.
- Feel unproven: whether real glasses can reliably spot real clothes on a messy bed, and whether the salute still motivates on the fiftieth tidy-up.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
