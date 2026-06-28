# Specification Index: Smart AI CRM & Lead Tracker

This repository uses a UI-first workshop plan. The detailed specification is split into focused files so each build stage has a clear contract.

## Product Goal

Build a lightweight single-page CRM for founders and sales engineers to track leads, log interactions, and generate AI-assisted next-step strategy without letting the model invent metrics.

## Build Stages

1. **Static UI**
   - Build the React/Vite shell, metrics header, lead grid, details drawer, timeline, and AI strategy pane.
   - Source of truth: [specs/02-ui-stage.md](specs/02-ui-stage.md) and [mock_data.json](mock_data.json).

2. **Local Interaction State**
   - Add inline editing, quick stage changes, add-note flow, localStorage persistence, empty states, and optimistic UI behavior.
   - Source of truth: [specs/04-interaction-flow.md](specs/04-interaction-flow.md).

3. **API Contract**
   - Implement the REST shape required by the UI before connecting to a real database.
   - Source of truth: [specs/05-api-contract.md](specs/05-api-contract.md).

4. **Backend and Database**
   - Add Express endpoints and PostgreSQL tables.
   - Source of truth: [specs/06-db-schema.md](specs/06-db-schema.md).

5. **AI Strategy Flow**
   - Add deterministic MCP tools and Claude strategy generation.
   - Source of truth: [specs/07-ai-mcp-flow.md](specs/07-ai-mcp-flow.md).

6. **Quality and Deployment**
   - Validate UX flows, state behavior, API contracts, AI fallback behavior, and production build.
   - Source of truth: [specs/08-quality-gates.md](specs/08-quality-gates.md) and [specs/09-deployment.md](specs/09-deployment.md).

## Spec Files

- [specs/01-product-overview.md](specs/01-product-overview.md)
- [specs/02-ui-stage.md](specs/02-ui-stage.md)
- [specs/03-mock-data-contract.md](specs/03-mock-data-contract.md)
- [specs/04-interaction-flow.md](specs/04-interaction-flow.md)
- [specs/05-api-contract.md](specs/05-api-contract.md)
- [specs/06-db-schema.md](specs/06-db-schema.md)
- [specs/07-ai-mcp-flow.md](specs/07-ai-mcp-flow.md)
- [specs/08-quality-gates.md](specs/08-quality-gates.md)
- [specs/09-deployment.md](specs/09-deployment.md)
