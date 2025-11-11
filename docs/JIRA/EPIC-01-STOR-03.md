# EPIC-01-STOR-03 — Minimal repro: docker-compose + .env

JIRA: EPIC-01-STOR-03

One-paragraph summary:
- Minimal repro created under [`repro/docker-compose.yml`](repro/docker-compose.yml:1) + [`repro/.env`](repro/.env:1). Running the repro on Windows reproduced the duplicated/concatenated `LLM_API_KEY` in container environment; logs saved to [`logs/EPIC-01/repro-compose.log`](logs/EPIC-01/repro-compose.log:1). Files created but not yet committed to a feature branch.

Assignee: code

Objective
- Create minimal docker-compose and .env that demonstrates duplicate `LLM_API_KEY` injection on Windows, document exact reproduce steps, and commit repro to branch `epic-01/llm-key-dup-code`.

References
- Host .env: [`.env`](.env:1)
- Compose: [`docker-compose.yml`](docker-compose.yml:1)
- Repro files: [`repro/docker-compose.yml`](repro/docker-compose.yml:1), [`repro/.env`](repro/.env:1)
- Repro logs: [`logs/EPIC-01/repro-compose.log`](logs/EPIC-01/repro-compose.log:1)

Acceptance criteria
- [x] Minimal repro reproduces duplication locally on Windows (evidence in logs).
- [ ] Files committed to branch `epic-01/llm-key-dup-code` with commit message referencing EPIC.
- [ ] README with exact Windows PowerShell steps to reproduce (pending).

Work performed
1. Created repro files:
   - [`repro/docker-compose.yml`](repro/docker-compose.yml:1)
   - [`repro/.env`](repro/.env:1)
2. Ran repro on Windows PowerShell:
   - Commands used:
     - Set-Location repro
     - docker compose up -d
     - docker compose logs --no-color --tail 200 repro > ../logs/EPIC-01/repro-compose.log
     - docker exec <cid> printenv > ../logs/EPIC-01/repro-env-full.txt
   - Result: [`logs/EPIC-01/repro-compose.log`](logs/EPIC-01/repro-compose.log:1) contains `LLM_API_KEY` value duplicated/concatenated on a single line (redacted in logs).
3. Saved artifacts to `logs/EPIC-01/`.

Evidence
- See [`logs/EPIC-01/repro-compose.log`](logs/EPIC-01/repro-compose.log:1) — contains lines showing:
  - `LLM_API_KEY=nvapi-REPRO-TEST-KEY nvapi-REPRO-TEST-KEY` (redacted in repo)
- Existing `repro/` files reproduce the condition when `env_file:` and `environment:` both supply the same variable.

Analysis / notes
- Reproduction indicates Docker/Compose or runtime is presenting the env value as concatenated when both `env_file` and `environment` supply the same variable (or when host env + env_file are both present). Alternative explanation: file encoding artifacts caused a duplicated value when Compose merges sources.
- Use `docker inspect --format '{{json .Config.Env}}' <cid>` vs in-container `printenv` to compare what Docker Engine injected vs what process sees.

Next steps (recommended)
- Commit repro files to feature branch and push (local commits suffice according to EPIC rules):
  - git checkout -b epic-01/llm-key-dup-code
  - git add repro/docker-compose.yml repro/.env
  - git commit -m "EPIC-01-STOR-03: Add minimal repro for duplicated LLM_API_KEY"
- Add `repro/README.md` with the exact PowerShell commands and expected outputs.
- EPIC-01-STOR-02 (research) should confirm whether this is Compose behavior or encoding/entrypoint issue.
- If confirmed, implement fix in EPIC-01-STOR-04.

Status: Repro created and executed; artifacts saved. Awaiting commit to branch and README creation.

Timestamp (UTC): 2025-11-11T09:44:00Z