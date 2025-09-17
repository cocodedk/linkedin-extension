# LinkedIn Lead Exporter (Chrome)

Manifest V3 build of the LinkedIn Lead Exporter extension. This folder contains the original Chrome-focused code with no functional changes beyond relocation into `chrome/`.

## Install in Google Chrome
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked**.
3. Select this `chrome/` directory (the one containing `manifest.json`).
4. (Optional) Pin the extension from the toolbar for quick access.

Once loaded, open a LinkedIn search results page and launch the popup from the toolbar to scan, review, score, or export leads.

## Development Tips
- All scripts are ES modules; use modern browsers that support module-based extension pages.
- Leads persist in `chrome.storage.local`. Use the **Clear stored leads** button in the popup to reset state during testing.
