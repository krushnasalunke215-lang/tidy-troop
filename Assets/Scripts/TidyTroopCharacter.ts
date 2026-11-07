/**
 * TidyTroopCharacter — one original reward character, code-authored with MeshBuilder
 * (articulated: hips + saluting right arm), about 25 cm tall, facing local +Z.
 *   style "SergeantSweep": a small soldier with helmet and a broom at "order arms".
 *   style "CaptainFresh":  a round cartoon-style buddy with a captain's cap.
 * Owns: its own geometry and animations (pop in, salute, march, big salute, fade out).
 * Must not: decide WHEN to celebrate (TidyTroopMain does) or show text (bubble UI does).
 * Model swap: put a GLB inside this object's child "ModelSlot" (about 25 cm tall, feet at the
 *       ModelSlot origin, facing +Z). The code-built body is then skipped; pop-in, facing, march,
 *       grow and hide still work on the model. The arm salute only moves the code-built arm, so a
 *       GLB character salutes only if it has its own animation (it does a small bow instead).
 */
import {MeshKit, RGBA, rgb, axisDeg} from "./TidyTroopMeshKit"
import {VERTEX_COLOR_MATERIAL} from "./TidyTroopAssets"
import {MODEL_SLOT_NAME} from "./TidyTroopProp"

type Tween = {t: number, dur: number, update: (k: number) => void, done?: () => void}

const SKIN = rgb(1.0, 0.84, 0.7)
const GOLD = rgb(1.0, 0.85, 0.35)
const EYE = rgb(0.16, 0.24, 0.5)
const WHITE = rgb(0.98, 0.98, 1.0)
const CHEEK = rgb(1.0, 0.62, 0.62)

@component
export class TidyTroopCharacter extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopCharacter – saluting reward buddy</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Which original character to build")
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Sergeant Sweep (small soldier)", "SergeantSweep"),
    new ComboBoxItem("Captain Fresh (cartoon buddy)", "CaptainFresh"),
  ]))
  style: string = "SergeantSweep"

  @input('vec3', '{0.5,0.66,0.36}')
  @hint("Uniform (Sergeant) or body (Captain) color")
  @widget(new ColorWidget())
  bodyColor: vec3 = new vec3(0.5, 0.66, 0.36)

  @input('vec3', '{0.42,0.56,0.3}')
  @hint("Helmet (Sergeant) or cap band (Captain) color")
  @widget(new ColorWidget())
  hatColor: vec3 = new vec3(0.42, 0.56, 0.3)

  @input
  @hint("Seconds the salute takes to go up / come down")
  @widget(new SliderWidget(0.1, 1.0, 0.05))
  saluteRaiseSeconds: number = 0.3
  @ui.group_end

  private body: SceneObject
  private shoulder: SceneObject
  private elbow: SceneObject
  private hipL: SceneObject
  private hipR: SceneObject
  private saluteShoulder = quat.quatIdentity()
  private saluteElbow = quat.quatIdentity()
  private tweens: Tween[] = []
  private marching = false
  private marchT = 0
  private baseScale = 1
  /** True when a replacement model in ModelSlot is used instead of the code-built body. */
  private usesModel = false

  onAwake() {
    this.buildRig()
    this.sceneObject.enabled = false
    this.createEvent("UpdateEvent").bind(() => this.tick(getDeltaTime()))
  }

  // ---------------------------------------------------------------- public API
  /** Pop up on a spot, turned to face `faceTowards` (yaw only). */
  appearAt(worldPos: vec3, faceTowards: vec3, scale: number = 1): void {
    this.tweens = []
    this.marching = false
    this.baseScale = scale
    const tr = this.sceneObject.getTransform()
    tr.setWorldPosition(worldPos)
    this.faceTowards(faceTowards)
    this.restPose()
    this.sceneObject.enabled = true
    this.setBodyScale(0.01)
    this.tween(0.28, (k) => this.setBodyScale(this.baseScale * this.easeOutBack(k)))
  }

  faceTowards(target: vec3): void {
    const tr = this.sceneObject.getTransform()
    const p = tr.getWorldPosition()
    const d = target.sub(p)
    tr.setWorldRotation(quat.angleAxis(Math.atan2(d.x, d.z), vec3.up()))
  }

  /** Raise the right hand to the brow, hold for `holdSeconds`, then lower it. */
  salute(holdSeconds: number): void {
    if (this.usesModel) {
      this.bow(holdSeconds)
      return
    }
    const up = this.saluteRaiseSeconds
    const s0 = quat.quatIdentity()
    this.tween(up, (k) => {
      const e = this.easeInOut(k)
      this.shoulder.getTransform().setLocalRotation(quat.slerp(s0, this.saluteShoulder, e))
      this.elbow.getTransform().setLocalRotation(quat.slerp(s0, this.saluteElbow, e))
    }, () => {
      this.tween(holdSeconds, () => {}, () => {
        this.tween(up, (k) => {
          const e = this.easeInOut(k)
          this.shoulder.getTransform().setLocalRotation(quat.slerp(this.saluteShoulder, s0, e))
          this.elbow.getTransform().setLocalRotation(quat.slerp(this.saluteElbow, s0, e))
        })
      })
    })
  }

  /** Hold the salute until hide() (used for the big final salute). */
  holdSalute(): void {
    const s0 = quat.quatIdentity()
    this.tween(this.saluteRaiseSeconds, (k) => {
      const e = this.easeInOut(k)
      this.shoulder.getTransform().setLocalRotation(quat.slerp(s0, this.saluteShoulder, e))
      this.elbow.getTransform().setLocalRotation(quat.slerp(s0, this.saluteElbow, e))
    })
  }

  /** March (legs swing, little bob) to a floor point, then call `arrived`. */
  marchTo(worldPos: vec3, seconds: number, faceAtEnd: vec3, arrived?: () => void): void {
    const tr = this.sceneObject.getTransform()
    const from = tr.getWorldPosition()
    this.faceTowards(new vec3(worldPos.x, from.y, worldPos.z))
    this.marching = true
    this.tween(seconds, (k) => {
      const p = vec3.lerp(from, worldPos, k)
      const hop = Math.sin(k * Math.PI) * Math.max(0, from.y - worldPos.y) * 0.25
      tr.setWorldPosition(new vec3(p.x, p.y + hop, p.z))
    }, () => {
      this.marching = false
      this.hipL.getTransform().setLocalRotation(quat.quatIdentity())
      this.hipR.getTransform().setLocalRotation(quat.quatIdentity())
      this.body.getTransform().setLocalPosition(vec3.zero())
      this.faceTowards(faceAtEnd)
      if (arrived) arrived()
    })
  }

  /** Grow to `scale` x size (the "big" final salute). */
  growTo(scale: number, seconds: number): void {
    const from = this.baseScale
    this.baseScale = scale
    this.tween(seconds, (k) => this.setBodyScale(from + (scale - from) * this.easeOutBack(k)))
  }

  /** Shrink away and disable. */
  hide(seconds: number = 0.25): void {
    if (!this.sceneObject.enabled) return
    const from = this.baseScale
    this.tween(seconds, (k) => this.setBodyScale(Math.max(0.01, from * (1 - k))), () => {
      this.sceneObject.enabled = false
      this.restPose()
    })
  }

  /** Static preview pose on the picker card (no animation, no hide timer). */
  showPreview(worldPos: vec3, faceTowards: vec3, scale: number): void {
    this.appearAt(worldPos, faceTowards, scale)
  }

  isShowing(): boolean {
    return this.sceneObject.enabled
  }

  /** World point for the speech bubble centre: clear of the head (head top ~23 cm x scale). */
  headTopWorld(): vec3 {
    const tr = this.sceneObject.getTransform()
    return tr.getWorldPosition().add(new vec3(0, 23 * this.baseScale + 6, 0))
  }

  // ---------------------------------------------------------------- animation
  /** Salute stand-in for a replacement model: tip forward 15 degrees, hold, stand up again. */
  private bow(holdSeconds: number) {
    const up = this.saluteRaiseSeconds
    const bt = this.body.getTransform()
    const tilt = quat.angleAxis(15 * MathUtils.DegToRad, vec3.right())
    const id = quat.quatIdentity()
    this.tween(up, (k) => bt.setLocalRotation(quat.slerp(id, tilt, this.easeInOut(k))), () => {
      this.tween(holdSeconds, () => {}, () => {
        this.tween(up, (k) => bt.setLocalRotation(quat.slerp(tilt, id, this.easeInOut(k))))
      })
    })
  }

  private tick(dt: number) {
    const live = this.tweens
    this.tweens = []
    for (const tw of live) {
      tw.t += dt
      const k = Math.min(1, tw.t / Math.max(tw.dur, 0.0001))
      tw.update(k)
      if (k >= 1) {
        if (tw.done) tw.done()
      } else {
        this.tweens.push(tw)
      }
    }
    if (this.marching) {
      this.marchT += dt * 9
      const sw = Math.sin(this.marchT) * 0.45
      this.hipL.getTransform().setLocalRotation(quat.angleAxis(sw, vec3.right()))
      this.hipR.getTransform().setLocalRotation(quat.angleAxis(-sw, vec3.right()))
      this.body.getTransform().setLocalPosition(new vec3(0, Math.abs(Math.cos(this.marchT)) * 0.8, 0))
    }
  }

  private tween(dur: number, update: (k: number) => void, done?: () => void) {
    this.tweens.push({t: 0, dur, update, done})
  }

  private setBodyScale(s: number) {
    this.body.getTransform().setLocalScale(new vec3(s, s, s))
  }

  private restPose() {
    this.shoulder.getTransform().setLocalRotation(quat.quatIdentity())
    this.elbow.getTransform().setLocalRotation(quat.quatIdentity())
  }

  private easeOutBack(k: number): number {
    const c1 = 1.70158, c3 = c1 + 1
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2)
  }

  private easeInOut(k: number): number {
    return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
  }

  // ---------------------------------------------------------------- geometry
  private child(parent: SceneObject, name: string, pos: vec3): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    so.getTransform().setLocalPosition(pos)
    return so
  }

  /** The authored ModelSlot child, if it holds a replacement model. */
  private findModelSlot(): SceneObject | null {
    for (let i = 0; i < this.sceneObject.getChildrenCount(); i++) {
      const c = this.sceneObject.getChild(i)
      if (c.name === MODEL_SLOT_NAME && c.getChildrenCount() > 0) return c
    }
    return null
  }

  private buildRig() {
    this.body = this.child(this.sceneObject, "Body", vec3.zero())
    const slot = this.findModelSlot()
    if (slot) {
      // Replacement model: it rides on Body so every body animation still applies.
      this.usesModel = true
      slot.setParent(this.body)
      this.shoulder = this.child(this.body, "ShoulderR", vec3.zero())
      this.elbow = this.child(this.shoulder, "ElbowR", vec3.zero())
      this.hipL = this.child(this.body, "HipL", vec3.zero())
      this.hipR = this.child(this.body, "HipR", vec3.zero())
      print("TidyTroopCharacter: " + this.sceneObject.name + " uses the model in its ModelSlot")
      return
    }
    const isSergeant = this.style !== "CaptainFresh"
    const c = this.bodyColor
    const main: RGBA = [c.x, c.y, c.z, 1]
    const h = this.hatColor
    const hat: RGBA = [h.x, h.y, h.z, 1]

    // Arm geometry: 2 links of 4 cm, solved so the hand reaches the brow (2-link IK).
    const shoulderPos = isSergeant ? new vec3(-4.4, 14, 0) : new vec3(-5.6, 13.5, 0)
    const handTarget = isSergeant ? new vec3(-3.4, 20.6, 2.2) : new vec3(-2.9, 19.4, 3.2)
    this.solveSalute(shoulderPos, handTarget, 4, 4)

    const torso = new MeshKit()
    const legL = new MeshKit(), legR = new MeshKit()
    const upper = new MeshKit(), fore = new MeshKit()
    let hipY: number
    if (isSergeant) {
      hipY = 7.2
      for (const leg of [legL, legR]) {
        leg.box(0, -2.5, 0, 2.2, 5, 2.4, main)
        leg.box(0, -6.1, 0.4, 2.4, 2.2, 3.4, rgb(0.62, 0.42, 0.28))
      }
      torso.box(0, 10.75, 0, 7, 7.5, 4.4, main)
      torso.box(0, 9.2, 0, 7.2, 1, 4.6, rgb(0.86, 0.72, 0.46))
      for (const y of [11.4, 12.9]) torso.box(0, y, 2.25, 0.7, 0.7, 0.3, GOLD)
      torso.cylinderY(0, 14.4, 0, 1.2, 1.2, SKIN, 10)
      torso.sphere(0, 18.6, 0, 3.3, SKIN, 14, 10)
      for (const x of [-1.2, 1.2]) {
        torso.sphere(x, 19.0, 2.95, 0.48, EYE, 8, 6)
        torso.sphere(x + 0.15, 19.2, 3.35, 0.14, WHITE, 6, 4)
      }
      for (const x of [-2.2, 2.2]) torso.ellipsoid(x, 17.8, 2.4, 0.7, 0.45, 0.4, CHEEK, 8, 6)
      torso.box(0, 17.2, 3.15, 1.5, 0.35, 0.3, rgb(0.82, 0.38, 0.38))
      torso.ellipsoid(0, 20.4, 0, 3.75, 2.6, 3.75, hat, 14, 8)
      torso.cylinderY(0, 19.7, 0, 4.2, 0.5, hat, 18)
      torso.octahedron(0, 21.2, 3.55, 0.75, GOLD)
      // left arm resting on the broom
      torso.box(4.4, 11.2, 0.4, 1.8, 5.8, 1.8, main)
      torso.sphere(4.5, 7.9, 0.8, 1.0, SKIN)
      torso.cylinderY(5.6, 2.6, 1.2, 0.35, 19.5, rgb(0.92, 0.78, 0.55), 8)
      torso.frustumY(5.6, 0, 1.2, 1.6, 0.8, 3, rgb(0.98, 0.86, 0.42), 12)
      upper.box(0, -2, 0, 1.8, 4, 1.8, main)
      fore.box(0, -1.8, 0, 1.7, 3.6, 1.7, main)
      fore.sphere(0, -4, 0, 1.0, SKIN)
    } else {
      hipY = 3.6
      for (const leg of [legL, legR]) {
        leg.cylinderY(0, -2.6, 0, 0.9, 2.8, main, 10)
        leg.ellipsoid(0, -2.9, 0.7, 1.4, 0.8, 1.9, rgb(1.0, 0.6, 0.5), 10, 6)
      }
      torso.ellipsoid(0, 11.5, 0, 6, 9, 5.5, main, 18, 12)
      torso.ellipsoid(0, 8.5, 4.1, 3.6, 4.2, 1.6, rgb(0.86, 0.98, 0.96), 12, 8)
      for (const x of [-2, 2]) {
        torso.sphere(x, 14.6, 4.3, 1.5, WHITE, 12, 8)
        torso.sphere(x, 14.7, 5.6, 0.75, rgb(0.2, 0.42, 0.85), 10, 6)
        torso.sphere(x + 0.3, 15.1, 6.25, 0.25, WHITE, 6, 4)
      }
      for (const x of [-3.7, 3.7]) torso.ellipsoid(x, 12.6, 4.0, 0.9, 0.55, 0.4, CHEEK, 8, 6)
      for (let i = 0; i <= 4; i++) {
        const u = (i - 2) / 2
        torso.sphere(u * 1.6, 11.6 - (1 - u * u) * 0.9, 5.25 - Math.abs(u) * 0.3, 0.38, rgb(0.86, 0.32, 0.4), 6, 4)
      }
      torso.cylinderY(0, 18.6, 0, 3.3, 2.8, WHITE, 18)
      torso.cylinderY(0, 18.6, 0, 3.38, 0.8, hat, 18)
      torso.ellipsoid(0, 21.4, 0, 3.9, 1.0, 3.9, WHITE, 16, 8)
      torso.box(0, 18.8, 3.5, 4.8, 0.45, 2.4, hat)
      torso.octahedron(0, 20.1, 3.45, 0.7, GOLD)
      torso.ellipsoid(6.3, 10.6, 0.5, 1.3, 3.2, 1.3, main, 10, 8)
      torso.sphere(6.6, 7.4, 0.8, 1.3, WHITE)
      upper.ellipsoid(0, -2, 0, 1.25, 2.4, 1.25, main, 10, 8)
      fore.ellipsoid(0, -1.8, 0, 1.15, 2.2, 1.15, main, 10, 8)
      fore.sphere(0, -3.9, 0, 1.3, WHITE)
    }

    const torsoObj = this.child(this.body, "Torso", vec3.zero())
    torso.build(torsoObj, VERTEX_COLOR_MATERIAL)
    this.hipL = this.child(this.body, "HipL", new vec3(isSergeant ? 1.6 : 2.2, hipY, 0))
    legL.build(this.hipL, VERTEX_COLOR_MATERIAL)
    this.hipR = this.child(this.body, "HipR", new vec3(isSergeant ? -1.6 : -2.2, hipY, 0))
    legR.build(this.hipR, VERTEX_COLOR_MATERIAL)
    this.shoulder = this.child(this.body, "ShoulderR", shoulderPos)
    upper.build(this.shoulder, VERTEX_COLOR_MATERIAL)
    this.elbow = this.child(this.shoulder, "ElbowR", new vec3(0, -4, 0))
    fore.build(this.elbow, VERTEX_COLOR_MATERIAL)
  }

  /** 2-link planar IK in the XY plane (+ a small forward tilt so the hand sits at the brow). */
  private solveSalute(shoulder: vec3, target: vec3, l1: number, l2: number) {
    const dx = target.x - shoulder.x
    const dy = target.y - shoulder.y
    const d = Math.min(Math.max(Math.sqrt(dx * dx + dy * dy), 0.5), l1 + l2 - 0.05)
    // angle theta such that the arm direction (sin t, -cos t) points at the target
    const tgt = Math.atan2(dx, -dy)
    const alpha = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))
    const gamma = Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2))
    const shoulderZ = tgt + alpha
    const elbowZ = -(Math.PI - gamma)
    const fwdTilt = Math.atan2(target.z - shoulder.z, d) * -1
    this.saluteShoulder = quat.angleAxis(shoulderZ, vec3.forward()).multiply(quat.angleAxis(fwdTilt, vec3.right()))
    this.saluteElbow = quat.angleAxis(elbowZ, vec3.forward())
  }
}
