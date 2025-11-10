# OpenHands Installation and Custom UI Setup Guide (REVISED)

## Context for Your Agent

You are helping install **OpenHands**, an open-source AI software development platform, on a Windows 10 Pro machine. The user currently uses RooCode VSCode extension and wants to explore OpenHands for more sophisticated autonomous agent capabilities and multi-agent delegation.

**Important OpenHands Architecture:**
- **CodeActAgent**: Main agent that can write code, run commands, browse web
- **Agent Delegation**: CodeActAgent can delegate to specialized agents (BrowsingAgent, micro-agents)
- **Function Calling**: Agents use litellm function calling interface (not plain prompts)
- **Task Completion**: Uses `AgentFinishAction()` to complete tasks
- **Task Rejection**: Uses `AgentRejectAction()` to reject/abandon tasks
- **MCP Support**: OpenHands supports MCP servers for extended capabilities

### User's Environment
- **OS**: Windows 10 Pro
- **Docker Desktop**: Installed and running
- **VSCode**: With RooCode extension
- **GitHub**: Integration configured
- **MCP Servers**: PowerShell, browser automation, desktop automation
- **API Keys**: Claude API key (Anthropic) available as environment variable
- **Media Server PC**: Available for continuous hosting if needed

### User's Requirements
1. Install OpenHands locally using existing Docker setup
2. Create a custom web UI with good UX for monitoring agent activity
3. View task progress and agent delegation in the web interface
4. Adapt existing RooCode EPIC/STORY workflow to OpenHands
5. Configure agent prompts and behavior
6. Integrate with existing MCP servers

---

## Part 1: OpenHands Installation with Docker

### Step 1: Verify Prerequisites

```powershell
# Open PowerShell as Administrator

# Verify Docker is running
docker --version
docker ps

# Expected output:
# Docker version 24.x.x or higher
# Container list (may be empty)

# Verify Python (OpenHands requires Python 3.11+)
python --version

# If Python not installed or < 3.11:
# Download from: https://www.python.org/downloads/
# Check "Add to PATH" during installation
```

### Step 2: Create Project Directory Structure

```powershell
# Create OpenHands project directory
cd C:\Users\[YOUR_USERNAME]\projects
mkdir openhands-local
cd openhands-local

# Create subdirectories
mkdir config
mkdir workspace
mkdir custom-dashboard
mkdir prompts
mkdir logs

# Directory structure:
# openhands-local/
# ├── config/           # Configuration files
# ├── workspace/        # Agent workspace (maps to Docker)
# ├── custom-dashboard/ # Custom UI code
# ├── prompts/          # Custom agent system prompts
# └── logs/             # Execution logs
```

### Step 3: Create Configuration Files

#### 3.1: Create `docker-compose.yml`

```yaml
# docker-compose.yml
version: '3.8'

services:
  openhands:
    image: ghcr.io/all-hands-ai/openhands:latest
    container_name: openhands-main
    restart: unless-stopped
    environment:
      - LLM_MODEL=anthropic/claude-sonnet-4-20250514
      - LLM_API_KEY=${ANTHROPIC_API_KEY}
      - SANDBOX_TYPE=ssh
      - SANDBOX_TIMEOUT=300
      - WORKSPACE_BASE=/workspace
      - LOG_ALL_EVENTS=true
      - AGENT_TYPE=CodeActAgent
    volumes:
      - ./workspace:/workspace
      - ./config/config.toml:/app/config.toml:ro
      - ./prompts:/app/prompts:ro
      - ./logs:/app/logs
      # Mount SSH keys for GitHub access
      - ${USERPROFILE}/.ssh:/root/.ssh:ro
    ports:
      - "3000:3000"  # OpenHands default UI
      - "3001:3001"  # WebSocket for real-time updates
    networks:
      - openhands-network

  custom-dashboard:
    build:
      context: ./custom-dashboard
      dockerfile: Dockerfile
    container_name: openhands-dashboard
    restart: unless-stopped
    ports:
      - "8080:80"  # Custom dashboard web UI
    depends_on:
      - openhands
    networks:
      - openhands-network
    volumes:
      - ./custom-dashboard:/app
      - ./logs:/app/logs:ro
    environment:
      - OPENHANDS_API_URL=http://openhands:3000

networks:
  openhands-network:
    driver: bridge
```

#### 3.2: Create `config/config.toml`

```toml
# config/config.toml

[core]
workspace_base = "/workspace"
workspace_mount_path = "/workspace"
sandbox_type = "ssh"
run_as_devin = false
enable_auto_lint = true
enable_cli_session = true

[llm]
model = "anthropic/claude-sonnet-4-20250514"
api_key_env = "ANTHROPIC_API_KEY"
temperature = 0.7
max_iterations = 50
max_budget_per_task = 2.0  # USD limit per task

# Fallback model (optional)
[llm.fallback]
model = "anthropic/claude-sonnet-4-20250514"
api_key_env = "ANTHROPIC_API_KEY"

[agent]
# CodeActAgent is the default and most capable agent
type = "CodeActAgent"

# Enable function calling (required for CodeActAgent)
function_calling_enabled = true

# Memory and history settings
memory_enabled = true
memory_max_threads = 10

# Custom system prompt (optional)
# If provided, this overrides default CodeActAgent prompt
# system_prompt_file = "/app/prompts/codeact_system_prompt.txt"

[agent.micro_agents]
# Enable specialized micro-agents
enable_npm = true
enable_github = true
enable_repo_study = true
enable_verifier = true

[runtime]
container_image = "nikolaik/python-nodejs:python3.11-nodejs20"
timeout = 300
use_host_network = false

[github]
token_env = "GITHUB_TOKEN"
auto_pr = true
pr_type = "draft"  # or "ready"

[logging]
level = "INFO"
log_dir = "/app/logs"
log_all_events = true

# MCP Server Configuration
# OpenHands supports MCP servers for extended capabilities
[mcp]
enabled = true

# Example MCP servers (uncomment and configure as needed)
# [[mcp.servers]]
# name = "brave-search"
# command = "uvx"
# args = ["mcp-server-brave-search"]
# env = { "BRAVE_API_KEY" = "${BRAVE_API_KEY}" }
#
# [[mcp.servers]]
# name = "filesystem"
# command = "uvx"
# args = ["mcp-server-filesystem", "${WORKSPACE_BASE}"]
```

#### 3.3: Create `.env` file

```bash
# .env
# Place this in the openhands-local directory

# API Keys (replace with your actual keys)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Optional: MCP Server API Keys
# BRAVE_API_KEY=your_brave_api_key_here

# User configuration
USERPROFILE=C:/Users/[YOUR_USERNAME]
WORKSPACE_BASE=C:/Users/[YOUR_USERNAME]/projects/openhands-local/workspace
```

### Step 4: Pull and Start OpenHands

```powershell
# Navigate to project directory
cd C:\Users\[YOUR_USERNAME]\projects\openhands-local

# Pull the latest OpenHands image
docker pull ghcr.io/all-hands-ai/openhands:latest

# Start OpenHands services
docker compose up -d

# View logs to confirm startup
docker compose logs -f openhands

# Wait for message: "OpenHands server started on http://localhost:3000"
# Press Ctrl+C to stop following logs

# Check running containers
docker compose ps
```

### Step 5: Test OpenHands Installation

```powershell
# Test API health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status": "healthy", "version": "0.9.x"}

# Open default OpenHands UI
start http://localhost:3000

# You should see the OpenHands web interface
# Click Settings (gear icon) to configure your LLM
```

---

## Part 2: Understanding OpenHands Agent Architecture

### How OpenHands Differs from RooCode

| Aspect | RooCode | OpenHands |
|--------|---------|-----------|
| **Main Agent** | Orchestrator (you configure) | CodeActAgent (built-in) |
| **Task Completion** | `attempt_completion` | `AgentFinishAction()` |
| **Sub-agents** | Workers (you spawn manually) | Micro-agents + BrowsingAgent (auto-delegated) |
| **Interface** | Function calling + prompts | Function calling (litellm) |
| **Reasoning** | SequentialThinking MCP | Native LLM reasoning (Claude extended thinking) |
| **Scope Control** | Explicit in prompts | Managed by agent's judgment + config |

### OpenHands Agent Actions

OpenHands agents have access to these key actions:

```python
# Task management
AgentFinishAction(outputs={"result": "Task completed successfully"})
AgentRejectAction(outputs={"reason": "Cannot complete this task"})
AgentDelegateAction(agent="BrowsingAgent", inputs={"task": "Search for X"})

# Code execution  
CmdRunAction(command="ls -la")  # Run bash commands
IPythonRunCellAction(code="import pandas as pd")  # Run Python code

# File operations
FileReadAction(path="/workspace/file.py")
FileWriteAction(path="/workspace/file.py", content="...")

# Browsing
BrowseURLAction(url="https://example.com")
BrowseInteractiveAction(browser_actions="click(#button)")

# Messaging
MessageAction(content="Please clarify the requirement")
```

### Agent Delegation Flow

```
User Task
    ↓
CodeActAgent (main)
    ├─→ Executes bash/Python directly
    ├─→ Delegates to BrowsingAgent (if web research needed)
    ├─→ Delegates to RepoStudyAgent (if needs to understand codebase)
    ├─→ Delegates to VerifierAgent (if needs to verify completion)
    └─→ Returns AgentFinishAction() when done
```

---

## Part 3: Custom Dashboard UI Setup

### Overview

We're creating a custom React-based dashboard that provides:
- **Agent activity timeline** showing CodeActAgent actions
- **Delegation visualization** when sub-agents are spawned
- **Real-time action log** with WebSocket updates
- **Task workspace view** showing files modified
- **VSCode-inspired UI/UX** with dark theme

### Step 1: Create Dashboard Directory Structure

```powershell
cd C:\Users\[YOUR_USERNAME]\projects\openhands-local\custom-dashboard

# Create subdirectories
mkdir src
mkdir src\components
mkdir src\services
mkdir src\styles
mkdir public
```

### Step 2: Create Dashboard Files

#### 2.1: `Dockerfile`

```dockerfile
# custom-dashboard/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the static build
RUN npm install -g serve

EXPOSE 80

# Serve the built app
CMD ["serve", "-s", "build", "-l", "80"]
```

#### 2.2: `package.json`

```json
{
  "name": "openhands-custom-dashboard",
  "version": "1.0.0",
  "description": "Custom UI dashboard for OpenHands with agent delegation visualization",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "react-flow-renderer": "^10.3.17",
    "markdown-to-jsx": "^7.3.2",
    "@monaco-editor/react": "^4.6.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

#### 2.3: Main Dashboard Component (`src/App.js`)

```javascript
// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import AgentTimeline from './components/AgentTimeline';
import DelegationView from './components/DelegationView';
import WorkspaceView from './components/WorkspaceView';
import ActionLog from './components/ActionLog';

const API_URL = process.env.REACT_APP_OPENHANDS_API_URL || 'http://localhost:3000';

function App() {
  const [actions, setActions] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [delegations, setDelegations] = useState([]);
  const [activeView, setActiveView] = useState('timeline'); // timeline, delegations, workspace, logs
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to OpenHands');
      setConnectionStatus('connected');
      loadCurrentTask();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from OpenHands');
      setConnectionStatus('disconnected');
    });

    // Listen for action updates
    newSocket.on('action_update', (data) => {
      console.log('Action update:', data);
      setActions(prevActions => {
        const updated = [...prevActions];
        updated.push(data);
        return updated;
      });

      // Track delegations
      if (data.action === 'AgentDelegateAction') {
        setDelegations(prev => [...prev, {
          id: data.id,
          agent: data.agent,
          task: data.inputs,
          status: 'active',
          timestamp: new Date()
        }]);
      }

      // Track delegation completions
      if (data.action === 'AgentFinishAction' && data.delegate_level > 0) {
        setDelegations(prev => prev.map(d => 
          d.id === data.delegation_id ? { ...d, status: 'completed' } : d
        ));
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Load current task from API
  const loadCurrentTask = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/current`);
      setCurrentTask(response.data);
      setActions(response.data.actions || []);
    } catch (error) {
      console.error('Error loading current task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <h1>OpenHands Dashboard</h1>
          <span className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
          </span>
        </div>
        {currentTask && (
          <div className="current-task">
            <strong>Current Task:</strong> {currentTask.description}
          </div>
        )}
        <nav className="view-tabs">
          <button 
            className={activeView === 'timeline' ? 'active' : ''}
            onClick={() => setActiveView('timeline')}
          >
            Agent Timeline
          </button>
          <button 
            className={activeView === 'delegations' ? 'active' : ''}
            onClick={() => setActiveView('delegations')}
          >
            Delegations
          </button>
          <button 
            className={activeView === 'workspace' ? 'active' : ''}
            onClick={() => setActiveView('workspace')}
          >
            Workspace
          </button>
          <button 
            className={activeView === 'logs' ? 'active' : ''}
            onClick={() => setActiveView('logs')}
          >
            Action Log
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeView === 'timeline' && (
          <AgentTimeline actions={actions} />
        )}
        {activeView === 'delegations' && (
          <DelegationView delegations={delegations} />
        )}
        {activeView === 'workspace' && (
          <WorkspaceView task={currentTask} />
        )}
        {activeView === 'logs' && (
          <ActionLog actions={actions} />
        )}
      </main>
    </div>
  );
}

export default App;
```

#### 2.4: Agent Timeline Component (`src/components/AgentTimeline.js`)

```javascript
// src/components/AgentTimeline.js
import React from 'react';
import './AgentTimeline.css';

const AgentTimeline = ({ actions }) => {
  const getActionIcon = (action) => {
    switch(action.action) {
      case 'CmdRunAction': return '💻';
      case 'IPythonRunCellAction': return '🐍';
      case 'FileWriteAction': return '📝';
      case 'FileReadAction': return '📖';
      case 'BrowseURLAction': return '🌐';
      case 'AgentDelegateAction': return '🔀';
      case 'AgentFinishAction': return '✅';
      case 'MessageAction': return '💬';
      default: return '⚙️';
    }
  };

  const getActionColor = (action) => {
    if (action.action === 'AgentFinishAction') return '#4caf50';
    if (action.action === 'AgentDelegateAction') return '#2196f3';
    if (action.action.includes('File')) return '#ff9800';
    if (action.action.includes('Cmd') || action.action.includes('Python')) return '#9c27b0';
    return '#607d8b';
  };

  return (
    <div className="agent-timeline">
      <h2>CodeActAgent Activity</h2>
      <div className="timeline">
        {actions.map((action, idx) => (
          <div 
            key={idx} 
            className="timeline-item"
            style={{ borderLeftColor: getActionColor(action) }}
          >
            <div className="timeline-icon">
              {getActionIcon(action)}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="action-type">{action.action}</span>
                <span className="action-time">
                  {new Date(action.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="timeline-details">
                {action.action === 'CmdRunAction' && (
                  <code>{action.command}</code>
                )}
                {action.action === 'FileWriteAction' && (
                  <div>
                    <strong>File:</strong> {action.path}
                    <br />
                    <strong>Lines:</strong> {action.content?.split('\n').length || 'N/A'}
                  </div>
                )}
                {action.action === 'AgentDelegateAction' && (
                  <div>
                    <strong>Delegated to:</strong> {action.agent}
                    <br />
                    <strong>Task:</strong> {action.inputs?.task || 'N/A'}
                  </div>
                )}
                {action.action === 'MessageAction' && (
                  <div className="message-content">{action.content}</div>
                )}
              </div>
              {action.observation && (
                <div className="action-result">
                  <strong>Result:</strong>
                  <pre>{JSON.stringify(action.observation, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTimeline;
```

### Step 3: Build and Run Custom Dashboard

```powershell
# Navigate to dashboard directory
cd C:\Users\[YOUR_USERNAME]\projects\openhands-local\custom-dashboard

# Install dependencies
npm install

# Build dashboard Docker container
docker compose build custom-dashboard

# Restart services to include dashboard
docker compose up -d

# View dashboard logs
docker compose logs -f custom-dashboard

# Open custom dashboard in browser
start http://localhost:8080
```

---

## Part 4: Adapting RooCode Workflow to OpenHands

### Understanding the Key Differences

**RooCode Approach:**
1. You manually create EPIC markdown files
2. You trigger orchestrator agents
3. Orchestrator spawns workers based on EPIC
4. Workers use `attempt_completion` when done

**OpenHands Approach:**
1. You give natural language task to CodeActAgent
2. CodeActAgent autonomously breaks down work
3. CodeActAgent delegates to specialized agents when needed
4. Agents use `AgentFinishAction()` when done

### Strategy: Adapt, Don't Replicate

Instead of forcing OpenHands into RooCode's structure, **adapt your workflow**:

#### Option 1: Use OpenHands with Structured Prompts

```python
# Submit a task with structure hints
task_prompt = """
I need to implement a new feature with the following structure:

EPIC: User Authentication System

Key Components:
1. Backend API endpoints (/login, /register, /logout)
2. JWT token management
3. Password hashing with bcrypt
4. Frontend login/register forms
5. Protected route middleware

Please break this down and implement each component. Create separate files for:
- routes/auth.js
- controllers/authController.js
- middleware/authMiddleware.js
- frontend/components/LoginForm.jsx
- frontend/components/RegisterForm.jsx

Testing: Write unit tests for each component.
"""

# OpenHands CodeActAgent will understand this structure and work accordingly
```

#### Option 2: Create Custom System Prompt

**File:** `/prompts/codeact_system_prompt.txt`

```
You are CodeActAgent, an AI software developer. When given a task:

1. ANALYZE: Break down complex tasks into logical components
2. PLAN: Create a mental "EPIC" of what needs to be done
3. IMPLEMENT: Write code, run commands, modify files systematically
4. VERIFY: Test your changes before finishing
5. REPORT: Use AgentFinishAction() with a summary of what you did

When working on multi-file projects:
- Create one file at a time
- Test each component before moving to the next
- Use clear, descriptive commit messages
- Document your reasoning in code comments

When you need help:
- Delegate to BrowsingAgent for web research
- Use IPythonRunCellAction for data analysis tasks
- Read existing files before modifying them

Always be systematic and thorough.
```

Add this to your `config.toml`:

```toml
[agent]
system_prompt_file = "/app/prompts/codeact_system_prompt.txt"
```

#### Option 3: Use EPIC Files as Reference Documents

```powershell
# Create your EPIC files as before
# Place them in /workspace/planning/

C:\Users\[USERNAME]\projects\openhands-local\workspace\planning\EPIC-001.md
```

Then in your task prompt:

```
Please read /workspace/planning/EPIC-001.md and implement the features described there. Follow the component breakdown specified in the EPIC.
```

OpenHands will read the file and follow your structure.

---

## Part 5: MCP Server Integration

### Enabling MCP Servers in OpenHands

OpenHands supports MCP servers out of the box. Edit your `config.toml`:

```toml
[mcp]
enabled = true

# Brave Search (for web research)
[[mcp.servers]]
name = "brave-search"
command = "uvx"
args = ["mcp-server-brave-search"]
env = { "BRAVE_API_KEY" = "${BRAVE_API_KEY}" }

# Filesystem access (already built-in, but can configure)
[[mcp.servers]]
name = "filesystem"
command = "uvx"
args = ["mcp-server-filesystem", "/workspace"]

# GitHub operations (if you have custom MCP server)
[[mcp.servers]]
name = "github"
command = "node"
args = ["C:/path/to/github-mcp/index.js"]
env = { "GITHUB_TOKEN" = "${GITHUB_TOKEN}" }
```

**Note:** Unlike RooCode, OpenHands does NOT use a `sequentialthinking` MCP server. Instead, OpenHands relies on:
- Claude's native extended thinking capabilities (in Claude 3.5 Sonnet)
- The agent's built-in planning and reasoning loop
- Function calling for structured decision-making

---

## Part 6: Testing Your Installation

### Test 1: Simple Task

```powershell
# Using PowerShell to submit via API
$body = @{
    task = "Create a Python script that reads a CSV file and prints summary statistics"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

Open http://localhost:8080 to watch the agent work.

### Test 2: Multi-File Task

```powershell
$body = @{
    task = @"
Create a simple Express.js REST API with:
- Server setup in server.js
- Routes in routes/users.js  
- Controller in controllers/userController.js
- Basic CRUD operations for users
- Test with curl commands
"@
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Test 3: With EPIC File

1. Create `workspace/planning/EPIC-test.md`:

```markdown
# EPIC: Simple Calculator API

## Components
1. server.js - Express server setup
2. routes/calculator.js - API routes
3. controllers/calculatorController.js - Business logic
4. tests/calculator.test.js - Unit tests

## Requirements
- POST /calculate - Accept {operation, a, b}
- Support: add, subtract, multiply, divide
- Return {result: number}
- Handle division by zero
```

2. Submit task:

```powershell
$body = @{
    task = "Read /workspace/planning/EPIC-test.md and implement everything described"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

---

## Troubleshooting

### Issue: "AgentFinishAction not recognized"

This means you might have RooCode terminology in your prompts. Replace:
- `attempt_completion` → Remove (agent knows when to finish)
- Explicit "finish" instructions → Let agent decide

### Issue: "Agent doesn't follow my EPIC structure"

**Solution:**
- Be more explicit in your task prompt
- Reference the EPIC file directly: "Read /workspace/planning/EPIC-X.md"
- Use the custom system prompt to reinforce structured behavior

### Issue: "No delegation happening"

**Solution:**
- Check `config.toml` has `function_calling_enabled = true`
- Verify your task actually needs delegation (e.g., web research)
- CodeActAgent is smart - it only delegates when necessary

### Issue: "Can't connect to MCP servers"

**Solution:**
```powershell
# Check MCP server installation
uvx --help

# Test MCP server manually
uvx mcp-server-brave-search

# Verify environment variables in .env file
```

---

## Next Steps

1. **Familiarize yourself** with OpenHands UI at http://localhost:3000
2. **Test simple tasks** before complex ones
3. **Iterate on prompts** - OpenHands responds well to clear, structured requests
4. **Monitor the dashboard** at http://localhost:8080 to understand agent behavior
5. **Read OpenHands docs** at https://docs.all-hands.dev for advanced features

## Key Differences Summary

| Feature | RooCode | OpenHands |
|---------|---------|-----------|
| Task Completion | `attempt_completion` | `AgentFinishAction()` |
| Reasoning | SequentialThinking MCP | Native LLM reasoning |
| Structure | Manual EPIC files | Autonomous planning |
| Delegation | Manual worker spawning | Automatic when needed |
| Prompts | Highly structured | Natural language |
| Control | Explicit, directed | Autonomous, goal-driven |

---

**Document Version:** 2.0 (REVISED)
**Last Updated:** 2025-11-10
**Key Changes:** Removed RooCode-specific terminology, added accurate OpenHands features