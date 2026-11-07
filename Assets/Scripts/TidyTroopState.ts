/**
 * TidyTroopState — pure game state for Tidy Troop (no scene access).
 * Owns: phase, chosen character, how many items are in place.
 * Must not: touch SceneObjects, UI or audio.
 */

export type TidyPhase = "starting" | "picking" | "tidying" | "ending" | "done"

export class TidyTroopState {
  phase: TidyPhase = "starting"
  chosen = -1
  placed = 0
  total = 10

  get isFinished(): boolean {
    return this.placed >= this.total
  }

  pick(index: number): boolean {
    if (this.phase !== "picking") return false
    this.chosen = index
    this.phase = "tidying"
    return true
  }

  /** Records one more item in place; returns the new count. */
  placeOne(): number {
    this.placed = Math.min(this.total, this.placed + 1)
    if (this.isFinished) this.phase = "ending"
    return this.placed
  }
}
