/**
 * TidyTroopPickerUI — the start screen: two big character cards side by side.
 * Owns: the panel (UIKit BackPlate + FlexLayout), the two card Buttons, show/hide.
 * API: show(), hide(), isShowing(), getCardTopWorldPosition(i), placeInFront(camPos, camFwd)
 * Emits: onPick (0 = Sergeant Sweep, 1 = Captain Fresh).
 * Must not: hold game state or start the game (TidyTroopMain reacts to onPick).
 */
import {BackPlate} from "UIKit.lspkg/Scripts/BackPlate"
import {Button} from "UIKit.lspkg/Scripts/Components/Button/Button"
import {FlexLayout} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexAlign, FlexDirection, FlexJustify} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import Event from "InteractionKit.lspkg/Utils/Event"
import {ICONS} from "./TidyTroopAssets"
import {addImage, addText, faceCamera, flexChild, makeFlex, obj} from "./TidyTroopTypeScaleUI"

const VIEW_DISTANCE = 80

@component
export class TidyTroopPickerUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopPickerUI – pick your character</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Title above the cards")
  title: string = "Pick your tidy buddy"

  @input
  @hint("Line under the title")
  subtitle: string = "Pinch a card. Your buddy salutes every spot you clear."

  @input
  @hint("Card width in cm (each card is a big pinch target)")
  @widget(new SliderWidget(10, 24, 0.5))
  cardWidthCm: number = 15.5

  @input
  @hint("Card height in cm")
  @widget(new SliderWidget(10, 28, 0.5))
  cardHeightCm: number = 19

  @input
  @hint("Distance from the eyes in cm, and how far below eye level")
  placement: vec2 = new vec2(80, 22)

  @input
  @hint("Size of the card names, taglines and the line under the title, relative to the Specs type scale at 80 cm. 1 is the old size; 1.8 reads at 80 cm")
  @widget(new SliderWidget(1, 2.5, 0.05))
  cardTextScale: number = 1.8

  @input('vec4', '{1,1,1,1}')
  @hint("Text color (keep light: the display is additive)")
  @widget(new ColorWidget())
  textColor: vec4 = new vec4(1, 1, 1, 1)
  @ui.group_end

  onPick: Event<number> = new Event<number>()

  private cards: SceneObject[] = []
  private panelSize: vec2 = new vec2(0, 0)

  /** Text boxes grow with cardTextScale so bigger lines keep their room. */
  private get lineScale(): number {
    return Math.max(1, this.cardTextScale * 0.65)
  }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    const content = obj(this.sceneObject, "Content", new vec3(0, 0, 0.6))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.autoDiscoverItemsOnStart = false
    const gap = 1.5
    const pad = 1.6
    const width = this.cardWidthCm * 2 + gap + pad * 2
    flex.width = width
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Center
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 1.0
    flex.paddingTop = pad
    flex.paddingBottom = pad
    flex.paddingLeft = pad
    flex.paddingRight = pad
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight)
      this.panelSize = plate.size
    })

    const row = makeFlex(content, FlexDirection.Row, width - pad * 2, this.cardHeightCm, {gap})
    this.cards.push(this.addCard(row.so, 0, "Card_SergeantSweep", ICONS.soldier, "Sergeant Sweep", "Small soldier. Strict, proud of you."))
    this.cards.push(this.addCard(row.so, 1, "Card_CaptainFresh", ICONS.buddy, "Captain Fresh", "Cartoon buddy. Same proud salute."))

    const inner = width - pad * 2
    // The title grows a little with the card text so it stays the biggest line.
    const titleScale = 1 + (this.cardTextScale - 1) * 0.4
    const titleH = 3.6 * Math.max(1, titleScale)
    flexChild(content, "Title", inner, titleH, (c) => {
      addText(c, "TitleText", this.title, "Title2", VIEW_DISTANCE * titleScale, inner, titleH, this.textColor)
    })
    const subH = 2.6 * this.lineScale
    flexChild(content, "Subtitle", inner, subH, (c) => {
      // Text size scales with the distance argument, so VIEW_DISTANCE * cardTextScale enlarges it.
      addText(c, "SubtitleText", this.subtitle, "Body", VIEW_DISTANCE * this.cardTextScale, inner, subH,
        new vec4(this.textColor.x, this.textColor.y, this.textColor.z, 0.8))
    })
  }

  show(): void {
    this.sceneObject.enabled = true
  }

  hide(): void {
    this.sceneObject.enabled = false
  }

  isShowing(): boolean {
    return this.sceneObject.enabled
  }

  /** Put the picker `placement.x` cm ahead and `placement.y` cm below the eyes, facing them. */
  placeInFront(camPos: vec3, camForward: vec3): void {
    const flat = new vec3(camForward.x, 0, camForward.z)
    const fwd = flat.length > 0.01 ? flat.normalize() : new vec3(0, 0, -1)
    const pos = camPos.add(fwd.uniformScale(this.placement.x)).add(new vec3(0, -this.placement.y, 0))
    const tr = this.sceneObject.getTransform()
    tr.setWorldPosition(pos)
    tr.setWorldRotation(faceCamera(pos, new vec3(camPos.x, pos.y, camPos.z)))
  }

  /** The two card SceneObjects (0 = Sergeant Sweep, 1 = Captain Fresh). */
  getCards(): SceneObject[] {
    return this.cards
  }

  /**
   * World points spread over the panel plus `aboveCm` above it (where the character previews stand).
   * TidyTroopMain casts sight lines from the eyes to these points to find room objects that would cover the picker.
   */
  getViewSamplePoints(aboveCm: number = 16, cols: number = 7, rows: number = 7): vec3[] {
    let w = this.panelSize.x, h = this.panelSize.y
    if (w <= 0 || h <= 0) {
      // Layout not finished yet: estimate from the inputs.
      w = this.cardWidthCm * 2 + 1.5 + 3.2
      h = this.cardHeightCm + (3.6 * (1 + (this.cardTextScale - 1) * 0.4) + 2.6 * this.lineScale) + 2 + 3.2
    }
    const margin = 2
    const left = -w / 2 - margin, right = w / 2 + margin
    const bottom = -h / 2 - margin, top = h / 2 + aboveCm
    const tr = this.sceneObject.getTransform()
    const origin = tr.getWorldPosition()
    const pts: vec3[] = []
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = left + (right - left) * (i / (cols - 1))
        const y = bottom + (top - bottom) * (j / (rows - 1))
        pts.push(origin.add(tr.right.uniformScale(x)).add(tr.up.uniformScale(y)))
      }
    }
    return pts
  }

  /** Top-centre of a card in world space (where its character preview stands). */
  getCardTopWorldPosition(index: number): vec3 {
    const card = this.cards[index]
    const tr = card.getTransform()
    return tr.getWorldPosition().add(tr.up.uniformScale(this.cardHeightCm / 2 + 0.3)).add(tr.forward.uniformScale(2))
  }

  private addCard(parent: SceneObject, index: number, name: string, icon: Texture, label: string, tagline: string): SceneObject {
    const w = this.cardWidthCm, h = this.cardHeightCm
    return flexChild(parent, name, w, h, (card) => {
      const btn = card.createComponent(Button.getTypeName()) as Button
      btn.size = new vec3(w, h, 1)
      const face = makeFlex(card, FlexDirection.Column, w - 1, h - 1, {gap: 0.6, pad: 0.6})
      face.so.getTransform().setLocalPosition(new vec3(0, 0, 0.6))
      flexChild(face.so, "Icon", w - 2, 7, (c) => {
        addImage(c, "IconImage", icon, 6.5, new vec4(1, 0.9, 0.55, 1))
      })
      const nameH = 2.8 * this.lineScale
      const tagH = 4.2 * this.lineScale
      const textDist = VIEW_DISTANCE * this.cardTextScale
      flexChild(face.so, "Name", w - 2, nameH, (c) => {
        addText(c, "NameText", label, "Headline1", textDist, w - 2, nameH, this.textColor)
      })
      flexChild(face.so, "Tagline", w - 2, tagH, (c) => {
        addText(c, "TaglineText", tagline, "Body", textDist, w - 2, tagH,
          new vec4(this.textColor.x, this.textColor.y, this.textColor.z, 0.75))
      })
      btn.onTriggerUp.add(() => this.onPick.invoke(index))
    })
  }
}
