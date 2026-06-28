# Interaction Flow

## Lead Selection

1. User clicks a lead row.
2. UI stores `selectedLeadId`.
3. Details drawer opens.
4. UI filters `interactions` by `lead_id`.
5. UI sorts matching interactions by `interaction_date` descending.
6. UI finds the current strategy where `strategy.lead_id === selectedLeadId`.

## Inline Lead Editing

Editable fields:

- `company_name`
- `contact_person`
- `email`
- `stage`
- `deal_value`

Behavior:

- Begin editing on cell click, explicit edit button, or keyboard focus.
- `Enter` commits.
- `Escape` reverts to the original value.
- Invalid email or invalid numeric value shows inline error and does not commit.
- Inline controls must stop row-click propagation.
- In mock mode, committed changes update local React state and localStorage.
- In API mode, committed changes optimistically update local state, then call `PATCH /api/leads/:id`.
- If API persistence fails, revert the edited field and show an error.

## Add Interaction Note

Form fields:

- `type`
- `notes`

Behavior:

1. User submits a note in the details drawer.
2. UI validates non-empty notes.
3. UI creates an interaction:

```json
{
  "id": "client-generated-id",
  "lead_id": "selectedLeadId",
  "interaction_date": "current ISO timestamp",
  "type": "Email | Call | Meeting",
  "notes": "user input",
  "ai_analyzed": false
}
```

4. UI appends the interaction to local state.
5. UI updates selected lead `last_interaction_date`.
6. Timeline re-sorts with the new interaction at the top.
7. Existing strategy remains visible but should be visually treated as stale if any newer interaction has `ai_analyzed: false`.

## Generate Strategy

Behavior:

1. User clicks `Generate Strategy`.
2. UI collects the latest three interactions for the selected lead.
3. If there are no interactions, show `Insufficient context to form strategy`.
4. If interactions exist, create or replace the current strategy for that lead.
5. Mark the interactions used for context as `ai_analyzed: true`.
6. Set `generated_at` to the current timestamp.

Mock mode may generate deterministic placeholder text. API mode calls `POST /api/ai/generate-strategy`.

## Local Persistence

Persist these collections to localStorage in mock mode:

- `leads`
- `interactions`
- `ai_strategies`

On first load:

1. Read localStorage.
2. If missing, seed from [../mock_data.json](../mock_data.json).
3. Provide a reset action during development to restore seed data.
