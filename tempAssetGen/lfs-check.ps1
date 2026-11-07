# Checks whether committed Assets/Packages files are real content or Git LFS pointers. Read only.
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "lfs-check.txt"
Set-Location -LiteralPath $root
$lines = New-Object System.Collections.Generic.List[string]
$ga = Get-Item -LiteralPath (Join-Path $root ".gitattributes") -ErrorAction SilentlyContinue
if ($ga) { $lines.Add(".gitattributes created " + $ga.CreationTime.ToString("MM-dd HH:mm:ss") + ", written " + $ga.LastWriteTime.ToString("MM-dd HH:mm:ss")) }
$lines.Add("filter.lfs.clean = " + (git config --get filter.lfs.clean))
$lines.Add("filter.lfs.required = " + (git config --get filter.lfs.required))
$lines.Add("git lfs: " + ((git lfs version 2>&1) -join ' '))
$lines.Add("--- committed sizes at HEAD (pointer files are about 130 bytes)")
foreach ($f in @("Assets/GeneratedMeshes/TT_ShirtBlue.glb", "Assets/GeneratedSFX/Fanfare.wav", "Assets/Icons/circle.png",
                 "Assets/Echopark.hdr", "Packages/UIKit.lspkg", "Packages/InteractionKit.lspkg", "Assets/Scene.scene")) {
  $c = (git cat-file -s ("HEAD:" + $f) 2>&1) -join ' '
  $d = (Get-Item -LiteralPath (Join-Path $root $f)).Length
  $lines.Add(("{0}: committed {1} bytes, on disk {2} bytes" -f $f, $c, $d))
}
$lines.Add("--- every committed file under Assets/ and Packages/ smaller than 200 bytes that starts like an LFS pointer")
$n = 0
git ls-tree -r -l HEAD -- Assets Packages | ForEach-Object {
  $parts = $_ -split '\s+', 5
  if ([int]$parts[3] -lt 200) {
    $txt = (git cat-file -p $parts[2]) -join ' '
    if ($txt -like 'version https://git-lfs*') { $lines.Add("  POINTER " + $parts[4]); $n++ }
  }
}
$lines.Add("pointer files found: " + $n)
$lines | Set-Content -LiteralPath $out -Encoding UTF8
