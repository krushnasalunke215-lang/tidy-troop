# Lists folder sizes, the largest files, and a few folders to check before making the repo public.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File repo-survey.ps1
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "repo-survey.txt"
$skip = @('Cache', 'Workspaces', 'PluginsUserPreferences')
$lines = New-Object System.Collections.Generic.List[string]

foreach ($d in Get-ChildItem -LiteralPath $root -Force -Directory) {
  $s = Get-ChildItem -LiteralPath $d.FullName -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum
  $lines.Add(("DIR {0} files={1} MB={2:N1}" -f $d.Name, $s.Count, ($s.Sum / 1MB)))
}

$lines.Add("--- largest files (outside Cache, Workspaces, PluginsUserPreferences)")
Get-ChildItem -LiteralPath $root -Recurse -Force -File -ErrorAction SilentlyContinue |
  Where-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    -not ($skip | Where-Object { $rel.StartsWith($_ + '\') })
  } |
  Sort-Object Length -Descending | Select-Object -First 15 |
  ForEach-Object { $lines.Add(("{0:N1} MB  {1}" -f ($_.Length / 1MB), $_.FullName.Substring($root.Length + 1))) }

$lines.Add("--- BackUp (first 20)")
Get-ChildItem -LiteralPath (Join-Path $root "BackUp") -Force -Recurse -ErrorAction SilentlyContinue |
  Select-Object -First 20 | ForEach-Object { $lines.Add($_.FullName.Substring($root.Length + 1)) }

$lines.Add("--- agent config folders")
foreach ($d in '.claude', '.codex', '.cursor', '.vscode', '.clad') {
  Get-ChildItem -LiteralPath (Join-Path $root $d) -Force -Recurse -File -ErrorAction SilentlyContinue |
    ForEach-Object { $lines.Add($_.FullName.Substring($root.Length + 1)) }
}

$lines.Add("--- .kiro")
foreach ($d in Get-ChildItem -LiteralPath (Join-Path $root ".kiro") -Force) {
  $s = Get-ChildItem -LiteralPath $d.FullName -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum
  $lines.Add(("{0} files={1} MB={2:N1}" -f $d.Name, $s.Count, ($s.Sum / 1MB)))
}

$lines.Add("--- git identity (read only)")
$lines.Add("user.name=" + (git config --get user.name))
$lines.Add("user.email=" + (git config --get user.email))

$lines | Set-Content -LiteralPath $out -Encoding UTF8
