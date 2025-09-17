# LinkedIn Lead Exporter Extensions

Cross-browser browser-extension project for collecting and evaluating LinkedIn search leads. The codebase now contains dedicated builds for both Google Chrome (Manifest V3) and Mozilla Firefox (Manifest V3 with browser-specific tweaks).

## Features
- **Lead capture**: Injects a content script into the active LinkedIn search results page and gathers profile metadata.
- **Persistent storage**: Deduplicates and stores captured leads locally so repeated scans enrich the saved list.
- **AI evaluation**: Lets you supply an OpenAI API key to score each lead and capture qualitative feedback.
- **Data export**: Downloads the stored leads as CSV or JSON using the browser downloads API.

## Repository Layout
- `chrome/` – original Chrome extension source, unchanged except for being relocated.
- `firefox/` – Firefox port that reuses the Chrome code with minimal compatibility shims.
- `prd.md` – product notes shared by both builds.

## Getting Started
Pick the target browser and follow the setup guide in the matching subfolder:

- Chrome: see `chrome/README.md`
- Firefox: see `firefox/README.md`

Each guide covers loading the unpacked extension, permissions, and any browser-specific tips.

## Development Notes
Both builds share the same popup UI and content-scripting logic. If you extend shared functionality, update both folders (or introduce shared tooling) so features stay in sync across browsers.

> The OpenAI integration requires the user to provide an API key through the popup before evaluation can run.
