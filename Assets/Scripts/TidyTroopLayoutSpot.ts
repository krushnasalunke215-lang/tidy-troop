/**
 * TidyTroopLayoutSpot — where one room object (furniture, item or anchor) sits in each placement mode.
 * Owns: the AroundUser pose (relative to the user's start spot on the floor) and per-mode visibility.
 *       In ColorfulHomeBedroom mode the object's own Scene transform under the Room root IS its
 *       placement (Room sits at the world origin, so those are Colorful Home world cm): nudge it by
 *       moving the object in the Scene panel / Inspector Transform.
 * Inputs: showInBedroom, showAroundUser, aroundUserPositionCm, aroundUserRotationDeg.
 * Must not: choose the mode (TidyTroopMain does) or hold gameplay state.
 */

@component
export class TidyTroopLayoutSpot extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopLayoutSpot – placement per mode</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">ColorfulHomeBedroom mode</span>')
  @ui.group_start("ColorfulHomeBedroom")
  @input
  @hint("Show this object in ColorfulHomeBedroom mode. Its placement there is its own Scene transform under Room (world cm)")
  showInBedroom: boolean = true
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">AroundUser mode</span>')
  @ui.group_start("AroundUser")
  @input
  @hint("Show this object in AroundUser mode")
  showAroundUser: boolean = true

  @input
  @hint("Position in cm relative to the user's start spot on the floor: +X right, -Z ahead, +Y up (relative to the parent if nested)")
  aroundUserPositionCm: vec3 = new vec3(0, 0, 0)

  @input
  @hint("Rotation in degrees relative to the user's start heading")
  aroundUserRotationDeg: vec3 = new vec3(0, 0, 0)
  @ui.group_end

  /** Put this object where the given mode wants it (called once by TidyTroopMain at start). */
  applyMode(mode: string): void {
    const so = this.getSceneObject()
    if (mode === "AroundUser") {
      const tr = so.getTransform()
      tr.setLocalPosition(this.aroundUserPositionCm)
      const r = this.aroundUserRotationDeg.uniformScale(MathUtils.DegToRad)
      tr.setLocalRotation(quat.fromEulerAngles(r.x, r.y, r.z))
      so.enabled = this.showAroundUser
    } else {
      so.enabled = this.showInBedroom
    }
  }
}
