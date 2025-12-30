# Gaming Journal - Product Design

## Overview

A personal gaming journal where users track games they play, write notes while playing, and optionally share their timeline publicly.

**Core use case:** Personal tracking tool (gaming journal) that can be shared via public URL.

**Non-goals:** Social features, browsing other users' timelines, discovery.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Hono.js on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Google + Discord OAuth |
| Game Data | RAWG API (cached locally) |

## Architecture

```
gaming-journal/
├── src/
│   ├── index.ts              # Hono app entry
│   ├── api/
│   │   ├── auth.ts           # OAuth routes
│   │   ├── logs.ts           # Game log CRUD
│   │   ├── journal.ts        # Journal entries CRUD
│   │   ├── games.ts          # RAWG search/cache
│   │   └── profile.ts        # User settings
│   ├── db/
│   │   └── schema.sql        # D1 schema
│   ├── middleware/
│   │   └── auth.ts           # JWT verification
│   ├── lib/
│   │   ├── oauth/            # Google + Discord OAuth
│   │   └── rawg.ts           # RAWG API client
│   └── frontend/             # React app
├── wrangler.toml
└── package.json
```

## Key Decisions

- **One timeline per user** - Keeps URL simple (`/u/:username`)
- **Private by default** - User explicitly publishes when ready
- **RAWG for game data** - Free tier (20k requests/month), cached locally
- **Manual entry fallback** - For games not in RAWG
- **Journal entries** - Multiple notes per game while playing, summary on timeline

## Sharing

- Public URL: `gaming-journal.app/u/:username`
- Toggle in settings to publish/unpublish
- When private, public URL shows "This timeline is private"

## Deployment

Cloudflare Workers with:
- D1 database
- Static assets (React build)
- Custom domain via Cloudflare DNS

Secrets managed via `wrangler secret put`:
- JWT_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
- RAWG_API_KEY

## References

- OAuth pattern: baba-is-win/src/lib/oauth/
- Hono + D1 pattern: splitdumb/
- Auth middleware: exercise-tracker-thingy/src/middleware/
- [RAWG API Docs](https://rawg.io/apidocs)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
