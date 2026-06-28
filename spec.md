# Specification: Smart AI CRM & Lead Tracker (Workshop Blueprint)

## 1. Project Overview & Architecture
This specification defines a lightweight, high-performance single-page AI-powered CRM designed for founders and sales engineers to track leads, log interactions, and generate AI-driven communication strategies while keeping context tokens optimized and preventing metric hallucinations.

### Core Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons)
- **Backend/API:** Node.js with Express (REST API endpoints)
- **Database:** PostgreSQL (Hosted via Supabase)
- **AI Engine:** Anthropic Claude API (Claude 3.5 Sonnet / Haiku) via Model Context Protocol (MCP)
- **Hosting/Deployment:** Vercel (Frontend/API) & Supabase (Database)

---
### Workshop Execution Strategy: UI-First
We will build the application starting with the User Interface.
This allows for rapid prototyping and early feedback.
1. Scaffold the frontend structure.
2. Build static UI components.
3. Integrate mocked data.
4. Connect to backend APIs once ready.

### Mocked Data / Seed Data
refer mock_data.json


## 2. Database Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
email VARCHAR(255) UNIQUE NOT NULL,
name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. LEADS TABLE
CREATE TYPE lead_stage AS ENUM ('Lead', 'Contacted', 'Proposal', 'Won', 'Lost');

CREATE TABLE leads (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
company_name VARCHAR(255) NOT NULL,
contact_person VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
stage lead_stage NOT NULL DEFAULT 'Lead',
deal_value DECIMAL(10,2) DEFAULT 0.00,
last_interaction_date TIMESTAMP NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, email)
);

-- 3. INTERACTIONS TABLE
CREATE TABLE interactions (
CREATE TYPE interaction_type AS ENUM ('Email', 'Call', 'Meeting');
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
notes TEXT NOT NULL,
type VARCHAR(50) NOT NULL -- 'Email', 'Call', 'Meeting'
type interaction_type NOT NULL

-- 4. AI STRATEGIES TABLE
CREATE TABLE ai_strategies (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
icebreaker TEXT NOT NULL,
next_step TEXT NOT NULL,
risk_level VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High'
risk_justification TEXT NOT NULL,
generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX idx_ai_strategies_lead_id ON ai_strategies(lead_id);

````

-----

## 3\. API Specifications

All endpoints accept and return JSON payloads. Base URL: `/api`. All endpoints require a valid JWT in the Authorization header.

### 1\. Lead Management

- **`GET /api/leads`**
- **Description:** Retrieve all active leads for the user.
- **Response Format:** `[{ id, company_name, contact_person, email, stage, deal_value, last_interaction_date }]`
- **`POST /api/leads`**
- **Description:** Create a new lead. `user_id` is extracted from the JWT token.
- **Payload:** `{ company_name, contact_person, email, stage, deal_value }`

### 2\. Interactions Pipeline

- **`GET /api/leads/:id/interactions`**
- **Description:** Get all interaction logs for a specific lead.
- **Response Format:** `[{ id, interaction_date, type, notes }]`
- **`POST /api/interactions`**
- **Description:** Log a new call, email, or meeting.
- **Payload:** `{ lead_id, type, notes }`

### 3\. AI Strategy Actions

- **`POST /api/ai/generate-strategy`**
- **Description:** Trigger Claude to analyze history and write a context-driven strategy.
- **Payload:** `{ lead_id }`
- **Response Format:** `{ lead_id, icebreaker, next_step, risk_level, risk_justification }`

-----

## 4\. Model Context Protocol (MCP) Tools

To eliminate AI token bloat and prevent data hallucination, Claude must never process raw histories directly. It must query the backend deterministically via these three MCP tools:

### Tool 1: `get_lead_metrics`

- **Description:** Computes exact deal values and pipeline stages deterministically from the DB.
- **Input Schema:** `{ "lead_id": "string (UUID)" }`
- **Output:** `{ "deal_value": 45000.00, "stage": "Proposal", "interaction_count": 8 }`

### Tool 2: `get_lead_context`

- **Description:** Pulls only the last 3 interaction notes (truncated to 1,000 characters) to optimize context windows.
- **Input Schema:** `{ "lead_id": "string (UUID)" }`
- **Output:** `[{ "type": "Call", "notes": "Client loves the demo but is worried about integration limits." }]`

### Tool 3: `update_lead_strategy`

- **Description:** Writes the finalized, schema-validated Claude output back into the `ai_strategies` database table.
- **Input Schema:**
``` json
{
"lead_id": "string",
"icebreaker": "string",
"next_step": "string",
"risk_level": "string",
"risk_justification": "string"
}
```

-----

## 5\. AI Agent System Prompt & Guardrails

``` text
PROMPT INSTRUCTION:
You are an expert Sales AI Agent operating inside a strict B2B CRM pipeline.
Your sole objective is to analyze historical logs and generate conversion tactics.

ANTI-HALLUCINATION GUARDRAILS:
1. Never guess, compute, or output KPI metrics (e.g., total deal value, closed-won statistics). You must exclusively invoke the 'get_lead_metrics' tool for numerical states.
2. If tool responses return empty values, state "Insufficent context to form strategy" instead of inventing mock touchpoints.

WORKFLOW SEQUENCE:
1. Call 'get_lead_metrics' to assess the current structural value and stage.
2. Call 'get_lead_context' to fetch the recent qualitative interaction logs.
3. Formulate a personalized outreach icebreaker, an explicit next action step, and a risk evaluation matrix.
4. Execute 'update_lead_strategy' to commit your final structured outputs back into the database.

```

-----

## 6\. Frontend & UI Requirements

### View Layout & Components

A clean, responsive single-page responsive workspace using a modern corporate indigo/slate motif:

1. **Metrics Header:** High-visibility dashboard cards displaying total pipeline value, won deals count, and average win rate (computed deterministically on the client-side).
2. **Interactive Lead Grid:** A tabular list supporting quick status changes, immediate row sorting by currency value, and inline editing.
3. **Slide-Out Details Panel:** Clicking a lead reveals an interaction timeline log with visual badges for AI-analyzed notes, an option to add notes, and an "AI Action Workspace" pane to view or trigger strategies.

### UX Flow & State Sync

- **Asynchronous Loading:** Use skeleton loaders during API calls.
- **Graceful Fallbacks:** Show empty states when no data is present.
- **Instant Refresh:** Optimistically update UI state before API confirmation.

### Spec-Driven Prompting Guides (For Claude Context Creation)

- **Token Optimization:** When building UI state transformations, pass explicit state arrays rather than re-requesting historical trees to maximize Claude's output tokens.
- **Context Clearing:** Always command the LLM environment to flush or reset memory variables between major multi-file feature additions to avoid token overflow.

-----

## 7\. Quality Gate: Test Cases & Validation Rules

| Component | Test Scenario | Steps to Reproduce | Expected Outcome | Status |
| :----------------- | :----------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------- | :------ |
| **UI Component** | Table Column Sorting | Click 'Deal Value' column header | Rows sort cleanly descending/ascending numerically | Pending |
| **State Layer** | Local Persistence | Add a dummy lead, refresh browser page | The created entity and cached AI strategies persist smoothly via active state hooks | Pending |
| **API Endpoints** | Data Payload Schema Validation | Post to `/api/leads` with empty email string | Server flags block, returns `400 Bad Request` | Pending |
| **AI Integration** | Anti-Hallucination Gate | Trigger strategy for lead with 0 logs | Agent stops execution gracefully via fallback text | Pending |
| **MCP Pipeline** | Schema Alignment Check | Validate strategy return fields against database layout | Both `risk_level` and `risk_justification` parse as separate strings | Pending |
| **UX Flow** | Form-Level Error Boundaries | Submit form with invalid data | UI displays inline error messages without crashing | Pending |
| **UX Flow** | Inline Editing Invalidation | Edit a cell and press Escape | Cell reverts to original value immediately | Pending |

-----

## 8\. DevOps: GitHub Workflow & Live Deployment Pipeline

Follow this 18-step operational runbook to provision infrastructure and launch the system live:

### Phase 1: Environment & Repository Init

1. Initialize local repository: `git init`
2. Initialize frontend: `npm create vite@latest . -- --template react`
3. Create staging and main branches: `git branch -M main`
4. Configure `.gitignore` to protect sensitive local variable assets: `echo "node_modules\n.env" > .gitignore`
5. Stage assets for tracking: `git add .`
6. Commit baseline files: `git commit -m "feat: initial system architecture and schema structure"`

### Phase 2: Database Provisioning (Supabase)

6. Log into your Supabase Dashboard and hit "New Project".
7. Navigate to Project Settings -\> Database to copy your connection string and API keys.
8. Open the SQL Editor in Supabase, paste the definitions from Section 2, and click "Run" to establish schemas and foreign key constraints.

### Phase 3: Express Backend Configurations

9. Install core server requirements: `npm install express pg dotenv cors`
10. Create an environment template file: `touch .env`
11. Populate `.env` with database variables:
``` env
DATABASE_URL=your_supabase_postgresql_connection_string
CLAUDE_API_KEY=your_anthropic_api_credential
PORT=5000
```

### Phase 4: Frontend Deployment Configuration (Vercel)

12. Create a deployment manifest file in the root workspace: `touch vercel.json`
13. Configure rewrites for the Express API layer to prevent CORS issues:
``` json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
14. Install the Vercel global CLI tool locally: `npm install -g vercel`
15. Authenticate and initialize the cloud workspace mapping: `vercel login` followed by `vercel link`
16. Upload and apply your backend environment configurations to the Vercel Dashboard under Project Settings -\> Environment Variables.

### Phase 5: Production Release & Testing

17. Run a final local production build simulation: `npm run build`
18. Execute the live deployment push: `vercel --prod` and perform end-to-end verification via your live production URL.

<!-- end list -->

```