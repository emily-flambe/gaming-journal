---
description: Run a D1 database query (local or remote)
allowed-tools: Bash, Read
---

# Database Query

Run a D1 database query.

Usage: /project:db-query [local|remote] SQL_QUERY

Arguments: $ARGUMENTS

## Steps

1. Parse the arguments to determine:
   - Target: "local" or "remote" (default: local)
   - SQL query to execute

2. If no SQL query provided, show helpful examples:
   ```sql
   -- List tables
   SELECT name FROM sqlite_master WHERE type='table';

   -- Show schema for a table
   PRAGMA table_info(game_logs);

   -- Count records
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM game_logs;
   SELECT COUNT(*) FROM journal_entries;
   ```

3. Execute the query:
   ```bash
   # Local
   npx wrangler d1 execute gaming-journal-db --local --command "SQL_HERE"

   # Remote (requires confirmation for write operations)
   npx wrangler d1 execute gaming-journal-db --remote --command "SQL_HERE"
   ```

4. For SELECT queries, display results formatted clearly.

5. For INSERT/UPDATE/DELETE on remote, warn about production impact and confirm before executing.
