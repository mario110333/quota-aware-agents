[CmdletBinding()]
param([string]$DestinationRoot = (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.agents/skills'))
$ErrorActionPreference = 'Stop'
$sourceRoot = Join-Path $PSScriptRoot 'quota-aware-agents'
$files = @('SKILL.md', 'agents/openai.yaml', 'references/model-routing.md', 'references/cost-model.md', 'scripts/summarize-usage.mjs', 'LICENSE')
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'checksums.json') -Raw | ConvertFrom-Json
foreach ($relative in $files) {
    $expected = $manifest.files | Where-Object { $_.path -eq $relative }
    if (@($expected).Count -ne 1 -or (Get-FileHash -LiteralPath (Join-Path $sourceRoot $relative) -Algorithm SHA256).Hash -ne $expected.sha256) {
        throw "Package integrity check failed: $relative"
    }
}
$destinationBase = [IO.Path]::GetFullPath($DestinationRoot)
$destination = Join-Path $destinationBase 'quota-aware-agents'
if (Test-Path -LiteralPath $destination) { throw "Already installed: $destination. Back up and move the existing folder before installing this package." }
New-Item -ItemType Directory -Force -Path $destinationBase | Out-Null
$staging = Join-Path $destinationBase ('.quota-aware-agents.install-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null
try {
    foreach ($relative in $files) {
        $target = Join-Path $staging $relative
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
        Copy-Item -LiteralPath (Join-Path $sourceRoot $relative) -Destination $target
        $expected = $manifest.files | Where-Object { $_.path -eq $relative }
        if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $expected.sha256) { throw "Copy verification failed: $relative" }
    }
    $resolvedBase = (Resolve-Path -LiteralPath $destinationBase).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
    $resolvedStaging = (Resolve-Path -LiteralPath $staging).Path
    if (-not $resolvedStaging.StartsWith($resolvedBase + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid staging location' }
    if (Test-Path -LiteralPath $destination) { throw 'Destination appeared during installation; nothing overwritten.' }
    Move-Item -LiteralPath $resolvedStaging -Destination $destination
    Write-Output "Installed and verified: $destination"
    Write-Output 'Ask Codex to use $quota-aware-agents. If it is not listed, restart Codex.'
} finally {
    if (Test-Path -LiteralPath $staging) {
        $resolvedStaging = (Resolve-Path -LiteralPath $staging).Path
        $resolvedBase = (Resolve-Path -LiteralPath $destinationBase).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
        if ($resolvedStaging.StartsWith($resolvedBase + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolvedStaging -Recurse -Force
        }
    }
}
