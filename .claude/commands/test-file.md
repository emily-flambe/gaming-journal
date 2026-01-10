---
description: Run tests related to a specific file
allowed-tools: Bash, Read, Glob, Grep
---

# Test File

Run tests related to the file: $ARGUMENTS

## Steps

1. Determine the file type and appropriate test strategy:
   - If it's a `.ts` file in `src/api/` - run e2e tests that hit that API
   - If it's a `.jsx` file in `src/frontend/` - run e2e tests that exercise that page/component
   - If it's a test file itself - run just that test

2. For API files, find related e2e tests:
   ```bash
   grep -l "api/$(basename $ARGUMENTS .ts)" e2e/*.ts
   ```

3. For frontend files, find related e2e tests by page/component name:
   ```bash
   grep -l "$(basename $ARGUMENTS .jsx)" e2e/*.ts
   ```

4. Run the relevant tests:
   ```bash
   # For specific test file
   npm run test:e2e -- --grep "pattern"

   # Or run all e2e tests if unclear
   npm run test:e2e
   ```

5. Report test results with any failures highlighted
