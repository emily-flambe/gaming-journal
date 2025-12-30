# Gaming Journal - Implementation Checklist

## Phase 1: Project Setup

- [ ] Initialize Hono.js project structure
- [ ] Configure wrangler.toml with D1 binding
- [ ] Create D1 database (`wrangler d1 create gaming-journal-db`)
- [ ] Run schema migration
- [ ] Set up Vite build for frontend assets
- [ ] Configure dev scripts (`npm run dev`, `npm run deploy`)
- [ ] Verify local dev environment works

## Phase 2: Authentication

- [ ] Set up JWT utilities (sign, verify)
- [ ] Implement Google OAuth flow
  - [ ] `/api/auth/google` - redirect to Google
  - [ ] `/api/auth/google/callback` - handle callback
  - [ ] Upsert user in DB
  - [ ] Set HttpOnly session cookie
- [ ] Implement Discord OAuth flow
  - [ ] `/api/auth/discord` - redirect to Discord
  - [ ] `/api/auth/discord/callback` - handle callback
  - [ ] Account linking (same email)
- [ ] Implement `/api/auth/me`
- [ ] Implement `/api/auth/logout`
- [ ] Create auth middleware for protected routes
- [ ] Add secrets to Cloudflare (`wrangler secret put`)

## Phase 3: Game Log API

- [ ] `GET /api/logs` - list user's logs
- [ ] `POST /api/logs` - create log
- [ ] `PATCH /api/logs/:id` - update log
- [ ] `DELETE /api/logs/:id` - delete log
- [ ] `PATCH /api/logs/reorder` - bulk reorder

## Phase 4: Journal Entries API

- [ ] `GET /api/logs/:id/journal` - list entries
- [ ] `POST /api/logs/:id/journal` - add entry
- [ ] `PATCH /api/journal/:id` - update entry
- [ ] `DELETE /api/journal/:id` - delete entry

## Phase 5: Game Search (RAWG)

- [ ] Create RAWG API client
- [ ] `GET /api/games/search` - search and cache
- [ ] `GET /api/games/:id` - get cached game
- [ ] Handle rate limiting gracefully

## Phase 6: Profile & Public Timeline

- [ ] `GET /api/profile` - get settings
- [ ] `PATCH /api/profile` - update settings
- [ ] Username validation (unique, URL-safe)
- [ ] `GET /api/u/:username` - public timeline

## Phase 7: Frontend - Core

- [ ] Set up TanStack Query
- [ ] Create API client with auth handling
- [ ] Login page with OAuth buttons
- [ ] Auth context/hook
- [ ] Protected route wrapper
- [ ] Settings page (username, display name, public toggle)

## Phase 8: Frontend - Timeline

- [ ] Refactor existing timeline to accept props
- [ ] Timeline page (fetch from API)
- [ ] Add game flow
  - [ ] Search modal with RAWG
  - [ ] Game selection
  - [ ] Date/rating/notes form
- [ ] Edit game flow
- [ ] Delete game (with confirmation)
- [ ] Reorder games (drag & drop or manual)

## Phase 9: Frontend - Journal

- [ ] Game detail view with journal entries
- [ ] Add journal entry
- [ ] Edit/delete journal entries
- [ ] Journal entry timestamps

## Phase 10: Frontend - Public View

- [ ] Public timeline page (`/u/:username`)
- [ ] "Timeline is private" state
- [ ] User not found state
- [ ] Share button / copy URL

## Phase 11: Polish & Deploy

- [ ] Error handling (API errors, network errors)
- [ ] Loading states
- [ ] Empty states
- [ ] Mobile responsiveness
- [ ] Update README with setup instructions
- [ ] Deploy to Cloudflare Workers
- [ ] Set up custom domain
- [ ] Update Netlify deployment (or remove)

## Future Enhancements (Post-MVP)

- [ ] Import from existing JSON/CSV
- [ ] Export timeline data
- [ ] Dark/light theme toggle
- [ ] Custom color schemes
- [ ] Cover art grid view (alternative to timeline)
- [ ] Year-in-review summary
- [ ] Embed code for blogs
