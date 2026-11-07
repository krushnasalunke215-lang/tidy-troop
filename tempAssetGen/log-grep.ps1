# Writes the last Tidy Troop log lines (and any script errors) to log-grep.txt.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File log-grep.ps1 [-Last 40]
param([int]$Last = 40)
$logDir = Join-Path $env:LOCALAPPDATA "Snap\Lens Studio\logs"
$log = Get-ChildItem -LiteralPath $logDir -Filter "LensStudioLog-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$out = Join-Path $PSScriptRoot "log-grep.txt"
$lines = Select-String -LiteralPath $log.FullName -Pattern 'TidyTroop|Lens has been reset|Recorded screenshot|^E |Error|TypeError' |
  Where-Object { $_.Line -notmatch 'SceneMaterialBatcher|adb|^Error: ""' } |
  Select-Object -Last $Last | ForEach-Object { ($_.Line -replace '^(\S+ \S+) .*?\[Preview \d+\] ', '$1 ') -replace '\[Assets/Scripts/[^\]]+\] ', '' }
@("log: " + $log.Name) + $lines | Set-Content -LiteralPath $out -Encoding UTF8
