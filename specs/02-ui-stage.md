# UI Stage Specification

## Stage Goal

Build a clean, responsive single-page CRM workspace using [../mock_data.json](../mock_data.json) before backend work starts.

This stage is intentionally split into smaller sub-stages so workshop participants can understand each piece before the next one is added.

## Visual Direction

- Use a restrained corporate UI suitable for repeated sales work.
- Keep the first screen as the working CRM dashboard, not a marketing page.
- Keep information dense and scannable.
- Prefer familiar controls: tables, badges, buttons, drawers, forms, and simple status chips.
- If using React later, use Vite, Tailwind CSS, and Lucide React. For the fastest workshop path, a static HTML/CSS/JS version is acceptable first.

## Sub-Stage 1A: Static Dashboard

### Goal

Show the product shape without any complex interactions.

### Build

- Load leads from `mock_data.json`.
- Render a metrics header.
- Render a lead grid.
- Show a friendly empty state if no leads exist.

### Metrics Header

Metrics are derived from the lead array:

- **Open Pipeline Value:** sum of `deal_value` for leads in `Lead`, `Contacted`, and `Proposal`.
- **Won Deals:** count of leads where `stage === "Won"`.
- **Average Win Rate:** `Won / (Won + Lost)`. If there are no closed deals, show `0%`.
- **Active Leads:** count of leads not in `Won` or `Lost`.

### Lead Grid Columns

- Company
- Contact
- Email
- Stage
- Deal value
- Last interaction date
- Latest risk level when a strategy exists

### Acceptance Criteria

- The app renders entirely from `mock_data.json`.
- Metrics match the formulas above.
- Lead rows are visible and readable on desktop and mobile.
- Leads without strategies show a neutral value such as `No strategy`.

## Sub-Stage 1B: Lead Details Drawer

### Goal

Make the app feel interactive while keeping data read-only.

### Build

- Clicking a lead row opens a slide-out details panel.
- The panel shows selected lead identity and current stage.
- The panel shows interaction timeline filtered by `lead_id`.
- Timeline sorts by `interaction_date` descending.
- Each timeline item shows a type badge: `Email`, `Call`, or `Meeting`.
- Show an AI badge when `interaction.ai_analyzed === true`.

### Empty States

- If the lead has no interactions, show an empty timeline state.
- Lead `50` in the mock data must demonstrate this state.

### Acceptance Criteria

- Clicking a lead opens the correct details.
- Lead `2` shows multiple interactions in newest-first order.
- Lead `50` shows a useful no-interactions state.

## Sub-Stage 1C: AI Strategy Pane

### Goal

Show how AI output appears in the product before implementing generation.

### Build

- In the lead details drawer, show an AI Action Workspace.
- If the selected lead has a strategy, show:
  - `icebreaker`
  - `next_step`
  - `risk_level`
  - `risk_justification`
  - `generated_at`
- If no strategy exists, show an empty strategy state.

### Empty States

- Leads `45` and `50` in the mock data must demonstrate missing strategy states.
- If a lead also has no interactions, show the fallback message: `Insufficient context to form strategy`.

### Acceptance Criteria

- Lead `2` shows an existing strategy.
- Lead `45` shows no strategy but has interaction context.
- Lead `50` shows no strategy and insufficient context.

## Sub-Stage 1D: Safe Read-Only Enhancements

### Goal

Improve dashboard usefulness without mutating data.

### Build

- Sort by deal value ascending and descending.
- Sort by last interaction date ascending and descending.
- Add basic lead search by company/contact/email.
- Preserve selected lead when sorting if possible.

### Acceptance Criteria

- Deal value sorting is numeric, not string-based.
- Null `last_interaction_date` values do not crash sorting.
- Search filters the lead grid without changing source data.

## Deferred to Interaction Flow

These are intentionally not part of the first UI implementation. They belong in [04-interaction-flow.md](04-interaction-flow.md):

- Inline lead editing.
- Stage changes.
- Pressing `Escape` to revert edits.
- Pressing `Enter` to commit edits.
- Add interaction note.
- Generate mock strategy.
- Mark interactions as analyzed.
- localStorage persistence.
- Optimistic update rollback.

## Stage 1 Completion Definition

Stage 1 is complete when a non-technical participant can open the app and understand:

1. What leads are.
2. What the sales pipeline looks like.
3. What interactions are.
4. Where AI strategy appears.
5. Why missing context prevents AI from generating a strategy.
