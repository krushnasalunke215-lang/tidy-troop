/**
 * TidyTroopSlot — a place where one item belongs (hanger, shelf slot, rack slot).
 * Owns: its category, whether it is occupied, and its soft glow marker.
 * Inputs: category + glow shape tunables. The slot's transform IS the placement frame
 *         (+Z faces out of the furniture, +Y up).
 * Must not: decide snapping (TidyTroopMain does that) or play sounds.
 */
import {MeshKit, rgb, axisDeg, fromVec3} from "./TidyTroopMeshKit"
import {VERTEX_COLOR_MATERIAL} from "./TidyTroopAssets"

@component
export class TidyTroopSlot extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopSlot – where one item belongs</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Which items belong here")
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Clothes (hanger)", "clothes"),
    new ComboBoxItem("Book (shelf)", "book"),
    new ComboBoxItem("Plate (rack)", "plate"),
  ]))
  category: string = "clothes"

  @input
  @hint("Glow ring radius in cm")
  @widget(new SliderWidget(2, 30, 0.5))
  glowRadiusCm: number = 6

  @input
  @hint("Glow ring centre, in this slot's local cm")
  glowOffsetCm: vec3 = new vec3(0, 0.5, 0)

  @input
  @hint("ON: ring stands upright facing the user (hangers). OFF: ring lies flat (shelf/rack)")
  glowUpright: boolean = false

  @input('vec3', '{0.55,1.0,0.8}')
  @hint("Glow color")
  @widget(new ColorWidget())
  glowColor: vec3 = new vec3(0.55, 1.0, 0.8)
  @ui.group_end

  private _occupied = false
  private glowObj: SceneObject
  private glowOn = false
  private t = 0

  get occupied(): boolean {
    return this._occupied
  }

  onAwake() {
    this.glowObj = global.scene.createSceneObject("Glow")
    this.glowObj.setParent(this.sceneObject)
    this.glowObj.getTransform().setLocalPosition(this.glowOffsetCm)
    if (this.glowUpright) this.glowObj.getTransform().setLocalRotation(axisDeg(90, vec3.right()))
    const k = new MeshKit()
    const c = fromVec3(this.glowColor)
    k.ringXZ(0, 0, 0, this.glowRadiusCm * 0.82, this.glowRadiusCm, c, 36)
    k.ringXZ(0, 0, 0, this.glowRadiusCm * 0.45, this.glowRadiusCm * 0.52, rgb(c[0], c[1], c[2]), 36)
    k.build(this.glowObj, VERTEX_COLOR_MATERIAL)
    this.glowObj.enabled = false
    this.createEvent("UpdateEvent").bind(() => this.pulse())
  }

  setGlow(on: boolean): void {
    this.glowOn = on && !this._occupied
    if (this.glowObj) this.glowObj.enabled = this.glowOn
  }

  /** Marks the slot taken; its glow stays off from now on. */
  occupy(): void {
    this._occupied = true
    this.setGlow(false)
  }

  isGlowing(): boolean {
    return this.glowOn
  }

  private pulse() {
    if (!this.glowOn) return
    this.t += getDeltaTime()
    const s = 1 + 0.12 * Math.sin(this.t * 5)
    this.glowObj.getTransform().setLocalScale(new vec3(s, s, s))
  }
}
