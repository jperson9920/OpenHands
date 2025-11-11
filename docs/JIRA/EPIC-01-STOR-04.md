# EPIC-01-STOR-04 — Fix: implement least-invasive remediation

JIRA: EPIC-01-STOR-04

One-paragraph summary:
- The duplicate mapping was removed from [`docker-compose.yml`](docker-compose.yml:1) to avoid supplying `LLM_API_KEY` from two sources. Docker Compose was restarted and the Docker Engine config inspected; `LLM_API_KEY` no longer appears duplicated in the container environment. The change is committed on branch `epic-01/llm-key-dup-backend` (local).

Assignee: back-end

Objective
- Implement least-invasive fix (compose edit) and verify locally on Windows.

Acceptance criteria
- [x] Use `sequentialthinking` prior to script changes (N/A for compose-only change).
- [x] Patch committed to branch `epic-01/llm-key-dup-backend` with JIRA refs.
- [x] Local test logs show single/no duplicated `LLM_API_KEY` in container env.

Steps performed
1. Edited [`docker-compose.yml`](docker-compose.yml:1) to remove explicit `LLM_API_KEY=${NVIDIA_NIM_API_KEY}` mapping so only a single source (host .env or UI) provides the key.
2. Restarted compose and captured Docker Engine env via:
   - `docker compose down; docker compose up -d`
   - `docker inspect --format '{{json .Config.Env}}' $(docker compose ps -q openhands) > logs/EPIC-01/inspect-config-env.txt`
3. Saved verification logs under [`logs/EPIC-01/inspect-config-env.txt`](logs/EPIC-01/inspect-config-env.txt:1).

Verification (results)
- `docker inspect` output saved to [`logs/EPIC-01/inspect-config-env.txt`](logs/EPIC-01/inspect-config-env.txt:1) shows the container engine environment array does not include any `LLM_API_KEY` entry added from the compose `environment` block.
- Compose restarted at 2025-11-11T10:03:24Z (local). Inspect/log timestamp: 2025-11-11T10:04:30Z (UTC).

Commands executed (host PowerShell)
- docker compose down
- docker compose up -d
- Start-Sleep -Seconds 2
- docker compose exec openhands sh -c "printenv | grep LLM_API_KEY || true"
- docker inspect --format '{{json .Config.Env}}' (docker compose ps -q openhands) > logs/EPIC-01/inspect-config-env.txt

Logs & artifacts
- [`logs/EPIC-01/inspect-config-env.txt`](logs/EPIC-01/inspect-config-env.txt:1)
- prior artifacts under [`logs/EPIC-01/`](logs/EPIC-01:1)

Notes & rollback
- Rollback: restore previous `docker-compose.yml` from Git history and restart: `git checkout -- docker-compose.yml && docker compose down && docker compose up -d`.
- Mitigation: prefer single source of truth for secrets; use `.env` or host env but not both; document in [`docs/JIRA/EPIC-01.md`](docs/JIRA/EPIC-01.md:1).

Status: completed (in progress -> completed for this story)

Timestamp: 2025-11-11T10:05:15.695Z