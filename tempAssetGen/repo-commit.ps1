# Re-stages the project, re-checks for the MCP token, and makes a commit with the given author.
# Passes the author with `git -c` for this command only; does not change any Git config.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File repo-commit.ps1 -Name "..." -Email "..." -Message "..."
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Email,
  [Parameter(Mandatory = $true)][string]$Message
)
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "repo-commit.txt"
Set-Location -LiteralPath $root
$lines = New-Object System.Collections.Generic.List[string]

# Lens Studio writes a .gitattributes that sends Assets/ and Packages/ to Git LFS. Keep this repo
# LFS-free: .git/info/attributes has the highest precedence, so these lines switch those rules off
# and git behaves as it did before that file existed.
$infoAttr = Join-Path $root ".git\info\attributes"
$want = "* !filter !diff !merge !text !eol"
$have = if (Test-Path -LiteralPath $infoAttr) { Get-Content -LiteralPath $infoAttr } else { @() }
if ($have -notcontains $want) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $infoAttr) | Out-Null
  Add-Content -LiteralPath $infoAttr -Value @("# Keep the repo free of Git LFS (see .gitignore note on .gitattributes)", $want)
  $lines.Add("wrote .git/info/attributes override")
}

git add -A 2>&1 | Out-Null
$staged = @(git diff --cached --name-only)
$lines.Add("staged changes: " + $staged.Count)

$token = $null
$mcp = Join-Path $root ".mcp.json"
if (Test-Path -LiteralPath $mcp) {
  $m = [regex]::Match((Get-Content -LiteralPath $mcp -Raw), 'Bearer ([A-Za-z0-9_\-]{20,})')
  if ($m.Success) { $token = $m.Groups[1].Value }
}
$hits = @()
if ($token) { $hits = @(git grep --cached -l -F -e $token 2>$null) }
$bearer = @(git grep --cached -l -E -e 'Bearer [A-Za-z0-9_\-]{20,}' 2>$null)
$pem = @(git ls-files --cached -- '*.pem' 2>$null)
$lines.Add("token hits: " + $hits.Count + ", bearer hits: " + $bearer.Count + ", pem files: " + $pem.Count)
# An LFS pointer is a ~130-byte text file starting with this line; none should be staged.
$lfs = @(git grep --cached -l -e 'version https://git-lfs.github.com/spec' -- Assets Packages 2>$null)
$lines.Add("lfs pointers staged: " + $lfs.Count)

if ($lfs.Count -gt 0) {
  $lines.Add("ABORTED: Git LFS pointers staged instead of real files")
  foreach ($h in $lfs) { $lines.Add("  " + $h) }
} elseif ($hits.Count -gt 0 -or $bearer.Count -gt 0 -or $pem.Count -gt 0) {
  $lines.Add("ABORTED: secret found in staged files")
  foreach ($h in ($hits + $bearer + $pem)) { $lines.Add("  " + $h) }
} elseif ($staged.Count -eq 0) {
  $lines.Add("nothing to commit")
} else {
  $r = git -c "user.name=$Name" -c "user.email=$Email" commit -q -m $Message 2>&1
  $lines.Add("commit exit: " + $LASTEXITCODE + " " + ($r -join ' '))
  $lines.Add("log: " + ((git log --oneline -n 3 --format='%h %an <%ae> %s') -join ' || '))
  $lines.Add("tracked files: " + @(git ls-files).Count)
}
$lines.Add("status lines after: " + @(git status --porcelain).Count)

$gh = Get-Command gh -ErrorAction SilentlyContinue
$lines.Add("gh cli: " + $(if ($gh) { (gh --version | Select-Object -First 1) } else { "not installed" }))

$lines | Set-Content -LiteralPath $out -Encoding UTF8
