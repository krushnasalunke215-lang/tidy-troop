# Lists item visuals, ModelSlot children and scene roots from .virtual-scene.json (read-only).
param([string]$Out = "$env:TEMP\tt_vis.txt")
$j = Get-Content -Raw ".virtual-scene.json" | ConvertFrom-Json
$lines = @()
foreach ($o in ($j.sceneObjects | Where-Object { $_.name -match '_Visual$' -or $_.name -match 'Household' -or $_.name -eq 'ModelSlot' -or $_.name -match '^TT_' })) {
  $kids = @($j.sceneObjects | Where-Object { $_.parentId -eq $o.id }).Count
  $lines += ("{0} | {1} | parent={2} | kids={3} | pos={4} | rot={5} | scl={6}" -f $o.id, $o.name, $o.parentId, $kids, ($o.transform.position -join ','), ($o.transform.rotation -join ','), ($o.transform.scale -join ','))
}
$lines += ("roots: " + (($j.sceneObjects | Where-Object { -not $_.parentId } | ForEach-Object { $_.name + '=' + $_.id }) -join ' | '))
$lines += ("assets matching Interior/GeneratedMeshes: " + (($j.assets | Where-Object { $_.path -match 'Interior Props|GeneratedMeshes' } | Select-Object -First 8 | ForEach-Object { $_.path + '=' + $_.id }) -join ' | '))
Set-Content -Path $Out -Value $lines -Encoding UTF8
