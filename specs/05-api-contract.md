# API Contract

All endpoints accept and return JSON. Base URL: `/api`. API mode requires a valid JWT in the `Authorization` header.

## Lead Management

### `GET /api/leads`

Returns all leads for the authenticated user.

```json
[
  {
    "id": "uuid",
    "company_name": "string",
    "contact_person": "string",
    "email": "string",
    "stage": "Lead",
    "deal_value": 0,
    "last_interaction_date": "ISO-8601 string | null"
  }
]
```

### `POST /api/leads`

Creates a lead. `user_id` is extracted from the JWT.

Payload:

```json
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "stage": "Lead",
  "deal_value": 0
}
```

### `PATCH /api/leads/:id`

Updates editable lead fields.

Payload may include any subset:

```json
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "stage": "Proposal",
  "deal_value": 12000
}
```

Response returns the updated lead.

## Interactions

### `GET /api/leads/:id/interactions`

Returns interaction logs for a lead sorted newest first.

```json
[
  {
    "id": "uuid",
    "lead_id": "uuid",
    "interaction_date": "ISO-8601 string",
    "type": "Email",
    "notes": "string",
    "ai_analyzed": true
  }
]
```

### `POST /api/interactions`

Logs a new call, email, or meeting and updates the lead `last_interaction_date`.

Payload:

```json
{
  "lead_id": "uuid",
  "type": "Call",
  "notes": "string"
}
```

Response returns the created interaction.

## AI Strategies

### `GET /api/leads/:id/strategy`

Returns the current strategy for a lead, or `null` if none exists.

### `POST /api/ai/generate-strategy`

Triggers AI strategy generation for a lead.

Payload:

```json
{
  "lead_id": "uuid"
}
```

Success response:

```json
{
  "lead_id": "uuid",
  "icebreaker": "string",
  "next_step": "string",
  "risk_level": "Low",
  "risk_justification": "string",
  "generated_at": "ISO-8601 string"
}
```

Fallback response for no usable context:

```json
{
  "lead_id": "uuid",
  "message": "Insufficient context to form strategy"
}
```

## Validation Rules

- Empty or invalid `email` returns `400 Bad Request`.
- Empty `notes` returns `400 Bad Request`.
- Invalid `stage`, `type`, or `risk_level` returns `400 Bad Request`.
- Unknown lead returns `404 Not Found`.
