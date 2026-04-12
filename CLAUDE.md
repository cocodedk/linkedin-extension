# CLAUDE.md — LinkedIn Extension

## Project Overview

LinkedIn Extension is a Chrome Manifest V3 extension for collecting and evaluating lead data from LinkedIn search results. It includes a full test suite with Vitest (unit) and Playwright (integration).

- **Language / Runtime**: JavaScript (ES modules), Node.js 22, Chrome Extension APIs (MV3)
- **Framework**: Vitest (unit tests), Playwright (integration tests), ESLint + Prettier
- **Architecture**: Chrome Extension (content scripts + background service worker + popup) with a comprehensive test harness
- **Package Manager**: npm

---

## Required Skills — ALWAYS Invoke These

These skills **must** be invoked when the relevant situation arises. Never skip them.

| Situation                              | Skill                                        |
| -------------------------------------- | -------------------------------------------- |
| Before any new feature or screen       | `superpowers:brainstorming`                  |
| Planning multi-step changes            | `superpowers:writing-plans`                  |
| Writing or fixing core logic           | `superpowers:test-driven-development`        |
| First sign of a bug or failure         | `superpowers:systematic-debugging`           |
| Before completing a feature branch     | `superpowers:requesting-code-review`         |
| Before claiming any task done          | `superpowers:verification-before-completion` |
| Working on UI / frontend               | `frontend-design:frontend-design`            |
| After implementing — reviewing quality | `simplify`                                   |

---

## Architecture

```
linkedin-extension/
├── chrome/                  ← Extension source (load this in Chrome)
│   ├── manifest.json        ← MV3 manifest
│   ├── background.js        ← Service worker
│   ├── content/             ← Content scripts (LinkedIn page interaction)
│   └── ui/                  ← Popup UI
├── tests/                   ← Vitest unit tests
├── test-extension/          ← Playwright test extension helpers
├── .github/workflows/       ← CI, release, and Pages automation
├── .githooks/               ← Pre-commit and commit-msg hooks
├── scripts/                 ← Repo management scripts
└── website/                 ← GitHub Pages site (English + Persian)
```

### Layer Rules

- Content scripts interact with LinkedIn DOM — be defensive about selectors
- No hardcoded LinkedIn selectors — use constants with documentation
- Tests must cover all scraping logic before merging

---

## Coding Conventions

- [ ] ES modules (`type: "module"` in package.json)
- [ ] All LinkedIn selectors are named constants — never inline strings
- [ ] Functions are pure where possible — no hidden side effects
- [ ] 200-line maximum per file — extract helpers when approaching the limit
- [ ] ESLint and Prettier must pass before commit

---

## Engineering Principles

### File Size

- **200-line maximum per file** — extract a function or module when approaching the limit

### DRY · SOLID · KISS · YAGNI

- Extract shared logic into named utilities; never copy-paste
- Single Responsibility: one file does one thing
- Don't add features not yet needed
- Delete dead code immediately

### TDD

- Write the failing test first, make it pass, then refactor
- Test names describe behaviour: `"should extract name from profile card"`
- One assertion per test — keep tests focused and readable

### Commit hygiene

- Follow Conventional Commits: `feat: ...` / `fix: ...` / `chore: ...`
- The `commit-msg` hook enforces this automatically

---

## Build Commands

```bash
npm ci                       # Install dependencies
npm run lint                 # ESLint
npm test                     # Vitest unit tests
npm run test:coverage        # Tests with coverage report
npm run test:integration     # Playwright integration tests
npm run test:all             # All tests
npm run format               # Prettier format
npm run format:check         # Check formatting
```

---

## Key Files

| File                       | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `CLAUDE.md`                | This file — project conventions and session startup     |
| `version.txt`              | Semantic version (MAJOR.MINOR.PATCH)                    |
| `chrome/manifest.json`     | Extension manifest — permissions, version, entry points |
| `vitest.config.js`         | Vitest configuration                                    |
| `playwright.config.js`     | Playwright configuration                                |
| `.eslintrc.cjs`            | ESLint rules                                            |
| `.prettierrc`              | Prettier config                                         |
| `.github/workflows/`       | CI, release, and Pages automation                       |
| `.githooks/`               | Pre-commit and commit-msg hooks                         |
| `scripts/install-hooks.sh` | One-time hook installer                                 |

---

## Starting a New Session

1. Read this file
2. Run `npm run lint && npm test` to confirm everything passes
3. Invoke `superpowers:brainstorming` before touching any feature
4. Follow the Required Skills table — every skill is mandatory, not optional
