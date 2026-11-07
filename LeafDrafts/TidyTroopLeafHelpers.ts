// DRAFT — not compiled. Move into Assets/Tests/ once a LEAF version compiles in this Lens Studio.
// Shared helpers for the Tidy Troop LEAF scenarios (one scenario per done criterion in
// devpost/design-brief.md). Scene names below were verified in the live scene on 2026-11-04.
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TidyTroopMain} from "../Assets/Scripts/TidyTroopMain"
import {TidyTroopItem} from "../Assets/Scripts/TidyTroopItem"

export const interactor = new DefaultLeafInteractor()

export function main(): TidyTroopMain {
  return findSceneObjectByName("TidyTroopMain").getComponent(TidyTroopMain.getTypeName()) as TidyTroopMain
}

export function item(name: string): TidyTroopItem {
  return findSceneObjectByName(name).getComponent(TidyTroopItem.getTypeName()) as TidyTroopItem
}

/** Pinch a character card if the picker is still up (scenarios share one Lens session). */
export async function pickIfNeeded(cardName: string = "Card_SergeantSweep"): Promise<void> {
  if (main().phase !== "picking") return
  await interactor.trigger(findInteractableByName(cardName))
  await sleep(500)
}

/** Grab an item and carry it over a place (world cm), then release. */
export async function dragItemTo(itemName: string, targetWorld: vec3, durationMs: number = 1200): Promise<void> {
  const it = findInteractableByName(itemName)
  const from = it.getSceneObject().getTransform().getWorldPosition()
  await interactor.drag(it, targetWorld.sub(from), durationMs)
  await sleep(300)
}

export function worldPos(name: string): vec3 {
  return findSceneObjectByName(name).getTransform().getWorldPosition()
}
