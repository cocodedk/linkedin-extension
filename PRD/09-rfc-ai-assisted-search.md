# RFC: AI-Assisted Search Automation

## Context

Manual keyword entry in LinkedIn's search box is a bottleneck for sales reps using the extension. Many users rely on trial-and-error queries to surface relevant leads, which conflicts with our goal of streamlining prospecting inside the browser. Introducing an AI co-pilot that proposes high-signal search phrases keeps users in flow, improves lead quality, and creates another touchpoint for differentiating the extension.

## Problem Statement

* Users spend significant time iterating on LinkedIn search keywords before scraping.
* Query craftsmanship varies by user, leading to inconsistent lead lists and noisy AI evaluations downstream.
* Existing functionality only operates on whatever query the user typed, with no feedback loop to suggest better phrasing.

## Goals

* Provide a single-click way to generate a LinkedIn-ready search phrase tailored to the user's target prospect description.
* Ensure the generated phrase is inserted into LinkedIn's global search input (`.search-global-typeahead__input`) without breaking native UI behaviour.
* Allow users to review and optionally edit the proposed query before running the search.
* Log the AI-generated query and meta information so downstream features (scraper, evaluation) know it originated from AI assistance.

## Non-Goals

* Building a conversational agent or multi-step prompt refinement inside the extension (out of scope for this release).
* Automatically executing the search without explicit user consent—pressing enter remains a user action.
* Replacing manual entry; users can still type their own queries.

## User Flow

1. User opens LinkedIn search page with the extension popup visible.
2. User clicks new `Generate AI Query` button in the popup.
3. Extension opens a lightweight prompt modal asking for the ideal customer profile (ICP) description or target role/industry.
4. On submit, extension calls configured AI provider to craft a LinkedIn search phrase (e.g., boolean keywords, title filters).
5. Generated phrase fills the global search box (`input.search-global-typeahead__input`).
6. User can edit the phrase directly in LinkedIn's UI and press enter to execute the search.
7. Extension tags the session as `aiQuery: true` for telemetry and future analytics.

## UX Notes

* Button placement: below existing scrape/export controls in the popup to keep related actions grouped.
* Modal prompt copy: "Describe who you want to find" with helper text listing examples ("B2B SaaS CFOs in Europe").
* Loading state: disable button and show inline spinner while awaiting AI response; provide retry on failure.
* Inserted query should preserve focus in the search input so user can immediately tweak or press enter.

## Technical Approach

* **Detection/Insertion**: Use `document.querySelector('input.search-global-typeahead__input')` with attribute fallback for robustness. Validate input is still attached to DOM before setting `value` and dispatching input events to trigger LinkedIn's internal handlers.
* **AI Service**: Reuse existing OpenAI integration where available; otherwise, call our backend proxy (if configured) with a system prompt tuned for LinkedIn boolean search phrase output.
* **Prompt Template**: Provide ICP description, highlight requirement for LinkedIn-specific operators (e.g., `AND`, `OR`, quotes), and ask for a short heading summarising the query for logging.
* **Telemetry**: Extend local storage schema to include `lastAiQuery`, timestamp, and ICP text. Hook into existing analytics emitter (or create simple event log) for future success metric tracking.
* **Permissions**: No new extension permissions; operate on active tab DOM via existing content script.

## Dependencies

* OpenAI API key or compatible provider configuration.
* LinkedIn DOM remaining consistent with `.search-global-typeahead__input`. Include fallback selectors noted in functional requirements doc if the class changes.

## Risks & Mitigations

* **LinkedIn DOM changes** – Mitigate by using layered selectors and validating input presence before mutation.
* **Low-quality AI queries** – Provide user editing step and capture feedback via optional thumbs-up/down control for future prompt tuning.
* **Latency** – Cache last successful prompt/response locally so users can reuse without waiting.
* **Rate limits** – Respect provider usage caps; throttle requests to one in-flight per user.

## Metrics

* Adoption: % of sessions with AI-generated queries.
* Quality: Average thumbs-up vs thumbs-down on AI queries (if feedback control implemented).
* Outcome: Conversion to scrape action after AI query vs manual query baseline.
* Efficiency: Time from query generation to scrape initiation.

## Open Questions

* Should we provide predefined ICP templates to reduce prompt friction?
* Do we surface AI confidence or reasoning alongside the generated phrase?
* How do we support users without API keys—bundle with default model via backend proxy?
