# PowerShell port of .kiro/skills/build-mesh/tools/make-eec-script.py (Python is not installed on this machine).
# Fills the CONFIG consts of a pinned ExecuteEditorCode script with JSON-encoded values and writes a fresh copy.
#   powershell -NoProfile -ExecutionPolicy Bypass -File make-eec-script.ps1 -Target <script.ts> -Out <new file> `
#     -Set "NAME=VALUE|NAME2=VALUE2" -Json "NAME=FILE"
# Entries are separated by "|" because -File passes each parameter as one string.
# Every value goes through ConvertTo-Json, so quotes and backslashes in prompts can't break the TypeScript.
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Set = '',
  [string]$Json = ''
)
$ErrorActionPreference = 'Stop'
$values = @{}
foreach ($raw in @($Set.Split('|') | Where-Object { $_ })) {
  $i = $raw.IndexOf('=')
  $values[$raw.Substring(0, $i)] = ConvertTo-Json -InputObject $raw.Substring($i + 1) -Compress
}
foreach ($raw in @($Json.Split('|') | Where-Object { $_ })) {
  $i = $raw.IndexOf('=')
  $obj = Get-Content -Raw -Encoding UTF8 $raw.Substring($i + 1) | ConvertFrom-Json
  $values[$raw.Substring(0, $i)] = ConvertTo-Json -InputObject $obj -Compress -Depth 20
}
$decl = '^(?<head>const\s+(?<name>\w+)\b[^=]*?)\s*=\s*.*?;(?<comment>\s*//.*)?$'
$seen = @{}
$lines = foreach ($line in (Get-Content -Encoding UTF8 $Target)) {
  $m = [regex]::Match($line, $decl)
  if ($m.Success -and $values.ContainsKey($m.Groups['name'].Value)) {
    $n = $m.Groups['name'].Value
    $seen[$n] = 1 + [int]$seen[$n]
    $m.Groups['head'].Value + ' = ' + $values[$n] + ';' + $m.Groups['comment'].Value
  } else {
    $line
  }
}
$wrong = @($values.Keys | Where-Object { $seen[$_] -ne 1 })
if ($wrong.Count -gt 0) { throw ('make-eec-script: expected exactly one declaration of: ' + ($wrong -join ', ')) }
[IO.File]::WriteAllText($Out, (($lines -join "`n") + "`n"), (New-Object Text.UTF8Encoding $false))
Write-Output $Out
