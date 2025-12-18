Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Sobe o stack de desenvolvimento padrão (docker-compose.yml)
Write-Host 'Subindo stack DEV...'
docker compose up -d --build

Write-Host 'OK: DEV no ar.'
