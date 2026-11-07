// DRAFT — Done criterion 5: putting the 10th item in its place plays the ending: the final
// salute, the light wave with sparkles, and "Room fresh! 10 of 10".
// Each remaining item is dragged onto a free place of its kind. The plate behind the start
// position (Item10) is dragged too; LEAF moves it without the user turning around.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {dragItemTo, main, pickIfNeeded} from "./TidyTroopLeafHelpers"

@component
export class TidyTroopC5EndingScenario extends Scenario {
  async run(): Promise<void> {
    await pickIfNeeded()
    const m = main()
    for (const it of m.items) {
      if (it.placed) continue
      const slot = m.slots.find((s) => !s.occupied && s.category === it.category)
      expect(slot !== undefined).toBe(true)
      const target = slot!.getSceneObject().getTransform().getWorldPosition().add(it.placedOffsetCm.uniformScale(0.5))
      await dragItemTo(it.getSceneObject().name, target)
      expect(it.placed).toBe(true)
      await sleep(400)
    }
    expect(m.placedCount).toBe(10)

    await sleep(2600) // march to the middle of the floor
    expect(m.phase).toBe("ending")
    const ch = m.chosenCharacter!
    expect(ch.getSceneObject().enabled).toBe(true)
    const floor = findSceneObjectByName("FloorCenter").getTransform().getWorldPosition()
    expect(ch.getSceneObject().getTransform().getWorldPosition().distance(floor) < 3).toBe(true)
    expect(m.lastMessage).toBe("Room fresh! 10 of 10")
    expect(findSceneObjectByName("LightWave").enabled || findSceneObjectByName("Sparkle_0").enabled).toBe(true)
    expect(m.audio.playCount["fanfare"]).toBe(1)

    await sleep(6500)
    expect(m.phase).toBe("done")
  }
}
