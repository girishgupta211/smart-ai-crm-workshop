# UI Stage Specification

## Stage Goal

Build a clean, responsive single-page CRM workspace using the mock data contract before backend work starts.

## Visual Direction

- Use a restrained corporate UI suitable for repeated sales work.
- Use Tailwind CSS for layout and states.
- Use Lucide React for toolbar, action, sorting, status, note, and AI icons.
- Keep information dense and scannable.
- Avoid marketing-page composition; the first screen is the working CRM dashboard.

## Primary Views

### Metrics Header

Show high-visibility metrics derived from the lead array:

- **Open Pipeline Value:** sum of `deal_value` for leads in `Lead`, `Contacted`, and `Proposal`.
- **Won Deals:** count of leads where `stage === "Won"`.
- **Average Win Rate:** `Won / (Won + Lost)`. If there are no closed deals, show `0%`.
- **Active Leads:** count of leads not in `Won` or `Lost`.

### Interactive Lead Grid

The grid must show:

- Company
- Contact
- Email
- Stage
- Deal value
- Last interaction date
- Latest risk level when a strategy exists

Required behaviors:

- Sort by deal value ascending and descending.
- Sort by last interaction date ascending and descending.
- Change stage inline.
- Edit company, contact, email, and deal value inline.
- Pressing `Escape` while editing reverts the active cell.
- Pressing `Enter` commits the active cell.
- Clicking a row opens the details drawer.
- Interacting with inline edit controls must not also open the details drawer.

### Slide-Out Details Panel

Opening a lead shows:

- Lead identity and current stage.
- Interaction timeline filtered by `lead_id`.
- Timeline sorted by `interaction_date` descending.
- Badges for `type`: `Email`, `Call`, or `Meeting`.
- AI badge when `interaction.ai_analyzed === true`.
- Add-note form.
- AI Action Workspace.

### AI Action Workspace

For the selected lead:

- Show the current strategy if one exists.
- Show `icebreaker`, `next_step`, `risk_level`, `risk_justification`, and `generated_at`.
- If no strategy exists, show an empty state.
- If the lead has no interactions, disable generation or show the fallback: `Insufficient context to form strategy`.
- In mock mode, `Generate Strategy` may synthesize a deterministic placeholder from the latest interactions.

## Required UI States

- Loading skeletons for future API calls.
- Empty lead table state.
- Empty interaction timeline state.
- Empty AI strategy state.
- Inline validation errors.
- Optimistic update pending state.
- Optimistic update failure rollback state.

## Stage 1 Acceptance Criteria

- The app can render entirely from [mock_data.json](../mock_data.json).
- The metrics header matches the formula in this file.
- The lead grid can sort by numeric value without string sorting bugs.
- Selecting a row opens a populated details panel.
- Leads with missing interactions or strategies render useful empty states.
