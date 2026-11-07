# Lists every powershell.exe with its start time, parent, memory and command line to ps-list.txt. Read only.
$out = Join-Path $PSScriptRoot "ps-list.txt"
$all = Get-CimInstance Win32_Process
$byId = @{}
foreach ($p in $all) { $byId[[int]$p.ProcessId] = $p }
$lines = New-Object System.Collections.Generic.List[string]
$all | Where-Object { $_.Name -eq 'powershell.exe' } | Sort-Object CreationDate | ForEach-Object {
  $parent = $byId[[int]$_.ParentProcessId]
  $pname = if ($parent) { $parent.Name } else { "(gone)" }
  $cmd = ($_.CommandLine -replace '\s+', ' ')
  if ($cmd.Length -gt 140) { $cmd = $cmd.Substring(0, 140) + "..." }
  $lines.Add(("pid={0} start={1} parent={2}({3}) mem={4:N0}MB cmd={5}" -f $_.ProcessId, $_.CreationDate.ToString("MM-dd HH:mm"),
    $pname, $_.ParentProcessId, ($_.PrivatePageCount / 1MB), $cmd))
}
$lines | Set-Content -LiteralPath $out -Encoding UTF8
