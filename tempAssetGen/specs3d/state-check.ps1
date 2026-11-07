# Read-only: Lens Studio processes, scene/esproj save times, newest log and crash log.
$out = "$env:TEMP\tt_state2.txt"
$lines = @("now " + (Get-Date).ToString("HH:mm:ss"))
foreach ($p in (Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like "*Lens*" })) {
  $lines += ("proc {0} pid={1} start={2} path={3}" -f $p.ProcessName, $p.Id, $p.StartTime.ToString("HH:mm:ss"), $p.Path)
}
$lines += ("Scene.scene " + (Get-Item "Assets\Scene.scene").LastWriteTime.ToString("HH:mm:ss"))
$lines += ("lens.esproj " + (Get-Item "lens.esproj").LastWriteTime.ToString("HH:mm:ss"))
$lines += ("props folder exists: " + (Test-Path "Assets\Interior Props Vol 1.lspkg"))
$lines += ("GeneratedMeshes glb count: " + @(Get-ChildItem "Assets\GeneratedMeshes" -Filter "*.glb" -ErrorAction SilentlyContinue).Count)
$logs = "$env:LOCALAPPDATA\Snap\Lens Studio\logs"
foreach ($f in (Get-ChildItem $logs -Filter "*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 4)) {
  $lines += ("log " + $f.Name + " " + $f.LastWriteTime.ToString("HH:mm:ss") + " " + $f.Length)
}
$newest = Get-ChildItem $logs -Filter "LensStudioLog-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$lines += "--- key lines in newest log"
$lines += (Select-String -Path $newest.FullName -Pattern "Application Version|Previous session crash|Project `"lens`" loaded|openProject|Opening|MCP\] Server started|Saving|saved" | Select-Object -Last 12 | ForEach-Object { $l = $_.Line; if ($l.Length -gt 200) { $l.Substring(0, 200) } else { $l } })
Set-Content -Path $out -Value $lines -Encoding UTF8
