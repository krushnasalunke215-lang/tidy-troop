/**
 * TidyTroopProp — code-authored stand-in geometry for the virtual room (MeshBuilder backend,
 * chosen because AI mesh generation needs a Lens Studio sign-in that is not available).
 * Owns: building ONE prop mesh (bed, cupboard, desk, chair, bookshelf, plate rack, hanger,
 *       shirt, pants, book, plate) on its own SceneObject at real-world cm sizes.
 * Inputs: kind, main/accent colors. Place/rotate the SceneObject in the scene; the mesh is
 *       built around its origin (floor/base contact at y = 0 for furniture, centre for items).
 * Must not: hold gameplay state (items/slots own that).
 * Front of every prop faces local +Z.
 * Model swap: put a GLB (or any mesh) inside this object's child "ModelSlot" and the code-built
 *       mesh is skipped automatically. Gameplay (colliders, slots, snapping) does not change.
 */
import {MeshKit, RGBA, fromVec3, rgb, axisDeg, shadeRGBA, mixRGBA, mirrorX} from "./TidyTroopMeshKit"
import {VERTEX_COLOR_MATERIAL} from "./TidyTroopAssets"

/** Name of the optional child that holds a replacement model (e.g. an AI-generated GLB). */
export const MODEL_SLOT_NAME = "ModelSlot"

/** True when `so` has a child named ModelSlot that contains at least one object. */
export function hasReplacementModel(so: SceneObject): boolean {
  for (let i = 0; i < so.getChildrenCount(); i++) {
    const c = so.getChild(i)
    if (c.name === MODEL_SLOT_NAME && c.getChildrenCount() > 0) return true
  }
  return false
}

const WHITE = rgb(0.97, 0.97, 0.95)
const CREAM = rgb(0.98, 0.94, 0.84)
const METAL = rgb(0.86, 0.88, 0.92)

@component
export class TidyTroopProp extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopProp – code-built room furniture / item mesh</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">To use your own model, drop it into the child "ModelSlot": this code mesh then turns off by itself.</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Which prop to build at this SceneObject's origin")
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Bed", "Bed"), new ComboBoxItem("Cupboard", "Cupboard"),
    new ComboBoxItem("Desk", "Desk"), new ComboBoxItem("Chair", "Chair"),
    new ComboBoxItem("Bookshelf", "Bookshelf"), new ComboBoxItem("Plate Rack", "PlateRack"),
    new ComboBoxItem("Hanger", "Hanger"), new ComboBoxItem("Shirt", "Shirt"),
    new ComboBoxItem("Pants", "Pants"), new ComboBoxItem("Book", "Book"),
    new ComboBoxItem("Plate", "Plate"),
  ]))
  kind: string = "Bed"

  @input('vec3', '{0.88,0.74,0.55}')
  @hint("Main color (wood, fabric or cover). Keep it light: the Specs display is additive")
  @widget(new ColorWidget())
  mainColor: vec3 = new vec3(0.88, 0.74, 0.55)

  @input('vec3', '{0.6,0.78,0.98}')
  @hint("Accent color (blanket, doors, trim, pages)")
  @widget(new ColorWidget())
  accentColor: vec3 = new vec3(0.6, 0.78, 0.98)
  @ui.group_end

  onAwake() {
    if (hasReplacementModel(this.sceneObject)) {
      print("TidyTroopProp: " + this.sceneObject.name + " uses the model in its ModelSlot")
      return
    }
    const k = new MeshKit()
    const m = fromVec3(this.mainColor)
    const a = fromVec3(this.accentColor)
    switch (this.kind) {
      case "Bed": this.bed(k, m, a); break
      case "Cupboard": this.cupboard(k, m, a); break
      case "Desk": this.desk(k, m); break
      case "Chair": this.chair(k, m); break
      case "Bookshelf": this.bookshelf(k, m); break
      case "PlateRack": this.plateRack(k, m); break
      case "Hanger": this.hanger(k, m); break
      case "Shirt": this.shirt(k, m, a); break
      case "Pants": this.pants(k, m, a); break
      case "Book": this.book(k, m); break
      case "Plate": this.plate(k, a); break
      default: print("TidyTroopProp: unknown kind " + this.kind)
    }
    k.build(this.sceneObject, VERTEX_COLOR_MATERIAL)
  }

  // Bed 190 x 45 x 90 cm, mattress/blanket top at 45 cm. Pillow at the -X end.
  private bed(k: MeshKit, wood: RGBA, blanket: RGBA) {
    for (const x of [-91, 91]) for (const z of [-41, 41]) k.box(x, 4, z, 6, 8, 6, wood)
    k.box(0, 18, 0, 190, 20, 90, wood)
    k.box(0, 35.5, 0, 186, 15, 86, WHITE)
    k.box(15.5, 44, 0, 155, 2, 88, blanket)
    k.box(-79, 46, 0, 26, 7, 58, CREAM)
  }

  // Cupboard 90 W x 180 H x 55 D, both doors open, hanging rail at 162 cm.
  private cupboard(k: MeshKit, wood: RGBA, door: RGBA) {
    const inside = rgb(0.95, 0.9, 0.8)
    k.box(0, 90, -26.5, 90, 180, 2, inside)
    k.box(-44, 90, 0, 2, 180, 55, wood)
    k.box(44, 90, 0, 2, 180, 55, wood)
    k.box(0, 179, 0, 90, 2, 55, wood)
    k.box(0, 4, 0, 90, 8, 55, wood)
    // rail along X
    k.push(new vec3(0, 162, 0), axisDeg(90, vec3.forward()))
    k.cylinderY(0, -42, 0, 0.8, 84, METAL, 12)
    k.pop()
    // doors hinged at the front edges, swung wide open (150 degrees) so they fold back to the sides
    k.push(new vec3(45, 90, 27.5), axisDeg(150, vec3.up()))
    k.box(-22, 0, 1, 44, 176, 2, door)
    k.box(-38, 0, 2.6, 1.5, 12, 1.5, METAL)
    k.pop()
    k.push(new vec3(-45, 90, 27.5), axisDeg(-150, vec3.up()))
    k.box(22, 0, 1, 44, 176, 2, door)
    k.box(38, 0, 2.6, 1.5, 12, 1.5, METAL)
    k.pop()
  }

  // Desk 100 x 75 x 60 cm, top surface at 75 cm.
  private desk(k: MeshKit, wood: RGBA) {
    k.box(0, 73.5, 0, 100, 3, 60, wood)
    for (const x of [-46, 46]) for (const z of [-26, 26]) k.box(x, 36, z, 4, 72, 4, wood)
    k.box(0, 66, -27, 92, 8, 2, wood)
  }

  // Chair, seat at 45 cm, backrest at local -Z.
  private chair(k: MeshKit, wood: RGBA) {
    k.box(0, 43, 0, 42, 4, 42, wood)
    for (const x of [-18, 18]) for (const z of [-18, 18]) k.box(x, 20.5, z, 3.5, 41, 3.5, wood)
    for (const x of [-18, 18]) k.box(x, 66, -19.5, 3.5, 42, 3.5, wood)
    k.box(0, 78, -19.5, 40, 14, 2.5, wood)
  }

  // Desktop bookshelf, 3 slots at x = -11.5, 0, 11.5 (slot floor y = 1.5).
  private bookshelf(k: MeshKit, wood: RGBA) {
    k.box(0, 0.75, 0, 36, 1.5, 20, wood)
    k.box(0, 12, -9.25, 36, 24, 1.5, wood)
    for (const x of [-17.25, -5.75, 5.75, 17.25]) k.box(x, 12.75, 0, 1.5, 24, 20, wood)
  }

  // Plate rack, 3 slots at x = -9, 0, 9; plates stand with faces along +-X.
  private plateRack(k: MeshKit, wood: RGBA) {
    k.box(0, 0.75, 0, 30, 1.5, 16, wood)
    for (const x of [-13.5, -4.5, 4.5, 13.5]) for (const z of [-6, 6]) k.cylinderY(x, 1.5, z, 0.5, 10, wood, 8)
  }

  // Hanger: origin at the rail contact, bar 5 cm below.
  private hanger(k: MeshKit, wood: RGBA) {
    k.cylinderY(0, -2.5, 0, 0.3, 2.5, METAL, 8)
    k.box(0, -5, 0, 38, 1.2, 1.2, wood)
    k.push(new vec3(-9.5, -3.6, 0), axisDeg(12, vec3.forward()))
    k.box(0, 0, 0, 19.5, 1.2, 1.2, wood)
    k.pop()
    k.push(new vec3(9.5, -3.6, 0), axisDeg(-12, vec3.forward()))
    k.box(0, 0, 0, 19.5, 1.2, 1.2, wood)
    k.pop()
  }

  // T-shirt standing upright, front facing +Z, centred: ~49 W x 37 H x 2.8 cm.
  // Soft-edged body and sleeves with baked light (the vertex-colour material is unlit), a collar in
  // the accent colour, ribbed cuffs and hem, a chest stripe, a pocket and fold creases.
  // Outlines are convex and counter-clockwise from +Z; mirrorX makes the left side.
  // Details sit from z = 0.3 up to just above the front face, so they read as part of the fabric.
  private shirt(k: MeshKit, fabric: RGBA, accent: RGBA) {
    k.setShading(new vec3(-0.35, 0.55, 0.76))
    const rib = shadeRGBA(fabric, 0.86)
    const crease = shadeRGBA(fabric, 0.9)
    // Sleeves first, so the body overlaps them at the shoulder.
    const sleeve = [[14, 2.5], [24.5, 5], [21, 11], [10.4, 15.6]]
    k.bevelPrismXY(sleeve, -1.2, 1.2, 1.0, fabric)
    k.bevelPrismXY(mirrorX(sleeve), -1.2, 1.2, 1.0, fabric)
    for (const sx of [1, -1]) k.stripXY(sx * 23.4, 5.1, sx * 20.5, 10.1, 1.4, 0.3, 1.55, rib)
    // Body: slightly A-shaped, shoulders sloping to the neck.
    const body = [[-13.5, -19.5], [13.5, -19.5], [14.5, 11], [11, 15], [4.2, 16.4], [-4.2, 16.4], [-11, 15], [-14.5, 11]]
    k.bevelPrismXY(body, -1.4, 1.4, 1.3, fabric)
    // Neck opening (shadow) and the crew-neck collar.
    k.prismXY([[-4.2, 16.4], [-3.2, 13.8], [0, 13], [3.2, 13.8], [4.2, 16.4]], 0.3, 1.55, shadeRGBA(fabric, 0.62))
    k.polyStripXY([[-4.6, 16.6], [-3.4, 13.6], [0, 12.7], [3.4, 13.6], [4.6, 16.6]], 1.3, 0.3, 1.8, accent)
    // Hem band, chest stripe and a chest pocket with a hemmed top.
    k.stripXY(-13.2, -18.6, 13.2, -18.6, 1.6, 0.3, 1.7, rib)
    k.prismXY([[-13.6, 1.2], [13.6, 1.2], [13.75, 4.4], [-13.75, 4.4]], 0.3, 1.62, accent)
    k.prismXY([[4.6, 5.6], [9.6, 5.6], [9.6, 10.4], [4.6, 10.4]], 0.3, 1.66, shadeRGBA(fabric, 0.93))
    k.stripXY(4.6, 10.1, 9.6, 10.1, 0.6, 0.3, 1.8, rib)
    // Fold creases so it reads as soft cloth.
    k.polyStripXY([[-9, -15], [-6, -8], [-7.5, -2]], 0.45, 0.3, 1.55, crease)
    k.polyStripXY([[7, -16], [9.5, -10], [8, -5]], 0.45, 0.3, 1.55, crease)
  }

  // Jeans standing upright, front facing +Z, centred: ~32 W x 87 H x 2.8 cm.
  // Waistband with belt loops and a button, fly seam, front pocket scoops, legs that taper with a
  // gap between them, contrast stitching (accent colour), knee fades, whiskers and turned-up cuffs.
  private pants(k: MeshKit, denim: RGBA, accent: RGBA) {
    k.setShading(new vec3(-0.35, 0.55, 0.76))
    const band = shadeRGBA(denim, 0.86)
    const loop = shadeRGBA(denim, 0.78)
    const stitch = mixRGBA(denim, accent, 0.75)
    const fade = mixRGBA(denim, WHITE, 0.12)
    const whisker = mixRGBA(denim, WHITE, 0.3)
    const cuff = mixRGBA(denim, WHITE, 0.28)
    const side = (sx: number, pts: number[][]) => (sx > 0 ? pts : mirrorX(pts))
    // Hips down to the crotch, then two tapered legs.
    k.bevelPrismXY([[-15.5, 26], [15.5, 26], [16, 43.5], [-16, 43.5]], -1.4, 1.4, 1.2, denim)
    const leg = [[1.5, -43.5], [14.3, -43.5], [15.5, 27], [0.7, 27]]
    k.bevelPrismXY(leg, -1.4, 1.4, 1.2, denim)
    k.bevelPrismXY(mirrorX(leg), -1.4, 1.4, 1.2, denim)
    // Waistband, belt loops and the button.
    k.prismXY([[-16.2, 39.8], [16.2, 39.8], [16.2, 43.6], [-16.2, 43.6]], 0.3, 1.8, band)
    for (const x of [-12, -5, 5, 12]) k.prismXY([[x - 0.6, 39.3], [x + 0.6, 39.3], [x + 0.6, 43.9], [x - 0.6, 43.9]], 0.3, 2.2, loop)
    k.discXY(0, 41.7, 1.1, 0.3, 2.3, accent)
    // Fly seam.
    k.polyStripXY([[1.8, 39.6], [1.8, 31.5], [0.4, 28.8]], 0.45, 0.3, 1.6, stitch)
    for (const sx of [1, -1]) {
      // Front pocket scoop.
      k.polyStripXY([[sx * 6.2, 39.6], [sx * 8.8, 35.8], [sx * 12.4, 33.4], [sx * 15.3, 33]], 0.55, 0.3, 1.62, stitch)
      // Outer-leg stitching on the front face.
      k.stripXY(sx * 13.6, 28, sx * 12.6, -38, 0.4, 0.3, 1.55, stitch)
      // Whiskers at the top of the leg and a lighter knee.
      k.stripXY(sx * 3, 22, sx * 8, 20.5, 0.5, 0.3, 1.52, whisker)
      k.stripXY(sx * 3, 19.5, sx * 7.5, 18.2, 0.5, 0.3, 1.52, whisker)
      k.prismXY(side(sx, [[3.5, -14], [12.6, -14], [12.9, -2], [3.4, -2]]), 0.3, 1.5, fade)
      // Turned-up cuff.
      k.prismXY(side(sx, [[1.3, -43.6], [14.6, -43.6], [14.4, -39.6], [1.5, -39.6]]), 0.3, 1.9, cuff)
    }
  }

  // Book standing upright, spine toward +Z, centred: 4 thick x 22 tall x 16 deep.
  private book(k: MeshKit, cover: RGBA) {
    k.box(-1.75, 0, 0, 0.5, 22, 16, cover)
    k.box(1.75, 0, 0, 0.5, 22, 16, cover)
    k.box(0, 0, 7.75, 4, 22, 0.5, cover)
    k.box(0, 0, -0.3, 3, 21, 15.2, CREAM)
  }

  // Plate lying flat, centred: 22 cm across, 1.4 cm tall (y -0.7..0.7).
  // A lathe profile: flat well, a thin accent line, a sloped rim, an accent-coloured lip,
  // an underside that steps in to a foot ring. Baked light from above gives the rim its shape.
  private plate(k: MeshKit, rim: RGBA) {
    k.setShading(new vec3(-0.3, 0.85, 0.42), 0.7, 0.32)
    const under = rgb(0.9, 0.9, 0.88)
    const line = mixRGBA(rim, WHITE, 0.25)
    // [r, y] walked outwards along the top, down the outer edge, inwards along the bottom.
    k.latheY(
      [[0, -0.15], [6.6, -0.15], [7.3, -0.1], [9.4, 0.5], [10.6, 0.7], [11, 0.6], [11, 0.35],
        [9.6, 0.05], [6.4, -0.6], [6, -0.7], [5.3, -0.7], [4.9, -0.45], [0, -0.45]],
      [WHITE, line, WHITE, rim, rim, shadeRGBA(rim, 0.9), under, under, under, under, under, under],
      40,
    )
  }
}
