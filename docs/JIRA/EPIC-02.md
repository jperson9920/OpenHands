# EPIC-02 — NVIDIA NIM (OpenHands LLM) Integration

JIRA: EPIC-02

Objective
- Configure OpenHands to use NVIDIA NIM (integrate.api.nvidia.com/v1) as the LLM provider, sourcing the API key from the project .env variable named NVIDIA_NIM_API_KEY.

Related story files
- [`docs/JIRA/EPIC-02-STOR-01.md`](docs/JIRA/EPIC-02-STOR-01.md:1)
- [`docs/JIRA/EPIC-02-STOR-02.md`](docs/JIRA/EPIC-02-STOR-02.md:1)
- [`docs/JIRA/EPIC-02-STOR-03.md`](docs/JIRA/EPIC-02-STOR-03.md:1)
- [`docs/JIRA/EPIC-02-STOR-04.md`](docs/JIRA/EPIC-02-STOR-04.md:1)
- [`docs/JIRA/EPIC-02-STOR-05.md`](docs/JIRA/EPIC-02-STOR-05.md:1)

Acceptance criteria
- config/config.toml uses `api_key_env = "NVIDIA_NIM_API_KEY"` (or equivalent env-driven mapping) and `base_url = "https://integrate.api.nvidia.com/v1"`.
- `.env.example` contains `NVIDIA_NIM_API_KEY` (no real secrets committed).
- Docker (docker-compose.yml) or docs updated to ensure container runtime receives `NVIDIA_NIM_API_KEY` mapped into OpenHands at runtime (LLM_API_KEY or api_key_env).
- Curl test against NVIDIA endpoint runs successfully using the env-provided key on developer machine.
- OpenHands started locally can call NVIDIA NIM and complete a simple "hello world" code generation request.
- All changes documented in `docs/JIRA/EPIC-02.md` and story files.

Worklog / Commands run
- Updated configuration: [`config/config.toml`](config/config.toml:13)
- Updated compose: [`docker-compose.yml`](docker-compose.yml:1)
- Added environment example: [`.env.example`](.env.example:1)

PowerShell snippets (run locally; do NOT commit your real key)
- Create local .env from example (PowerShell):
  - Set-Content -Path .env -Value "NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxx"
- Run curl test using current env:
  - $env:NVIDIA_NIM_API_KEY = (Get-Content .env | Select-String 'NVIDIA_NIM_API_KEY' | ForEach-Object { $_.ToString().Split('=')[1].Trim() })
  - curl -X POST "https://integrate.api.nvidia.com/v1/chat/completions" -H "Authorization: Bearer $env:NVIDIA_NIM_API_KEY" -H "Content-Type: application/json" -d '{"model":"qwen/qwen2.5-coder-32b-instruct","messages":[{"role":"system","content":"You are a coding assistant."},{"role":"user","content":"Write a hello world in Python"}],"temperature":0.2,"max_tokens":200}'
- Start OpenHands (Docker Compose):
  - docker compose up -d
  - docker compose logs -f openhands

Notes
- UI settings override env and config in Docker/web mode; if the UI has previously saved LLM settings, remove `~/.openhands-state/settings.json` to force env/config precedence.
- Never commit real API keys. Use `.env.example` as guidance and set real keys in a local `.env` or user environment variables.

Verification
- Save curl output (redact key) and paste into corresponding story file under "Verification logs" with `nvapi-****` redaction.
- Take screenshots of Settings → LLM showing Base URL & Model and masked API key asterisks; add images or base64 redacted outputs into the story file.

Files changed
- [`config/config.toml`](config/config.toml:13)
- [`docker-compose.yml`](docker-compose.yml:1)
- [`.env.example`](.env.example:1)

Last updated: 2025-11-11