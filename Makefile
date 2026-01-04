.PHONY: dev setup db-init db-init-remote deploy lint test test-e2e clean

# Full dev setup (run this in a fresh worktree)
setup:
	@if [ ! -f .dev.vars ]; then \
		echo "Copying .dev.vars from main project..."; \
		cp ../gaming-journal/.dev.vars . 2>/dev/null || echo "Warning: Could not copy .dev.vars - copy it manually"; \
	fi
	npm install
	$(MAKE) db-init

# Start dev server (runs setup first if needed)
dev:
	@if [ ! -d node_modules ]; then $(MAKE) setup; fi
	@if [ ! -f .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite ] 2>/dev/null; then $(MAKE) db-init; fi
	npm run dev

# Initialize local D1 database
db-init:
	npx wrangler d1 execute gaming-journal-db --local --file=./src/db/schema.sql

# Initialize remote D1 database (production)
db-init-remote:
	npx wrangler d1 execute gaming-journal-db --remote --file=./src/db/schema.sql

# Deploy to production
deploy:
	npm run deploy

# Run linter
lint:
	npm run lint

# Run unit tests
test:
	npm test

# Run e2e tests
test-e2e:
	npm run test:e2e

# Clean build artifacts and local DB
clean:
	rm -rf dist .wrangler node_modules
