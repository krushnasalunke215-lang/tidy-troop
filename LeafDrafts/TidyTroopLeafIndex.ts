// DRAFT — LEAF index for Tidy Troop. Attach to a root SceneObject named "LeafIndex".
// Run order matters (scenarios share one Lens session): c1 -> c2c3 -> c4 -> c5.
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {TidyTroopC1PickScenario} from "./TidyTroopC1PickScenario"
import {TidyTroopC2C3ShirtScenario} from "./TidyTroopC2C3ShirtScenario"
import {TidyTroopC4HintScenario} from "./TidyTroopC4HintScenario"
import {TidyTroopC5EndingScenario} from "./TidyTroopC5EndingScenario"

@component
export class TidyTroopLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "tidytroop-c1-pick", typename: TidyTroopC1PickScenario.getTypeName()},
    {id: "tidytroop-c2c3-shirt-salute", typename: TidyTroopC2C3ShirtScenario.getTypeName()},
    {id: "tidytroop-c4-out-of-view-hint", typename: TidyTroopC4HintScenario.getTypeName()},
    {id: "tidytroop-c5-ending", typename: TidyTroopC5EndingScenario.getTypeName()},
  ]
}
