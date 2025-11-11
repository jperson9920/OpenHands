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

---
## Automated run (executed by scripts/EPIC-02-STOR-04-restart.ps1)

Run timestamp: 2025-11-10T20:09:48-08:00 (local dev machine timezone)

Commands executed (host PowerShell)
- Sourced local `.env` into session and set $env:NVIDIA_NIM_API_KEY
- docker compose down
- docker compose up -d
- docker compose logs --no-color --tail 500 openhands
- docker compose exec openhands printenv | Select-String 'NVIDIA_NIM_API_KEY|LLM_API_KEY'
- Attempted curl POST to `https://integrate.api.nvidia.com/v1/chat/completions` using the session env key

Saved logs path: logs/EPIC-02-STOR-04/restart-20251110-200948.log

Key log excerpts (redacted)
- docker compose lifecycle
  - Container openhands-dashboard  Stopped
  - Container openhands-main  Stopped
  - Container openhands-main  Removed
  - Network openhands_openhands-network  Removed
  - Network openhands_openhands-network  Created
  - Container openhands-main  Created
  - Container openhands-main  Started
  - Container openhands-dashboard  Started

- OpenHands startup
  - openhands-main  | Starting OpenHands...
  - openhands-main  | Running OpenHands as root

- Environment inside container (redacted)
  - LLM_API_KEY=nvapi-REDACTED

- Curl test attempt output (captured)
  - Invoke-WebRequest : Cannot bind parameter 'Headers'. Cannot convert the "Authorization: Bearer nvapi-REDACTED" value of type "System.String" to type "System.Collections.IDictionary".
    At scripts/EPIC-02-STOR-04-restart.ps1:48 char:72
    + ... /integrate.api.nvidia.com/v1/chat/completions" -H $authHeader -H "Con ...
    +                                                       ~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [Invoke-WebRequest], ParameterBindingException
    + FullyQualifiedErrorId : CannotConvertArgumentNoMessage,Microsoft.PowerShell.Commands.InvokeWebRequestCommand

Observations and next actions
- OpenHands successfully restarted and container reports starting. The runtime env var LLM_API_KEY is present inside the container (value redacted above).
- The automated curl test failed due to PowerShell binding: the script attempted to pass the Authorization header as a single string to the PowerShell HTTP helper, which expects a header hashtable or raw curl.exe usage. This is why the request did not complete.
- UI verification (Settings → LLM) has not yet been captured. Verify manually at http://localhost:3000 or inspect `~/.openhands-state/settings.json` to confirm settings precedence and whether the API key is masked.

Suggested fixes to complete verification
- Rerun the test using one of:
  - curl.exe (full binary) with -H "Authorization: Bearer $env:NVIDIA_NIM_API_KEY" (preferred on Windows if curl.exe is available)
  - Invoke-RestMethod -Uri ... -Method Post -Headers @{ Authorization = "Bearer $env:NVIDIA_NIM_API_KEY"; "Content-Type" = "application/json" } -Body $body
- After a successful curl, capture the response JSON, redact the nvapi- value, and append to this JIRA story.
- Capture a screenshot or exported HTML snippet of Settings → LLM showing Base URL = https://integrate.api.nvidia.com/v1, Model = openai/qwen2.5-coder-32b-instruct, and masked API key.

Status (current)
- [x] OpenHands restarted (completed)
- [x] LLM env var present in container (completed, redacted)
- [ ] Curl test to NVIDIA NIM (attempted; failed due to JSON/header issues)
- [ ] UI Settings verification (pending)

Logs & test outputs (redacted)
- Container env check (redacted):
  - LLM_API_KEY=nvapi-REDACTED

- PowerShell curl attempt (error):
  - Invoke-WebRequest / Invoke-RestMethod binding error when passing headers as a single string. Recommended fix: use -Headers @{ Authorization = "Bearer $env:NVIDIA_NIM_API_KEY"; "Content-Type" = "application/json" } or curl.exe.

- Container curl attempt (error):
  - failed to decode json body: json: string unexpected end of JSON input
  - Follow-up attempt produced garbled/partial input, indicating quoting/encoding issues when passing JSON through sh -c on Windows host.

Next steps to complete verification
1. Run host-level curl.exe with a JSON file to avoid quoting issues:
   - Save payload to request.json and run:
     - curl.exe -v -X POST "https://integrate.api.nvidia.com/v1/chat/completions" -H "Authorization: Bearer nvapi-****" -H "Content-Type: application/json" --data-binary @request.json
2. Or run a clean container exec with here-doc to avoid Windows quoting:
   - docker compose exec openhands sh -lc "cat > /tmp/request.json <<'EOF'
     {\"model\":\"qwen/qwen2.5-coder-32b-instruct\",\"messages\":[{\"role\":\"system\",\"content\":\"You are a coding assistant.\"},{\"role\":\"user\",\"content\":\"Write a hello world in Python\"}],\"temperature\":0.2,\"max_tokens\":200}
     EOF
     curl -s -X POST 'https://integrate.api.nvidia.com/v1/chat/completions' -H \"Authorization: Bearer \$LLM_API_KEY\" -H 'Content-Type: application/json' --data-binary @/tmp/request.json
   - This avoids shell quoting problems.

3. Capture the successful JSON response, redact nvapi- value, and append to this JIRA story.

Commit guidance
- "EPIC-02-STOR-04: restart server and partial verification — logs added; curl test pending (see next steps)"

Commit guidance
- When ready to record these artifacts to the repo, commit changes with:
  - "EPIC-02-STOR-04: restart server and verify NVIDIA NIM integration — logs added to JIRA"

Files referenced
- [`docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md`](docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md:401)
- [`docs/JIRA/EPIC-02.md`](docs/JIRA/EPIC-02.md:1)
