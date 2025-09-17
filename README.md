# LinkedIn Lead Exporter Extension

A Chrome MV3 extension that scrapes the currently visible LinkedIn search results, stores deduplicated leads locally, optionally evaluates them with OpenAI, and exports them as CSV or JSON files.

## Features

- **Scan Results**: Injects a content script into the active LinkedIn search tab and extracts names, headlines, companies, locations, and profile URLs.
- **Lead Storage**: Saves and deduplicates leads in `chrome.storage.local` so repeated scans simply enrich existing entries.
- **OpenAI Evaluation**: Allows the user to provide an OpenAI API key and score stored leads, storing both `aiScore` and `aiReasons` fields.
- **Export**: Downloads the stored leads as CSV or JSON using the Chrome downloads API.

## Development

1. Load the extension in Chrome via `chrome://extensions` → **Load unpacked** → select this folder.
2. Navigate to a LinkedIn search results page.
3. Open the extension popup and use the provided controls.

> **Note:** The OpenAI integration requires a valid API key supplied by the user via the popup settings section.
