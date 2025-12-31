# Gaming Journal

A personal gaming journal where you track games you play, write notes while playing, and optionally share your timeline publicly.

## Features

- **Timeline Visualization** - See your gaming history with rating-based horizontal positioning
- **Game Search** - Search RAWG database for games with cover art
- **Journal Entries** - Write notes while playing a game
- **OAuth Login** - Sign in with Google
- **Public Sharing** - Share your timeline at `/u/username`

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Hono.js on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth

## Development

### Prerequisites

- Node.js 18+
- Cloudflare account
- RAWG API key (free at https://rawg.io/apidocs)
- Google OAuth credentials

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/emily-flambe/gaming-journal.git
   cd gaming-journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up secrets:
   ```bash
   wrangler secret put JWT_SECRET
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put RAWG_API_KEY
   ```

4. Initialize the database:
   ```bash
   npm run db:init           # Local
   npm run db:init:remote    # Production
   ```

5. Run locally:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev` - Start development server (builds frontend + wrangler dev)
- `npm run build:frontend` - Build React frontend
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run db:init` - Initialize local D1 database
- `npm run db:init:remote` - Initialize remote D1 database
- `npm test` - Run unit tests
- `npm run test:e2e` - Run Playwright e2e tests

## Project Structure

```
gaming-journal/
├── src/
│   ├── index.ts              # Hono app entry
│   ├── types.ts              # TypeScript types
│   ├── api/                  # API route handlers
│   │   ├── auth.ts           # OAuth routes
│   │   ├── logs.ts           # Game log CRUD
│   │   ├── journal.ts        # Journal entries
│   │   ├── games.ts          # RAWG search
│   │   ├── profile.ts        # User settings
│   │   └── public.ts         # Public timeline
│   ├── db/
│   │   └── schema.sql        # D1 schema
│   ├── lib/
│   │   ├── auth.ts           # JWT utilities
│   │   └── oauth/            # OAuth services
│   ├── middleware/
│   │   └── auth.ts           # Auth middleware
│   └── frontend/             # React app
├── e2e/                      # Playwright tests
├── .plans/                   # Design docs
├── wrangler.toml             # Cloudflare config
└── package.json
```

## API Endpoints

See [.plans/api-reference.md](.plans/api-reference.md) for full API documentation.

## License

MIT
