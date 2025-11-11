# OpenHands Custom Dashboard — EPIC-01-STOR-02

JIRA: EPIC-01-STOR-02

This repo folder contains the custom-dashboard used by OpenHands. This README documents local development, build, and Docker steps used in the EPIC-01-STOR-02 work.

Local development
1. Install dependencies
   - From project root (or inside custom-dashboard):
     - npm install

2. Run dev server
   - From custom-dashboard:
     - npm run start
   - Opens Vite dev server (default port 5173). To point the dashboard at a backend, set:
     - REACT_APP_OPENHANDS_API_URL=http://localhost:3000

Tailwind (local build)
- Tailwind files:
  - src/tailwind.css — base imports and component utilities
  - tailwind.config.cjs — content configuration
  - postcss.config.cjs — PostCSS config for builds

- Build (development / CI):
  - npm run tailwind:build
  - The `build` script already runs `tailwind:build` before `vite build`.

Tests & lint
- Vitest smoke test: src/__tests__/App.test.jsx
- Run tests:
  - npm run test
- ESLint:
  - npm run lint
- CI check:
  - npm run ci-check

Docker
- Build image:
  - docker compose build custom-dashboard
- Run container:
  - docker compose up -d custom-dashboard
- The container serves the built UI via nginx on the port configured in `docker-compose.yml` (default mapping used by the project).
- Verify:
  - Visit http://localhost:8080 (or configured port) to see the dashboard.
  - Confirm backend health: curl http://localhost:3000/api/health

Notes and verification
- Recharts visuals were added to `src/components/AgentTimeline.jsx` and summary charts (actions-per-minute, delegation counts) are rendered from action data.
- Monaco editor is used in `src/components/WorkspaceView.jsx` via `@monaco-editor/react` and displays fetched file contents.
- Tailwind is built locally (tailwind:build) and the built CSS is imported via `src/main.jsx`.
- Tests were added (Vitest) and a smoke test verifies the App header renders.
- Branch: `EPIC-01-STOR-02/v1` created and pushed. All commits reference EPIC-01-STOR-02 in the message.

If anything fails locally, ensure:
- Node (LTS) installed
- Docker Desktop running (for docker compose)
- GitHub push permissions (if pushing changes)