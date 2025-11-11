# EPIC-02-STOR-05 — Docs & JIRA: Record changes and verification

JIRA: EPIC-02-STOR-05

Objective
- Create and update JIRA docs recording requirements, changes, commands executed, and verification artifacts for EPIC-02.
- Provide final verification checklist and commit message recommendations referencing EPIC-02-STOR-0X.

Summary of work completed
- Config updated to use NVIDIA NIM:
  - [`config/config.toml`](config/config.toml:13) — [llm] now set to NVIDIA defaults: model = "openai/qwen2.5-coder-32b-instruct", base_url = "https://integrate.api.nvidia.com/v1", api_key_env = "NVIDIA_NIM_API_KEY", custom_llm_provider = "openai".
- Docker compose updated to pass runtime env:
  - [`docker-compose.yml`](docker-compose.yml:1) — openhands service environment now maps `LLM_API_KEY=${NVIDIA_NIM_API_KEY}`, sets `LLM_BASE_URL` and model.
- Environment guidance:
  - [`.env.example`](.env.example:1) — contains `NVIDIA_NIM_API_KEY` example and PowerShell usage notes.
- JIRA docs added/updated:
  - [`docs/JIRA/EPIC-02.md`](docs/JIRA/EPIC-02.md:1)
  - [`docs/JIRA/EPIC-02-STOR-01.md`](docs/JIRA/EPIC-02-STOR-01.md:1)
  - [`docs/JIRA/EPIC-02-STOR-02.md`](docs/JIRA/EPIC-02-STOR-02.md:1)
  - [`docs/JIRA/EPIC-02-STOR-03.md`](docs/JIRA/EPIC-02-STOR-03.md:1)
  - [`docs/JIRA/EPIC-02-STOR-04.md`](docs/JIRA/EPIC-02-STOR-04.md:1)
  - This file: [`docs/JIRA/EPIC-02-STOR-05.md`](docs/JIRA/EPIC-02-STOR-05.md:1)

Commands & verification (PowerShell snippets for local execution)
- Create local .env (example — do NOT commit):
  - Set-Content -Path .env -Value "NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxx"
- Load env in current PS session:
  - $env:NVIDIA_NIM_API_KEY = (Get-Content .env | Select-String 'NVIDIA_NIM_API_KEY' | ForEach-Object { $_.ToString().Split('=')[1].Trim() })
- Curl test against NVIDIA NIM:
  - curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" `
    -H "Authorization: Bearer $env:NVIDIA_NIM_API_KEY" `
    -H "Content-Type: application/json" `
    -d '{ "model": "qwen/qwen2.5-coder-32b-instruct", "messages":[{"role":"system","content":"You are a coding assistant."},{"role":"user","content":"Write a hello world in Python"}], "temperature":0.2, "max_tokens":200 }'
- Start OpenHands (Docker Compose):
  - docker compose up -d
  - docker compose logs -f openhands
- Confirm env inside container:
  - docker compose exec openhands printenv | Select-String LLM_API_KEY
- Test OpenHands API task (PowerShell):
  - $body = @{ task = "Write a Python function that prints Hello World" } | ConvertTo-Json
  - Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Method Post -Body $body -ContentType "application/json"

Verification artifacts to capture (redact keys)
- Curl output JSON (replace `nvapi-...` with `nvapi-****`) — save to `docs/JIRA/EPIC-02/verification-curl-output.txt` (local).
- Docker logs excerpt showing LLM initialization (redact keys).
- Screenshot of Settings → LLM showing Base URL & Model and masked API key (asterisks).

Commit messages
- Use explicit JIRA refs per change:
  - "EPIC-02-STOR-01: Read NVIDIA_NIM_API_KEY from .env; expose as LLM_API_KEY in Docker"
  - "EPIC-02-STOR-02: Configure config/config.toml for NVIDIA NIM (model, base_url, api_key_env, custom_llm_provider)"
  - "EPIC-02-STOR-03: Docker-compose map NVIDIA_NIM_API_KEY -> LLM_API_KEY for OpenHands runtime"
  - "EPIC-02-STOR-04: Add integration & test instructions for NVIDIA NIM (curl test, Docker verification)"
  - "EPIC-02-STOR-05: Add JIRA docs and verification checklist for EPIC-02"

Notes and caveats
- UI settings in Docker/web mode may override environment/config. If a previous UI setting exists, remove `~/.openhands-state/settings.json` on the host to force env/config precedence.
- This work does NOT commit any real API keys. `.env.example` is intentionally placeholder-only.
- The local developer must run the PowerShell curl test and docker commands on their Windows machine (this agent did not execute the commands against live endpoints).

Next steps (manual)
- Run the PowerShell curl test and collect JSON output (redact) into the JIRA story `EPIC-02-STOR-04`.
- Start OpenHands, confirm settings in UI, and capture verification artifacts as described.
- Commit changes with the messages above and push to remote.

Last updated: 2025-11-11