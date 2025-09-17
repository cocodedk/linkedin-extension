# LinkedIn Lead Exporter (Firefox)

Manifest V3 port of the LinkedIn Lead Exporter tuned for Mozilla Firefox. The code mirrors the Chrome build with small adjustments that swap Chrome APIs for promise-based WebExtension equivalents and add Firefox-specific metadata in `manifest.json`.

## Install in Firefox (temporary add-on)
1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on…**.
3. Choose this folder's `manifest.json` file.
4. The extension appears in the toolbar while the browser session remains open.

For distribution through AMO, update the `browser_specific_settings.gecko.id` if required and package the contents of this directory.

## Compatibility Notes
- Uses `browser.*` APIs (or the underlying Chrome shim) for storage, downloads, tabs, and scripting.
- Requires Firefox 109 or later for Manifest V3 plus the `scripting` API.
- Feature parity matches the Chrome build; keep both directories in sync when implementing new functionality.
