# LinkedIn Lead Exporter Extensions

Cross-browser browser-extension project for collecting and evaluating LinkedIn search leads. The codebase now contains dedicated builds for both Google Chrome (Manifest V3) and Mozilla Firefox (Manifest V3 with browser-specific tweaks).

## Features
- **Lead capture**: Injects a content script into the active LinkedIn search results page and gathers profile metadata.
- **Deep Scan**: Extracts detailed company information from individual LinkedIn profiles.
- **Deep Scan ALL**: Automatically scans up to 100 pages of search results.
- **Persistent storage**: Deduplicates and stores captured leads locally so repeated scans enrich the saved list.
- **Virk.dk Integration**: Enriches leads with Danish CVR company data.
- **AI evaluation**: Lets you supply an OpenAI API key to score each lead and capture qualitative feedback.
- **Data export**: Downloads the stored leads as CSV or JSON using the browser downloads API.

## Installation

### Chrome Installation

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **Load unpacked**

4. Select the `chrome/` folder from this repository

5. The extension icon should appear in your browser toolbar

6. Pin the extension for easy access (click the puzzle icon → pin)

### Firefox Installation

1. Open Firefox and navigate to:
   ```
   about:debugging#/runtime/this-firefox
   ```

2. Click **Load Temporary Add-on...**

3. Navigate to the `firefox/` folder and select `manifest.json`

4. The extension will be loaded temporarily (persists until browser restart)

5. For permanent installation, you need to sign the extension through AMO or use Firefox Developer Edition/Nightly with signing disabled

**Note**: Temporary add-ons in Firefox are removed when the browser closes. For development, you'll need to reload it each time.

## Repository Layout
- `chrome/` – Chrome extension source (Manifest V3)
- `firefox/` – Firefox extension (synced from Chrome via `sync-to-firefox.sh`)
- `sync-to-firefox.sh` – Automated sync script (edit Chrome, run this to update Firefox)
- `ARCHITECTURE.md` – Detailed explanation of the cross-browser architecture
- `README-ARCHITECTURE.md` – Quick reference for the API abstraction pattern
- `DEEP_SCAN_ALL_TESTING.md` – Testing guide for the Deep Scan ALL feature

## Development Workflow

### Making Changes

1. **Edit code in the `chrome/` folder** (business logic, UI, handlers, etc.)

2. **Run the sync script** to copy changes to Firefox:
   ```bash
   ./sync-to-firefox.sh
   ```

3. **Reload extensions** in both browsers to test

### Architecture

Both builds use identical code except for the `api/` folder:
- `chrome/api/` → Re-exports `chrome.*` APIs
- `firefox/api/` → Re-exports `browser.*` APIs with fallback

All business logic imports from `../api/`, making the codebase 99% shared between browsers.

See `ARCHITECTURE.md` for full details.

## Usage

1. Navigate to LinkedIn search results (e.g., `linkedin.com/search/results/people/`)

2. Click the extension icon to open the popup

3. Use **Scan Results** to capture leads from the current page

4. Use **Deep Scan** to extract detailed company info from profiles

5. Use **Deep Scan ALL** to automatically scan multiple pages (up to 100)

6. View, evaluate, enrich, and export your leads

## Development Notes

> The OpenAI integration requires the user to provide an API key through the popup before evaluation can run.

> The Virk.dk enrichment feature requires Danish company data and works with CVR numbers.

> The Deep Scan ALL feature runs in a background service worker and survives popup closure. Progress is shown via badge updates.
