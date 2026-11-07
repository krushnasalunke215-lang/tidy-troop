/**
 * TidyTroopLines — what each buddy says (pure data and text helpers, no scene access).
 * Owns: the per-character lines (Sergeant Sweep strict, Captain Fresh friendly), the item
 *       "job" names, and the time format for the ending.
 * Must not: decide when anything is said (TidyTroopMain does) or show text (the bubble does).
 * Every bubble message is two lines joined with "\n"; keep each line under about 28 characters
 * so it fits the bubble's 30 cm text width without wrapping.
 */

export type ItemKind = "shirt" | "pants" | "clothes" | "book" | "plate"

export type BuddyLines = {
  /** First line after putting one thing away, per kind of thing. */
  job: Record<ItemKind, string>
  /** First line when the last thing on the bed is put away. */
  bedClear: string
  /** Briefing right after the pick: (total) -> line 1, (first number) -> line 2. */
  briefing: [(total: number) => string, (first: number) => string]
  /** Shown at the last place after the final item, before turning to the bed. */
  lastOne: [string, string]
}

const SERGEANT: BuddyLines = {
  job: {
    shirt: "Shirt hung, soldier!",
    pants: "Pants hung, soldier!",
    clothes: "Clothes hung, soldier!",
    book: "Book shelved, soldier!",
    plate: "Plate racked, soldier!",
  },
  bedClear: "Bed clear, soldier!",
  briefing: [(total) => total + " things out of place!", (first) => "Start with number " + first + "!"],
  lastOne: ["That's all of them!", "Eyes on your bed, soldier!"],
}

const CAPTAIN: BuddyLines = {
  job: {
    shirt: "Nice! Shirt hung!",
    pants: "Nice! Pants hung!",
    clothes: "Nice! Clothes hung!",
    book: "Nice! Book shelved!",
    plate: "Nice! Plate put away!",
  },
  bedClear: "Yay, your bed is clear!",
  briefing: [(total) => "Hi! " + total + " things to put away.", (first) => "Let's start with number " + first + "!"],
  lastOne: ["That's all of them!", "Now look at your bed!"],
}

/** Lines for character index 0 (Sergeant Sweep) or 1 (Captain Fresh). */
export function linesFor(characterIndex: number): BuddyLines {
  return characterIndex === 1 ? CAPTAIN : SERGEANT
}

/** Kind of thing from its category and SceneObject name (e.g. "Item02_Pants"). */
export function itemKind(category: string, objectName: string): ItemKind {
  if (category === "book") return "book"
  if (category === "plate") return "plate"
  const n = objectName.toLowerCase()
  if (n.indexOf("shirt") >= 0) return "shirt"
  if (n.indexOf("pant") >= 0 || n.indexOf("jean") >= 0) return "pants"
  return "clothes"
}

/** "Done in 2 min 41 s" / "Done in 48 s". */
export function doneInText(seconds: number): string {
  const s = Math.max(1, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rest = s % 60
  return "Done in " + (m > 0 ? m + " min " + rest + " s" : rest + " s")
}

/** Parses "1,2,3" into [1, 2, 3], ignoring anything that isn't a number. */
export function parseNumberList(text: string): number[] {
  return text.split(",").map((t) => parseInt(t.trim(), 10)).filter((n) => !isNaN(n))
}
