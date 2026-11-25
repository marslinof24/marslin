# Static contract checks for the root *.html pages (v2.0.0 Ive site).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tests\static-check.ps1
# Exits 1 when any check fails. ASCII only so PowerShell 5.1 parses it without a BOM.
param([string]$Root = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'
$script:failures = 0
$script:passes = 0

function Pass([string]$msg) { $script:passes++ }
function Fail([string]$msg) { $script:failures++; Write-Output "FAIL $msg" }
function Check([bool]$ok, [string]$msg) { if ($ok) { Pass $msg } else { Fail $msg } }

function Read-Text([string]$path) { [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8) }

$contentPages  = @('index.html', 'home.html', 'workspace.html', 'about.html')
$chromePages   = @('home.html', 'workspace.html', 'about.html')   # pages with header nav + footer
$redirectStubs = @('portfolio.html', 'articles.html', 'links.html')
$noindexPages  = $redirectStubs + @('404.html')
$cacheToken    = '?v=2.0.0'

$pages = @(Get-ChildItem -Path $Root -Filter *.html -File | Sort-Object Name)
if ($pages.Count -eq 0) { Fail "no root *.html pages found in $Root"; exit 1 }

# Cache of id sets per page so fragment checks read each file once.
$idCache = @{}
function Get-Ids([string]$file) {
  if (-not $idCache.ContainsKey($file)) {
    $set = New-Object 'System.Collections.Generic.HashSet[string]'
    if (Test-Path -LiteralPath $file) {
      foreach ($m in [regex]::Matches((Read-Text $file), '\sid\s*=\s*"([^"]+)"')) { [void]$set.Add($m.Groups[1].Value) }
    }
    $idCache[$file] = $set
  }
  return , $idCache[$file]   # comma stops PowerShell unrolling the set
}

function Strip-Scripts([string]$html) { [regex]::Replace($html, '(?is)<script\b.*?</script>', '') }

# Resolve one URL reference from $page; returns nothing when the URL is external.
function Test-Reference([string]$page, [string]$url, [bool]$checkFragment) {
  $name = Split-Path -Leaf $page
  if ($url -match '^(?i)(https?:|mailto:|tel:|data:|javascript:)') { return }
  if ($url.StartsWith('//')) { return }
  if ($url.Contains('../')) { Fail "$name uses a '../' path: $url"; return }

  $hash = ''
  $pathPart = $url
  $i = $pathPart.IndexOf('#'); if ($i -ge 0) { $hash = $pathPart.Substring($i + 1); $pathPart = $pathPart.Substring(0, $i) }
  $q = $pathPart.IndexOf('?'); if ($q -ge 0) { $pathPart = $pathPart.Substring(0, $q) }

  if ($pathPart -eq '') {
    $target = $page
  } elseif ($pathPart.StartsWith('/')) {
    if ($name -eq '404.html' -and $pathPart.StartsWith('/marslin/')) {
      $rel = $pathPart.Substring('/marslin/'.Length)
      if ($rel -eq '') { $rel = 'index.html' }
      $target = Join-Path $Root $rel
    } else {
      Fail "$name uses a root-absolute path outside /marslin/ (breaks on GitHub Pages): $url"; return
    }
  } else {
    $target = Join-Path (Split-Path -Parent $page) ([uri]::UnescapeDataString($pathPart))
  }
  if ((Test-Path -LiteralPath $target -PathType Container)) { $target = Join-Path $target 'index.html' }

  if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { Fail "$name references a missing file: $url"; return }
  Pass "$name -> $url"

  if ($checkFragment -and $hash -ne '' -and $target -like '*.html') {
    $ids = Get-Ids $target
    Check ($ids.Contains([uri]::UnescapeDataString($hash))) "$name links to #$hash but $(Split-Path -Leaf $target) has no id=`"$hash`""
  }
}

foreach ($file in $pages) {
  $page = $file.FullName
  $name = $file.Name
  $html = Read-Text $page
  $isStub = $redirectStubs -contains $name
  # For redirect stubs the hash map lives in JS; only the visible markup is link-checked.
  $markup = if ($isStub) { Strip-Scripts $html } else { $html }

  # --- references resolve -------------------------------------------------
  foreach ($m in [regex]::Matches($markup, '(?i)\s(href|src)\s*=\s*"([^"]*)"')) {
    $url = $m.Groups[2].Value.Trim()
    if ($url -eq '' -or $url -eq '#') { continue }
    Test-Reference $page $url $true
  }
  foreach ($m in [regex]::Matches($markup, '(?i)url\(\s*[''"]?([^''")]+)[''"]?\s*\)')) {
    Test-Reference $page $m.Groups[1].Value.Trim() $false
  }
  Check (-not ([regex]::IsMatch($html, '(?i)(href|src|url)\s*[=(]\s*[''"]?\.\./'))) "$name contains a '../' path"

  # --- head basics -----------------------------------------------------------
  $noSvg = [regex]::Replace($html, '(?is)<svg\b.*?</svg>', '')
  Check ([regex]::Matches($noSvg, '(?i)<title[\s>]').Count -eq 1) "$name must have exactly one <title>"
  Check ($html -match '(?i)<html\b[^>]*\slang\s*=\s*"[^"]+"') "$name <html> needs a lang attribute"
  Check ($html -match '(?i)<meta\b[^>]*name\s*=\s*"viewport"') "$name needs a viewport meta"
  Check ($html -match '(?i)<meta\b[^>]*charset\s*=') "$name needs a charset meta"

  foreach ($m in [regex]::Matches($html, '(?is)<img\b[^>]*>')) {
    Check ($m.Value -match '(?i)\salt\s*=') "$name has an <img> without alt: $($m.Value.Substring(0, [Math]::Min(90, $m.Value.Length)))"
  }

  # --- cache token on style.css / viewer.js ----------------------------------
  foreach ($m in [regex]::Matches($html, '(?i)(?:href|src)\s*=\s*"((?:[^"]*/)?(?:style\.css|viewer\.js)[^"]*)"')) {
    $ref = $m.Groups[1].Value
    Check ($ref -match ([regex]::Escape($cacheToken) + '$')) "$name references $ref without $cacheToken"
  }

  # --- robots -----------------------------------------------------------------
  $hasNoindex = $html -match '(?i)noindex'
  if ($contentPages -contains $name) { Check (-not $hasNoindex) "$name must not contain noindex" }
  if ($noindexPages -contains $name) { Check $hasNoindex "$name must contain noindex" }

  # --- redirect stubs -------------------------------------------------------
  if ($isStub) {
    $refresh = [regex]::Match($html, '(?i)<meta\b[^>]*http-equiv\s*=\s*"refresh"[^>]*>')
    Check $refresh.Success "$name needs a meta refresh"
    if ($refresh.Success) {
      $u = [regex]::Match($refresh.Value, '(?i)url\s*=\s*([^"''>\s]+)')
      Check $u.Success "$name meta refresh has no url="
      if ($u.Success) { Test-Reference $page $u.Groups[1].Value $true }
    }
    Check ($html -match '(?i)<link\b[^>]*rel\s*=\s*"canonical"[^>]*href\s*=\s*"https://marslinof24\.github\.io/marslin/') "$name needs a canonical link to the production base"
    $body = [regex]::Match($markup, '(?is)<body\b.*</body>').Value
    Check ($body -match '(?i)<a\b[^>]*href\s*=\s*"[^"#][^"]*"') "$name needs a visible fallback link in <body>"
  }
}

# --- chrome shared by home / workspace / about ---------------------------------
$headers = @{}
foreach ($name in $chromePages) {
  $path = Join-Path $Root $name
  if (-not (Test-Path -LiteralPath $path)) { Fail "$name is missing"; continue }
  $html = Read-Text $path
  Check ($html.Contains('ThisisMarsLin')) "$name must contain the brand text ThisisMarsLin"

  $footer = [regex]::Match($html, '(?is)<footer\b[^>]*\sid\s*=\s*"links"[^>]*>.*?</footer>')
  Check $footer.Success "$name needs <footer id=`"links`">"
  if ($footer.Success) {
    foreach ($site in @('linkedin.com', 'github.com', 'instagram.com')) {
      Check ($footer.Value -match ('(?i)href\s*=\s*"https://(www\.)?' + [regex]::Escape($site) + '/')) "$name footer #links needs a $site href"
    }
  }

  $header = [regex]::Match($html, '(?is)<header\b.*?</header>')
  Check $header.Success "$name needs a site <header>"
  if ($header.Success) {
    $nav = [regex]::Replace($header.Value, '\s+aria-current\s*=\s*"[^"]*"', '')
    $headers[$name] = [regex]::Replace($nav, '\s+', ' ')
  }
}
if ($headers.Count -gt 1) {
  $ref = $headers['home.html']
  foreach ($name in $headers.Keys) {
    if ($null -ne $ref -and $headers[$name] -ne $ref) { Fail "$name header markup differs from home.html (ignoring aria-current)" } else { Pass "header $name" }
  }
  foreach ($name in $chromePages) {
    $path = Join-Path $Root $name
    if (Test-Path -LiteralPath $path) {
      $h = [regex]::Match((Read-Text $path), '(?is)<header\b.*?</header>').Value
      $current = [regex]::Match($h, '(?i)<a\b[^>]*aria-current\s*=\s*"page"[^>]*>')
      Check ($current.Success -and $current.Value -match ('href\s*=\s*"' + [regex]::Escape($name) + '"')) "$name header should mark its own link aria-current=`"page`""
    }
  }
}

Write-Output ("static-check: {0} passed, {1} failed" -f $script:passes, $script:failures)
if ($script:failures -gt 0) { exit 1 } else { exit 0 }
