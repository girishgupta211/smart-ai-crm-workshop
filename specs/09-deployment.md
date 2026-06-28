# Deployment Runbook

## Phase 1: Repository and Frontend

1. Initialize local repository if needed: `git init`
2. Initialize frontend: `npm create vite@latest . -- --template react`
3. Set main branch: `git branch -M main`
4. Configure `.gitignore` with `node_modules` and `.env`
5. Commit the baseline

## Phase 2: Database Provisioning

1. Create a Supabase project.
2. Copy the database connection string.
3. Run the schema from [06-db-schema.md](06-db-schema.md) in the Supabase SQL editor.

## Phase 3: Express Backend

Install server dependencies:

```sh
npm install express pg dotenv cors
```

Create `.env`:

```env
DATABASE_URL=your_supabase_postgresql_connection_string
CLAUDE_API_KEY=your_anthropic_api_credential
PORT=5000
```

## Phase 4: Vercel Configuration

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Phase 5: Production Validation

1. Run the local production build: `npm run build`
2. Deploy with Vercel.
3. Verify the live dashboard.
4. Verify API calls.
5. Verify AI fallback and successful generation flows.
