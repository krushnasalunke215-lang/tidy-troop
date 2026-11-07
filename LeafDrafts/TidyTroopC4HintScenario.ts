// DRAFT — Done criterion 4: turning away from all remaining items shows an arrow toward the
// nearest one and plays a chime.
// OPEN QUESTION: DefaultLeafInteractor cannot turn the user's head. This draft turns the camera
// by rotating "Camera Object" each frame for 1.5 s; in the preview, Device Tracking may overwrite
// that rotation. If it does, run this criterion by hand (right-drag to look right, toward the
// cupboard wall) or use MCP MovePreviewCamera, then check the asserts below.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, nextFrame} from "Leaf.lspkg/Utils/common/Utils"
import {main, pickIfNeeded} from "./TidyTroopLeafHelpers"

@component
export class TidyTroopC4HintScenario extends Scenario {
  async run(): Promise<void> {
    await pickIfNeeded()
    const chimesBefore = main().hintChimes
    const cam = findSceneObjectByName("Camera Object").getTransform()
    const lookRight = quat.angleAxis(-Math.PI / 2, vec3.up()) // face +X: no items there
    const until = getTime() + 1.5
    while (getTime() < until) {
      cam.setWorldRotation(lookRight)
      await nextFrame()
    }
    expect(main().hintShowing).toBe(true)
    expect(findSceneObjectByName("HintArrow").enabled).toBe(true)
    expect(main().hintChimes).toBe(chimesBefore + 1)
  }
}
