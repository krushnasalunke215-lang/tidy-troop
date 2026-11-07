# Writes git status, the files changed since the last commit, and whether main matches GitHub, to repo-status.txt. Read only.
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "repo-status.txt"
Set-Location -LiteralPath $root
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("checked: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
$lines.Add("head: " + (git log -1 --format='%h %ad %s' --date=format:'%m-%d %H:%M'))
git fetch -q origin 2>&1 | Out-Null
$lines.Add("vs github: " + (git status -sb | Select-Object -First 1))
$lines.Add("--- changed or new files")
git status --porcelain | ForEach-Object { $lines.Add($_) }
$lines.Add("--- Scene.scene and lens.esproj last written")
foreach ($f in @("Assets\Scene.scene", "lens.esproj")) {
  $i = Get-Item -LiteralPath (Join-Path $root $f)
  $lines.Add($f + " " + $i.LastWriteTime.ToString("MM-dd HH:mm:ss"))
}
$lines | Set-Content -LiteralPath $out -Encoding UTF8
