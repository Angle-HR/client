.PHONY: install dev build start lint format format-check typecheck test test-ci check

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
