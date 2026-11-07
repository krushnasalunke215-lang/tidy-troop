# Kiro adapter for CLAD's Lens Studio MCP liveness gate (Windows PowerShell 5.1+).
#
# Wired by .kiro/hooks/clad-lens-studio-liveness.json (PreToolUse, matcher @lens-studio).
# Kiro hook contract: exit 0 allows the tool call (STDOUT is shown as context);
# exit 2 blocks the call and sends STDERR to the model.
#
# This adapter runs the unchanged CLAD script mcp-liveness-check.ps1 (same folder),
# which writes Claude Code hook JSON on STDOUT and always exits 0. A
# permissionDecision of "deny" becomes exit 2 + STDERR here. Anything else,
# including errors, allows the call (fail open, as upstream does).
#
# The CLAD script reads the hook event from STDIN itself, so this adapter must not
# read STDIN. ASCII only (Windows PowerShell 5.1 reads .ps1 files as Windows-1252).
$ErrorActionPreference = 'SilentlyContinue'

$check = Join-Path $PSScriptRoot 'mcp-liveness-check.ps1'
if (-not (Test-Path -LiteralPath $check)) { exit 0 }

$out = (& $check | Out-String)

$d = $null
try { $d = $out | ConvertFrom-Json } catch { exit 0 }
if ($null -eq $d) { exit 0 }

$hso = $d.hookSpecificOutput
if ($hso -and $hso.permissionDecision -eq 'deny') {
  [Console]::Error.WriteLine(([string]$hso.permissionDecisionReason + ' ' + [string]$d.systemMessage).Trim())
  exit 2
}

if ($hso -and $hso.additionalContext) { Write-Output $hso.additionalContext }
exit 0
