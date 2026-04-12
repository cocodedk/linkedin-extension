# Contributing to LinkedIn Extension

## Local Setup

1. Install Node.js 22 or later.
2. Clone the repository.
3. Install dependencies: `npm ci`
4. Load the extension from `chrome/` via `chrome://extensions/` → **Load unpacked**.

## Install Git Hooks

```sh
./scripts/install-hooks.sh
```

## Build and Test Commands

```bash
npm run lint            # Lint JavaScript files
npm test                # Run unit tests (vitest)
npm run test:coverage   # Run tests with coverage
npm run test:integration # Run Playwright integration tests
npm run test:all        # Run all tests
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

## Local Git Setup

Run these once after cloning:

```bash
git config pull.rebase true
git config core.autocrlf input
git config push.autoSetupRemote true
git config init.defaultBranch main
```

## Coding Style

- Follow ESLint rules configured in `.eslintrc.cjs`.
- Format with Prettier (`.prettierrc`).
- Keep files under 200 lines — extract modules when approaching the limit.
- No hardcoded strings for selectors — use constants.

## Branch Naming

| Prefix      | Type        | Example                     |
| ----------- | ----------- | --------------------------- |
| `feature/`  | `feat:`     | `feature/export-leads-csv`  |
| `fix/`      | `fix:`      | `fix/selector-not-found`    |
| `chore/`    | `chore:`    | `chore/update-dependencies` |
| `docs/`     | `docs:`     | `docs/update-contributing`  |
| `refactor/` | `refactor:` | `refactor/extract-scraper`  |
| `ci/`       | `ci:`       | `ci/add-dependabot`         |

## PR Checklist

- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] Manual test completed in Chrome with the extension loaded unpacked.
- [ ] Updated docs if behavior changed.
- [ ] Commit message follows Conventional Commits (`feat: ...`, `fix: ...`, etc.).
