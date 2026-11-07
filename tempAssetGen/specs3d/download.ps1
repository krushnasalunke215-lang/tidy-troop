# PowerShell port of .kiro/skills/build-mesh/tools/download-glb.js (Node is not installed on this machine).
# Plain GET on a signed asset_url, then a 'glTF' magic check so an error page is never saved as a .glb.
#   powershell -NoProfile -ExecutionPolicy Bypass -File download.ps1 -UrlFile urls.json -OutDir <folder>
# urls.json: { "<Name>": { "glb": "<asset_url>", "preview": "<processed_preview_image_url>" }, ... }
param(
  [Parameter(Mandatory = $true)][string]$UrlFile,
  [Parameter(Mandatory = $true)][string]$OutDir
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$urls = Get-Content -Raw -Encoding UTF8 $UrlFile | ConvertFrom-Json
foreach ($p in $urls.PSObject.Properties) {
  $name = $p.Name
  try {
    $glb = Join-Path $OutDir "$name.glb"
    Invoke-WebRequest -UseBasicParsing -Uri $p.Value.glb -OutFile $glb
    $bytes = [IO.File]::ReadAllBytes($glb)
    $magic = if ($bytes.Length -ge 4) { [Text.Encoding]::ASCII.GetString($bytes, 0, 4) } else { '' }
    if ($magic -ne 'glTF') { Remove-Item $glb; throw "response is not a GLB (magic '$magic', $($bytes.Length) bytes)" }
    $msg = "$name : DOWNLOADED $($bytes.Length) bytes"
    if ($p.Value.preview) {
      Invoke-WebRequest -UseBasicParsing -Uri $p.Value.preview -OutFile (Join-Path $OutDir "$name-preview.png")
      $msg += ' + preview'
    }
    Write-Output $msg
  } catch {
    Write-Output "$name : FAILED $($_.Exception.Message)"
  }
}
