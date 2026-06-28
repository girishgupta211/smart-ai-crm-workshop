# Smart AI CRM Workshop

Hands-on workshop repo for building a Smart AI CRM + Lead Tracker with a UI-first workflow, mock data, MCP-style tools, and a testable AI agent loop.

## End-to-End Workshop Flow

```mermaid
flowchart LR
  A[Idea] --> B[Product Spec]
  B --> C[Mock Data]
  C --> D[Static UI]
  D --> E[Local State + UX Flows]
  E --> F[MCP Tool Contracts]
  F --> G[AI Agent Workflow]
  G --> H[Tests + Debugging]
  H --> I[API + Database]
  I --> J[Deployment]
```

## Application Flow

```mermaid
flowchart TD
  U[User opens CRM] --> M[Load mock_data.json]
  M --> S[Seed local app state]
  S --> H[Metrics Header]
  S --> G[Lead Grid]
  G -->|Sort / edit / change stage| S
  G -->|Click lead row| D[Slide-Out Details Panel]
  D --> T[Interaction Timeline]
  D --> A[AI Action Workspace]
  D -->|Add note| N[Create interaction with ai_analyzed=false]
  N --> S
  N --> A
  A -->|Generate Strategy| W[AI Agent Workflow]
```

## MCP + AI Agent Flow

```mermaid
sequenceDiagram
  participant UI as CRM UI
  participant Agent as AI Agent
  participant Metrics as get_lead_metrics
  participant Context as get_lead_context
  participant Strategy as update_lead_strategy
  participant Data as mock_data.json

  UI->>Agent: Generate strategy for lead_id
  Agent->>Metrics: Fetch exact stage, value, interaction count
  Metrics->>Data: Read lead + interactions
  Data-->>Metrics: Deterministic metrics
  Metrics-->>Agent: Metrics result
  Agent->>Context: Fetch latest 3 interactions
  Context->>Data: Read scoped interaction history
  Data-->>Context: Latest notes only
  Context-->>Agent: Context result

  alt No interactions
    Agent-->>UI: Insufficient context to form strategy
  else Context exists
    Agent->>Agent: Draft schema-shaped strategy
    Agent->>Strategy: Save strategy
    Strategy->>Data: Upsert strategy + mark notes analyzed
    Strategy-->>Agent: Saved strategy
    Agent-->>UI: Strategy response
  end
```

## Data Flow

```mermaid
flowchart LR
  L[leads] --> UI[CRM UI]
  I[interactions] --> UI
  S[ai_strategies] --> UI

  L --> Metrics[get_lead_metrics]
  I --> Metrics
  I --> Context[get_lead_context]
  S --> StrategyPane[AI Strategy Pane]

  Agent[AI Agent] --> Metrics
  Agent --> Context
  Agent --> Upsert[update_lead_strategy]
  Upsert --> S
  Upsert --> I
```

## Local Test Flow

```mermaid
flowchart TD
  A[Run MCP tests] --> B[node scripts/test-mock-mcp-tools.js]
  B --> C[Validate metrics]
  B --> D[Validate latest-3 context]
  B --> E[Validate no-context fallback]
  B --> F[Validate strategy upsert]

  G[Run AI agent tests] --> H[node scripts/test-mock-ai-agent.js]
  H --> I[Validate tool call order]
  H --> J[Validate fallback]
  H --> K[Validate strategy creation]

  L[Run workshop demo] --> M[node scripts/demo-mock-ai-agent.js 2]
  M --> N[Print agent-to-tool trace]
```

## Useful Commands

```sh
node scripts/test-mock-mcp-tools.js
node scripts/test-mock-ai-agent.js
node scripts/demo-mock-ai-agent.js 2
node scripts/demo-mock-ai-agent.js 50
```

Lead `2` shows the full multi-tool path. Lead `50` shows the no-context guardrail path.

## Spec Map

- [Specification index](spec.md)
- [UI stage](specs/02-ui-stage.md)
- [Mock data contract](specs/03-mock-data-contract.md)
- [Interaction flow](specs/04-interaction-flow.md)
- [API contract](specs/05-api-contract.md)
- [AI MCP flow](specs/07-ai-mcp-flow.md)
- [Quality gates](specs/08-quality-gates.md)
