# Creates the local Git repo (if missing), stages the project, and checks the staged files for secrets.
# Does not commit and does not change any Git config.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File repo-stage.ps1
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "repo-stage.txt"
Set-Location -LiteralPath $root
$lines = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path -LiteralPath (Join-Path $root ".git"))) {
  $lines.Add("init: " + ((git init -b main 2>&1) -join ' '))
}
git add -A 2>&1 | Out-Null

$staged = @(git diff --cached --name-only)
$lines.Add("staged files: " + $staged.Count)

# Paths that must never be staged.
$bad = $staged | Where-Object {
  $_ -match '(^|/)\.mcp\.json$' -or $_ -match '^\.kiro/settings/mcp\.json' -or $_ -match 'spk_debug_key\.pem$' -or
  $_ -match '^\.claude/settings\.local\.json$' -or $_ -match '^\.codex/config\.toml$' -or $_ -match '^\.cursor/mcp\.json$' -or
  $_ -match '^\.vscode/' -or $_ -match 'ls-live-instance\.json' -or $_ -match '\.lock$' -or
  $_ -match '^(Cache|Workspaces|PluginsUserPreferences|BackUp)/'
}
$lines.Add("forbidden paths staged: " + @($bad).Count)
foreach ($b in $bad) { $lines.Add("  BAD " + $b) }

# Secret text in staged content: the current MCP token, bearer tokens, private keys.
$token = $null
$mcp = Join-Path $root ".mcp.json"
if (Test-Path -LiteralPath $mcp) {
  $m = [regex]::Match((Get-Content -LiteralPath $mcp -Raw), 'Bearer ([A-Za-z0-9_\-]{20,})')
  if ($m.Success) { $token = $m.Groups[1].Value }
}
if ($token) {
  $hits = @(git grep --cached -l -F -e $token 2>$null)
  $lines.Add("files containing the current MCP token: " + $hits.Count)
  foreach ($h in $hits) { $lines.Add("  TOKEN " + $h) }
}
$bearer = @(git grep --cached -l -E -e 'Bearer [A-Za-z0-9_\-]{20,}' 2>$null)
$lines.Add("files with a Bearer token: " + $bearer.Count)
foreach ($h in $bearer) { $lines.Add("  BEARER " + $h) }
$pk = @(git grep --cached -l -e 'PRIVATE KEY-----' 2>$null)
$lines.Add("files with a private key: " + $pk.Count)
foreach ($h in $pk) { $lines.Add("  KEY " + $h) }

# Largest staged files (GitHub rejects files over 100 MB).
$lines.Add("--- largest staged files")
$sizes = foreach ($f in $staged) {
  $p = Join-Path $root $f
  if (Test-Path -LiteralPath $p) { [pscustomobject]@{ f = $f; mb = (Get-Item -LiteralPath $p).Length / 1MB } }
}
$sizes | Sort-Object mb -Descending | Select-Object -First 5 | ForEach-Object { $lines.Add(("{0:N1} MB  {1}" -f $_.mb, $_.f)) }
$total = ($sizes | Measure-Object mb -Sum).Sum
$lines.Add(("total staged MB: {0:N1}" -f $total))

$lines.Add("--- top-level staged entries")
$staged | ForEach-Object { ($_ -split '/')[0] } | Group-Object | Sort-Object Name | ForEach-Object { $lines.Add(("{0} ({1})" -f $_.Name, $_.Count)) }

$lines | Set-Content -LiteralPath $out -Encoding UTF8
