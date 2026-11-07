/**
 * TidyTroopCelebration — the ending effect: a soft ring of light sweeps out across the room
 * floor from the character while sparkles twinkle up through the room.
 * Owns: the wave ring + sparkle meshes (code-authored) and their animation.
 * Must not: play sounds or show text (TidyTroopMain coordinates those).
 */
import {MeshKit, rgb, RGBA} from "./TidyTroopMeshKit"
import {VERTEX_COLOR_MATERIAL} from "./TidyTroopAssets"

type Sparkle = {so: SceneObject, pos: vec3, delay: number, phase: number}

/** Highest a sparkle drifts above its start point, cm. */
const SPARKLE_MAX_RISE_CM = 36

@component
export class TidyTroopCelebration extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopCelebration – light wave + sparkles</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("How far the light wave travels, cm")
  @widget(new SliderWidget(100, 600, 10))
  waveRadiusCm: number = 320

  @input
  @hint("Seconds for the wave to cross the room")
  @widget(new SliderWidget(0.5, 5, 0.1))
  waveSeconds: number = 2.2

  @input
  @hint("Number of sparkles")
  @widget(new SliderWidget(0, 120, 1))
  sparkleCount: number = 60

  @input
  @hint("Largest sparkle size, cm")
  @widget(new SliderWidget(1, 10, 0.5))
  sparkleSizeCm: number = 4.5

  @input('vec3', '{1.0,0.95,0.7}')
  @hint("Wave color")
  @widget(new ColorWidget())
  waveColor: vec3 = new vec3(1.0, 0.95, 0.7)
  @ui.group_end

  private wave: SceneObject
  private sparkles: Sparkle[] = []
  private running = false
  private t = 0
  private total = 6
  private center = vec3.zero()
  private withWave = true
  private activeCount = 0
  private maxRise = SPARKLE_MAX_RISE_CM
  private sizeScale = 1

  onAwake() {
    this.wave = global.scene.createSceneObject("LightWave")
    this.wave.setParent(this.sceneObject)
    const k = new MeshKit()
    const c: RGBA = [this.waveColor.x, this.waveColor.y, this.waveColor.z, 1]
    k.ringXZ(0, 0, 0, 0.82, 1.0, c, 64)
    k.ringXZ(0, 0.02, 0, 0.66, 0.74, rgb(0.75, 1.0, 0.9), 64)
    k.build(this.wave, VERTEX_COLOR_MATERIAL)
    this.wave.enabled = false

    const palette: RGBA[] = [rgb(1.0, 0.92, 0.55), rgb(0.7, 1.0, 0.85), rgb(0.7, 0.88, 1.0), rgb(1.0, 0.8, 0.95)]
    for (let i = 0; i < this.sparkleCount; i++) {
      const so = global.scene.createSceneObject("Sparkle_" + i)
      so.setParent(this.sceneObject)
      const sk = new MeshKit()
      sk.octahedron(0, 0, 0, 1, palette[i % palette.length])
      sk.build(so, VERTEX_COLOR_MATERIAL)
      so.enabled = false
      this.sparkles.push({so, pos: vec3.zero(), delay: 0, phase: Math.random() * 6.28})
    }
    this.createEvent("UpdateEvent").bind(() => this.tick(getDeltaTime()))
  }

  /**
   * Start at `floorCenter` (world). Sparkles fill a box of `halfExtentCm`, starting `base` cm above it.
   * opts.wave = false skips the light wave; opts.count uses only that many sparkles (a small burst);
   * opts.base (default 15), opts.maxRise (default 36) and opts.sizeScale (default 1) shape the burst.
   */
  play(floorCenter: vec3, halfExtentCm: vec3, totalSeconds: number,
    opts?: {wave?: boolean, count?: number, base?: number, maxRise?: number, sizeScale?: number}): void {
    this.center = floorCenter
    this.total = totalSeconds
    this.t = 0
    this.running = true
    this.withWave = opts?.wave ?? true
    this.activeCount = Math.min(this.sparkles.length, opts?.count ?? this.sparkles.length)
    this.maxRise = opts?.maxRise ?? SPARKLE_MAX_RISE_CM
    this.sizeScale = opts?.sizeScale ?? 1
    const base = opts?.base ?? 15
    this.wave.enabled = this.withWave
    this.wave.getTransform().setWorldPosition(floorCenter.add(new vec3(0, 1, 0)))
    for (const s of this.sparkles) {
      s.pos = floorCenter.add(new vec3(
        (Math.random() * 2 - 1) * halfExtentCm.x,
        base + Math.random() * halfExtentCm.y,
        (Math.random() * 2 - 1) * halfExtentCm.z))
      const dist = Math.sqrt(Math.pow(s.pos.x - floorCenter.x, 2) + Math.pow(s.pos.z - floorCenter.z, 2))
      s.delay = Math.min(1, dist / this.waveRadiusCm) * this.waveSeconds
      s.so.enabled = false
    }
  }

  isRunning(): boolean {
    return this.running
  }

  stop(): void {
    this.running = false
    this.wave.enabled = false
    for (const s of this.sparkles) s.so.enabled = false
  }

  private tick(dt: number) {
    if (!this.running) return
    this.t += dt
    const wk = Math.min(1, this.t / this.waveSeconds)
    const r = 10 + wk * this.waveRadiusCm
    const thick = 1 - wk * 0.85
    this.wave.enabled = this.withWave && wk < 1
    this.wave.getTransform().setLocalScale(new vec3(r, thick * 40 + 1, r))
    for (let i = 0; i < this.sparkles.length; i++) {
      const s = this.sparkles[i]
      const life = this.t - s.delay
      const remaining = this.total - this.t
      if (i >= this.activeCount || life < 0 || remaining <= 0) {
        s.so.enabled = false
        continue
      }
      s.so.enabled = true
      const fade = Math.min(1, life * 3) * Math.min(1, remaining / 0.8)
      const tw = 0.6 + 0.4 * Math.sin(this.t * 8 + s.phase)
      const size = this.sparkleSizeCm * this.sizeScale * (0.6 + 0.4 * tw) * fade
      const tr = s.so.getTransform()
      // Drift up 6 cm/s, but no higher than maxRise, so long effects stay where they were put.
      tr.setWorldPosition(s.pos.add(new vec3(0, Math.min(life * 6, this.maxRise), 0)))
      tr.setLocalScale(new vec3(size, size, size))
      tr.setLocalRotation(quat.angleAxis(this.t * 2 + s.phase, vec3.up()))
    }
    if (this.t >= this.total) this.stop()
  }
}
