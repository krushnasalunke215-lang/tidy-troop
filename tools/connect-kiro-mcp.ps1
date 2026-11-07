<#
.SYNOPSIS
  Connects Kiro to this project's Lens Studio MCP server.

.DESCRIPTION
  Copies the "lens-studio" server (url and headers, or command, args and env) from the
  .mcp.json that Lens Studio writes into .kiro\settings\mcp.json. Other servers and other
  keys on the lens-studio entry (disabled, autoApprove, ...) are kept, and the old file is
  backed up first. This is the same MCP step that install-clad-kiro.ps1 (CLAD-for-Kiro kit)
  does. The CLAD files under .kiro\ are already in this repo, so the kit isn't needed.

  Run it again whenever Lens Studio restarts its MCP server: it picks a new port and token.
  The token is never printed. .kiro\settings\mcp.json and its backups are git-ignored.

  Exit codes: 0 ok; 1 no .mcp.json or no lens-studio entry in it; 3 the existing
  .kiro\settings\mcp.json is not valid JSON (nothing is changed).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File tools\connect-kiro-mcp.ps1
#>
param([string]$ProjectPath)
$ErrorActionPreference = 'Stop'
if (-not $ProjectPath) { $ProjectPath = Split-Path -Parent $PSScriptRoot }
$proj = (Resolve-Path -LiteralPath $ProjectPath).ProviderPath

$lsMcp = Join-Path $proj '.mcp.json'
if (-not (Test-Path -LiteralPath $lsMcp -PathType Leaf)) {
  Write-Host ("No .mcp.json in " + $proj + ". Open lens.esproj in Lens Studio 5.24.1, start the MCP server " +
    "(AI Assistant > AI Model Context Protocol (MCP) > Configure Server), then run this again.")
  exit 1
}
$ls = Get-Content -LiteralPath $lsMcp -Raw -Encoding UTF8 | ConvertFrom-Json
$entry = $null
if ($ls.PSObject.Properties['mcpServers'] -and $ls.mcpServers.PSObject.Properties['lens-studio']) {
  $entry = $ls.mcpServers.'lens-studio'
}
if (-not $entry) {
  Write-Host ".mcp.json has no mcpServers.lens-studio entry. Restart the MCP server in Lens Studio and run this again."
  exit 1
}

$dir = Join-Path $proj '.kiro\settings'
$file = Join-Path $dir 'mcp.json'
$root = [pscustomobject]@{}
$backup = ''
if (Test-Path -LiteralPath $file -PathType Leaf) {
  $text = Get-Content -LiteralPath $file -Raw -Encoding UTF8
  if ($text -and $text.Trim()) {
    try { $root = $text | ConvertFrom-Json }
    catch { Write-Host ($file + " is not valid JSON. Fix or move it, then run this again. Nothing was changed."); exit 3 }
  }
  $backup = $file + '.bak-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
  Copy-Item -LiteralPath $file -Destination $backup
}

if (-not $root.PSObject.Properties['mcpServers']) {
  $root | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([pscustomobject]@{})
}
$servers = $root.mcpServers
$p = $servers.PSObject.Properties['lens-studio']
if ($p) { $target = $p.Value } else {
  $target = [pscustomobject]@{}
  $servers | Add-Member -NotePropertyName 'lens-studio' -NotePropertyValue $target
}
# Replace only the connection keys; keep the rest of the entry.
foreach ($k in @('url', 'headers', 'command', 'args', 'env', 'type')) {
  if ($target.PSObject.Properties[$k]) { $target.PSObject.Properties.Remove($k) }
}
foreach ($k in @('url', 'headers', 'command', 'args', 'env')) {
  $q = $entry.PSObject.Properties[$k]
  if ($q) { $target | Add-Member -NotePropertyName $k -NotePropertyValue $q.Value }
}

New-Item -ItemType Directory -Force -Path $dir | Out-Null
$json = ($root | ConvertTo-Json -Depth 20) -replace "`r`n", "`n"
[IO.File]::WriteAllText($file, $json + "`n", (New-Object System.Text.UTF8Encoding($false)))

$where = if ($entry.PSObject.Properties['url']) { $entry.url } else { $entry.command }
Write-Host ("lens-studio (" + $where + ") written to .kiro\settings\mcp.json" + $(if ($backup) { "; backup " + (Split-Path -Leaf $backup) } else { "" }) + ".")
Write-Host "Now open Kiro's MCP Servers panel and reconnect lens-studio."
