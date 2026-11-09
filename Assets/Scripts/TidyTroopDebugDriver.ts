/**
 * TidyTroopDebugDriver — preview test helper (stand-in for LEAF, which does not compile on
 * Lens Studio 5.24.1). OFF by default: its SceneObject "DebugDriver" ships disabled.
 * Keys (Lens Studio preview keyboard):
 *   P = print the screen position (0..1, top-left origin) of both picker cards, every item and slot
 *   N = put the lowest-numbered remaining item into a free matching place, through the same
 *       placement code a real drop uses (test shortcut, used to reach the ending quickly)
 *   R = print a one-line state report (phase, count, tags, picker, character, bubble, arrow)
 *   H = hit-test a 21 x 21 grid of rays through the view against the preview room (WorldQueryModule)
 *       and print each hit as s/d/h/normal in the Colorful Home bedroom frame (see BEDROOM_* below):
 *       s along "right", d along "forward" (toward the headboard wall), h = cm above the floor.
 *       Used to measure the room's own furniture for the slot positions.
 *   F = print the Lens's average frame rate and slowest frame over the next 3 seconds (pressing it
 *       again restarts the count)
 *   D = drop the lowest-numbered remaining item 150 cm straight ahead, as a real release would
 *       (same snap check), to test the places without a mouse drag
 * Must not: run during normal use (keep the DebugDriver object disabled).
 */
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {TidyTroopMain} from "./TidyTroopMain"

const WorldQuery = require("LensStudio:WorldQueryModule") as WorldQueryModule

/** Colorful Home bedroom frame (TidyTroopReports/tidy-troop-colorful-home-report.md): walls at 45 degrees. */
const BEDROOM_RIGHT = new vec3(-0.7193, 0, 0.6947)
const BEDROOM_FORWARD = new vec3(0.6947, 0, 0.7193)
const BEDROOM_FLOOR_Y = -136
const HIT_GRID = 21

@component
export class TidyTroopDebugDriver extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopDebugDriver – preview test keys (P, N, R)</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input
  @hint("The game to drive")
  main: TidyTroopMain
  @ui.group_end

  onAwake() {
    this.createEvent("KeyPressEvent").bind((e: KeyPressEvent) => {
      if (!this.main) return
      if (e.key === Keys.P) this.printScreen()
      else if (e.key === Keys.N) print("DEBUG N placed=" + this.main.debugPlaceNext() + " count=" + this.main.placedCount)
      else if (e.key === Keys.R) print("DEBUG R " + this.main.debugReport())
      else if (e.key === Keys.H) this.hitGrid()
      else if (e.key === Keys.F) this.measureFps()
      else if (e.key === Keys.D) print("DEBUG D placed=" + this.main.debugDropAhead(150) + " count=" + this.main.placedCount)
    })
    this.createEvent("UpdateEvent").bind(() => {
      if (this.fpsLeft <= 0) return
      this.fpsFrames++
      this.fpsWorst = Math.max(this.fpsWorst, getDeltaTime())
      this.fpsLeft -= getDeltaTime()
      if (this.fpsLeft <= 0) {
        const secs = getTime() - this.fpsStart
        print("DEBUG F " + (this.fpsFrames / secs).toFixed(1) + " fps over " + secs.toFixed(1) + " s, slowest frame " +
          Math.round(this.fpsWorst * 1000) + " ms")
      }
    })
  }

  private fpsLeft = 0
  private fpsFrames = 0
  private fpsStart = 0
  private fpsWorst = 0

  /** Key F: average frame rate of the Lens over the next 3 seconds. */
  private measureFps() {
    this.fpsLeft = 3
    this.fpsFrames = 0
    this.fpsWorst = 0
    this.fpsStart = getTime()
  }

  private session: HitTestSession | null = null

  private hitGrid() {
    if (!this.session) {
      const o = HitTestSessionOptions.create()
      o.filter = false
      this.session = WorldQuery.createHitTestSessionWithOptions(o)
      this.session.start()
    }
    const cam = WorldCameraFinderProvider.getInstance().getComponent()
    const eye = cam.getTransform().getWorldPosition()
    const rows: string[][] = []
    for (let j = 0; j < HIT_GRID; j++) rows.push(new Array(HIT_GRID).fill("?"))
    let pending = HIT_GRID * HIT_GRID
    let printed = false
    const dump = () => {
      if (printed) return
      printed = true
      print("DEBUG H eye s/d/h=" + this.frame(eye) + " grid " + HIT_GRID + "x" + HIT_GRID + " u,v 0.05..0.95, entries s/d/h/normal")
      rows.forEach((r, j) => print("DEBUG H v" + j + " " + r.join(" ")))
    }
    for (let j = 0; j < HIT_GRID; j++) {
      for (let i = 0; i < HIT_GRID; i++) {
        const u = 0.05 + 0.9 * i / (HIT_GRID - 1)
        const v = 0.05 + 0.9 * j / (HIT_GRID - 1)
        const far = cam.screenSpaceToWorldSpace(new vec2(u, v), 1500)
        this.session.hitTest(eye, far, (hit) => {
          rows[j][i] = hit ? this.frame(hit.position) + "/" + this.normalTag(hit.normal) : "-"
          if (--pending === 0) dump()
        })
      }
    }
    const ev = this.createEvent("DelayedCallbackEvent")
    ev.bind(() => dump())
    ev.reset(3)
  }

  /** "s/d/h" in the bedroom frame, whole cm. */
  private frame(p: vec3): string {
    return Math.round(p.dot(BEDROOM_RIGHT)) + "/" + Math.round(p.dot(BEDROOM_FORWARD)) + "/" + Math.round(p.y - BEDROOM_FLOOR_Y)
  }

  /** U up, D down, or which bedroom axis a wall-like normal points along (R+, R-, F+, F-). */
  private normalTag(n: vec3): string {
    if (n.y > 0.8) return "U"
    if (n.y < -0.8) return "D"
    const a = n.dot(BEDROOM_RIGHT)
    const b = n.dot(BEDROOM_FORWARD)
    return Math.abs(a) > Math.abs(b) ? (a > 0 ? "R+" : "R-") : (b > 0 ? "F+" : "F-")
  }

  private printScreen() {
    const cam = WorldCameraFinderProvider.getInstance().getComponent()
    const fmt = (name: string, so: SceneObject) => {
      const s = cam.worldSpaceToScreenSpace(so.getTransform().getWorldPosition())
      return name + "=(" + s.x.toFixed(3) + "," + s.y.toFixed(3) + ")"
    }
    const parts: string[] = []
    const cards = this.main.debugCards()
    cards.forEach((c, i) => parts.push(fmt("card" + i, c)))
    for (const it of this.main.items) parts.push(fmt("item" + it.number + (it.placed ? "*" : ""), it.getSceneObject()))
    for (const s of this.main.slots) parts.push(fmt(s.getSceneObject().name, s.getSceneObject()))
    print("DEBUG P " + parts.join(" "))
  }
}
