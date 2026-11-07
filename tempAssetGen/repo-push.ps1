# Sets the GitHub remote (if missing) and pushes main. Git Credential Manager may open a sign-in window.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File repo-push.ps1 -Url "https://github.com/<user>/<repo>.git"
param([Parameter(Mandatory = $true)][string]$Url)
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "repo-push.txt"
Set-Location -LiteralPath $root
$lines = New-Object System.Collections.Generic.List[string]

$remotes = @(git remote)
if ($remotes -notcontains 'origin') {
  git remote add origin $Url 2>&1 | Out-Null
  $lines.Add("remote added: " + $Url)
} else {
  $lines.Add("remote origin already: " + (git remote get-url origin))
}

$env:GIT_TERMINAL_PROMPT = '0'
$r = git push -u origin main 2>&1
$lines.Add("push exit: " + $LASTEXITCODE)
foreach ($l in $r) { $lines.Add("  " + $l) }
$lines.Add("status: " + ((git status -sb | Select-Object -First 1)))
$lines | Set-Content -LiteralPath $out -Encoding UTF8
