# Mock Data Contract

## Source File

The UI-first stage uses [../mock_data.json](../mock_data.json) as the local source of truth.

## Root Shape

```json
{
  "leads": [],
  "interactions": [],
  "ai_strategies": []
}
```

## Lead

```json
{
  "id": "string",
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "stage": "Lead | Contacted | Proposal | Won | Lost",
  "deal_value": 0,
  "last_interaction_date": "ISO-8601 string | null"
}
```

Rules:

- `id` is a string in mock mode. The database later uses UUIDs.
- `deal_value` is numeric, not formatted text.
- `last_interaction_date` is nullable so the UI can test no-history states.

## Interaction

```json
{
  "id": "string",
  "lead_id": "string",
  "interaction_date": "ISO-8601 string",
  "notes": "string",
  "type": "Email | Call | Meeting",
  "ai_analyzed": true
}
```

Rules:

- `lead_id` must reference an existing lead.
- New notes created in the UI start with `ai_analyzed: false`.
- After strategy generation, the interactions used for strategy context should be marked `ai_analyzed: true`.

## AI Strategy

```json
{
  "id": "string",
  "lead_id": "string",
  "icebreaker": "string",
  "next_step": "string",
  "risk_level": "Low | Medium | High",
  "risk_justification": "string",
  "generated_at": "ISO-8601 string"
}
```

Rules:

- `lead_id` must reference an existing lead.
- Mock mode keeps at most one current strategy per lead.
- Missing strategy rows are intentional and must render an empty AI workspace.

## Intentional Edge Cases

- Lead `50` has no interactions.
- Leads `45` and `50` have no AI strategy.
- At least one interaction has `ai_analyzed: false`.
- Several leads have multiple interactions to test timeline sorting.
