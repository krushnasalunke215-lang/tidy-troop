/**
 * TidyTroopMain — orchestrates Tidy Troop.
 * Owns: the flow (pick character -> briefing -> tidy 10 numbered items -> salute per item ->
 *       ending on the clear bed), snapping released items into matching free slots, and the
 *       out-of-view hint rule.
 * Salutes wait for you: the bugle plays at the drop, and the buddy's salute and bubble start once
 *       the cleared spot is inside the salute view cone (about the SPECS display), or after
 *       `saluteWaitSeconds`. Clearing the last bed item (`bedItemNumbers`) says "Bed clear!" with
 *       sparkles. After the last item the bubble says "look at your bed", the arrow points there,
 *       and the big salute plays on the spot where item `finaleOnItem` lay, with the time taken.
 *       What each buddy says lives in TidyTroopLines.ts; the buddy also says it out loud
 *       (TidyTroopVoiceLines.ts), and each salute lasts until the voice is done.
 * Far away: the buddy grows (buddyFullSizeWithinCm) and so does the bubble, so neither looks tiny.
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
import {InteractionManager} from "InteractionKit.lspkg/Core/InteractionManager/InteractionManager"
import {InteractorInputType} from "InteractionKit.lspkg/Core/Interactor/Interactor"
import {MouseInteractor} from "InteractionKit.lspkg/Core/MouseInteractor/MouseInteractor"
import {VOICE_LINES} from "./TidyTroopVoiceLines"
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
import {TidyTroopDropZone} from "./TidyTroopDropZone"
import {TidyTroopState} from "./TidyTroopState"
import {doneInText, itemKind, linesFor, parseNumberList} from "./TidyTroopLines"

/** A salute that waits until the cleared spot is in view. */
type PendingSalute = {item: TidyTroopItem, text: string, bedClear: boolean, since: number, token: number}

/** Seconds every remaining item must stay out of view before the arrow + chime appear. */
const HINT_DELAY_SECONDS = 0.6

/** "Look at your bed" bubble after the last item: this far straight ahead of the eyes, cm. */
const LOOK_BUBBLE_DISTANCE_CM = 90

/** Briefing bubble: its bottom edge sits this far below the buddy's feet (the bubble is about 12 cm tall). */
const BRIEFING_BUBBLE_DROP_CM = 16

/**
 * Before a buddy is picked, moving the eyes this far (cm) from where the picker opened opens it again in
 * front of them. In the Lens Studio preview the Lens can start before the saved preview camera pose is
 * restored, which put the picker metres away; walking into the room before picking does the same.
 */
const PICKER_REOPEN_CM = 150

/** The salute bugle is 1.6 s long; the buddy starts talking once it is nearly over. */
const BUGLE_SECONDS = 1.5

/** Sight lines to the picker count room meshes up to this fraction past the panel (things poking through it). */
const PICKER_SIGHT_OVERSHOOT = 1.15

/** A drop over the furniture itself counts too (its box grown by this much, cm), not only near one of its places. */
const FURNITURE_DROP_PAD_CM = 10

/** The view ray through a dropped item is followed this many eye-to-item distances, to find furniture behind it. */
const FURNITURE_RAY_REACH = 20

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
  @input @hint("A point on the room floor: its height is the floor for the ending light wave, and the final salute happens here if 'Final salute on item' is 0") floorCenter: SceneObject
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
  @hint("How close (cm) a released item must be to its place to snap in. A drop over the furniture that holds the place (cupboard, bookshelf, rack) also counts")
  @widget(new SliderWidget(10, 60, 1))
  snapRadiusCm: number = 32

  @input
  @hint("Seconds the character stays after each item, at least (it stays longer while it is still talking)")
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
  @hint("Second line of the bubble after each item (the count is added). The first line names the job and depends on the buddy (TidyTroopLines.ts)")
  praiseText: string = "You are disciplined!"

  @input
  @hint("What the character says at the end (the count is added; the time taken goes on the second line)")
  finaleText: string = "Room fresh!"

  @input
  @hint("Salute view cone half-angles in degrees (horizontal, vertical): the salute starts once the cleared spot is inside it. 16 x 18 is about the SPECS display")
  saluteViewConeDeg: vec2 = new vec2(16, 18)

  @input
  @hint("Longest wait (s) for you to look at the cleared spot; after this the salute plays anyway")
  @widget(new SliderWidget(1, 20, 0.5))
  saluteWaitSeconds: number = 8

  @input
  @hint("Seconds the buddy explains where to start, right after the pick")
  @widget(new SliderWidget(0, 8, 0.5))
  briefingSeconds: number = 3.5

  @input
  @hint("Item numbers that lie on the bed, comma separated. Putting the last of them away gets 'Bed clear!' and sparkles")
  bedItemNumbers: string = "1,2,3"

  @input
  @hint("The final salute happens on the spot where this item lay (1 = the shirt on the bed). 0 = at FloorCenter")
  @widget(new SliderWidget(0, 10, 1))
  finaleOnItem: number = 1

  @input
  @hint("Longest wait (s) for you to turn to the final salute spot; after this the ending plays anyway")
  @widget(new SliderWidget(2, 30, 0.5))
  finaleWaitSeconds: number = 10

  @input
  @hint("Farther away than this (cm), the buddy grows so it looks no smaller than at this distance")
  @widget(new SliderWidget(100, 400, 10))
  buddyFullSizeWithinCm: number = 200

  @input
  @hint("Most the buddy grows when far away (times its normal size)")
  @widget(new SliderWidget(1, 4, 0.1))
  buddyMaxFarScale: number = 2.5

  @input
  @hint("Lens Studio preview only: how far the mouse can reach items, cm (the interaction kit's default is 500)")
  @widget(new SliderWidget(300, 3000, 50))
  mouseReachCm: number = 1500
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
  /** The salute waiting for its cleared spot to come into view. */
  private pending: PendingSalute | null = null
  /** False while the bubble is pinned somewhere other than the buddy's head. */
  private bubbleFollows = true
  private pickTime = 0
  private finishTime = 0
  private finaleWaiting = false
  private finaleWaitSince = 0
  /** Seconds after the last item before the final salute may start (lets "look at your bed" be said). */
  private finaleMinWait = 1.2
  private finaleSpot: vec3 = vec3.zero()
  /** Bumped whenever something new is said, so a delayed line that is no longer current stays quiet. */
  private voiceToken = 0
  /** Where the eyes were when the picker last opened. */
  private pickerEye: vec3 = vec3.zero()
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
      " pendingSalute=" + (this.pending ? this.pending.item.number : "none") +
      " finaleWaiting=" + this.finaleWaiting +
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
    this.setMouseReach()
  }

  /** The preview mouse can only reach 500 cm by default; items further away can't be picked up. */
  private setMouseReach() {
    const mice = InteractionManager.getInstance().getInteractorsByType(InteractorInputType.Mouse)
    for (const m of mice) (m as MouseInteractor).maxRaycastDistance = this.mouseReachCm
    print("TidyTroop: mouse reach " + this.mouseReachCm + " cm (" + mice.length + " mouse interactor)")
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
      this.pickerEye = eye
      if (this.roomVisuals.length === 0) this.collectVisuals(this.room, this.roomVisuals)
      this.clearPickerView(eye)
      this.state.phase = "picking"
      return
    }
    if (this.state.phase === "picking") {
      const eye = c.getWorldPosition()
      const moved = eye.distance(this.pickerEye)
      if (moved > PICKER_REOPEN_CM) {
        print("TidyTroop: eyes moved " + Math.round(moved) + " cm before a pick, so the picker opens again in front of them")
        this.restorePickerView()
        this.state.phase = "starting"
        return
      }
      this.clearPickerView(eye)
      this.previewOnCard(this.sergeant, 0, eye)
      this.previewOnCard(this.captain, 1, eye)
      return
    }
    const ch = this.finaleChar || this.chosenCharacter
    if (ch && this.bubbleFollows && this.bubble.isShowing()) this.bubble.moveTo(ch.headTopWorld())
    if (this.pending) this.updatePending(c)
    if (this.state.phase === "tidying") this.updateHint(c)
    if (this.finaleWaiting) this.updateFinaleWait(c)
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
    // Each layout has its own places (the bedroom uses the preview room's real wardrobe, shelves and
    // table; AroundUser uses the stand-in cupboard and desk). Only the ones shown in this mode count.
    this.slots = this.slots.filter((s) => s.getSceneObject().isEnabledInHierarchy)
    print("TidyTroop: placement " + mode + " (" + this.spots.length + " layout spots)")
    print("TidyTroop: " + this.items.length + " items, " + this.slots.length + " slots")
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
    const ch = this.chosenCharacter
    for (const other of [this.sergeant, this.captain]) if (other !== ch) other.hide(0.15)
    this.tags.showAll()
    for (const item of this.items) item.setInteractive(true)
    this.pickTime = getTime()
    print("TidyTroop: picked " + (index === 0 ? "Sergeant Sweep" : "Captain Fresh"))
    if (ch) this.brief(ch)
  }

  /** Right after the pick: the buddy stays where its card was and says where to start. */
  private brief(ch: TidyTroopCharacter) {
    const first = this.items.find((i) => !i.placed)
    if (!first || this.briefingSeconds <= 0) {
      ch.hide(0.15)
      return
    }
    const token = ++this.praiseToken
    const lines = linesFor(this.state.chosen)
    this.lastMessage = lines.briefing[0](this.state.total) + "\n" + lines.briefing[1](first.number)
    const hold = Math.max(this.briefingSeconds, this.speak(this.lastMessage, 0.2) + 0.4)
    ch.faceTowards(this.camPos())
    ch.salute(Math.max(0.4, hold - 1.2))
    this.tags.pulse(first.number, hold + 2)
    // The buddy stands at about eye height here, so a bubble over its head would sit above the
    // top of the SPECS display. Put it just below the buddy, centred where the picker panel was
    // (where you were just looking), so the wide bubble stays inside the display.
    this.bubbleFollows = false
    const feet = ch.getSceneObject().getTransform().getWorldPosition()
    const panel = this.picker.getSceneObject().getTransform().getWorldPosition()
    this.bubble.show(this.lastMessage, new vec3(panel.x, feet.y - BRIEFING_BUBBLE_DROP_CM, panel.z))
    print("TidyTroop: briefing: " + this.lastMessage.replace("\n", " / "))
    this.after(hold, () => {
      if (token !== this.praiseToken) return
      ch.hide()
      this.bubble.hide()
    })
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
    else print("TidyTroop: item " + item.number + " dropped away from a free " + item.category + " place, not snapped")
  }

  /**
   * Nearest free matching slot that the item was released "over" (3D distance or along the view ray).
   * If none is that close, a drop over the furniture that holds free matching slots (the wardrobe
   * rail, the shelves, the plate rack; their TidyTroopDropZone or mesh box) takes the nearest free one.
   */
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
    return best ? best : this.findFurnitureSnap(item, p, eye)
  }

  /** findSnap fallback: the item lies inside, or on the view ray to, furniture that has a free matching slot. */
  private findFurnitureSnap(item: TidyTroopItem, p: vec3, eye: vec3): TidyTroopSlot | null {
    const pad = new vec3(FURNITURE_DROP_PAD_CM, FURNITURE_DROP_PAD_CM, FURNITURE_DROP_PAD_CM)
    let best: TidyTroopSlot | null = null
    let bestDist = Number.MAX_VALUE
    for (const s of this.slots) {
      if (s.occupied || s.category !== item.category) continue
      const furniture = s.getSceneObject().getParent()
      if (!furniture) continue
      // A drop zone (real furniture in the preview room) wins; otherwise the parent's own mesh box.
      const zone = furniture.getComponent(TidyTroopDropZone.getTypeName()) as TidyTroopDropZone
      const v = furniture.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
      if (!zone && (!v || !v.mesh)) continue
      // Test in the furniture's own frame so the rotated cupboard uses its real box, not a padded world box.
      const inv = furniture.getTransform().getInvertedWorldTransform()
      const min = (zone ? zone.minCm : v.localAabbMin()).sub(pad)
      const max = (zone ? zone.maxCm : v.localAabbMax()).add(pad)
      if (!segmentHitsBox(inv.multiplyPoint(eye), inv.multiplyPoint(p), min, max, FURNITURE_RAY_REACH)) continue
      const d = s.getSceneObject().getTransform().getWorldPosition().distance(p)
      if (d < bestDist) {
        bestDist = d
        best = s
      }
    }
    if (best) {
      print("TidyTroop: item " + item.number + " dropped on the " + best.getSceneObject().getParent().name +
        ", so it goes to " + best.getSceneObject().name)
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
    if (count < this.state.total) this.queuePraise(item, count)
    else this.startFinale(item)
  }

  /** The bugle plays now; the salute itself waits until the cleared spot is in view. */
  private queuePraise(item: TidyTroopItem, count: number) {
    const ch = this.chosenCharacter
    if (!ch) return
    const token = ++this.praiseToken
    ch.hide(0.15)
    this.bubble.hide()
    this.stopSpeaking()
    this.audio.playSalute()
    const lines = linesFor(this.state.chosen)
    const bedClear = this.isBedClearNow(item)
    const first = bedClear ? lines.bedClear : lines.job[itemKind(item.category, item.getSceneObject().name)]
    const text = first + "\n" + this.praiseText + " " + count + " of " + this.state.total
    this.pending = {item, text, bedClear, since: getTime(), token}
  }

  private updatePending(c: Transform) {
    const p = this.pending
    if (!p) return
    if (p.token !== this.praiseToken) {
      this.pending = null
      return
    }
    const inView = this.inCone(c, p.item.originWorld.add(new vec3(0, 12, 0)), this.saluteViewConeDeg)
    const waited = getTime() - p.since
    if (!inView && waited < this.saluteWaitSeconds) return
    this.pending = null
    this.startSalute(p, inView, waited)
  }

  private startSalute(p: PendingSalute, inView: boolean, waited: number) {
    const ch = this.chosenCharacter
    if (!ch) return
    ch.appearAt(p.item.originWorld, this.camPos(), this.farScale(p.item.originWorld))
    // The bugle played at the drop: start talking once it is nearly over.
    const hold = Math.max(this.saluteSeconds, this.speak(p.text, Math.max(0.2, BUGLE_SECONDS - waited)) + 0.4)
    ch.salute(Math.max(0.4, hold - 1.4))
    if (p.bedClear) {
      this.audio.playSparkle()
      // A small burst low over the cleared bed, around the buddy and below its bubble (which starts
      // about 29 cm up). No light wave: that's kept for the ending.
      this.celebration.play(p.item.originWorld, new vec3(50, 14, 50), hold,
        {wave: false, count: 24, base: 2, maxRise: 8, sizeScale: 0.7})
    }
    this.lastMessage = p.text
    this.bubbleFollows = true
    this.bubble.show(p.text, ch.headTopWorld())
    print("TidyTroop: salute for item " + p.item.number + " started " +
      (inView ? "when its spot came into view" : "after waiting " + this.saluteWaitSeconds + " s") +
      " (" + waited.toFixed(1) + " s after the drop): " + p.text.replace("\n", " / "))
    this.after(hold, () => {
      if (p.token !== this.praiseToken) return
      ch.hide()
      this.bubble.hide()
      print("TidyTroop: salute for item " + p.item.number + " ended after " + hold.toFixed(1) + " s")
    })
  }

  /** True when `item` was the last bed item still out (the bed is now clear) and others remain. */
  private isBedClearNow(item: TidyTroopItem): boolean {
    const bed = parseNumberList(this.bedItemNumbers)
    if (bed.indexOf(item.number) < 0) return false
    return bed.every((n) => {
      const it = this.findItem(n)
      return !it || it.placed
    })
  }

  /** Last item in: say "look at your bed" where you are looking, then wait for the bed spot. */
  private startFinale(item: TidyTroopItem) {
    const ch = this.chosenCharacter
    if (!ch) return
    this.praiseToken++
    this.pending = null
    this.finishTime = getTime()
    this.finaleChar = ch
    ch.hide(0.15)
    this.setHint(false, null)
    this.audio.playSalute()
    const lines = linesFor(this.state.chosen)
    this.lastMessage = lines.lastOne[0] + "\n" + lines.lastOne[1]
    // Show it right where you are looking (not on the item, which can sit at the edge of the view).
    this.bubbleFollows = false
    const c = this.camera()
    const eye = this.camPos()
    const ahead = c ? eye.add(c.back.uniformScale(LOOK_BUBBLE_DISTANCE_CM)) : item.originWorld
    this.bubble.show(this.lastMessage, ahead.add(new vec3(0, -6, 0)))
    // The bugle plays now too; the final salute waits until "look at your bed" has been said.
    const talk = this.speak(this.lastMessage, BUGLE_SECONDS)
    this.finaleMinWait = Math.max(1.2, talk + 0.2)
    const onItem = this.finaleOnItem > 0 ? this.findItem(this.finaleOnItem) : null
    this.finaleSpot = onItem ? onItem.originWorld : this.floorCenter.getTransform().getWorldPosition()
    this.finaleWaitSince = getTime()
    this.finaleWaiting = true
    print("TidyTroop: last item in after " + (this.finishTime - this.pickTime).toFixed(1) + " s; waiting for the final salute spot")
  }

  private updateFinaleWait(c: Transform) {
    const inView = this.inCone(c, this.finaleSpot.add(new vec3(0, 25, 0)), this.saluteViewConeDeg)
    const waited = getTime() - this.finaleWaitSince
    if ((inView && waited >= this.finaleMinWait) || waited >= Math.max(this.finaleWaitSeconds, this.finaleMinWait)) {
      this.finaleWaiting = false
      this.playFinale(inView, waited)
      return
    }
    // Give the "look at your bed" line a moment, then point the way if the spot is out of view.
    if (waited >= 1.2) this.setHint(!inView, inView ? null : this.finaleSpot)
  }

  private playFinale(inView: boolean, waited: number) {
    const ch = this.finaleChar
    if (!ch) return
    this.setHint(false, null)
    this.bubble.hide()
    const eye = this.camPos()
    const s = this.farScale(this.finaleSpot)
    ch.appearAt(this.finaleSpot, eye, s)
    print("TidyTroop: final salute " + (inView ? "when its spot came into view" : "after waiting " + this.finaleWaitSeconds + " s") +
      " (" + waited.toFixed(1) + " s after the last item)")
    this.after(0.3, () => {
      ch.growTo(2 * s, 0.45)
      ch.holdSalute()
      this.audio.playFanfare()
      this.audio.playSparkle()
      this.celebration.play(this.floorBelow(this.finaleSpot), new vec3(170, 150, 140), this.endingSeconds)
      this.lastMessage = this.finaleText + " " + this.state.total + " of " + this.state.total + "\n" +
        doneInText(this.finishTime - this.pickTime)
      this.bubbleFollows = true
      this.bubble.show(this.lastMessage, ch.headTopWorld())
      this.speak(this.lastMessage, 0.6)
      print("TidyTroop: ending: " + this.lastMessage.replace("\n", " / "))
      this.after(this.endingSeconds, () => {
        ch.hide(0.6)
        this.bubble.hide()
        this.state.phase = "done"
        print("TidyTroop: ending finished")
      })
    })
  }

  /** The point on the room floor (FloorCenter's height) straight below `p`. */
  private floorBelow(p: vec3): vec3 {
    return new vec3(p.x, this.floorCenter.getTransform().getWorldPosition().y, p.z)
  }

  // ------------------------------------------------------------ out-of-view hint
  /** True when the point is inside the view cone of the camera. */
  isInView(c: Transform, p: vec3): boolean {
    return this.inCone(c, p, this.viewConeDeg)
  }

  /** True when the point is inside a cone of `halfAnglesDeg` (horizontal, vertical) around the view. */
  private inCone(c: Transform, p: vec3, halfAnglesDeg: vec2): boolean {
    const d = p.sub(c.getWorldPosition())
    const fwd = d.dot(c.back)
    if (fwd <= 0) return false
    const limH = Math.tan(halfAnglesDeg.x * MathUtils.DegToRad)
    const limV = Math.tan(halfAnglesDeg.y * MathUtils.DegToRad)
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

  // ------------------------------------------------------------ voice and size
  /**
   * Says each line of `message` that has a voice clip for the chosen buddy, starting after
   * `delaySeconds`, and replaces anything still being said. Returns the seconds until it is done
   * (0 when no line has a clip).
   */
  private speak(message: string, delaySeconds: number): number {
    this.stopSpeaking()
    const table = VOICE_LINES[this.state.chosen]
    if (!table) return 0
    const lines = message.split("\n").filter((l) => !!table[l])
    if (lines.length === 0) return 0
    const tracks = lines.map((l) => table[l].track)
    const seconds = lines.reduce((sum, l) => sum + table[l].seconds, 0)
    const token = this.voiceToken
    this.after(delaySeconds, () => {
      if (token !== this.voiceToken) return
      this.audio.say(tracks)
      print("TidyTroop: voice: " + lines.join(" / ") + " (" + seconds.toFixed(1) + " s)")
    })
    return delaySeconds + seconds
  }

  private stopSpeaking() {
    this.voiceToken++
    this.audio.stopVoice()
  }

  /** Buddy scale at `p`: normal up close, bigger far away so it never looks smaller than at buddyFullSizeWithinCm. */
  private farScale(p: vec3): number {
    const d = p.distance(this.camPos())
    return Math.min(this.buddyMaxFarScale, Math.max(1, d / this.buddyFullSizeWithinCm))
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
