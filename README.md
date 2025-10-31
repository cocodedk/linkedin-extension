# LinkedIn Lead Exporter Extension

Chrome Manifest V3 extension for collecting and evaluating LinkedIn search leads.

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

## Repository Layout
- `chrome/` – Chrome extension source (Manifest V3)
- `ARCHITECTURE.md` – Detailed explanation of the extension architecture
- `README-ARCHITECTURE.md` – Quick reference for the API abstraction pattern
- `DEEP_SCAN_ALL_TESTING.md` – Testing guide for the Deep Scan ALL feature

## Development Workflow

### Making Changes

Edit code in the `chrome/` folder (business logic, UI, handlers, etc.), then reload the unpacked extension.

### Architecture

The `chrome/api/` folder re-exports the relevant `chrome.*` APIs that the rest of the extension consumes.

All business logic imports from `../api/`, keeping the browser API usage centralized.

See `ARCHITECTURE.md` for additional implementation notes.

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
