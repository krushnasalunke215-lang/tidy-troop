/**
 * TidyTroopMain — orchestrates Tidy Troop.
 * Owns: the flow (pick character -> tidy 10 numbered items -> salute per item -> ending),
 *       snapping released items into matching free slots, and the out-of-view hint rule.
 * Expects @inputs: the four UI modules, audio, celebration, both characters, the Room root
 *       (items, slots and TidyTroopLayoutSpots are discovered under it) and the FloorCenter anchor.
 * Placement: `placementMode` ColorfulHomeBedroom keeps the Room where it is authored (the mess sits on
 *       the Colorful Home preview bedroom's own bed and floor; the virtual bed hides). AroundUser moves
 *       the Room root to the user's start spot + heading and puts every LayoutSpot at its AroundUser pose.
 *       The picker is placed relative to the user's start pose in both modes. While picking, any room
 *       mesh between the eyes and the picker is hidden (clearPickerView) and comes back on pick.
 * Must not: build UI or meshes itself (UI modules / TidyTroopProp / TidyTroopCharacter do).
 */
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {TidyTroopPickerUI} from "./TidyTroopPickerUI"
import {TidyTroopNumberTagsUI} from "./TidyTroopNumberTagsUI"
import {TidyTroopSpeechBubbleUI} from "./TidyTroopSpeechBubbleUI"
import {TidyTroopHintArrowUI} from "./TidyTroopHintArrowUI"
import {TidyTroopAudio} from "./TidyTroopAudio"
import {TidyTroopCelebration} from "./TidyTroopCelebration"
import {TidyTroopCharacter} from "./TidyTroopCharacter"
import {TidyTroopItem} from "./TidyTroopItem"
import {TidyTroopSlot} from "./TidyTroopSlot"
import {TidyTroopLayoutSpot} from "./TidyTroopLayoutSpot"
import {TidyTroopState} from "./TidyTroopState"

/** Seconds every remaining item must stay out of view before the arrow + chime appear. */
const HINT_DELAY_SECONDS = 0.6

/** Sight lines to the picker count room meshes up to this fraction past the panel (things poking through it). */
const PICKER_SIGHT_OVERSHOOT = 1.15

/** True when segment a + t*(b - a), 0 <= t <= tMax, touches the box [min, max] (slab test). */
function segmentHitsBox(a: vec3, b: vec3, min: vec3, max: vec3, tMax: number): boolean {
  const d = b.sub(a)
  let t0 = 0
  let t1 = tMax
  const axes = [[a.x, d.x, min.x, max.x], [a.y, d.y, min.y, max.y], [a.z, d.z, min.z, max.z]]
  for (const [o, dir, lo, hi] of axes) {
    if (Math.abs(dir) < 1e-6) {
      if (o < lo || o > hi) return false
      continue
    }
    let ta = (lo - o) / dir
    let tb = (hi - o) / dir
    if (ta > tb) { const s = ta; ta = tb; tb = s }
    t0 = Math.max(t0, ta)
    t1 = Math.min(t1, tb)
    if (t0 > t1) return false
  }
  return true
}

@component
export class TidyTroopMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopMain – Tidy Troop game flow</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input @hint("Character picker panel") picker: TidyTroopPickerUI
  @input @hint("Floating number tags") tags: TidyTroopNumberTagsUI
  @input @hint("Character speech bubble") bubble: TidyTroopSpeechBubbleUI
  @input @hint("Out-of-view arrow") arrow: TidyTroopHintArrowUI
  @input @hint("Sound cues") audio: TidyTroopAudio
  @input @hint("Ending light wave + sparkles") celebration: TidyTroopCelebration
  @input @hint("Character 1: Sergeant Sweep") sergeant: TidyTroopCharacter
  @input @hint("Character 2: Captain Fresh") captain: TidyTroopCharacter
  @input @hint("Room root: every TidyTroopItem and TidyTroopSlot under it takes part") room: SceneObject
  @input @hint("Where the character marches for the final salute (middle of the floor)") floorCenter: SceneObject
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Where the room goes. Colorful Home bedroom: the mess sits on the bed and floor of the Colorful Home preview bedroom (fixed world spots = the Scene transforms under Room; the virtual bed hides). Around the user: the whole stand-in room, virtual bed included, is placed around wherever the user starts, facing their start heading")
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Colorful Home bedroom (fixed)", "ColorfulHomeBedroom"),
    new ComboBoxItem("Around the user (any room)", "AroundUser"),
  ]))
  placementMode: string = "ColorfulHomeBedroom"

  @input
  @hint("Around the user mode only: eye height of the user, cm. The room floor is placed this far below the eyes at start (136 matches the Colorful Home preview)")
  @widget(new SliderWidget(100, 200, 1))
  eyeHeightCm: number = 136

  @input
  @hint("How close (cm) a released item must be to its place to snap in")
  @widget(new SliderWidget(10, 60, 1))
  snapRadiusCm: number = 32

  @input
  @hint("Seconds the character stays after each item")
  @widget(new SliderWidget(1, 6, 0.1))
  saluteSeconds: number = 3

  @input
  @hint("Seconds the ending stays before it fades")
  @widget(new SliderWidget(3, 12, 0.5))
  endingSeconds: number = 6

  @input
  @hint("Out-of-view hint: view cone half-angles in degrees (horizontal, vertical). Vertical is wide because people look down at the bed and desk")
  viewConeDeg: vec2 = new vec2(30, 65)

  @input
  @hint("What the character says after each item (the count is added)")
  praiseText: string = "You are disciplined!"

  @input
  @hint("What the character says at the end (the count is added)")
  finaleText: string = "Room fresh!"
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Debug</span>')
  @ui.group_start("Debug")
  @input
  @hint("Draw every collider in the room as a wireframe (takes effect on preview restart)")
  debugColliders: boolean = false
  @ui.group_end

  readonly state = new TidyTroopState()
  items: TidyTroopItem[] = []
  slots: TidyTroopSlot[] = []
  spots: TidyTroopLayoutSpot[] = []
  /** The placement mode actually applied at start (for tests and the debug report). */
  appliedMode = ""
  lastMessage = ""
  hintShowing = false
  hintChimes = 0

  private camTr: Transform | null = null
  private outOfViewSeconds = 0
  private praiseToken = 0
  private heldItem: TidyTroopItem | null = null
  private finaleChar: TidyTroopCharacter | null = null
  /** Every mesh under Room (furniture, hangers, items), gathered once at setup. */
  private roomVisuals: RenderMeshVisual[] = []
  /** Room meshes hidden because they covered the picker; shown again on pick. */
  private hiddenForPicker: RenderMeshVisual[] = []

  onAwake() {
    const missing = ["picker", "tags", "bubble", "arrow", "audio", "celebration", "sergeant", "captain", "room", "floorCenter"]
      .filter((k) => !this[k])
    if (missing.length > 0) {
      print("TidyTroopMain: missing @input wiring: " + missing.join(", "))
      return
    }
    this.createEvent("OnStartEvent").bind(() => this.setup())
    this.createEvent("UpdateEvent").bind(() => this.tick())
  }

  // ------------------------------------------------------------ public (tests)
  get placedCount(): number { return this.state.placed }
  get phase(): string { return this.state.phase }
  get chosenCharacter(): TidyTroopCharacter | null {
    return this.state.chosen === 0 ? this.sergeant : this.state.chosen === 1 ? this.captain : null
  }
  findItem(n: number): TidyTroopItem | null {
    return this.items.find((i) => i.number === n) || null
  }

  /** Test hook (TidyTroopDebugDriver key N): place the lowest-numbered remaining item. */
  debugPlaceNext(): boolean {
    if (this.state.phase !== "tidying") return false
    const item = this.items.find((i) => !i.placed)
    if (!item) return false
    const slot = this.slots.find((s) => !s.occupied && s.category === item.category)
    if (!slot) return false
    this.place(item, slot)
    return true
  }

  /** Test hook: the two picker card SceneObjects. */
  debugCards(): SceneObject[] {
    return this.picker.getCards()
  }

  /** Test hook (key R): one-line state summary. */
  debugReport(): string {
    const visibleTags = this.items.filter((i) => this.tags.isTagVisible(i.number)).map((i) => i.number)
    const ch = this.finaleChar || this.chosenCharacter
    return "mode=" + this.appliedMode + " phase=" + this.state.phase + " placed=" + this.state.placed + "/" + this.state.total +
      " picker=" + this.picker.isShowing() + " tags=[" + visibleTags.join(",") + "]" +
      " character=" + (ch ? ch.getSceneObject().name + ":" + ch.isShowing() : "none") +
      " bubble=" + this.bubble.isShowing() + ":'" + this.bubble.getText() + "'" +
      " arrow=" + this.arrow.isShowing() + " chimes=" + this.hintChimes +
      " celebration=" + this.celebration.isRunning() +
      " pickerCleared=[" + this.hiddenForPicker.map((v) => v.getSceneObject().name).join(",") + "]" +
      " audio=" + JSON.stringify(this.audio.playCount)
  }

  // ------------------------------------------------------------ setup
  private setup() {
    this.collect(this.room)
    this.items.sort((a, b) => a.number - b.number)
    this.state.total = this.items.length
    for (const item of this.items) {
      item.setInteractive(false)
      this.tags.addTag(item.number, item.getSceneObject(), item.tagHeightCm)
      item.onGrab.add((it) => this.onGrab(it))
      item.onRelease.add((it) => this.onRelease(it))
    }
    this.tags.hideAll()
    this.picker.onPick.add((i) => this.pick(i))
    if (this.debugColliders) this.setColliderDebug(this.room, true)
    print("TidyTroop: " + this.items.length + " items, " + this.slots.length + " slots")
  }

  private collect(so: SceneObject) {
    const item = so.getComponent(TidyTroopItem.getTypeName()) as TidyTroopItem
    if (item) this.items.push(item)
    const slot = so.getComponent(TidyTroopSlot.getTypeName()) as TidyTroopSlot
    if (slot) this.slots.push(slot)
    const spot = so.getComponent(TidyTroopLayoutSpot.getTypeName()) as TidyTroopLayoutSpot
    if (spot) this.spots.push(spot)
    for (let i = 0; i < so.getChildrenCount(); i++) this.collect(so.getChild(i))
  }

  /** Every RenderMeshVisual under `so` (meshes are built in onAwake, so call this from OnStart or later). */
  private collectVisuals(so: SceneObject, out: RenderMeshVisual[]) {
    const rmvs = so.getComponents("Component.RenderMeshVisual") as RenderMeshVisual[]
    for (const v of rmvs) out.push(v)
    for (let i = 0; i < so.getChildrenCount(); i++) this.collectVisuals(so.getChild(i), out)
  }

  /**
   * While picking, hide any room mesh on a sight line from the eyes to the picker or its character
   * previews, so furniture can never cover the cards (on real glasses real furniture can't either).
   * Runs every picking frame and only adds; everything comes back in restorePickerView().
   */
  private clearPickerView(eye: vec3) {
    const pts = this.picker.getViewSamplePoints()
    for (const v of this.roomVisuals) {
      if (isNull(v) || !v.enabled || !v.getSceneObject().isEnabledInHierarchy) continue
      if (!v.mesh) continue
      const inv = v.getSceneObject().getTransform().getInvertedWorldTransform()
      const min = v.localAabbMin()
      const max = v.localAabbMax()
      const le = inv.multiplyPoint(eye)
      // Test in the mesh's own frame so rotated furniture uses its real box, not a padded world box.
      const blocks = pts.some((p) => segmentHitsBox(le, inv.multiplyPoint(p), min, max, PICKER_SIGHT_OVERSHOOT))
      if (blocks) {
        v.enabled = false
        this.hiddenForPicker.push(v)
        print("TidyTroop: hid " + v.getSceneObject().name + " while picking (it covered the picker)")
      }
    }
  }

  private restorePickerView() {
    for (const v of this.hiddenForPicker) if (!isNull(v)) v.enabled = true
    this.hiddenForPicker = []
  }

  private camera(): Transform | null {
    if (!this.camTr) {
      const cam = WorldCameraFinderProvider.getInstance()
      if (cam) this.camTr = cam.getComponent().getTransform()
    }
    return this.camTr
  }

  private camPos(): vec3 {
    const c = this.camera()
    return c ? c.getWorldPosition() : vec3.zero()
  }

  // ------------------------------------------------------------ per frame
  private tick() {
    const c = this.camera()
    if (!c) return
    if (this.state.phase === "starting") {
      // First frame with a tracked camera: place the room for the chosen mode, show the picker.
      const eye = c.getWorldPosition()
      this.placeRoom(eye, c.back)
      for (const item of this.items) item.recordOrigin()
      this.picker.placeInFront(eye, c.back)
      this.picker.show()
      this.collectVisuals(this.room, this.roomVisuals)
      this.clearPickerView(eye)
      this.state.phase = "picking"
      return
    }
    if (this.state.phase === "picking") {
      const eye = c.getWorldPosition()
      this.clearPickerView(eye)
      this.previewOnCard(this.sergeant, 0, eye)
      this.previewOnCard(this.captain, 1, eye)
      return
    }
    const ch = this.finaleChar || this.chosenCharacter
    if (ch && this.bubble.isShowing()) this.bubble.moveTo(ch.headTopWorld())
    if (this.state.phase === "tidying") this.updateHint(c)
  }

  /** ColorfulHomeBedroom: keep the authored Room. AroundUser: Room root to the user's floor spot + heading. */
  private placeRoom(eye: vec3, camForward: vec3) {
    const mode = this.placementMode === "AroundUser" ? "AroundUser" : "ColorfulHomeBedroom"
    if (mode === "AroundUser") {
      const flat = new vec3(camForward.x, 0, camForward.z)
      const f = flat.length > 0.01 ? flat.normalize() : new vec3(0, 0, -1)
      const rt = this.room.getTransform()
      rt.setWorldPosition(new vec3(eye.x, eye.y - this.eyeHeightCm, eye.z))
      // Room local -Z (ahead in the AroundUser layout) points along the user's start heading.
      rt.setWorldRotation(quat.angleAxis(Math.atan2(-f.x, -f.z), vec3.up()))
    }
    for (const spot of this.spots) spot.applyMode(mode)
    this.appliedMode = mode
    print("TidyTroop: placement " + mode + " (" + this.spots.length + " layout spots)")
  }

  private previewOnCard(ch: TidyTroopCharacter, index: number, eye: vec3) {
    const p = this.picker.getCardTopWorldPosition(index)
    if (!ch.isShowing()) ch.showPreview(p, eye, 0.55)
    ch.getSceneObject().getTransform().setWorldPosition(p)
    ch.faceTowards(eye)
  }

  // ------------------------------------------------------------ flow
  private pick(index: number) {
    if (!this.state.pick(index)) return
    this.audio.playPick()
    this.picker.hide()
    this.restorePickerView()
    this.sergeant.hide(0.15)
    this.captain.hide(0.15)
    this.tags.showAll()
    for (const item of this.items) item.setInteractive(true)
    print("TidyTroop: picked " + (index === 0 ? "Sergeant Sweep" : "Captain Fresh"))
  }

  private onGrab(item: TidyTroopItem) {
    this.heldItem = item
    for (const s of this.slots) s.setGlow(s.category === item.category && !s.occupied)
  }

  private onRelease(item: TidyTroopItem) {
    if (this.heldItem === item) this.heldItem = null
    for (const s of this.slots) s.setGlow(false)
    const slot = this.findSnap(item)
    if (slot) this.place(item, slot)
  }

  /** Nearest free matching slot that the item was released "over" (3D distance or along the view ray). */
  findSnap(item: TidyTroopItem): TidyTroopSlot | null {
    const p = item.getSceneObject().getTransform().getWorldPosition()
    const eye = this.camPos()
    const ray = p.sub(eye)
    const rayLen = ray.length
    const dir = rayLen > 0.001 ? ray.uniformScale(1 / rayLen) : new vec3(0, 0, -1)
    let best: TidyTroopSlot | null = null
    let bestScore = this.snapRadiusCm
    for (const s of this.slots) {
      if (s.occupied || s.category !== item.category) continue
      const sp = s.getSceneObject().getTransform().getWorldPosition().add(item.placedOffsetCm.uniformScale(0.5))
      let score = sp.distance(p)
      const along = sp.sub(eye).dot(dir)
      if (along > 0) {
        const perp = sp.sub(eye.add(dir.uniformScale(along))).length
        score = Math.min(score, perp)
      }
      if (score < bestScore) {
        bestScore = score
        best = s
      }
    }
    return best
  }

  private place(item: TidyTroopItem, slot: TidyTroopSlot) {
    item.placeAt(slot.getSceneObject())
    slot.occupy()
    this.tags.setTagVisible(item.number, false)
    this.audio.playSnap()
    const count = this.state.placeOne()
    print("TidyTroop: item " + item.number + " placed (" + count + " of " + this.state.total + ")")
    if (count < this.state.total) this.praise(item, count)
    else this.finale(item)
  }

  private praise(item: TidyTroopItem, count: number) {
    const ch = this.chosenCharacter
    if (!ch) return
    const token = ++this.praiseToken
    ch.appearAt(item.originWorld, this.camPos(), 1)
    ch.salute(Math.max(0.4, this.saluteSeconds - 1.4))
    this.audio.playSalute()
    this.lastMessage = this.praiseText + " " + count + " of " + this.state.total
    this.bubble.show(this.lastMessage, ch.headTopWorld())
    this.after(this.saluteSeconds, () => {
      if (token !== this.praiseToken) return
      ch.hide()
      this.bubble.hide()
      print("TidyTroop: salute for item " + item.number + " ended after " + this.saluteSeconds + " s")
    })
  }

  private finale(item: TidyTroopItem) {
    const ch = this.chosenCharacter
    if (!ch) return
    this.praiseToken++
    this.finaleChar = ch
    this.arrow.hide()
    this.hintShowing = false
    const eye = this.camPos()
    const center = this.floorCenter.getTransform().getWorldPosition()
    ch.appearAt(item.originWorld, eye, 1)
    this.audio.playSalute()
    this.after(0.45, () => {
      ch.marchTo(center, 1.6, eye, () => {
        ch.growTo(2, 0.45)
        ch.holdSalute()
        this.audio.playFanfare()
        this.audio.playSparkle()
        this.celebration.play(center, new vec3(170, 150, 140), this.endingSeconds)
        this.lastMessage = this.finaleText + " " + this.state.total + " of " + this.state.total
        this.bubble.show(this.lastMessage, ch.headTopWorld())
        this.after(this.endingSeconds, () => {
          ch.hide(0.6)
          this.bubble.hide()
          this.state.phase = "done"
          print("TidyTroop: ending finished")
        })
      })
    })
  }

  // ------------------------------------------------------------ out-of-view hint
  /** True when the point is inside the view cone of the camera. */
  isInView(c: Transform, p: vec3): boolean {
    const d = p.sub(c.getWorldPosition())
    const fwd = d.dot(c.back)
    if (fwd <= 0) return false
    const limH = Math.tan(this.viewConeDeg.x * MathUtils.DegToRad)
    const limV = Math.tan(this.viewConeDeg.y * MathUtils.DegToRad)
    return Math.abs(d.dot(c.right)) / fwd < limH && Math.abs(d.dot(c.up)) / fwd < limV
  }

  private updateHint(c: Transform) {
    const remaining = this.items.filter((i) => !i.placed)
    if (remaining.length === 0 || this.heldItem) {
      this.outOfViewSeconds = 0
      this.setHint(false, null)
      return
    }
    const anyInView = remaining.some((i) => this.isInView(c, i.getSceneObject().getTransform().getWorldPosition()))
    if (anyInView) {
      this.outOfViewSeconds = 0
      this.setHint(false, null)
      return
    }
    // Wait a moment so a quick glance away does not ring the chime.
    this.outOfViewSeconds += getDeltaTime()
    if (this.outOfViewSeconds < HINT_DELAY_SECONDS) return
    const eye = c.getWorldPosition()
    let nearest = remaining[0]
    let best = Number.MAX_VALUE
    for (const i of remaining) {
      const dd = i.getSceneObject().getTransform().getWorldPosition().distance(eye)
      if (dd < best) { best = dd; nearest = i }
    }
    this.setHint(true, nearest.getSceneObject().getTransform().getWorldPosition())
  }

  private setHint(on: boolean, target: vec3 | null) {
    if (on && target) {
      this.arrow.pointTo(target)
      if (!this.hintShowing) {
        this.audio.playChime()
        this.hintChimes++
      }
      this.hintShowing = true
    } else if (this.hintShowing) {
      this.arrow.hide()
      this.hintShowing = false
    }
  }

  // ------------------------------------------------------------ helpers
  private after(seconds: number, cb: () => void) {
    const ev = this.createEvent("DelayedCallbackEvent")
    ev.bind(() => cb())
    ev.reset(seconds)
  }

  private setColliderDebug(so: SceneObject, on: boolean) {
    const cols = so.getComponents("Physics.ColliderComponent") as ColliderComponent[]
    for (const col of cols) col.debugDrawEnabled = on
    for (let i = 0; i < so.getChildrenCount(); i++) this.setColliderDebug(so.getChild(i), on)
  }
}
