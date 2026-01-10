# Gaming Journal

Personal gaming journal with timeline visualization. Track games you play, write journal entries, and share your gaming history publicly.

## Tech Stack

- **Frontend**: React 19, React Router 7, Tailwind CSS 4, Vite
- **Backend**: Hono (Cloudflare Workers), TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth, JWT sessions
- **External APIs**: RAWG (game metadata)
- **Testing**: Vitest (unit), Playwright (e2e)
- **CI/CD**: GitHub Actions, auto-deploy to Cloudflare on merge

## Project Structure

```
src/
├── index.ts              # Hono app entry point, mounts API routes
├── api/                  # API route handlers (auth, logs, journal, games, profile, public, admin)
├── lib/                  # Auth utilities, OAuth helpers
├── middleware/           # Auth middleware
├── frontend/             # React SPA
│   ├── App.jsx           # Router config
│   ├── pages/            # Route components (Timeline, Journals, Settings, Login, Landing)
│   ├── components/       # Shared components (AddGameModal, JournalEntryForm, TimelineView)
│   └── contexts/         # AuthContext
├── db/schema.sql         # D1 schema definition
└── types.ts              # TypeScript interfaces (Env, User, GameLog, JournalEntry, etc.)
e2e/                      # Playwright tests
```

## Essential Commands

```bash
# Development
make setup                # Copy .dev.vars, install deps, init local DB (run in new worktrees)
make dev                  # Start dev server at localhost:8787
npm run build:frontend    # Build frontend only

# Testing
npm run lint              # ESLint
npx tsc --noEmit          # TypeScript check
npm test                  # Vitest unit tests
npm run test:e2e          # Playwright e2e tests

# Database
npm run db:init           # Initialize local D1
npm run db:init:remote    # Initialize remote D1 (production)
npx wrangler d1 execute gaming-journal-db --local --command "SQL"
npx wrangler d1 execute gaming-journal-db --remote --command "SQL"

# Deploy
make deploy               # Build + deploy to Cloudflare Workers
```

## Key Patterns

### API Response Format
All API routes return `{ data: T | null, error: { message, code } | null }`. Error codes: `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`.

### Rating Scale
Ratings are 0-10 (not 1-10). Rating 0 is valid. Use `rating !== null && rating !== undefined` not `if (rating)`.

### Timeline Components
Two timeline views that must stay visually in sync:
- `Timeline.jsx` - Authenticated user's editable timeline
- `PublicTimeline.jsx` - Read-only public view at `/u/:username`

When modifying timeline styling, update both.

### Database Migrations
Schema is in `src/db/schema.sql`. Changes require manual ALTER TABLE on both local and remote:
```bash
npx wrangler d1 execute gaming-journal-db --local --command "ALTER TABLE ..."
npx wrangler d1 execute gaming-journal-db --remote --command "ALTER TABLE ..."
```

### Auth Flow
Google OAuth -> JWT in cookie (`session`). Backend middleware validates JWT and sets `userId` in Hono context. Frontend uses `AuthContext` to track user state.

## Environment Variables

Required in `.dev.vars` (local) and Cloudflare secrets (production):
- `JWT_SECRET` - Session signing key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `RAWG_API_KEY` - Game metadata API

## Git Workflow

**All changes go through PRs. Never commit directly to main.**

Create worktree for new work:
```bash
git fetch origin
git worktree add ../gaming-journal-feature-x -b feature-x origin/main
cd ../gaming-journal-feature-x
make setup
```

Clean up after merge:
```bash
git worktree remove ../gaming-journal-feature-x
```

## CI Checks

PRs must pass: build, lint, typecheck, e2e tests. Deployment happens automatically on merge to main.

## Production

- URL: gaming.emilycogsdill.com
- Hosting: Cloudflare Workers + D1
