/**
 * TidyTroopTypeScaleUI — shared UI helpers for the Tidy Troop UI modules only.
 * Owns: the Specs type scale (role -> size + weight), text/image/flex helpers.
 * Must not: be imported by non-UI scripts.
 */
import {FlexLayout} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {IMAGE_MATERIAL} from "./TidyTroopAssets"

const FONT_SIZE_SCALE = 1.0

export type TextRole =
  | "Title1" | "Title2" | "HeadlineXL" | "Headline1" | "Headline2"
  | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"

const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Title1: {size: 105, weight: 700},
  Title2: {size: 93, weight: 700},
  HeadlineXL: {size: 62, weight: 700},
  Headline1: {size: 54, weight: 700},
  Headline2: {size: 48, weight: 700},
  Subheadline: {size: 41, weight: 700},
  Button: {size: 39, weight: 500},
  Callout: {size: 39, weight: 700},
  Body: {size: 39, weight: 500},
  Caption: {size: 38, weight: 500},
}

export function roleSize(role: TextRole, distanceCm: number = 110): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}

export function applyTextRole(t: Text, role: TextRole, distanceCm: number = 110): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

export const LAYOUT_Z_LIFT = 0.1

export function obj(parent: SceneObject, name: string, position?: vec3): SceneObject {
  const so = global.scene.createSceneObject(name)
  so.setParent(parent)
  if (position) so.getTransform().setLocalPosition(position)
  return so
}

export function liftInZ(so: SceneObject, z: number): void {
  const tr = so.getTransform()
  const p = tr.getLocalPosition()
  tr.setLocalPosition(new vec3(p.x, p.y, p.z + z))
}

/** A flex container child; properties applied inside onInitialized. */
export function makeFlex(parent: SceneObject, direction: FlexDirection, width: number, height: number,
    opts?: {gap?: number, pad?: number, justify?: FlexJustify, align?: FlexAlign}): {so: SceneObject, flex: FlexLayout} {
  const so = obj(parent, direction === FlexDirection.Row ? "FlexRow" : "FlexColumn")
  liftInZ(so, LAYOUT_Z_LIFT)
  const flex = so.createComponent(FlexLayout.getTypeName()) as FlexLayout
  // Items are registered explicitly with addItems(); auto-discovery would throw on pre-start adds.
  flex.autoDiscoverItemsOnStart = false
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  if (width > 0) item.overrideWidth = width
  if (height > 0) item.overrideHeight = height
  flex.onInitialized.add(() => {
    flex.width = width
    flex.height = height
    flex.direction = direction
    if (direction === FlexDirection.Row) flex.columnGap = opts?.gap ?? 0
    else flex.rowGap = opts?.gap ?? 0
    const pad = opts?.pad ?? 0
    flex.paddingTop = pad
    flex.paddingBottom = pad
    flex.paddingLeft = pad
    flex.paddingRight = pad
    flex.justifyContent = opts?.justify ?? FlexJustify.Center
    flex.alignItems = opts?.align ?? FlexAlign.Center
  })
  const parentFlex = parent.getComponent(FlexLayout.getTypeName()) as FlexLayout | null
  if (parentFlex) parentFlex.addItems([item])
  return {so, flex}
}

/** Register a fixed-size flex child and let `builder` fill it. */
export function flexChild(parent: SceneObject, name: string, w: number, h: number,
    builder: (child: SceneObject) => void): SceneObject {
  const child = obj(parent, name)
  liftInZ(child, LAYOUT_Z_LIFT)
  const item = child.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = w
  item.overrideHeight = h
  item.flexGrow = 0
  item.flexShrink = 0
  builder(child)
  const parentFlex = parent.getComponent(FlexLayout.getTypeName()) as FlexLayout | null
  if (parentFlex) parentFlex.addItems([item])
  return child
}

/** Centered text filling a w x h cm rect. */
export function addText(parent: SceneObject, name: string, text: string, role: TextRole, distanceCm: number,
    w: number, h: number, color: vec4): Text {
  const so = obj(parent, name)
  const t = so.createComponent("Component.Text") as Text
  t.text = text
  t.depthTest = true
  applyTextRole(t, role, distanceCm)
  t.horizontalAlignment = HorizontalAlignment.Center
  t.verticalAlignment = VerticalAlignment.Center
  t.horizontalOverflow = HorizontalOverflow.Wrap
  t.verticalOverflow = VerticalOverflow.Overflow
  t.layoutRect = Rect.create(-w / 2, w / 2, -h / 2, h / 2)
  t.textFill.color = color
  return t
}

/** Icon image of `sizeCm` with its own cloned ImageMaterial, tinted. */
export function addImage(parent: SceneObject, name: string, texture: Texture, sizeCm: number, tint: vec4): Image {
  const so = obj(parent, name)
  const img = so.createComponent("Component.Image") as Image
  const mat = IMAGE_MATERIAL.clone()
  mat.mainPass.baseTex = texture
  mat.mainPass.baseColor = tint
  mat.mainPass.depthTest = true
  mat.mainPass.depthWrite = false
  img.clearMaterials()
  img.addMaterial(mat)
  so.getTransform().setLocalScale(new vec3(sizeCm, sizeCm, 1))
  return img
}

/** Rotation that turns an object's +Z toward `camPos` (billboard). */
export function faceCamera(objPos: vec3, camPos: vec3): quat {
  const d = camPos.sub(objPos)
  if (d.length < 0.001) return quat.quatIdentity()
  return quat.lookAt(d.normalize(), vec3.up())
}
