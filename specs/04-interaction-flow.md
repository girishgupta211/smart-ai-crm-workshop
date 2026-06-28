# Interaction Flow

## Sub-Stage 2A: Local Mock Persistence

### Goal

Move the UI from one-time JSON rendering to browser-backed mock state.

### Build

- Fetch [../mock_data.json](../mock_data.json) as seed data.
- Persist these collections to localStorage in mock mode:
  - `leads`
  - `interactions`
  - `ai_strategies`
- On first load, seed localStorage from `mock_data.json`.
- On later reloads, read from localStorage.
- Provide a reset action to restore the seed data during demos.

### Acceptance Criteria

- Metrics and lead grid render from local mock state.
- Reloading the page preserves local mock state.
- Reset restores all seed leads, interactions, and strategies.
- No backend, database, MCP server, or AI key is required.

## Lead Selection

1. User clicks a lead row.
2. UI stores `selectedLeadId`.
3. Details drawer opens.
4. UI filters `interactions` by `lead_id`.
5. UI sorts matching interactions by `interaction_date` descending.
6. UI finds the current strategy where `strategy.lead_id === selectedLeadId`.

## Sub-Stage 2D: Inline Lead Editing

### Goal

Allow participants to update lead fields directly in the grid while staying in mock mode.

### Build

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

### Acceptance Criteria

- Company, contact, email, stage, and deal value can be edited from the grid.
- `Enter` commits the current edit.
- `Escape` cancels the current edit.
- Invalid email or invalid deal value shows inline error and does not persist.
- Edit controls do not open the details drawer.
- Metrics, sorting, search, selected row state, and localStorage reflect committed edits.

## Sub-Stage 2B: Add Interaction Note

### Goal

Let a participant add real sales context to a selected lead without a backend.

### Build

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
  "interaction_date": "current or next mock-safe ISO timestamp",
  "type": "Email | Call | Meeting",
  "notes": "user input",
  "ai_analyzed": false
}
```

4. UI appends the interaction to local state.
5. UI updates selected lead `last_interaction_date`.
6. Timeline re-sorts with the new interaction at the top.
7. Existing strategy remains visible but should be visually treated as stale if any newer interaction has `ai_analyzed: false`.

### Acceptance Criteria

- Empty notes show an inline error and do not save.
- Valid notes are appended to local mock state and localStorage.
- The selected lead's `last_interaction_date` updates immediately.
- The drawer timeline shows the newest note first.
- Seed data with future same-day timestamps does not push the new note below existing notes.
- Existing AI strategy remains visible and is marked stale when the new note is not AI analyzed.

## Sub-Stage 2C: Mock Generate Strategy

### Goal

Show the AI agent workflow without requiring an AI key, backend, database, or MCP server.

### Build

Behavior:

1. User clicks `Generate Strategy`.
2. UI collects the latest three interactions for the selected lead.
3. If there are no interactions, show `Insufficient context to form strategy`.
4. If interactions exist, create or replace the current strategy for that lead.
5. Mark the interactions used for context as `ai_analyzed: true`.
6. Set `generated_at` to the current or next mock-safe ISO timestamp.

Mock mode generates deterministic placeholder text. API mode later calls `POST /api/ai/generate-strategy`.

### Acceptance Criteria

- A `Generate Strategy` button is visible in the selected lead drawer.
- Leads with zero interactions show `Insufficient context to form strategy` and do not create a strategy.
- Leads with interactions create or replace the strategy in local mock state and localStorage.
- The latest three interactions used for context are marked `ai_analyzed: true`.
- The drawer refreshes immediately with the generated strategy and clears stale-strategy messaging.
- No AI key, backend, database, or MCP server is required.
