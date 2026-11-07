/**
 * TidyTroopDebugDriver — preview test helper (stand-in for LEAF, which does not compile on
 * Lens Studio 5.24.1). OFF by default: its SceneObject "DebugDriver" ships disabled.
 * Keys (Lens Studio preview keyboard):
 *   P = print the screen position (0..1, top-left origin) of both picker cards, every item and slot
 *   N = put the lowest-numbered remaining item into a free matching place, through the same
 *       placement code a real drop uses (test shortcut, used to reach the ending quickly)
 *   R = print a one-line state report (phase, count, tags, picker, character, bubble, arrow)
 * Must not: run during normal use (keep the DebugDriver object disabled).
 */
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {TidyTroopMain} from "./TidyTroopMain"

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
    })
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
