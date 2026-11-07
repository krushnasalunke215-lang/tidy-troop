/**
 * TidyTroopAudio — every sound cue in one place.
 * Owns: one AudioComponent per cue (created at runtime under this object) and their volumes.
 * Cues: pick click, snap into place, salute bugle, out-of-view chime, ending fanfare, sparkles.
 * Must not: decide when cues play (TidyTroopMain calls these methods).
 */
import {SFX} from "./TidyTroopAssets"

@component
export class TidyTroopAudio extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">TidyTroopAudio – sound cues</span>')
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Volume of quick feedback sounds (click, snap, chime)")
  @widget(new SliderWidget(0, 1, 0.05))
  sfxVolume: number = 0.85

  @input
  @hint("Volume of the salute bugle and the ending fanfare")
  @widget(new SliderWidget(0, 1, 0.05))
  jingleVolume: number = 0.8
  @ui.group_end

  private sources: {[key: string]: AudioComponent} = {}

  onAwake() {
    this.add("pick", SFX.pickClick, this.sfxVolume, true)
    this.add("snap", SFX.snapPlace, this.sfxVolume, true)
    this.add("chime", SFX.hintChime, this.sfxVolume * 0.8, true)
    this.add("salute", SFX.saluteBugle, this.jingleVolume, true)
    this.add("fanfare", SFX.fanfare, this.jingleVolume, false)
    this.add("sparkle", SFX.sparkle, this.sfxVolume * 0.7, false)
  }

  playPick(): void { this.play("pick") }
  playSnap(): void { this.play("snap") }
  playChime(): void { this.play("chime") }
  playSalute(): void { this.play("salute") }
  playFanfare(): void { this.play("fanfare") }
  playSparkle(): void { this.play("sparkle") }

  /** Count of plays per cue, readable by tests. */
  playCount: {[key: string]: number} = {}

  private add(key: string, track: AudioTrackAsset, volume: number, lowLatency: boolean) {
    const so = global.scene.createSceneObject("Audio_" + key)
    so.setParent(this.sceneObject)
    const ac = so.createComponent("Component.AudioComponent") as AudioComponent
    ac.audioTrack = track
    ac.volume = volume
    if (lowLatency) ac.playbackMode = Audio.PlaybackMode.LowLatency
    this.sources[key] = ac
    this.playCount[key] = 0
  }

  private play(key: string) {
    const ac = this.sources[key]
    if (!ac) return
    if (ac.isPlaying()) ac.stop(false)
    ac.play(1)
    this.playCount[key] = (this.playCount[key] || 0) + 1
  }
}
