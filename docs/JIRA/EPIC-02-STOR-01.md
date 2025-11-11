# EPIC-02-STOR-01 — Back-end: Read NVIDIA_NIM_API_KEY from .env

JIRA: EPIC-02-STOR-01

Objective
- Ensure the project reads NVIDIA_NIM_API_KEY from the project .env and exposes it as the runtime env var used by OpenHands.
- Verify runtime env var name used by OpenHands is LLM_API_KEY or configure `api_key_env` to reference NVIDIA_NIM_API_KEY.

Tasks
- Add `.env.example` with NVIDIA_NIM_API_KEY (done).
- Confirm `config/config.toml` uses `api_key_env = "NVIDIA_NIM_API_KEY"` (done).
- Ensure runtime Docker mapping passes NVIDIA_NIM_API_KEY into container as LLM_API_KEY (docker-compose updated).

Commands executed
- Updated config:
  - Edited `config/config.toml` to set:
    - model = "openai/qwen2.5-coder-32b-instruct"
    - base_url = "https://integrate.api.nvidia.com/v1"
    - api_key_env = "NVIDIA_NIM_API_KEY"
    - custom_llm_provider = "openai"
- Updated docker-compose.yml environment mapping to:
  - LLM_MODEL=openai/qwen2.5-coder-32b-instruct
  - LLM_BASE_URL=https://integrate.api.nvidia.com/v1
  - LLM_API_KEY=${NVIDIA_NIM_API_KEY}
  - LLM_CUSTOM_LLM_PROVIDER=openai

Verification steps
1. Create local .env (PowerShell):
   - Set-Content -Path .env -Value "NVIDIA_NIM_API_KEY=nvapi-xxxxxxxxxx"
2. Start services:
   - docker compose up -d
3. Confirm container received env var:
   - docker compose exec openhands printenv | Select-String NVIDIA_NIM_API_KEY
4. Confirm OpenHands reads API key (Settings → LLM shows masked key or UI field displays asterisks).

Notes
- I updated `.env.example` but did NOT commit a real key.
- Docker-compose passes the NVIDIA_NIM_API_KEY into the container as `LLM_API_KEY` to match OpenHands runtime expectations in Docker/web mode.

Commit message suggestion
- "EPIC-02-STOR-01: Read NVIDIA_NIM_API_KEY from .env; configure api_key_env and Docker env mapping"
