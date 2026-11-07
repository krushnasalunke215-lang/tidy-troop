// DRAFT — Done criterion 1: pinching a character card picks it, the picker disappears,
// and numbers 1 to 10 appear on the 10 items.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {interactor, main} from "./TidyTroopLeafHelpers"

@component
export class TidyTroopC1PickScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(2500) // the picker appears on the first tracked frame
    expect(main().phase).toBe("picking")
    expect(findSceneObjectByName("CharacterPicker").enabled).toBe(true)

    await interactor.trigger(findInteractableByName("Card_SergeantSweep"))
    await sleep(600)

    expect(main().phase).toBe("tidying")
    expect(findSceneObjectByName("CharacterPicker").enabled).toBe(false)
    for (let n = 1; n <= 10; n++) {
      expect(findSceneObjectByName("Tag_" + n).enabled).toBe(true)
    }
  }
}
