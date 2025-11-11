# EPIC-02-STOR-02 — Config: Update config/config.toml for NVIDIA NIM

JIRA: EPIC-02-STOR-02

Objective
- Update [`config/config.toml`](config/config.toml:13) so the default LLM section uses:
  - model = "openai/qwen2.5-coder-32b-instruct"
  - base_url = "https://integrate.api.nvidia.com/v1"
  - api_key_env = "NVIDIA_NIM_API_KEY"
  - custom_llm_provider = "openai"

Changes made
- Edited [`config/config.toml`](config/config.toml:13) [llm] section to the required NVIDIA NIM settings:
  - model = "openai/qwen2.5-coder-32b-instruct"
  - base_url = "https://integrate.api.nvidia.com/v1"
  - api_key_env = "NVIDIA_NIM_API_KEY"
  - custom_llm_provider = "openai"

Verification steps
1. Inspect the file:
   - Open [`config/config.toml`](config/config.toml:13) and verify the [llm] block contains the values above.
2. In development mode (running from source) environment precedence:
   - Ensure $env:NVIDIA_NIM_API_KEY is set locally or in `.env` before starting the app.
3. In Docker/web mode:
   - Docker envs override `config.toml` (but UI settings can override both). See [`docker-compose.yml`](docker-compose.yml:1) for runtime mapping.

Commit message suggestion
- "EPIC-02-STOR-02: Configure config.toml for NVIDIA NIM (model, base_url, api_key_env, custom_llm_provider)"

Notes
- Refer to [`docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md`](docs/compass_artifact_wf-1eaff533-6ba1-4935-ae3c-eedbd1330e1b_text_markdown.md:60) for examples and curl test snippets.
- UI settings (Settings → LLM) may take precedence in Docker/web mode; remove `~/.openhands-state/settings.json` if needed to force env/config precedence.