# Runs every site test: static contracts, copy parity, and headless-Chrome
# behaviour tests served over http://localhost:4174 (no Node needed).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tests\run.ps1
param(
  [int]$Port = 4174,
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$results = New-Object System.Collections.Generic.List[object]

function Add-Result([string]$suite, [bool]$ok, [string]$note = '') {
  $results.Add([pscustomobject]@{ Suite = $suite; Ok = $ok; Note = $note })
}

function Invoke-Suite([string]$suite, [string]$script) {
  Write-Output "== $suite"
  $output = & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot $script) -Root $root
  $code = $LASTEXITCODE
  $output | ForEach-Object { Write-Output "  $_" }
  Add-Result $suite ($code -eq 0) ($output | Select-Object -Last 1)
}

Invoke-Suite 'static-check' 'static-check.ps1'
Invoke-Suite 'copy-parity' 'copy-parity.ps1'

# ---- static file server (background job) --------------------------------------
$server = Start-Job -ArgumentList $root, $Port -ScriptBlock {
  param($root, $port)
  $types = @{ '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8';
              '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp';
              '.webm' = 'video/webm'; '.mp4' = 'video/mp4'; '.json' = 'application/json'; '.ttf' = 'font/ttf'; '.woff2' = 'font/woff2' }
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
      $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
      if ($full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
        $ctx.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
        $ctx.Response.Headers.Add('Cache-Control', 'no-store')
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $ctx.Response.StatusCode = 404
      }
    } catch {
      $ctx.Response.StatusCode = 500
    } finally {
      $ctx.Response.Close()
    }
  }
}

$base = "http://localhost:$Port"
$ready = $false
for ($i = 0; $i -lt 40 -and -not $ready; $i++) {
  try { $null = Invoke-WebRequest -UseBasicParsing -Uri "$base/tests/harness.js" -TimeoutSec 2; $ready = $true }
  catch { Start-Sleep -Milliseconds 250 }
}

$profileDir = Join-Path ([System.IO.Path]::GetTempPath()) ("site-tests-chrome-" + [guid]::NewGuid().ToString('N'))
try {
  if (-not $ready) {
    Receive-Job $server -ErrorAction SilentlyContinue | Out-Null
    Add-Result 'browser' $false "server did not start on port $Port"
  } elseif (-not (Test-Path -LiteralPath $Chrome)) {
    Add-Result 'browser' $false "Chrome not found at $Chrome"
  } else {
    foreach ($test in @('viewer', 'welcome', 'redirects')) {
      Write-Output "== $test.test.html"
      $dump = Join-Path $profileDir "$test.dom.html"
      New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
      $chromeArgs = @('--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
                "--user-data-dir=`"$profileDir\profile`"", '--virtual-time-budget=10000', '--dump-dom',
                "$base/tests/$test.test.html")
      $proc = Start-Process -FilePath $Chrome -ArgumentList $chromeArgs -RedirectStandardOutput $dump `
                -RedirectStandardError (Join-Path $profileDir "$test.err.txt") -NoNewWindow -PassThru
      if (-not $proc.WaitForExit(60000)) { $proc.Kill(); Add-Result "$test.test.html" $false 'chrome timed out'; continue }
      # Chrome's helper processes inherit the stdout handle and release it a moment
      # after the main process exits; retry until the dump file can be read.
      $raw = $null
      for ($try = 0; $try -lt 120 -and $null -eq $raw; $try++) {
        try { $raw = [System.IO.File]::ReadAllText($dump, [System.Text.Encoding]::UTF8) }
        catch [System.IO.IOException] { Start-Sleep -Milliseconds 250 }
      }
      if ($null -eq $raw) { Add-Result "$test.test.html" $false 'could not read chrome output'; continue }
      $text = [System.Net.WebUtility]::HtmlDecode($raw)
      # The first result shares a line with the <pre> tag in the dumped DOM.
      $lines = @([regex]::Matches($text, '(?m)(?:^|>)((?:PASS|FAIL|DONE) [^\r\n<]*)') | ForEach-Object { $_.Groups[1].Value })
      $lines | ForEach-Object { Write-Output "  $_" }
      $failCount = @($lines | Where-Object { $_ -like 'FAIL *' }).Count
      $passCount = @($lines | Where-Object { $_ -like 'PASS *' }).Count
      $done = @($lines | Where-Object { $_ -like 'DONE *' }).Count -gt 0
      if (-not $done) { Write-Output '  FAIL test page never reported DONE (timeout or script error)' }
      Add-Result "$test.test.html" ($done -and $failCount -eq 0) "$passCount passed, $failCount failed"
    }
  }
} finally {
  Stop-Job $server -ErrorAction SilentlyContinue
  Remove-Job $server -Force -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force -LiteralPath $profileDir -ErrorAction SilentlyContinue
}

Write-Output ''
Write-Output '== Summary'
foreach ($r in $results) { Write-Output ("  {0,-4} {1,-20} {2}" -f ($(if ($r.Ok) { 'PASS' } else { 'FAIL' })), $r.Suite, $r.Note) }
$failed = @($results | Where-Object { -not $_.Ok }).Count
Write-Output ("  {0} of {1} suites passed" -f ($results.Count - $failed), $results.Count)
if ($failed -gt 0) { exit 1 } else { exit 0 }
