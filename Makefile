install:
	npm ci

develop:
	npx webpack serve

test:
	npm test

lint:
	npx eslint .