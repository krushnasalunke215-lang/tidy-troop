/**
 * TidyTroopHintArrowUI — the small arrow that points toward the nearest remaining item
 * when every remaining item is out of view.
 * Owns: an arrow icon held a little in front of the eyes, rolled to point at the target.
 * API: pointTo(worldTarget), hide(), isShowing()
 * Must not: decide visibility rules or play the chime (TidyTroopMain does).
 */
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {ICONS} from "./TidyTroopAssets"
import {addImage} from "./TidyTroopTypeScaleUI"

@component
export class TidyTroopHintArrowUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopHintArrowUI – "it is over there" arrow</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Arrow size in cm")
  @widget(new SliderWidget(2, 12, 0.5))
  arrowSizeCm: number = 5

  @input
  @hint("Distance in front of the eyes, cm")
  @widget(new SliderWidget(30, 120, 1))
  distanceCm: number = 60

  @input
  @hint("How far the arrow slides toward the side it points to, cm")
  @widget(new SliderWidget(0, 20, 0.5))
  edgeOffsetCm: number = 9

  @input('vec4', '{1.0,0.85,0.4,1}')
  @hint("Arrow color")
  @widget(new ColorWidget())
  arrowColor: vec4 = new vec4(1.0, 0.85, 0.4, 1)
  @ui.group_end

  private arrow: SceneObject
  private camTr: Transform | null = null
  private target: vec3 = vec3.zero()

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const img = addImage(this.sceneObject, "Arrow", ICONS.arrow, this.arrowSizeCm, this.arrowColor)
    this.arrow = img.getSceneObject()
    this.createEvent("UpdateEvent").bind(() => this.follow())
    this.sceneObject.enabled = false
  }

  pointTo(worldTarget: vec3): void {
    this.target = worldTarget
    this.sceneObject.enabled = true
    this.follow()
  }

  hide(): void {
    this.sceneObject.enabled = false
  }

  isShowing(): boolean {
    return this.sceneObject.enabled
  }

  private follow() {
    if (!this.camTr) {
      const cam = WorldCameraFinderProvider.getInstance()
      if (cam) this.camTr = cam.getComponent().getTransform()
      if (!this.camTr) return
    }
    const c = this.camTr
    const camPos = c.getWorldPosition()
    const fwd = c.forward.uniformScale(-1)   // camera looks along -Z of its transform
    const right = c.right
    const up = c.up
    const d = this.target.sub(camPos)
    let r = d.dot(right)
    let u = d.dot(up)
    if (d.dot(fwd) < 0) {
      // Target is behind: point the way to turn (left/right), not up/down.
      r = r >= 0 ? 1 : -1
      u = 0
    }
    if (Math.abs(r) < 0.001 && Math.abs(u) < 0.001) r = -1
    const len = Math.sqrt(r * r + u * u)
    const dir2 = new vec2(r / len, u / len)
    const angle = Math.atan2(dir2.y, dir2.x)
    const pos = camPos.add(fwd.uniformScale(this.distanceCm))
      .add(right.uniformScale(dir2.x * this.edgeOffsetCm))
      .add(up.uniformScale(dir2.y * this.edgeOffsetCm - 4))
    const tr = this.sceneObject.getTransform()
    tr.setWorldPosition(pos)
    tr.setWorldRotation(c.getWorldRotation().multiply(quat.angleAxis(angle, vec3.forward())))
  }
}
