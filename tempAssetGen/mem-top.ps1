# Writes the processes using the most memory (grouped by name) to mem-top.txt. Read only.
$out = Join-Path $PSScriptRoot "mem-top.txt"
$os = Get-CimInstance Win32_OperatingSystem
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("checked: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
$ls = Get-Process | Where-Object { $_.ProcessName -like "*Lens*Studio*" }
foreach ($p in $ls) { $lines.Add(("Lens Studio pid={0} started={1} responding={2}" -f $p.Id, $p.StartTime.ToString("MM-dd HH:mm"), $p.Responding)) }
if (-not $ls) { $lines.Add("Lens Studio: not running") }
$lines.Add(("RAM free {0:N1} of {1:N1} GB; commit used {2:N1} of {3:N1} GB" -f ($os.FreePhysicalMemory / 1MB), ($os.TotalVisibleMemorySize / 1MB),
  (($os.TotalVirtualMemorySize - $os.FreeVirtualMemory) / 1MB), ($os.TotalVirtualMemorySize / 1MB)))
Get-Process | Group-Object ProcessName | ForEach-Object {
  [pscustomobject]@{ name = $_.Name; count = $_.Count; ws = ($_.Group | Measure-Object WorkingSet64 -Sum).Sum; priv = ($_.Group | Measure-Object PrivateMemorySize64 -Sum).Sum }
} | Sort-Object priv -Descending | Select-Object -First 12 | ForEach-Object {
  $lines.Add(("{0,-28} x{1,-3} private {2,7:N0} MB  in RAM {3,7:N0} MB" -f $_.name, $_.count, ($_.priv / 1MB), ($_.ws / 1MB)))
}
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 2
foreach ($g in $gpu) { $lines.Add("GPU: " + $g.Name + " (" + [math]::Round($g.AdapterRAM / 1GB, 1) + " GB reported)") }
$lines | Set-Content -LiteralPath $out -Encoding UTF8
