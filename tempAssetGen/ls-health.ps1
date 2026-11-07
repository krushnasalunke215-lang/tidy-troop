# Writes Lens Studio process health and the end of its log to ls-health.txt. Read only: changes nothing.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File ls-health.ps1
$out = Join-Path $PSScriptRoot "ls-health.txt"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("now: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))

$procs = Get-Process | Where-Object { $_.ProcessName -like "*Lens*Studio*" -or $_.ProcessName -like "*LensStudio*" }
foreach ($p in $procs) {
  $path = ""
  try { $path = $p.Path } catch {}
  $cpu1 = $p.CPU
  Start-Sleep -Milliseconds 2000
  $p.Refresh()
  $cpuPct = [math]::Round((($p.CPU - $cpu1) / 2) * 100 / [Environment]::ProcessorCount, 1)
  $lines.Add(("{0} pid={1} responding={2} mem={3:N0} MB cpu~{4}% started={5} path={6}" -f $p.ProcessName, $p.Id, $p.Responding,
    ($p.WorkingSet64 / 1MB), $cpuPct, $p.StartTime.ToString("MM-dd HH:mm"), $path))
}
if (-not $procs) { $lines.Add("no Lens Studio process found") }

$os = Get-CimInstance Win32_OperatingSystem
$lines.Add(("system RAM free {0:N1} of {1:N1} GB" -f ($os.FreePhysicalMemory / 1MB), ($os.TotalVisibleMemorySize / 1MB)))

$logDir = Join-Path $env:LOCALAPPDATA "Snap\Lens Studio\logs"
$log = Get-ChildItem -LiteralPath $logDir -Filter "LensStudioLog-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$lines.Add("log: " + $log.Name + " last written " + $log.LastWriteTime.ToString("HH:mm:ss") + " size " + [math]::Round($log.Length / 1MB, 1) + " MB")
$crash = Get-ChildItem -LiteralPath $logDir -Filter "CrashLog-*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 2
foreach ($c in $crash) { $lines.Add("crash log: " + $c.Name + " " + $c.LastWriteTime.ToString("MM-dd HH:mm")) }
$lines.Add("--- last 25 log lines (batcher/adb noise removed)")
Get-Content -LiteralPath $log.FullName -Tail 400 |
  Where-Object { $_ -notmatch 'SceneMaterialBatcher|adb|^Error: ""|Open audio file|Http request cancellation' } |
  Select-Object -Last 25 | ForEach-Object { $lines.Add(($_ -replace '^(\S+ \S+) .*?\] ', '$1 ')) }

$lines | Set-Content -LiteralPath $out -Encoding UTF8
