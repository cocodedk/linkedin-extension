## 7. Risks & Mitigations

* **LinkedIn ToS**: keep actions user-initiated, low volume.
* **Fragile DOM selectors**: abstract selectors into constants for easy patching; ship debug counters to validate scrape health.
* **OpenAI key leaks**: store only in browser `storage.local`; advise backend proxy for production.
* **Cross-browser drift**: reuse modules and shared PRD to keep Chrome/Firefox behavior aligned.
