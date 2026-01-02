# Gaming Journal - Project Guidelines for Claude

## Timeline Components

This project has TWO timeline components that must stay in sync:

1. **Timeline.jsx** (`src/frontend/pages/Timeline.jsx`) - Authenticated user's timeline with editing/drag-drop
2. **PublicTimeline.jsx** (`src/frontend/pages/PublicTimeline.jsx`) - Public read-only timeline at `/u/:username`

**When making UI changes to the timeline:**
- Update BOTH components with consistent styling
- Keep rating scale logic identical (0-10 scale)
- Keep color functions (`getColor`, `getBorderColor`, `getPosition`) identical
- Keep font sizes, spacing, and layout consistent between both views

## Rating Scale

- Ratings use a 0-10 scale (not 1-10)
- Rating 0 is valid and must not be treated as falsy
- Use `rating !== null && rating !== undefined` instead of `if (rating)`

## D1 Database Schema

The schema is defined in `src/db/schema.sql`. Local and remote D1 databases must stay in sync.

**When modifying the schema:**
1. Update `src/db/schema.sql` with the new schema
2. Apply changes to BOTH local and remote databases:
   ```bash
   # Local
   npx wrangler d1 execute gaming-journal-db --local --command "ALTER TABLE ..."

   # Remote (production)
   npx wrangler d1 execute gaming-journal-db --remote --command "ALTER TABLE ..."
   ```
3. Never assume a migration applied to one has been applied to the other

**Common pitfall:** Adding columns to the schema file doesn't automatically migrate existing databases. You must run ALTER TABLE commands on both local and remote.

## Deployment

- Deploy with `npm run deploy` (builds frontend then deploys to Cloudflare Workers)
- Production URL: gaming.emilycogsdill.com
- GitHub Actions deployment requires `CLOUDFLARE_API_TOKEN` secret
