.PHONY: install dev build start lint format format-check typecheck test test-ci check pr-description

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

test:
	npm run test

check: lint format-check typecheck test-ci

format-check:
	npm run format:check

test-ci:
	npm run test:ci

# Scaffolds a PR body from the repo template into pr_template/ (gitignored).
pr-description:
	@test -f $(PR_TEMPLATE) || (echo "❌ Missing $(PR_TEMPLATE)"; exit 1)
	@mkdir -p $(PR_OUT_DIR)
	@branch=$$(git branch --show-current); \
	safe=$$(printf '%s' "$$branch" | sed 's/[^A-Za-z0-9._-]/-/g'); \
	out="$(PR_OUT_DIR)/pr-$$safe.md"; \
	cp $(PR_TEMPLATE) "$$out"; \
	{ \
		echo ""; \
		echo "---"; \
		echo ""; \
		echo "## Draft context (auto-generated)"; \
		echo ""; \
		echo "**Branch:** \`$$branch\`"; \
		echo ""; \
		base=""; \
		for candidate in main origin/main master origin/master; do \
			if git rev-parse --verify "$$candidate" >/dev/null 2>&1; then \
				mb=$$(git merge-base HEAD "$$candidate" 2>/dev/null); \
				if [ -n "$$mb" ]; then \
					base="$$candidate"; \
					break; \
				fi; \
			fi; \
		done; \
		if [ -n "$$base" ]; then \
			echo "**Commits (vs \`$$base\`):**"; \
			echo ""; \
			echo '```'; \
			git log "$$base"..HEAD --oneline || true; \
			echo '```'; \
		else \
			echo "**Recent commits (no \`main\`/\`master\` base found):**"; \
			echo ""; \
			echo '```'; \
			git log -20 --oneline || true; \
			echo '```'; \
		fi; \
	} >> "$$out"; \
	echo "✅ Wrote $$out"
