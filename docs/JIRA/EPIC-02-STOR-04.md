# EPIC-02-STOR-04 — Integration & Test

JIRA: EPIC-02-STOR-04

Objective
- Implement and run tests to verify NVIDIA NIM integration:
  - Curl test against NVIDIA endpoint using env-provided key.
  - Start OpenHands locally and confirm LLM settings reflect NVIDIA NIM.

PowerShell curl test (manual)
1. Create local `.env` (do NOT commit):
   - Set-Content -Path .env -Value "NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxx"
2. Load env value into session (PowerShell):
   - $env:NVIDIA_NIM_API_KEY = (Get-Content .env | Select-String 'NVIDIA_NIM_API_KEY' | ForEach-Object { $_.ToString().Split('=')[1].Trim() })
3. Run curl against NVIDIA NIM (PowerShell / curl available in Windows):
   - curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" `
     -H "Authorization: Bearer $env:NVIDIA_NIM_API_KEY" `
     -H "Content-Type: application/json" `
     -d '{ "model": "qwen/qwen2.5-coder-32b-instruct", "messages": [{"role":"system","content":"You are a coding assistant."},{"role":"user","content":"Write a hello world in Python"}], "temperature": 0.2, "max_tokens": 200 }'

Expected result
- HTTP 200 with JSON response containing model output (e.g., Python hello world). Redact API key when saving logs.

OpenHands end-to-end test (Docker)
1. Ensure local `.env` contains `NVIDIA_NIM_API_KEY`.
2. Start services:
   - docker compose up -d
3. Check OpenHands logs:
   - docker compose logs -f openhands
   - Look for startup lines and LLM initialization logs.
4. Verify in UI:
   - Open http://localhost:3000
   - Settings → LLM tab: confirm Base URL = `https://integrate.api.nvidia.com/v1`, Custom Model = `openai/qwen2.5-coder-32b-instruct`, API Key field shows asterisks (masked).
5. Run a simple task in UI or via API to generate code:
   - Use the PowerShell API test from `docs/JIRA/EPIC-02.md`:
     - $body = @{ task = "Write a Python function that prints Hello World" } | ConvertTo-Json
     - Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Method Post -Body $body -ContentType "application/json"

Verification artifacts to record (redact keys)
- Curl output JSON (replace any occurrence of `nvapi-...` with `nvapi-****`).
- docker compose logs excerpt showing LLM base_url/model initialization (redact keys).
- Screenshot or exported HTML snippet of Settings → LLM showing masked API key and Base URL/model.

Commit message suggestion
- "EPIC-02-STOR-04: Add integration & test instructions for NVIDIA NIM (curl test, Docker verification)"

Files referenced
- [`docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md`](docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md:401)
- [`docs/JIRA/EPIC-02.md`](docs/JIRA/EPIC-02.md:1)
