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

```bash
npm install
make setup    # Copy secrets, init local DB
make dev      # Start dev server
```

See `CLAUDE.md` for detailed development guidelines.

## Deployment

```bash
npm run deploy
```

Production URL: https://gaming.emilycogsdill.com

## License

MIT
