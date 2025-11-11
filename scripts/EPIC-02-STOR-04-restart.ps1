# PowerShell script to restart OpenHands and verify NVIDIA NIM integration (EPIC-02-STOR-04)
param()

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir = "logs/EPIC-02-STOR-04"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logFile = Join-Path $logDir ("restart-$timestamp.log")

# Load NVIDIA_NIM_API_KEY from local .env (do not commit .env)
if (Test-Path .env) {
  Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim()
      if ($k -eq 'NVIDIA_NIM_API_KEY') { $env:NVIDIA_NIM_API_KEY = $v }
    }
  }
} else {
  "Warning: .env not found in current directory" | Tee-Object -FilePath $logFile
}

"Timestamp: $(Get-Date -Format o)" | Tee-Object -FilePath $logFile

if (-not $env:NVIDIA_NIM_API_KEY) {
  "ERROR: NVIDIA_NIM_API_KEY not set in session. Aborting." | Tee-Object -FilePath $logFile
  exit 1
} else {
  "NVIDIA_NIM_API_KEY is set in session (value will be redacted in docs)" | Tee-Object -FilePath $logFile
}

"Running: docker compose down" | Tee-Object -FilePath $logFile -Append
docker compose down 2>&1 | Tee-Object -FilePath $logFile -Append

"Running: docker compose up -d" | Tee-Object -FilePath $logFile -Append
docker compose up -d 2>&1 | Tee-Object -FilePath $logFile -Append

Start-Sleep -Seconds 5

"Capturing docker compose logs (tail 500) for openhands" | Tee-Object -FilePath $logFile -Append
docker compose logs --no-color --tail 500 openhands 2>&1 | Tee-Object -FilePath $logFile -Append

"Printing env vars inside container (LLM_API_KEY and NVIDIA_NIM_API_KEY)" | Tee-Object -FilePath $logFile -Append
docker compose exec openhands printenv 2>&1 | Select-String 'NVIDIA_NIM_API_KEY|LLM_API_KEY' | Tee-Object -FilePath $logFile -Append

"Running curl test against NVIDIA NIM (response redacted in docs)" | Tee-Object -FilePath $logFile -Append
$curlBody = '{ "model": "qwen/qwen2.5-coder-32b-instruct", "messages":[{"role":"system","content":"You are a coding assistant."},{"role":"user","content":"Write a hello world in Python"}], "temperature":0.2, "max_tokens":200 }'
$authHeader = "Authorization: Bearer $env:NVIDIA_NIM_API_KEY"
curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" -H $authHeader -H "Content-Type: application/json" -d $curlBody 2>&1 | Tee-Object -FilePath $logFile -Append

"Finished at: $(Get-Date -Format o)" | Tee-Object -FilePath $logFile -Append