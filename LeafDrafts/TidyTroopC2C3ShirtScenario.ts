// DRAFT — Done criteria 2 and 3 (one flow, because 3 is "right after" 2):
// 2. Grabbing shirt 1 from the bed and releasing it over a hanger snaps it on and hides its number.
// 3. The chosen character appears on the cleared bed spot, salutes, says
//    "You are disciplined! N of 10", and disappears within about 3 seconds.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {dragItemTo, item, main, pickIfNeeded, worldPos} from "./TidyTroopLeafHelpers"

@component
export class TidyTroopC2C3ShirtScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(2500)
    await pickIfNeeded()
    const before = main().placedCount
    const shirt = item("Item01_Shirt")
    expect(shirt.placed).toBe(false)
    const clearedSpot = shirt.originWorld

    // Carry it over hanger 2 (the slot frame sits on the rail; the shirt hangs ~19 cm below).
    const target = worldPos("HangerSlot2").add(new vec3(0, -10, 0))
    await dragItemTo("Item01_Shirt", target)

    // Criterion 2
    expect(shirt.placed).toBe(true)
    expect(main().placedCount).toBe(before + 1)
    expect(findSceneObjectByName("Tag_1").enabled).toBe(false)

    // Criterion 3
    const ch = main().chosenCharacter
    expect(ch !== null).toBe(true)
    expect(ch!.getSceneObject().enabled).toBe(true)
    const at = ch!.getSceneObject().getTransform().getWorldPosition()
    expect(at.distance(clearedSpot) < 2).toBe(true)
    expect(main().lastMessage).toBe("You are disciplined! " + (before + 1) + " of 10")
    expect(findSceneObjectByName("SpeechBubble").enabled).toBe(true)

    await sleep(3600)
    expect(ch!.getSceneObject().enabled).toBe(false)
    expect(findSceneObjectByName("SpeechBubble").enabled).toBe(false)
  }
}
