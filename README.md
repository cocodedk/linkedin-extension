# LinkedIn Lead Exporter Extension

A Chrome MV3 extension that scrapes the currently visible LinkedIn search results, stores deduplicated leads locally, optionally evaluates them with OpenAI, and exports them as CSV or JSON files.

## Features

- **Scan Results**: Injects a content script into the active LinkedIn search tab and extracts names, headlines, companies, locations, and profile URLs.
- **Lead Storage**: Saves and deduplicates leads in `chrome.storage.local` so repeated scans simply enrich existing entries.
- **OpenAI Evaluation**: Allows the user to provide an OpenAI API key and score stored leads, storing both `aiScore` and `aiReasons` fields.
- **Export**: Downloads the stored leads as CSV or JSON using the Chrome downloads API.

## Installation in Chrome

Follow these steps to install the unpacked extension in Google Chrome:

1. **Get the source code**
   - Clone this repository: `git clone https://github.com/<your-account>/linkedin-extension.git`
   - or download the ZIP from GitHub and extract it to a convenient location.
2. **Open the Extensions page**
   - Launch Chrome and visit `chrome://extensions`.
   - Enable **Developer mode** using the toggle in the top-right corner of the page.
3. **Load the unpacked extension**
   - Click **Load unpacked**.
   - In the file dialog, choose the folder that contains the `manifest.json` file (the root of this project).
   - Confirm the selection. Chrome should add "LinkedIn Lead Exporter Extension" to your list of installed extensions.
4. **(Optional) Pin the extension**
   - Click the puzzle-piece icon in the Chrome toolbar and pin the extension for easy access.

After installation, you can open the popup from the Chrome toolbar whenever you are on a LinkedIn search results page.

## Development

1. Navigate to a LinkedIn search results page.
2. Open the extension popup and use the provided controls.

> **Note:** The OpenAI integration requires a valid API key supplied by the user via the popup settings section.
