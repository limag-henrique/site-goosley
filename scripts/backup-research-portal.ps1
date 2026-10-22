param([switch]$Local)
$ErrorActionPreference = 'Stop'
$repository = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $repository '.research-portal-backups'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fffffff')
$scope = if ($Local) { 'local' } else { 'remote' }
$partial = Join-Path $destination "research-$scope-$stamp.partial.sql"
$complete = Join-Path $destination "research-$scope-$stamp.sql"
Push-Location $repository
try {
    & npx wrangler d1 export goosley-prod "--$scope" --table research_portal_events --table research_portal_lyrics --output $partial --skip-confirmation
    if ($LASTEXITCODE -ne 0) { throw 'Falha no backup. Arquivo parcial nao deve ser usado para restauracao.' }
    if (!(Test-Path -LiteralPath $partial) -or (Get-Item -LiteralPath $partial).Length -eq 0) { throw 'Exportacao vazia.' }
    Move-Item -LiteralPath $partial -Destination $complete
    $digest = (Get-FileHash -LiteralPath $complete -Algorithm SHA256).Hash.ToLowerInvariant()
    Set-Content -LiteralPath "$complete.sha256" -Value $digest -Encoding ascii
    Write-Output "Backup concluido: $complete"
    Write-Output "SHA-256: $digest"
} finally { Pop-Location }
