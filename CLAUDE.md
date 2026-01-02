# Zebra Client Project Standards

This repository is a monorepo for the irly-tech Zebra API client and its extensions.

## Tech Stack
- **Language**: TypeScript (v5.3+)
- **Runtime**: Node.js (v20+)
- **Test Runner**: Node.js test runner (using `node --test`)
- **Package Manager**: npm (using workspaces)

## Project Structure
- `packages/core`: The core Zebra API client.
- `packages/otel`: OpenTelemetry extension for the core client.

## Coding Standards
- Use ESM (ECMAScript Modules).
- Ensure all new features have accompanying tests in their respective `src/**/*.test.ts` files.
- For the `core` package, avoid adding external dependencies unless absolutely necessary.
- For the `otel` package, maintain compatibility with the version of `@irly-tech/zebra-client` stated in its `package.json`.

## Releasing
- Always bump the version in `package.json` before creating a release tag.
- Git tags should follow semantic versioning (e.g., `v0.2.1`).
