---
status: draft
---

# Design brief: Tidy Troop (default name)

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

> **Revised on 2026-11-06, waiting for the learner's re-approval.** The first version was approved for a fully virtual room. Since then the learner chose "bedroom option B": the mess lies on the Colorful Home preview bedroom's own bed. What changed here: "Stand-in for the preview", "Where things live" (bed, cupboard, desk, chair and item spots, tag size), the picker rule in "When things show", and a new line about the second layout.
>
> **Revised again on 2026-11-07** after the improvement analysis (`TidyTroopReports/improvement-ideas.md`), which the learner asked for and approved ("build all"). What changed: a briefing after the pick, the salute waits until you look at the cleared spot, a "Bed clear!" moment, a line per job and per buddy, and the ending now happens on the clear bed with the time taken. See "When things show", "Characters" and done criteria 3 and 5.

## The one spatial moment
You come home tired to your shared room, where clothes, books and plates are "just roaming." Numbers appear on 10 things lying around, and your chosen character tells you where to start. Each time you put one in its place, the character pops up on the spot that just got clear, gives a salute and says what you did and "You are disciplined." When the bed is empty it says "Bed clear!" with sparkles. When the 10th thing is in its place, it sends you back to look at your clear bed, where it gives the big final salute (default ending, see below).

For: students sharing a room, like the learner and their roommates, who know where things go but are too tired or lazy to put them there.

## Why it belongs on glasses
- Uses: draws in the world, and leaves your body free.
- Why it's better than the phone or laptop version: the numbers sit on the actual shirt, book or plate, and the reward appears on the exact spot you just cleared, so you see your room getting "clean and clear" as you go. Your hands stay free to carry clothes and plates. A phone would have to be held and looked at while you tidy.

## Product or overlay
- Type: overlay. It responds to the real mess in your room.
- What the real version would sense: the real clothes, books and plates lying around, where each one belongs, and when you've put it there.
- Stand-in for the preview: the green bedroom of Lens Studio's Colorful Home preview scene plays your room. Its own double bed and nightstand hold the mess. The places things belong are virtual and real size: a cupboard with a hanging rail, a desk with a bookshelf and a plate rack, and a chair. 10 virtual items lie around: 2 shirts, 2 pants, 3 books and 3 plates. You grab each item and drop it in its place. Dropping it in its place stands in for the glasses noticing you put the real thing away.
- Second layout (default): an "Around the user" setting puts the whole stand-in room, with a virtual bed, around wherever the user starts, for any other preview scene.

## Where things live
- Where the user is looking during the main task: at the item in hand and the place it goes, mostly down at bed and desk height, 1 to 1.5 m away.
- User start (default): standing on the open floor at the foot of the Colorful Home double bed, facing the bed. The Lens starts from wherever you stand when the preview refreshes.
- Bed: the Colorful Home bedroom's own double bed, cover top 41 cm above the floor, 1.3 to 1.75 m straight ahead. The right nightstand (top 27 cm high) is next to it.
- Cupboard (default): 90 cm wide, 180 cm tall, 55 cm deep, doors open, 1.5 m to the right of the start, front facing you. A hanging rail at 162 cm with 4 empty hangers.
- Desk (default): 100 x 60 cm, 75 cm high, 1.15 m to the left, in front of the doorway, facing you. On it, a 3-slot bookshelf and a 3-slot plate rack.
- Chair (default): seat 45 cm high, on the open floor between the bed and the dresser.
- The 10 items (default): shirt 1, pants 2 and book 3 on the bed; book 4 on the floor left of the bed's foot; shirt 5 on the chair seat and pants 6 hanging off the chair; plate 7 on the desk; book 8 on the nightstand by the lamp; plate 9 on the floor right of the bed; plate 10 on the floor behind your start spot, so the out-of-view hint gets used. Shirts and pants go on the hangers, books on the bookshelf, plates in the plate rack.
- Number tags (default): light-colored circles, 12 cm across, with numbers 1 to 10, floating above each item and facing the user.
- Character (default): about 25 cm tall, standing on the spot that just got clear.
- Character picker (default): two big cards side by side, 80 cm ahead, a little below eye level, shown only at the start.

## Hands and input
- Choose a character: pinch one of the two big character cards.
- Put a thing away: grab the item, carry it, and release it over its place. It snaps neatly into place (default).
- Dropped somewhere else: the item stays where you dropped it and keeps its number (default).
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Character picker: shows at the start; hides once a character is picked. Card names and taglines are sized to read at 80 cm. If a virtual stand-in (for example the open cupboard door) would cover the cards, it stays hidden until you pick (default), since real furniture can't cover virtual content on the glasses either.
- Number tags: appear on all 10 items once a character is picked. Each tag disappears when its item is in its place.
- Briefing (default): right after the pick, the chosen character stays where its card was for about 3.5 seconds, salutes, and says where to start ("10 things out of place! / Start with number 1!"). Tag 1 pulses.
- Places (hanger, shelf slot, rack slot): glow softly only while you're carrying an item that belongs there (default).
- Character: the salute sound plays when the item snaps in. The character then waits until the spot that just got clear is in view (or 8 seconds at most), because you're usually facing the cupboard or desk at that moment. Then it appears on the cleared spot, salutes, and shows a two-line speech bubble: what you did ("Shirt hung, soldier!") and "You are disciplined! 3 of 10" (the count is a default). It disappears after about 3 seconds.
- Bed clear (default): when the last of the 3 things on the bed is put away, the first line says "Bed clear!" and a small burst of sparkles shows around the character on the bed. This is the learner's own good moment: "the bed is clean and it felt good."
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
- The Lens name, character names, personality and ending are defaults. The learner hasn't chosen them yet.
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
