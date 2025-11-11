# PowerShell script to collect logs for EPIC-01-STOR-01
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/epic01-collect-logs.ps1
param()

$ExpectedRoot = "d:\VSProj\OpenHands"
if ((Get-Location).Path -ne $ExpectedRoot) {
  Write-Output "Changing to expected workspace: $ExpectedRoot"
  try { Set-Location $ExpectedRoot } catch { Write-Error "Failed to set location to $ExpectedRoot"; exit 2 }
}

$LogsDir = "logs/EPIC-01"
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

$Branch = "epic-01/llm-key-dup-backend"
try {
  $exists = git rev-parse --verify $Branch 2>$null
  if ($LASTEXITCODE -ne 0) { git checkout -b $Branch } else { git checkout $Branch }
} catch {
  Write-Output "Git checkout failed; continuing without branch change."
}

Write-Output "Starting docker compose..."
docker compose up -d
Start-Sleep -Seconds 6

Write-Output "Capturing compose logs..."
docker compose logs --no-color --tail 500 openhands > "$LogsDir/compose-openhands.log"

Write-Output "Resolving openhands container id..."
$cid = docker compose ps -q openhands 2>$null
if ($cid) {
  Write-Output "Found container id: $cid"
  docker exec $cid printenv > "$LogsDir/container-env-full.txt"
  # capture lines matching LLM_API_KEY
  Select-String -Path "$LogsDir/container-env-full.txt" -Pattern 'LLM_API_KEY' | Out-File "$LogsDir/container-env.txt"
  # capture settings.json if present in container
  Write-Output "Checking for /root/.openhands-state/settings.json in container..."
  $settings = docker exec $cid sh -c 'if [ -f "/root/.openhands-state/settings.json" ]; then cat /root/.openhands-state/settings.json; fi' 2>$null
  if ($settings) { $settings | Out-File "$LogsDir/settings.json" } else { Write-Output "No settings.json found in container." | Out-File "$LogsDir/settings.json" }
} else {
  Write-Output "No running 'openhands' container found." | Out-File "$LogsDir/container-env-full.txt"
}

# Save PowerShell history and timestamp
Get-History | Out-File "$LogsDir/commands.txt"
Get-Date -Format o | Out-File "$LogsDir/timestamp.txt"

# Redact common API key patterns from collected files
$patterns = @(
  'nvapi-[A-Za-z0-9\-_]+',
  'sk-[A-Za-z0-9\-_]+',
  'ghp_[A-Za-z0-9\-_]+',
  '(?<=Bearer\s)\S+'
)

$filesToSanitize = @("$LogsDir/compose-openhands.log", "$LogsDir/container-env-full.txt", "$LogsDir/settings.json")
foreach ($f in $filesToSanitize) {
  if (Test-Path $f) {
    $text = Get-Content $f -Raw
    foreach ($p in $patterns) { $text = [regex]::Replace($text, $p, 'REDACTED') }
    Set-Content -Path $f -Value $text
  }
}

# Also create a redacted copy of container-env-full for safe checking
if (Test-Path "$LogsDir/container-env-full.txt") {
  Copy-Item "$LogsDir/container-env-full.txt" "$LogsDir/container-env-full-redacted.txt" -Force
}

# Summarize artifacts
Write-Output "Artifacts produced:"
Get-ChildItem -Path $LogsDir | ForEach-Object { Write-Output (" - " + $_.Name) }
Write-Output "EPIC-01 collection script completed."
exit 0