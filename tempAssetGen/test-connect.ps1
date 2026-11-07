# Tests tools\connect-kiro-mcp.ps1 in a throwaway folder with FAKE data (no real token), and
# measures the longest tracked path in the repo. Writes test-connect.txt.
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "test-connect.txt"
$lines = New-Object System.Collections.Generic.List[string]
$t = Join-Path $env:TEMP ("tt-connect-test-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Force -Path (Join-Path $t ".kiro\settings") | Out-Null
# Built at runtime so this file never contains a token-shaped string (repo-commit.ps1 refuses those).
$fakeToken = "FAKE" + "_TOKEN_FOR_TEST_ONLY_123456"
$fakeAuth = "Bearer " + $fakeToken
('{"mcpServers":{"lens-studio":{"type":"http","url":"http://localhost:50999/mcp","headers":{"Authorization":"' + $fakeAuth + '"}}}}') |
  Set-Content -LiteralPath (Join-Path $t ".mcp.json") -Encoding UTF8
'{"mcpServers":{"other":{"command":"uvx","args":["x"]},"lens-studio":{"url":"http://localhost:1/mcp","headers":{"Authorization":"Bearer OLD"},"disabled":false,"autoApprove":["ListAllPanels"]}}}' |
  Set-Content -LiteralPath (Join-Path $t ".kiro\settings\mcp.json") -Encoding UTF8

$r = & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "tools\connect-kiro-mcp.ps1") -ProjectPath $t 2>&1
$lines.Add("exit: " + $LASTEXITCODE)
foreach ($l in $r) { $lines.Add("  out: " + ($l -replace 'Bearer \S+', 'Bearer ***')) }
$res = Get-Content -LiteralPath (Join-Path $t ".kiro\settings\mcp.json") -Raw | ConvertFrom-Json
$e = $res.mcpServers.'lens-studio'
$lines.Add("url updated: " + ($e.url -eq "http://localhost:50999/mcp"))
$lines.Add("token updated: " + ($e.headers.Authorization -eq $fakeAuth))
$lines.Add("type key dropped: " + (-not $e.PSObject.Properties['type']))
$lines.Add("disabled kept: " + ($e.PSObject.Properties['disabled'] -and $e.disabled -eq $false))
$lines.Add("autoApprove kept as array: " + ($e.autoApprove -is [array] -and $e.autoApprove[0] -eq "ListAllPanels"))
$lines.Add("other server kept: " + ($res.mcpServers.other.command -eq "uvx" -and $res.mcpServers.other.args -is [array]))
$lines.Add("backup made: " + (@(Get-ChildItem -LiteralPath (Join-Path $t ".kiro\settings") -Filter "mcp.json.bak-*").Count -eq 1))
$printed = ($r -join ' ').Contains($fakeToken)
$lines.Add("token printed to console: " + $printed)

# Missing .mcp.json must exit 1 without creating anything.
Remove-Item -LiteralPath (Join-Path $t ".mcp.json")
$null = & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "tools\connect-kiro-mcp.ps1") -ProjectPath $t 2>&1
$lines.Add("no .mcp.json -> exit " + $LASTEXITCODE)
Remove-Item -LiteralPath $t -Recurse -Force

Set-Location -LiteralPath $root
$longest = git ls-files | Sort-Object Length -Descending | Select-Object -First 1
$lines.Add("longest tracked path: " + $longest.Length + " chars: " + $longest)
$lines.Add("so the project folder path can be at most " + (259 - $longest.Length - 1) + " chars")
$lines | Set-Content -LiteralPath $out -Encoding UTF8
