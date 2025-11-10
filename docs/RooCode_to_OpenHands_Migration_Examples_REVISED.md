# RooCode to OpenHands: Workflow Migration Examples (REVISED)

## Important Context

This document compares your RooCode workflows with **actual OpenHands behavior**. The previous version incorrectly described OpenHands as having a "Leader → Orchestrator → Worker" hierarchy. That was based on a misunderstanding.

**What OpenHands Actually Is:**
- **CodeActAgent**: Autonomous agent that can write code, run commands, browse web
- **Delegation**: CodeActAgent can delegate to specialized agents (BrowsingAgent, micro-agents)
- **No Manual Hierarchy**: Agent decides when to delegate based on task needs
- **Function Calling**: Uses litellm function calling, not prompt-based commands

---

## Example 1: Simple Feature Addition

### Scenario
You want to add a new API endpoint to an existing Express.js application.

### RooCode Workflow (2-Level)

**You manually create:** `EPIC-add-user-endpoint.md`

```markdown
# EPIC: Add User Registration Endpoint

## Overview
Add POST /api/users/register endpoint to handle new user signups.

## Requirements
- Accept email, password, username
- Validate input
- Hash password
- Save to database
- Return JWT token

## Implementation Steps
1. Add route in src/routes/users.js
2. Create controller function in src/controllers/userController.js
3. Add validation middleware in src/middleware/validation.js
4. Write tests in tests/user.test.js
```

**You trigger:** Orchestrator agent in RooCode

**Orchestrator does:**
1. Reads EPIC file
2. Creates 4 worker tasks with specific file scopes
3. Spawns workers sequentially or in parallel
4. Each worker calls `attempt_completion` when done
5. Orchestrator compiles results and reports to you

**Time:** ~15 minutes (5 min manual EPIC creation + 10 min execution)

---

### OpenHands Workflow

**You submit:** Natural language prompt to CodeActAgent

```
Add a user registration endpoint to my Express.js app at /api/users/register. 
It should:
- Accept email, password, and username in the request body
- Validate the inputs (email format, password strength)
- Hash the password with bcrypt
- Save the user to MongoDB
- Return a JWT token

The codebase follows this structure:
- routes in src/routes/
- controllers in src/controllers/
- middleware in src/middleware/
- tests in tests/
```

**CodeActAgent does:**
1. Analyzes the request and existing codebase structure
2. Reads relevant existing files to understand patterns
3. Creates/modifies files in this order:
   - Adds validation middleware
   - Updates user routes file
   - Implements controller function
   - Writes unit tests
4. Runs tests to verify functionality
5. Calls `AgentFinishAction(outputs={...})` with summary

**What you see in dashboard:**
```
📖 Reading src/routes/users.js
📖 Reading src/controllers/userController.js  
💻 Running: npm install bcrypt jsonwebtoken
📝 Writing src/middleware/validation.js
📝 Modifying src/routes/users.js (added /register route)
📝 Writing src/controllers/userController.js (added register function)
📝 Writing tests/user.test.js
🐍 Running Python validation script
💻 Running: npm test
✅ Task completed successfully
```

**Time:** ~12 minutes (no manual EPIC creation, agent works autonomously)

**Key Difference:** You don't create an EPIC or manage workers. You just describe what you want, and CodeActAgent figures out the implementation approach.

---

## Example 2: Complex Multi-Component Project

### Scenario
Build a full-stack dashboard for monitoring server metrics with real-time updates.

### RooCode Workflow (2-Level)

**You manually create:** Multiple EPIC files

1. `EPIC-001-backend-api.md` (10-15 specific worker tasks defined)
2. `EPIC-002-frontend-dashboard.md` (10-15 tasks)
3. `EPIC-003-websocket-realtime.md` (5-10 tasks)
4. `EPIC-004-docker-deployment.md` (5 tasks)

**Manual coordination:**
- Start EPIC-001 orchestrator, wait for completion (~2 hours)
- Review output, fix any issues
- Start EPIC-002 orchestrator, wait (~2 hours)
- Ensure frontend connects to backend API correctly
- Start EPIC-003 orchestrator (~1 hour)
- Start EPIC-004 orchestrator (~30 min)
- **Total: 6-8 hours** (4-5 hours dev + 2-3 hours your coordination)

---

### OpenHands Workflow

**You submit:** Single comprehensive prompt to CodeActAgent

```
Build a full-stack server metrics dashboard with the following:

BACKEND (Node.js/Express):
- REST API endpoints for fetching metrics (CPU, memory, disk, network)
- WebSocket server for real-time metric updates
- Authentication with JWT tokens
- PostgreSQL database for storing historical metrics
- Metrics collection service that samples system stats every 10 seconds

FRONTEND (React):
- Login/register pages with JWT authentication
- Real-time dashboard showing current metrics (updating every 2 seconds)
- Historical charts (last 24 hours) using Recharts
- Alert configuration UI (set thresholds for notifications)
- Responsive design with Tailwind CSS

DEPLOYMENT:
- Dockerfile for backend
- Dockerfile for frontend  
- Docker Compose configuration
- Nginx reverse proxy setup
- Environment variable configuration

Tech stack: Node.js, Express, PostgreSQL, React, Socket.io, Recharts, Tailwind, Docker

Project structure:
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── middleware/
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
├── Dockerfile
└── package.json

docker-compose.yml
```

**CodeActAgent does:**
1. **Planning Phase** (implicit, not visible to you):
   - Understands the full scope
   - Decides to start with backend foundation, then frontend, then deployment

2. **Backend Implementation**:
   - Creates project structure
   - Implements auth endpoints
   - Sets up database models
   - Creates metrics collection service
   - Sets up WebSocket server
   - Writes tests

3. **Frontend Implementation**:
   - Creates React app structure
   - Implements authentication flow
   - Builds dashboard components
   - Integrates WebSocket client
   - Creates chart components
   - Adds responsive styling

4. **Deployment Setup**:
   - Creates Dockerfiles
   - Writes docker-compose.yml
   - Configures Nginx
   - Creates .env.example files

5. **Testing & Verification**:
   - Runs backend tests
   - Builds Docker images
   - Tests Docker Compose startup
   - Verifies connectivity between services

6. **AgentFinishAction()**:
   - Provides comprehensive summary
   - Lists all files created
   - Includes setup instructions
   - Notes any caveats or manual steps needed

**What you see in dashboard:**
```
📝 Creating backend/package.json
💻 Running: cd backend && npm install
📝 Creating backend/src/server.js
📝 Creating backend/src/routes/auth.js
... [many more actions]
💻 Running: cd backend && npm test
📝 Creating frontend/src/App.jsx
... [many more actions]
💻 Running: cd frontend && npm run build
📝 Creating docker-compose.yml
💻 Running: docker compose build
💻 Running: docker compose up -d
💻 Running: curl http://localhost:3000/api/health
✅ All services running successfully
```

**Time:** 3-5 hours (agent works mostly autonomously, minimal intervention needed)

**Key Difference:** 
- No EPIC files needed
- No coordination between separate orchestrators
- Agent works on everything in logical order
- You can check in periodically rather than managing each phase

---

## Example 3: Bug Investigation and Fix

### Scenario
Fix a memory leak in a Python data processing service.

### RooCode Workflow

**You create:** `EPIC-fix-memory-leak.md`

```markdown
# EPIC: Fix Memory Leak in Data Processor

## Problem
Service crashes after processing ~10k records due to memory not being freed.

## Investigation Tasks
1. Profile memory usage with tracemalloc
2. Analyze cache_manager.py for unreleased objects
3. Check data_loader.py for unclosed file handles
4. Implement fix
5. Run stress test with 50k records

## Known Files
- src/processor.py (main processing logic)
- src/data_loader.py (data loading)
- src/cache_manager.py (caching system)
```

**You trigger:** Orchestrator

**If Worker 1 finds leak is actually in a different file:**
- You have to STOP workflow
- Update EPIC with new file
- Restart orchestrator
- Worker continues investigation

**Time:** 1-3 hours (includes manual EPIC updates if investigation reveals unexpected issues)

---

### OpenHands Workflow

**You submit:** Problem description to CodeActAgent

```
My Python data processing service has a memory leak - it crashes after processing about 10,000 records. 

The main processing code is in:
- src/processor.py (main loop)
- src/data_loader.py (loads CSV files)
- src/cache_manager.py (caches processed data)

Can you:
1. Investigate the memory leak using profiling tools
2. Identify the root cause
3. Implement a fix
4. Verify the fix with a stress test (50k records)

The service processes CSV files and caches results in memory for fast retrieval.
```

**CodeActAgent does:**
1. **Investigation**:
   ```python
   # Agent runs profiling
   import tracemalloc
   tracemalloc.start()
   # Runs process_file() with monitoring
   # Analyzes memory snapshots
   ```

2. **Discovery** (agent's reasoning, you don't see this directly):
   - "Memory growth is continuous, not spiky"
   - "Cache size grows without bound"
   - "No cache eviction policy found"
   - "data_loader.py keeps file handles open"

3. **Adaptive Investigation** (if needed):
   - If agent finds the issue is NOT in the files you mentioned
   - Agent autonomously checks related files
   - No need for you to update anything

4. **Implementation**:
   ```python
   # Agent modifies cache_manager.py to add LRU eviction
   # Agent modifies data_loader.py to use context managers
   # Agent adds memory monitoring to processor.py
   ```

5. **Verification**:
   ```python
   # Agent writes stress test script
   # Runs test with 50k records
   # Monitors memory usage
   # Confirms leak is fixed
   ```

6. **Report via AgentFinishAction()**:
   ```json
   {
     "problem_found": "Two issues: 1) Unbounded cache growth 2) File handles not closed",
     "files_modified": [
       "src/cache_manager.py (added LRU cache with 1000 item limit)",
       "src/data_loader.py (added context managers for file handling)",
       "src/processor.py (added memory monitoring)"
     ],
     "verification": "Stress test passed: processed 50k records, memory stable at 150MB",
     "next_steps": "Consider making cache size configurable via environment variable"
   }
   ```

**Time:** 45-90 minutes (agent handles adaptive investigation automatically)

**Key Difference:**
- Agent can investigate beyond the files you specified
- No need to update EPIC if new issues found
- Agent adapts its approach based on findings
- More autonomous problem-solving

---

## Example 4: Real Workflow - Your RooMessenger Project

### RooCode Approach

**Your manual work:**
1. Create main EPIC document with high-level vision
2. Break into 4 sub-EPICs:
   - `EPIC-001-agent-management.md` (define 10-12 worker tasks)
   - `EPIC-002-discord-bot.md` (define 8-10 tasks)
   - `EPIC-003-github-sync.md` (define 8-10 tasks)
   - `EPIC-004-task-queue.md` (define 6-8 tasks)
3. Execute sequentially:
   - Day 1-2: Run EPIC-001 orchestrator
   - Day 3-4: Run EPIC-002 orchestrator  
   - Day 5-6: Run EPIC-003 orchestrator
   - Day 7: Run EPIC-004 orchestrator
4. Manual integration testing
5. Fix cross-EPIC issues

**Your time investment:**
- 4-6 hours creating EPICs
- 2-3 hours per day monitoring execution
- 2-3 hours fixing integration issues
- **Total: 3-4 weeks**

---

### OpenHands Approach

**Your work:**
Submit one comprehensive prompt:

```
Build RooMessenger - a web application for managing RooCode agents:

CORE FEATURES:

1. AGENT MANAGEMENT:
   - Dashboard showing all active agents (from RooCode VSCode extension)
   - Start/stop agents via web UI
   - Configure agent prompts through UI
   - View agent resource usage (CPU, memory, token consumption)
   - Agent execution logs with real-time streaming

2. DISCORD INTEGRATION:
   - Discord bot that receives commands from specified channels
   - Commands: !start-agent <name>, !stop-agent <name>, !status
   - Send agent output/errors to Discord channels
   - Notification system for task completions/failures

3. GITHUB SYNCHRONIZATION:
   - Auto-sync with specified GitHub repositories
   - When agent completes work, create a new branch
   - Generate PR with agent's changes
   - PR description includes: task summary, files modified, testing notes

4. TASK QUEUE VISUALIZATION:
   - Kanban-style board showing queued tasks
   - Visual hierarchy: main task → orchestrator → workers
   - Real-time progress updates
   - Filter by status, priority, agent type

TECHNICAL REQUIREMENTS:
- Backend: Node.js/Express with TypeScript
- Frontend: React with TypeScript, Tailwind CSS
- Database: PostgreSQL for task history
- Real-time: Socket.io for live updates
- Authentication: JWT tokens
- Deployment: Docker + Docker Compose

PROJECT STRUCTURE:
backend/
├── src/
│   ├── routes/ (API endpoints)
│   ├── controllers/ (business logic)
│   ├── services/ (external integrations: RooCode, Discord, GitHub)
│   ├── models/ (database models)
│   ├── websocket/ (Socket.io handlers)
│   └── middleware/ (auth, error handling)
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── components/ (UI components)
│   ├── pages/ (main views)
│   ├── services/ (API client, WebSocket client)
│   ├── hooks/ (React hooks)
│   └── types/ (TypeScript types)
├── Dockerfile
└── package.json

INTEGRATION NOTES:
- RooCode agents run in VSCode extension - we need to communicate with them via their local API
- Discord bot should run as a separate process managed by the backend
- GitHub operations should use GitHub API with personal access token

Please implement this system. Start with the backend foundation, then build the frontend, then add integrations.
```

**CodeActAgent does:**
1. Sets up project structure
2. Implements backend API
3. Builds Discord bot service
4. Creates GitHub integration service
5. Implements frontend UI
6. Adds WebSocket real-time updates
7. Creates Docker deployment config
8. Writes tests
9. Provides setup documentation

**Your time investment:**
- 30 minutes crafting comprehensive prompt
- 2-3 check-ins per day (10 min each) to review progress
- 1-2 hours fixing any issues found in testing
- **Total: 2-3 weeks** (agent does most of the work)

**Key Difference:**
- One detailed prompt vs. four EPIC documents
- Agent manages its own task breakdown
- No coordination needed between EPICs
- You review finished chunks instead of managing workers

---

## Migration Strategy

### Don't Try to Replicate RooCode Exactly

OpenHands is **fundamentally different**. Instead of forcing it into RooCode's structure:

### ✅ DO THIS:

1. **Write Comprehensive Prompts**
   - Describe the complete goal
   - Specify technical requirements
   - Indicate preferred structure
   - Let agent figure out implementation order

2. **Provide Context Files**
   ```
   # If you really want to use EPIC files:
   "Please read /workspace/planning/project-requirements.md 
    and implement everything described there."
   ```
   
3. **Use Structured Descriptions**
   ```
   Task: Implement feature X
   
   Requirements:
   - Requirement 1
   - Requirement 2
   
   Technical approach:
   - Use technology Y
   - Follow pattern Z
   
   Testing:
   - Test scenario A
   - Test scenario B
   ```

4. **Monitor and Guide**
   - Check dashboard periodically
   - If agent goes off track, send clarification message
   - Let agent recover from mistakes autonomously

### ❌ DON'T DO THIS:

1. **Don't create "Leader/Orchestrator/Worker" prompts**
   - OpenHands doesn't use this hierarchy
   - CodeActAgent handles everything

2. **Don't use `attempt_completion` in prompts**
   - Agent knows when to call `AgentFinishAction()`
   - Don't instruct it on this

3. **Don't try to manually spawn "workers"**
   - Agent delegates automatically when needed
   - You don't control delegation

4. **Don't expect SequentialThinking MCP**
   - OpenHands uses native LLM reasoning
   - Claude 3.5 Sonnet has extended thinking built-in

---

## Practical Migration Steps

### Week 1: Exploration
1. Install OpenHands (use revised installation guide)
2. Run 3-5 simple tasks to understand agent behavior
3. Compare results with what RooCode would have done
4. Note differences in approach and output

### Week 2: Adaptation
1. Take a recent RooCode EPIC
2. Convert it to a single comprehensive OpenHands prompt
3. Run both in parallel (RooCode and OpenHands)
4. Compare:
   - Time to completion
   - Quality of output
   - Your effort required
   - Final result differences

### Week 3: Hybrid Operation
1. Use RooCode for quick edits (< 30 min tasks)
2. Use OpenHands for new projects (> 1 hour tasks)
3. Track which system you prefer for which tasks

### Week 4: Decision Point
- **If OpenHands is better:** Start transitioning fully
- **If RooCode is better:** Keep using it primarily
- **If mixed:** Use both for their strengths

---

## Common Questions

### Q: Can I force OpenHands to follow my EPIC structure?

**A:** Sort of. You can:
- Put EPIC files in `/workspace/planning/`
- Reference them in your prompt: "Read and follow EPIC-001.md"
- Agent will understand the structure but may deviate if it finds a better approach

### Q: How do I replicate RooCode's scope management?

**A:** You can't enforce it as strictly. Instead:
- Be specific in prompts: "Only modify files in src/components/"
- Review agent's plan before it executes (use confirmation mode)
- Trust agent's judgment - it's usually good

### Q: Is OpenHands slower because it's more autonomous?

**A:** Usually faster overall:
- No time spent creating EPICs
- No coordination between orchestrators
- Agent works continuously without waiting for you
- But individual "think time" may seem longer

### Q: Can I use both RooCode and OpenHands?

**A:** Yes! Use them for different scenarios:
- **RooCode**: Quick edits, small tasks, when you want fine control
- **OpenHands**: Complex projects, exploratory work, autonomous development

---

## Key Takeaways

| Aspect | RooCode | OpenHands |
|--------|---------|-----------|
| **Planning** | Manual EPIC creation required | Natural language description |
| **Execution** | Orchestrator → Workers | CodeActAgent (autonomous) |
| **Completion** | `attempt_completion` | `AgentFinishAction()` |
| **Delegation** | Manual worker spawning | Automatic when beneficial |
| **Reasoning** | SequentialThinking MCP | Native LLM reasoning |
| **Control** | High (explicit structure) | Medium (guide via prompts) |
| **Autonomy** | Low (you manage workflow) | High (agent manages itself) |
| **Best For** | Structured, repeatable tasks | Complex, exploratory projects |

---

## Final Recommendation

**Use OpenHands when:**
- Starting new projects from scratch
- Working on complex multi-component systems
- You want to save time on planning
- The problem is not fully defined yet

**Keep using RooCode when:**
- Making quick edits to existing code
- You have a proven workflow for a specific task type
- You need very precise control over execution order
- The task is straightforward and well-defined

**The hybrid approach is optimal:** Use the right tool for each job.

---

**Document Version:** 2.0 (REVISED)
**Last Updated:** 2025-11-10
**Key Changes:** 
- Removed fictional "Leader/Orchestrator/Worker" hierarchy
- Added accurate CodeActAgent behavior
- Removed `attempt_completion` references
- Removed SequentialThinking MCP references
- Added realistic workflow comparisons