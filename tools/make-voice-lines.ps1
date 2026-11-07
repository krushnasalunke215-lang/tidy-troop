# Makes the buddies' spoken lines with the offline Windows voices (System.Speech) and writes
# Assets/Scripts/TidyTroopVoiceLines.ts, which maps each bubble line (exactly as the bubble shows it)
# to its clip. Lens Studio's own TextToSpeechModule is part of VoiceML, which Specs doesn't support,
# so the lines are pre-made clips instead.
#   Sergeant Sweep: "Microsoft David Desktop", a bit faster, pitched 8 % down (strict).
#   Captain Fresh:  "Microsoft Zira Desktop", pitched 18 % up (cartoon buddy).
# Output: 22050 Hz, 16-bit mono WAV in Assets/GeneratedSFX/Voice/, silence trimmed, peak at -1 dBFS.
# Usage (from the project folder): powershell -NoProfile -ExecutionPolicy Bypass -File tools\make-voice-lines.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
public static class TidyVoiceDsp {
  // Trim silence, resample by `pitch` (>1 = higher and shorter), normalise to `peak`, fade the ends.
  public static short[] Process(short[] x, double pitch, double peak, int rate) {
    int max = 1;
    foreach (short v in x) { int a = Math.Abs((int)v); if (a > max) max = a; }
    int thr = Math.Max(150, max / 60);
    int s = 0; while (s < x.Length && Math.Abs((int)x[s]) < thr) s++;
    int e = x.Length - 1; while (e > s && Math.Abs((int)x[e]) < thr) e--;
    s = Math.Max(0, s - rate / 50);
    e = Math.Min(x.Length - 1, e + rate / 8);
    int len = e - s + 1;
    double[] src = new double[len];
    for (int i = 0; i < len; i++) src[i] = x[s + i];
    if (pitch > 1.0) {
      // Light low-pass before shortening, so the raised voice doesn't alias into hiss.
      double[] lp = new double[len];
      for (int i = 0; i < len; i++) {
        double a = src[Math.Max(0, i - 1)], b = src[i], c = src[Math.Min(len - 1, i + 1)];
        lp[i] = (a + 2 * b + c) / 4;
      }
      src = lp;
    }
    int outLen = (int)Math.Floor((len - 1) / pitch);
    double[] y = new double[outLen];
    double ym = 1;
    for (int i = 0; i < outLen; i++) {
      double p = i * pitch; int k = (int)p; double f = p - k;
      double a = src[k], b = src[Math.Min(k + 1, len - 1)];
      y[i] = a + (b - a) * f;
      if (Math.Abs(y[i]) > ym) ym = Math.Abs(y[i]);
    }
    double gain = peak * 32767.0 / ym;
    int fade = Math.Min(rate / 100, outLen / 4);
    short[] o = new short[outLen];
    for (int i = 0; i < outLen; i++) {
      double g = gain;
      if (i < fade) g *= (double)i / fade;
      if (i >= outLen - fade) g *= (double)(outLen - 1 - i) / fade;
      double v = Math.Round(y[i] * g);
      if (v > 32767) v = 32767; if (v < -32768) v = -32768;
      o[i] = (short)v;
    }
    return o;
  }
  public static void WriteWav(string path, short[] y, int rate) {
    using (FileStream fs = new FileStream(path, FileMode.Create))
    using (BinaryWriter w = new BinaryWriter(fs)) {
      int dataLen = y.Length * 2;
      w.Write(Encoding.ASCII.GetBytes("RIFF")); w.Write(36 + dataLen);
      w.Write(Encoding.ASCII.GetBytes("WAVE"));
      w.Write(Encoding.ASCII.GetBytes("fmt ")); w.Write(16); w.Write((short)1); w.Write((short)1);
      w.Write(rate); w.Write(rate * 2); w.Write((short)2); w.Write((short)16);
      w.Write(Encoding.ASCII.GetBytes("data")); w.Write(dataLen);
      foreach (short v in y) w.Write(v);
    }
  }
}
"@

$root = Split-Path -Parent $PSScriptRoot
$voiceDir = Join-Path $root 'Assets\GeneratedSFX\Voice'
$tsPath = Join-Path $root 'Assets\Scripts\TidyTroopVoiceLines.ts'
New-Item -ItemType Directory -Force -Path $voiceDir | Out-Null
$rate = 22050
$peak = 0.89

# Each line: the file name, and the text exactly as the bubble shows it (TidyTroopLines.ts and the
# TidyTroopMain inputs praiseText "You are disciplined!" and finaleText "Room fresh!", with 10 items).
function PraiseLines {
  $out = @()
  for ($n = 1; $n -le 9; $n++) { $out += ,@("Praise$n", "You are disciplined! $n of 10") }
  return $out
}
$buddies = @(
  @{ prefix = 'Sgt'; voice = 'Microsoft David Desktop'; speed = 1; pitch = 0.92; lines = @(
      @('Briefing1', '10 things out of place!'),
      @('Briefing2', 'Start with number 1!'),
      @('JobShirt', 'Shirt hung, soldier!'),
      @('JobPants', 'Pants hung, soldier!'),
      @('JobClothes', 'Clothes hung, soldier!'),
      @('JobBook', 'Book shelved, soldier!'),
      @('JobPlate', 'Plate racked, soldier!'),
      @('BedClear', 'Bed clear, soldier!'),
      @('LastOne1', "That's all of them!"),
      @('LastOne2', 'Eyes on your bed, soldier!'),
      @('Finale', 'Room fresh! 10 of 10')
    ) + (PraiseLines) },
  @{ prefix = 'Cpt'; voice = 'Microsoft Zira Desktop'; speed = 0; pitch = 1.18; lines = @(
      @('Briefing1', 'Hi! 10 things to put away.'),
      @('Briefing2', "Let's start with number 1!"),
      @('JobShirt', 'Nice! Shirt hung!'),
      @('JobPants', 'Nice! Pants hung!'),
      @('JobClothes', 'Nice! Clothes hung!'),
      @('JobBook', 'Nice! Book shelved!'),
      @('JobPlate', 'Nice! Plate put away!'),
      @('BedClear', 'Yay, your bed is clear!'),
      @('LastOne1', "That's all of them!"),
      @('LastOne2', 'Now look at your bed!'),
      @('Finale', 'Room fresh! 10 of 10')
    ) + (PraiseLines) }
)

$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo($rate, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$ts = New-Object System.Collections.Generic.List[string]
$ts.Add('/**')
$ts.Add(' * TidyTroopVoiceLines - the buddies'' spoken lines. GENERATED by tools/make-voice-lines.ps1: edit that')
$ts.Add(' * script (and TidyTroopLines.ts) and run it again instead of editing this file.')
$ts.Add(' * Maps each bubble line, exactly as the bubble shows it, to its clip and its length in seconds.')
$ts.Add(' * Index 0 = Sergeant Sweep (Windows voice David, pitched down), 1 = Captain Fresh (Windows voice Zira, pitched up).')
$ts.Add(' * A line with no clip (for example "Done in 2 min 41 s") is shown but not spoken.')
$ts.Add(' */')
$ts.Add('export type VoiceClip = {track: AudioTrackAsset, seconds: number}')
$ts.Add('')
$ts.Add('export const VOICE_LINES: Record<string, VoiceClip>[] = [')
$total = 0.0
foreach ($b in $buddies) {
  $ts.Add('  {')
  foreach ($l in $b.lines) {
    $file = $b.prefix + '_' + $l[0] + '.wav'
    $text = $l[1]
    $syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $syn.SelectVoice($b.voice)
    $syn.Rate = $b.speed
    $ms = New-Object System.IO.MemoryStream
    $syn.SetOutputToAudioStream($ms, $fmt)
    $syn.Speak($text)
    $syn.SetOutputToNull()
    $syn.Dispose()
    $bytes = $ms.ToArray()
    $raw = New-Object 'int16[]' ([int]($bytes.Length / 2))
    [Buffer]::BlockCopy($bytes, 0, $raw, 0, $raw.Length * 2)
    $y = [TidyVoiceDsp]::Process($raw, [double]$b.pitch, $peak, $rate)
    [TidyVoiceDsp]::WriteWav((Join-Path $voiceDir $file), $y, $rate)
    $sec = [math]::Round($y.Length / $rate, 2)
    $total += $sec
    $key = $text.Replace('\', '\\').Replace('"', '\"')
    $ts.Add('    "' + $key + '": {track: requireAsset("../GeneratedSFX/Voice/' + $file + '") as AudioTrackAsset, seconds: ' + $sec.ToString([Globalization.CultureInfo]::InvariantCulture) + '},')
    Write-Output ($file + ' ' + $sec + ' s  "' + $text + '"')
  }
  $ts.Add('  },')
}
$ts.Add(']')
[IO.File]::WriteAllText($tsPath, ($ts -join "`n") + "`n", (New-Object Text.UTF8Encoding $false))
Write-Output ("wrote " + $tsPath + "; " + $buddies[0].lines.Count + " + " + $buddies[1].lines.Count + " clips, " + [math]::Round($total, 1) + " s in total")
