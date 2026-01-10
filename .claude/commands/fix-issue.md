---
description: Pull and fix a GitHub issue by number
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebFetch, mcp__plugin_playwright_playwright__*
---

# Fix GitHub Issue

Fix GitHub issue #$ARGUMENTS

## Steps

1. Fetch the issue details:
   ```bash
   gh issue view $ARGUMENTS --json title,body,labels,comments
   ```

2. Understand the issue:
   - Read the title and description
   - Check any labels for context (bug, enhancement, etc.)
   - Review comments for additional context

3. Investigate the codebase:
   - Search for relevant files
   - Understand the affected components
   - Identify the root cause (for bugs) or implementation location (for features)

4. Implement the fix:
   - Make minimal, targeted changes
   - Follow existing code patterns
   - Update both Timeline.jsx and PublicTimeline.jsx if touching timeline UI

5. Verify the fix:
   - Run `npm run lint`
   - Run `npx tsc --noEmit`
   - Run `npm test`
   - Run `npm run test:e2e`
   - For UI changes, use Playwright to visually verify

6. Summarize what was done and what files were changed
