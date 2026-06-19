<#
  deploy.ps1 — Deploy the JHB static website to Hostinger over FTP.

  Why FTP (not the File Manager): Hostinger's web File Manager proved
  unreliable on this account (500/503 on extract, 403 session errors).
  FTP straight to the webroot is the dependable path.

  KEY FACTS baked in below:
    * The FTP account's root (/) IS public_html for this account, so files
      go to the root — do NOT prefix paths with "public_html/".
    * curl needs -g (globoff) so Next.js dynamic-route folders like
      [slug] upload literally instead of being treated as URL globs.
    * .htaccess lives in this deploy/ folder, not in out/.

  USAGE (run from anywhere; paths resolve relative to this script):
    pwsh ./deploy.ps1            # upload the existing apps/website/out
    pwsh ./deploy.ps1 -Build     # run the production build first, then upload

  PASSWORD: set $env:FTP_PASS before running, or you'll be prompted.
            (Get/reset it in hPanel -> Files -> FTP Accounts.)
#>
param(
  [switch]$Build
)

$ErrorActionPreference = "Stop"

# --- config ---
$ftpHost    = "92.249.46.14"
$ftpUser    = "u911792192.jhbautomations.com"
$remoteBase = "ftp://$ftpHost/"          # root == public_html for this account

# --- locate repo paths relative to this script ---
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path   # apps/website/deploy
$websiteDir = Split-Path -Parent $scriptDir                     # apps/website
$outDir     = Join-Path $websiteDir "out"
$htaccess   = Join-Path $scriptDir ".htaccess"

# --- optional production build ---
if ($Build) {
  Write-Host "Building website (next build)..." -ForegroundColor Cyan
  Push-Location $websiteDir
  try { npm run build } finally { Pop-Location }
}

if (-not (Test-Path $outDir))   { throw "Build output missing: $outDir  (run with -Build, or 'npm run build:website')" }
if (-not (Test-Path $htaccess)) { throw ".htaccess missing: $htaccess" }

# --- password ---
$pass = $env:FTP_PASS
if (-not $pass) { $pass = Read-Host "FTP password for $ftpUser" }
$cred = "${ftpUser}:${pass}"

# --- upload every file in out/ to the webroot ---
$bs = [char]92; $fw = [char]47
$files = Get-ChildItem $outDir -Recurse -Force -File
$ok = 0; $fail = 0; $failed = @()
Write-Host "Uploading $($files.Count) files to $ftpHost ..." -ForegroundColor Cyan
foreach ($file in $files) {
  $rel = $file.FullName.Substring($outDir.Length + 1).Replace($bs, $fw)
  $url = "$remoteBase$rel"
  $null = curl.exe -s -S -g --connect-timeout 30 --ftp-create-dirs -u $cred -T $file.FullName $url
  if ($LASTEXITCODE -eq 0) { $ok++ } else { $fail++; $failed += "exit $LASTEXITCODE : $rel" }
}

# --- .htaccess (lives in deploy/, not out/) ---
$null = curl.exe -s -S -g --connect-timeout 30 -u $cred -T $htaccess "${remoteBase}.htaccess"
$htok = ($LASTEXITCODE -eq 0)

# --- report ---
Write-Host "------------------------------------" -ForegroundColor DarkGray
Write-Host "Uploaded OK : $ok / $($files.Count)"
Write-Host ".htaccess   : $htok"
if ($fail -gt 0) {
  Write-Host "FAILED ($fail):" -ForegroundColor Red
  $failed | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  exit 1
} else {
  Write-Host "DONE - all files uploaded. Check https://jhbautomations.com" -ForegroundColor Green
}
