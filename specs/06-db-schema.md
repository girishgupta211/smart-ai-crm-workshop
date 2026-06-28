# Database Schema

PostgreSQL schema for the API stage.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE lead_stage AS ENUM ('Lead', 'Contacted', 'Proposal', 'Won', 'Lost');
CREATE TYPE interaction_type AS ENUM ('Email', 'Call', 'Meeting');
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  stage lead_stage NOT NULL DEFAULT 'Lead',
  deal_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_interaction_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, email)
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NOT NULL,
  type interaction_type NOT NULL,
  ai_analyzed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  icebreaker TEXT NOT NULL,
  next_step TEXT NOT NULL,
  risk_level risk_level NOT NULL,
  risk_justification TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lead_id)
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date DESC);
CREATE INDEX idx_ai_strategies_lead_id ON ai_strategies(lead_id);
```

## Notes

- The mock data uses string IDs; API/database mode uses UUIDs.
- `ai_strategies` stores one current strategy per lead.
- Strategy history can be added later with a separate `ai_strategy_versions` table if needed.
