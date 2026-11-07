# Writes the GPU lines from the current Lens Studio log, the Windows per-app GPU setting for
# Lens Studio, and memory after cleanup, to gpu-check.txt. Read only.
$out = Join-Path $PSScriptRoot "gpu-check.txt"
$lines = New-Object System.Collections.Generic.List[string]
$logDir = Join-Path $env:LOCALAPPDATA "Snap\Lens Studio\logs"
$log = Get-ChildItem -LiteralPath $logDir -Filter "LensStudioLog-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$lines.Add("log: " + $log.Name)
Select-String -LiteralPath $log.FullName -Pattern 'NVIDIA|GeForce|Intel|Iris|Renderer|renderer|Vendor|adapter|Adapter|GPU' |
  Where-Object { $_.Line -notmatch 'SceneMaterialBatcher|adb' } | Select-Object -First 12 |
  ForEach-Object { $lines.Add(($_.Line -replace '^(\S+ \S+) .*?\] ', '$1 ')) }
$key = "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences"
$lines.Add("--- Windows graphics preference entries")
if (Test-Path $key) {
  (Get-ItemProperty $key).PSObject.Properties | Where-Object { $_.Name -like "*Lens*" } |
    ForEach-Object { $lines.Add($_.Name + " = " + $_.Value) }
} else { $lines.Add("none set") }
$os = Get-CimInstance Win32_OperatingSystem
$lines.Add(("RAM free now {0:N1} of {1:N1} GB" -f ($os.FreePhysicalMemory / 1MB), ($os.TotalVisibleMemorySize / 1MB)))
$ps = @(Get-Process powershell -ErrorAction SilentlyContinue)
$lines.Add("powershell processes: " + $ps.Count + ", private " + [math]::Round((($ps | Measure-Object PrivateMemorySize64 -Sum).Sum) / 1MB) + " MB")
$lines | Set-Content -LiteralPath $out -Encoding UTF8
