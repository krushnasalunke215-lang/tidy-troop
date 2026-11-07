/**
 * TidyTroopAssets — fixed internal asset references for Tidy Troop.
 * Owns: every requireAsset() path the experience uses (one place to look).
 * Must not: hold state or create scene objects.
 */

// Per-vertex-color material from the SimpleVertexBaseColor package (mesh-builder-scripting skill).
export const VERTEX_COLOR_MATERIAL = requireAsset("../SimpleVertexBaseColor.lspkg/vertexBaseColorMaterial.mat") as Material
export const IMAGE_MATERIAL = requireAsset("../Materials/ImageMaterial.mat") as Material

export const SFX = {
  pickClick: requireAsset("../GeneratedSFX/PickClick.wav") as AudioTrackAsset,
  snapPlace: requireAsset("../GeneratedSFX/SnapPlace.wav") as AudioTrackAsset,
  hintChime: requireAsset("../GeneratedSFX/HintChime.wav") as AudioTrackAsset,
  sparkle: requireAsset("../GeneratedSFX/SparkleShimmer.wav") as AudioTrackAsset,
  saluteBugle: requireAsset("../GeneratedSFX/SaluteBugle.wav") as AudioTrackAsset,
  fanfare: requireAsset("../GeneratedSFX/Fanfare.wav") as AudioTrackAsset,
}

export const ICONS = {
  circle: requireAsset("../Icons/circle.png") as Texture,
  ring: requireAsset("../Icons/radio_button_unchecked.png") as Texture,
  arrow: requireAsset("../Icons/arrow_forward.png") as Texture,
  soldier: requireAsset("../Icons/military_tech.png") as Texture,
  buddy: requireAsset("../Icons/sentiment_very_satisfied.png") as Texture,
}

/** Item categories — an item only snaps into a slot of the same category. */
export type TidyCategory = "clothes" | "book" | "plate"

/** Character choice index used by the picker and the main script. */
export const CHARACTER_NAMES = ["Sergeant Sweep", "Captain Fresh"]
