# Copy is frozen: the visible text of the production pages must match the approved
# baseline in tests/copy-baseline/. Markup may change; words may not.
# After an approved copy change, refresh the baseline with -Update and review the diff.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tests\copy-parity.ps1 [-Update]
param([string]$Root = (Split-Path -Parent $PSScriptRoot), [switch]$Update)

$ErrorActionPreference = 'Stop'
$baseline = Join-Path $PSScriptRoot 'copy-baseline'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Read-Text([string]$path) { [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8) }

# Visible text as a list of text runs: every tag acts as a separator, so the
# comparison is insensitive to attributes, class names and asset paths.
# The first run is the page <title>, which is visible in the tab.
function Get-VisibleText([string]$html) {
  $title = [regex]::Match($html, '(?is)<title>(.*?)</title>').Groups[1].Value.Trim()
  $t = [regex]::Replace($html, '(?is)<!--.*?-->', ' ')
  $t = [regex]::Replace($t, '(?is)<(script|style|template|noscript)\b.*?</\1\s*>', ' ')
  $t = [regex]::Replace($t, '(?is)<head\b.*?</head\s*>', ' ')
  $t = [regex]::Replace($t, '(?s)<[^>]*>', "`n")
  $t = [System.Net.WebUtility]::HtmlDecode($t)
  $t = $t.Replace([char]0x00A0, ' ')
  $lines = foreach ($line in $t -split "`n") {
    $c = ([regex]::Replace($line, '\s+', ' ')).Trim()
    if ($c -ne '') { $c }
  }
  $all = @("title: $([System.Net.WebUtility]::HtmlDecode($title))") + @($lines)
  return , $all
}

if ($Update -and -not (Test-Path -LiteralPath $baseline)) { New-Item -ItemType Directory -Path $baseline | Out-Null }

$failed = 0
foreach ($name in @('index.html', 'home.html', 'workspace.html', 'about.html')) {
  $page = Join-Path $Root $name
  $snap = Join-Path $baseline ([IO.Path]::ChangeExtension($name, '.txt'))
  if (-not (Test-Path -LiteralPath $page)) { Write-Output "FAIL $name missing at root"; $failed++; continue }
  $after = Get-VisibleText (Read-Text $page)

  if ($Update) {
    [System.IO.File]::WriteAllText($snap, (($after -join "`n") + "`n"), $utf8)
    Write-Output "UPDATED $name ($($after.Count) text runs)"
    continue
  }
  if (-not (Test-Path -LiteralPath $snap)) { Write-Output "FAIL $name has no baseline (run with -Update)"; $failed++; continue }

  $before = @((Read-Text $snap) -split "`n" | Where-Object { $_ -ne '' })
  $diff = @(Compare-Object -ReferenceObject $before -DifferenceObject $after -SyncWindow 1000 -CaseSensitive)
  if ($diff.Count -eq 0 -and (($before -join "`n") -ceq ($after -join "`n"))) {
    Write-Output "PASS $name ($($before.Count) text runs)"
  } else {
    $failed++
    Write-Output "FAIL $name visible text differs from tests/copy-baseline"
    foreach ($d in $diff) {
      $side = if ($d.SideIndicator -eq '<=') { '- baseline' } else { '+ page    ' }
      Write-Output "  $side | $($d.InputObject)"
    }
    if ($diff.Count -eq 0) { Write-Output '  same text runs, different order' }
  }
}

if ($failed -gt 0) { Write-Output "copy-parity: $failed page(s) differ"; exit 1 }
Write-Output 'copy-parity: all pages match'
exit 0
