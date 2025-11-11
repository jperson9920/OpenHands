# EPIC-02-STOR-03 — Docker: Pass NVIDIA_NIM_API_KEY into OpenHands container

JIRA: EPIC-02-STOR-03

Objective
- Update Docker / docker-compose environment mappings so containers pass NVIDIA_NIM_API_KEY into the OpenHands service as LLM_API_KEY (or ensure code reads api_key_env).

Changes made
- Edited `docker-compose.yml` to set:
  - LLM_MODEL=openai/qwen2.5-coder-32b-instruct
  - LLM_BASE_URL=https://integrate.api.nvidia.com/v1
  - LLM_API_KEY=${NVIDIA_NIM_API_KEY}
  - LLM_CUSTOM_LLM_PROVIDER=openai

Notes on compose behavior
- Docker Compose substitutes variables from a local `.env` file in the compose directory or from the host environment if present.
- Ensure you create a local `.env` (not committed) or set `NVIDIA_NIM_API_KEY` in Windows environment variables.

PowerShell example: create local .env (do NOT commit)
- Set-Content -Path .env -Value "NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxx"

Verification steps
1. Start services:
   - docker compose up -d
2. Confirm env inside container:
   - docker compose exec openhands printenv | Select-String LLM_API_KEY
3. Confirm OpenHands UI: Settings → LLM shows Base URL & Model and masked API key.
4. Run curl test (see EPIC-02-STOR-04).

Commit message suggestion
- "EPIC-02-STOR-03: Docker-compose map NVIDIA_NIM_API_KEY -> LLM_API_KEY for OpenHands runtime"