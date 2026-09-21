# LinkedIn Extension

Chrome Manifest V3 extension for collecting and evaluating LinkedIn search leads. Collects profile metadata, enriches with company data, and supports AI-based lead scoring.

## Website

- [English](https://linkedin-extension.cocode.dk/)
- [فارسی (Persian)](https://linkedin-extension.cocode.dk/fa/)

## Features

- **Lead capture**: Injects a content script into LinkedIn search results and gathers profile metadata
- **Deep Scan**: Extracts detailed company information from individual LinkedIn profiles
- **Deep Scan ALL**: Automatically scans up to 100 pages of search results
- **Persistent storage**: Deduplicates and stores captured leads locally
- **Virk.dk Integration**: Enriches leads with Danish CVR company data
- **AI evaluation**: Score leads using an OpenAI API key
- **Data export**: Downloads stored leads as CSV or JSON

## Download

[**Download LinkedIn Extension**](https://github.com/cocodedk/linkedin-extension/releases/latest/download/linkedin-extension.zip)

## Build from Source

**Prerequisites:** Node.js 22 or later, Google Chrome 116+.

```bash
git clone https://github.com/cocodedk/linkedin-extension.git
cd linkedin-extension
npm ci
./scripts/install-hooks.sh
npm run lint     # Lint
npm test         # Unit tests
```

Load in Chrome: `chrome://extensions/` → Developer mode → Load unpacked → select `chrome/`

## Architecture

```
linkedin-extension/
├── chrome/          ← Extension source (MV3)
│   ├── manifest.json
│   ├── background.js
│   ├── content/     ← LinkedIn page interaction
│   └── ui/          ← Popup UI
├── tests/           ← Vitest unit tests
├── test-extension/  ← Playwright test helpers
└── website/         ← GitHub Pages site
```

| Component         | Technology              |
| ----------------- | ----------------------- |
| Extension runtime | Chrome MV3              |
| Language          | JavaScript (ES modules) |
| Unit tests        | Vitest                  |
| Integration tests | Playwright              |
| Linting           | ESLint + Prettier       |

## Author

**Babak Bandpey** — [cocode.dk](https://cocode.dk) | [LinkedIn](https://linkedin.com/in/babakbandpey) | [GitHub](https://github.com/cocodedk)

## License

Apache-2.0 | © 2026 [Cocode](https://cocode.dk) | Created by [Babak Bandpey](https://linkedin.com/in/babakbandpey)
