# Quality Gates

| Area | Scenario | Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| UI Component | Table column sorting | Click `Deal Value` header | Rows sort ascending/descending numerically | Pending |
| UI Component | Date sorting | Click `Last Interaction` header | Null dates are stable and do not crash sorting | Pending |
| UX Flow | Row click vs inline edit | Edit stage inside a row | Stage changes without opening drawer | Pending |
| State Layer | Local persistence | Add a lead or note, refresh browser | Local changes persist from localStorage | Pending |
| UX Flow | Empty interactions | Open lead `50` | Timeline empty state appears | Pending |
| UX Flow | Empty strategy | Open lead `45` | AI workspace empty state appears | Pending |
| UX Flow | No-context AI fallback | Generate strategy for lead `50` | UI shows `Insufficient context to form strategy` | Pending |
| UX Flow | Inline editing invalidation | Edit a cell and press `Escape` | Cell reverts immediately | Pending |
| UX Flow | Form validation | Submit empty note | Inline error appears without crashing | Pending |
| API | Lead validation | Post lead with empty email | Server returns `400 Bad Request` | Pending |
| API | Update contract | Patch a lead stage | Updated lead returns and UI stays in sync | Pending |
| AI Integration | Schema alignment | Validate strategy response | `risk_level` and `risk_justification` parse separately | Pending |

## Manual Smoke Test

1. Load the dashboard from mock data.
2. Confirm metrics render.
3. Sort by deal value twice.
4. Open a lead with multiple interactions.
5. Add a note.
6. Confirm the new note appears first and has no AI badge.
7. Generate strategy.
8. Confirm the strategy updates and the used notes show AI badges.
9. Open lead `50` and confirm empty states.
