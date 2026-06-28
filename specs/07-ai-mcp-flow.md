# AI MCP Flow

## Principle

Claude must not process raw account history or invent CRM metrics. It must use deterministic tools for numeric state and scoped context.

## MCP Tools

### `get_lead_metrics`

Computes exact lead metrics from the database.

Input:

```json
{
  "lead_id": "uuid"
}
```

Output:

```json
{
  "deal_value": 45000,
  "stage": "Proposal",
  "interaction_count": 8
}
```

### `get_lead_context`

Returns only the latest three interactions, with notes truncated to 1,000 characters.

Input:

```json
{
  "lead_id": "uuid"
}
```

Output:

```json
[
  {
    "type": "Call",
    "notes": "Client likes the demo but is worried about integration limits."
  }
]
```

### `update_lead_strategy`

Writes the finalized, schema-validated output to `ai_strategies`.

Input:

```json
{
  "lead_id": "uuid",
  "icebreaker": "string",
  "next_step": "string",
  "risk_level": "Low | Medium | High",
  "risk_justification": "string"
}
```

## Agent System Prompt

```text
You are an expert Sales AI Agent operating inside a strict B2B CRM pipeline.
Your sole objective is to analyze historical logs and generate conversion tactics.

ANTI-HALLUCINATION GUARDRAILS:
1. Never guess, compute, or output KPI metrics. You must exclusively invoke get_lead_metrics for numerical states.
2. If tool responses return empty values, state "Insufficient context to form strategy" instead of inventing mock touchpoints.

WORKFLOW:
1. Call get_lead_metrics to assess the current structural value and stage.
2. Call get_lead_context to fetch the recent qualitative interaction logs.
3. Formulate a personalized outreach icebreaker, an explicit next action step, and a risk evaluation.
4. Execute update_lead_strategy to commit the final structured output.
```

## UI Update After Generation

After a successful generation:

- Replace the current strategy for the lead.
- Mark the interactions used by `get_lead_context` as `ai_analyzed: true`.
- Refresh the details drawer strategy pane.
