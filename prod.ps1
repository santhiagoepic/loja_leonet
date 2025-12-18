Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Sobe o stack usando docker-compose.prod.yml
Write-Host 'Parando stack DEV (se existir)...'
docker compose down

Write-Host 'Subindo stack PROD...'
docker compose -f docker-compose.prod.yml up -d --build

Write-Host 'OK: PROD no ar.'
