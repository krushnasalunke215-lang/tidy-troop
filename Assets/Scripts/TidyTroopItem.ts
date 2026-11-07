/**
 * TidyTroopItem — one numbered mess item (shirt, pants, book, plate).
 * Owns: its number, category, grab interaction (SIK Interactable + InteractableManipulation,
 *       created on this unit-scale wrapper), where it first lay ("the cleared spot"), and
 *       its placed pose. Its child #0 is the visual (TidyTroopProp) and carries all rotation.
 * Emits: onGrab / onRelease (TidyTroopMain decides snapping).
 * Must not: know about slots, counts, characters or UI.
 * Root origin = the item's centre; the visual child is centred on it.
 */
import {Interactable} from "InteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractableManipulation} from "InteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"
import Event from "InteractionKit.lspkg/Utils/Event"

@component
export class TidyTroopItem extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopItem – a numbered thing to put away</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Number shown on the floating tag (1 to 10)")
  @widget(new SliderWidget(1, 10, 1))
  number: number = 1

  @input
  @hint("Which kind of place it belongs in")
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Clothes (hanger)", "clothes"),
    new ComboBoxItem("Book (shelf)", "book"),
    new ComboBoxItem("Plate (rack)", "plate"),
  ]))
  category: string = "clothes"

  @input
  @hint("Grab box size in cm (big on purpose: easy to aim at)")
  colliderSizeCm: vec3 = new vec3(44, 10, 40)

  @input
  @hint("How high above the item the number tag floats, in cm")
  @widget(new SliderWidget(4, 40, 0.5))
  tagHeightCm: number = 12

  @input
  @hint("Placed position relative to the slot frame, cm (e.g. hang below the hanger)")
  placedOffsetCm: vec3 = new vec3(0, -21, 0)

  @input
  @hint("Placed rotation of the visual, degrees (upright on hanger/shelf, on edge in rack)")
  placedVisualRotationDeg: vec3 = new vec3(0, 0, 0)

  @input
  @hint("Where the character stands when this item is put away, relative to where it lay, in this item's own frame (cm; turns with the item, so it works in both placement modes)")
  standOffsetCm: vec3 = new vec3(0, -1, 0)
  @ui.group_end

  onGrab: Event<TidyTroopItem> = new Event<TidyTroopItem>()
  onRelease: Event<TidyTroopItem> = new Event<TidyTroopItem>()

  private interactable: Interactable
  private manipulation: InteractableManipulation
  private collider: ColliderComponent
  private _placed = false
  private _held = false
  private _hasOrigin = false
  private _origin: vec3 = vec3.zero()
  private _originRot: quat = quat.quatIdentity()
  private visual: SceneObject | null = null
  private hovered = false

  get placed(): boolean { return this._placed }
  get held(): boolean { return this._held }

  onAwake() {
    this.visual = this.sceneObject.getChildrenCount() > 0 ? this.sceneObject.getChild(0) : null
    this.collider = this.sceneObject.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createBoxShape()
    shape.size = this.colliderSizeCm
    this.collider.shape = shape
    this.collider.fitVisual = false
    this.interactable = this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable
    this.interactable.targetingMode = 3
    this.manipulation = this.sceneObject.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation
    this.manipulation.setCanScale(false)
    this.manipulation.setCanRotate(false)

    this.createEvent("OnStartEvent").bind(() => {
      this.manipulation.onManipulationStart.add(() => {
        if (this._placed) return
        this._held = true
        this.onGrab.invoke(this)
      })
      this.manipulation.onManipulationEnd.add(() => {
        if (this._placed || !this._held) return
        this._held = false
        this.onRelease.invoke(this)
      })
      this.interactable.onHoverEnter.add(() => this.setHover(true))
      this.interactable.onHoverExit.add(() => this.setHover(false))
    })
  }

  /** Remember where it lay in the mess (called once by the main script after room alignment). */
  recordOrigin(): void {
    if (this._hasOrigin) return
    const tr = this.sceneObject.getTransform()
    this._origin = tr.getWorldPosition()
    this._originRot = tr.getWorldRotation()
    this._hasOrigin = true
  }

  /** The spot it lay on before tidying — where the character pops up. */
  get originWorld(): vec3 { return this._origin.add(this._originRot.multiplyVec3(this.standOffsetCm)) }

  setInteractive(on: boolean): void {
    if (this._placed) on = false
    this.interactable.enabled = on
    this.manipulation.enabled = on
    this.collider.enabled = on
  }

  /** Snap into a slot frame and lock. */
  placeAt(slot: SceneObject): void {
    const st = slot.getTransform()
    const rot = st.getWorldRotation()
    const pos = st.getWorldPosition().add(rot.multiplyVec3(this.placedOffsetCm))
    const tr = this.sceneObject.getTransform()
    tr.setWorldPosition(pos)
    tr.setWorldRotation(rot)
    if (this.visual) {
      const vt = this.visual.getTransform()
      vt.setLocalPosition(vec3.zero())
      const r = this.placedVisualRotationDeg.uniformScale(MathUtils.DegToRad)
      vt.setLocalRotation(quat.fromEulerAngles(r.x, r.y, r.z))
      vt.setLocalScale(vec3.one())
    }
    this._placed = true
    this._held = false
    this.setInteractive(false)
  }

  private setHover(on: boolean) {
    if (this._placed || !this.visual || this.hovered === on) return
    this.hovered = on
    const s = on ? 1.08 : 1
    this.visual.getTransform().setLocalScale(new vec3(s, s, s))
  }
}
