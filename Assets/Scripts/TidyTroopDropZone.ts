/**
 * TidyTroopDropZone — the box that counts as "dropped on this furniture" for the slots under it.
 * Owns: a box in this object's local cm (centre + size).
 * Use: put it on the parent of a group of TidyTroopSlots when that parent has no mesh of its own
 *      (the preview room's real shelves) or when its mesh is much smaller than the furniture (a
 *      clothes rail on the real wardrobe, a plate rack on the real table). Without it, the parent's
 *      own mesh bounds are used.
 * Must not: decide snapping (TidyTroopMain.findFurnitureSnap reads it).
 */

@component
export class TidyTroopDropZone extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopDropZone – drop area for the places under this object</span>')
  @ui.separator
  @input
  @hint("Centre of the drop box, in this object's local cm")
  centerCm: vec3 = new vec3(0, 0, 0)

  @input
  @hint("Size of the drop box, cm (local X, Y, Z)")
  sizeCm: vec3 = new vec3(100, 100, 60)

  /** Local-space minimum corner. */
  get minCm(): vec3 {
    return this.centerCm.sub(this.sizeCm.uniformScale(0.5))
  }

  /** Local-space maximum corner. */
  get maxCm(): vec3 {
    return this.centerCm.add(this.sizeCm.uniformScale(0.5))
  }
}
