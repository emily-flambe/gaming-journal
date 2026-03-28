---
description: Run all checks and prepare changes for commit
allowed-tools: Bash, Read, Glob, Grep
---

# PR Preparation

Run all checks and prepare changes for commit.

## Steps

1. Run all verification checks:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   npm run test:e2e
   ```

2. If any checks fail, report the failures and stop.

3. If all checks pass, show the changes:
   ```bash
   git status
   git diff
   ```

4. Generate a commit message based on the changes:
   - Summarize what was changed and why
   - Use conventional commit format if appropriate (feat:, fix:, refactor:, etc.)
   - Keep the first line under 72 characters

5. Stage the changes:
   ```bash
   git add -A
   ```

6. Report ready status with the suggested commit message
