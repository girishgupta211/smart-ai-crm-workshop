# Product Overview

## Purpose

Smart AI CRM & Lead Tracker is a lightweight, high-performance single-page CRM for founders and sales engineers. It helps users track leads, log sales interactions, and generate AI-assisted communication strategies.

## Architecture

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend/API:** Node.js with Express REST endpoints
- **Database:** PostgreSQL hosted on Supabase
- **AI Engine:** Anthropic Claude API through deterministic MCP tools
- **Hosting:** Vercel for the frontend/API and Supabase for the database

## Workshop Strategy

The project is built UI-first:

1. Scaffold the frontend.
2. Build static UI components.
3. Integrate [mock_data.json](../mock_data.json).
4. Add local state mutations and persistence.
5. Connect to backend APIs.
6. Add AI generation through MCP tools.

## Core Product Rules

- The UI may compute display aggregates from already-loaded deterministic data.
- The AI must not compute or invent KPI metrics.
- Interaction history shown to the model must be scoped and truncated.
- Mock mode must expose the same state transitions expected from the future API mode.
