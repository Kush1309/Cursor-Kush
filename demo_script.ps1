## Demo script (PowerShell) — run from repository root

# 1) Start services with Docker Compose
docker-compose up --build -d

# 2) Show running containers
docker-compose ps

# 3) Health checks
Write-Host "Executor health:"; Invoke-RestMethod http://localhost:4000/health
Write-Host "Main app health:"; Invoke-RestMethod http://localhost:3001/health

# 4) Execute a sample command on executor
$body = @{ command = 'echo hello from executor' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/execute -Body $body -ContentType 'application/json'

# 5) Tail logs (runs until Ctrl+C)
Write-Host "Tailing compose logs (Ctrl+C to stop)" 
docker-compose logs -f ai-agent executor
