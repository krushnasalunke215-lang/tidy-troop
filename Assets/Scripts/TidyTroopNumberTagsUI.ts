/**
 * TidyTroopNumberTagsUI — the floating number tags (1 to 10) above each mess item.
 * Owns: one tag per item (light ring + translucent dark fill + light number), each
 *       following its item and facing the user every frame.
 * API: addTag(n, target, heightCm), setTagVisible(n, on), showAll(), hideAll(), isTagVisible(n),
 *      pulse(n, seconds) (the tag gently grows and shrinks to draw the eye)
 * Must not: decide when tags show (TidyTroopMain does).
 */
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {ICONS} from "./TidyTroopAssets"
import {addImage, addText, faceCamera, obj} from "./TidyTroopTypeScaleUI"

type Tag = {n: number, root: SceneObject, target: SceneObject, height: number, wanted: boolean, pulseUntil: number}

/** Pulse: up to this much bigger, this many beats per second. */
const PULSE_GROW = 0.25
const PULSE_SPEED = 5

@component
export class TidyTroopNumberTagsUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopNumberTagsUI – numbers on the mess</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Tag diameter in cm")
  @widget(new SliderWidget(4, 16, 0.5))
  tagDiameterCm: number = 8

  @input('vec4', '{1.0,0.93,0.6,1}')
  @hint("Ring color (the light circle)")
  @widget(new ColorWidget())
  ringColor: vec4 = new vec4(1.0, 0.93, 0.6, 1)

  @input('vec4', '{0.08,0.12,0.3,0.6}')
  @hint("Fill behind the number (dark fill shows as clear on the additive display)")
  @widget(new ColorWidget())
  fillColor: vec4 = new vec4(0.08, 0.12, 0.3, 0.6)

  @input('vec4', '{1,1,1,1}')
  @hint("Number color")
  @widget(new ColorWidget())
  numberColor: vec4 = new vec4(1, 1, 1, 1)
  @ui.group_end

  private tags: Tag[] = []
  private camTr: Transform | null = null

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    this.createEvent("UpdateEvent").bind(() => this.follow())
  }

  addTag(n: number, target: SceneObject, heightCm: number): void {
    const root = obj(this.sceneObject, "Tag_" + n)
    const d = this.tagDiameterCm
    addImage(root, "Fill", ICONS.circle, d, this.fillColor)
    const ring = addImage(root, "Ring", ICONS.ring, d * 1.08, this.ringColor)
    ring.getSceneObject().getTransform().setLocalPosition(new vec3(0, 0, 0.05))
    const t = addText(root, "Number", "" + n, "Title1", 110 * d / 8 * 2.1, d, d, this.numberColor)
    t.getSceneObject().getTransform().setLocalPosition(new vec3(0, 0, 0.1))
    root.enabled = false
    this.tags.push({n, root, target, height: heightCm, wanted: false, pulseUntil: 0})
  }

  /** Make tag `n` pulse for `seconds` (used to say "start here"). */
  pulse(n: number, seconds: number): void {
    const tag = this.tags.find((t) => t.n === n)
    if (tag) tag.pulseUntil = getTime() + seconds
  }

  setTagVisible(n: number, on: boolean): void {
    const tag = this.tags.find((t) => t.n === n)
    if (!tag) return
    tag.wanted = on
    tag.root.enabled = on
  }

  showAll(): void {
    for (const t of this.tags) this.setTagVisible(t.n, true)
  }

  hideAll(): void {
    for (const t of this.tags) this.setTagVisible(t.n, false)
  }

  isTagVisible(n: number): boolean {
    const tag = this.tags.find((t) => t.n === n)
    return !!tag && tag.root.enabled
  }

  private follow() {
    if (!this.camTr) {
      const cam = WorldCameraFinderProvider.getInstance()
      if (cam) this.camTr = cam.getComponent().getTransform()
    }
    const camPos = this.camTr ? this.camTr.getWorldPosition() : vec3.zero()
    const now = getTime()
    for (const t of this.tags) {
      if (!t.wanted) continue
      const p = t.target.getTransform().getWorldPosition().add(new vec3(0, t.height, 0))
      const tr = t.root.getTransform()
      tr.setWorldPosition(p)
      tr.setWorldRotation(faceCamera(p, camPos))
      const k = now < t.pulseUntil ? 1 + PULSE_GROW * Math.abs(Math.sin(now * PULSE_SPEED)) : 1
      tr.setLocalScale(new vec3(k, k, k))
    }
  }
}
