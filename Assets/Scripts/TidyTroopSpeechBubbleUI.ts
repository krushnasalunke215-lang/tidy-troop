/**
 * TidyTroopSpeechBubbleUI — the character's speech bubble ("You are disciplined! 3 of 10").
 * Owns: a UIKit BackPlate bubble with one line of text that floats at an anchor point and
 *       faces the user.
 * API: show(text, worldAnchor), moveTo(worldAnchor), hide(), isShowing(), getText()
 * Must not: compose the message or decide timing (TidyTroopMain does).
 */
import {BackPlate} from "UIKit.lspkg/Scripts/BackPlate"
import {FlexLayout} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexAlign, FlexDirection, FlexJustify} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {addText, faceCamera, flexChild, obj} from "./TidyTroopTypeScaleUI"

@component
export class TidyTroopSpeechBubbleUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopSpeechBubbleUI – the praise bubble</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Bubble text width in cm (sized for the longest line)")
  @widget(new SliderWidget(12, 50, 0.5))
  textWidthCm: number = 30

  @input
  @hint("Distance the text size is tuned for, cm (bigger = larger letters)")
  @widget(new SliderWidget(60, 250, 5))
  readingDistanceCm: number = 150

  @input('vec4', '{1,1,1,1}')
  @hint("Text color")
  @widget(new ColorWidget())
  textColor: vec4 = new vec4(1, 1, 1, 1)
  @ui.group_end

  private text: Text
  private camTr: Transform | null = null
  private anchor: vec3 = vec3.zero()

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    const content = obj(this.sceneObject, "Content", new vec3(0, 0, 0.6))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.autoDiscoverItemsOnStart = false
    flex.width = this.textWidthCm + 3
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Center
    flex.justifyContent = FlexJustify.Center
    flex.paddingTop = 1.4
    flex.paddingBottom = 1.4
    flex.paddingLeft = 1.5
    flex.paddingRight = 1.5
    flex.onLayoutComplete.add((r) => {
      plate.size = new vec2(r.containerWidth, r.containerHeight)
    })
    const lineH = 3.4 * this.readingDistanceCm / 110
    flexChild(content, "Line", this.textWidthCm, lineH, (c) => {
      this.text = addText(c, "BubbleText", "You are disciplined! 10 of 10", "Headline2",
        this.readingDistanceCm, this.textWidthCm, lineH, this.textColor)
    })
    this.createEvent("UpdateEvent").bind(() => this.follow())
    this.sceneObject.enabled = false
  }

  show(message: string, worldAnchor: vec3): void {
    if (this.text) this.text.text = message
    this.anchor = worldAnchor
    this.sceneObject.enabled = true
    this.follow()
  }

  moveTo(worldAnchor: vec3): void {
    this.anchor = worldAnchor
  }

  hide(): void {
    this.sceneObject.enabled = false
  }

  isShowing(): boolean {
    return this.sceneObject.enabled
  }

  getText(): string {
    return this.text ? this.text.text : ""
  }

  private follow() {
    if (!this.camTr) {
      const cam = WorldCameraFinderProvider.getInstance()
      if (cam) this.camTr = cam.getComponent().getTransform()
    }
    const camPos = this.camTr ? this.camTr.getWorldPosition() : vec3.zero()
    const tr = this.sceneObject.getTransform()
    tr.setWorldPosition(this.anchor)
    tr.setWorldRotation(faceCamera(this.anchor, camPos))
  }
}
