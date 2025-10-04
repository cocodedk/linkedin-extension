## 6. UI Sketch

### Popup View (Compact):

```
+----------------------------------------+
| LinkedIn Lead Exporter                 |
+----------------------------------------+
| [Scan] [View] [Evaluate]               |
| [Enrich Virk] [AI Query] [Open]        |
| [Export CSV] [Export JSON] [🗑]        |
+----------------------------------------+
| Settings: [ OpenAI Key _________ ]     |
|           [Save Key]                   |
+----------------------------------------+
| Status: Enriched 12/15 leads           |
+----------------------------------------+
| Card Grid View:                        |
|                                        |
| +----------------+ +----------------+  |
| | John Doe       | | Jane Smith     |  |
| | Level7 • DK    | | TechCo • SF    |  |
| | Score: 85      | | Score: 92      |  |
| | 🏢 CVR: 395164 | | (No Virk data) |  |
| | 📍 Roskilde    | |                |  |
| +----------------+ +----------------+  |
|                                        |
| +----------------+ +----------------+  |
| | Bob Johnson    | | Alice Lee      |  |
| | StartupX • LA  | | FinCorp • NYC  |  |
| | Score: 78      | | Score: 88      |  |
| +----------------+ +----------------+  |
+----------------------------------------+
```

### Full-Page Tab View (Expanded):

```
+--------------------------------------------------------+
| LinkedIn Lead Manager              15 leads            |
+--------------------------------------------------------+
| [🔍 Scan] [⚡ Evaluate] [🇩🇰 Enrich] [👁️ Refresh]    |
| [🤖 AI Query] [📊 CSV] [📄 JSON] [🗑️ Clear]          |
+--------------------------------------------------------+
| OpenAI API Key: [_______________] [💾 Save Key]       |
+--------------------------------------------------------+
| Status: Enriched 12 leads with Virk.dk data           |
+--------------------------------------------------------+
| Responsive Card Grid (3-4 columns on desktop):         |
|                                                        |
| +---------------+ +---------------+ +---------------+  |
| | John Doe      | | Jane Smith    | | Bob Johnson   |  |
| | CEO @ Level7  | | CTO @ TechCo  | | VP @ StartupX |  |
| | Denmark       | | San Francisco | | Los Angeles   |  |
| | Score: 85     | | Score: 92     | | Score: 78     |  |
| |               | |               | |               |  |
| | 🏢 CVR:       | | (No CVR data) | | (No CVR data) |  |
| | 39516446      | |               | |               |  |
| | 📍 Address:   | |               | |               |  |
| | Københavns-   | |               | |               |  |
| | vej 19B       | |               | |               |  |
| | 4000 Roskilde | |               | |               |  |
| | 📋 Anparts-   | |               | |               |  |
| | selskab       | |               | |               |  |
| | ✅ Normal     | |               | |               |  |
| |               | |               | |               |  |
| | AI Reasons:   | | AI Reasons:   | | AI Reasons:   |  |
| | Strong fit... | | Perfect...    | | Good match... |  |
| |               | |               | |               |  |
| | FITS Summary: | | FITS Summary: | | FITS Summary: |  |
| | Compliance... | | Security...   | | Risk mgmt...  |  |
| +---------------+ +---------------+ +---------------+  |
|                                                        |
| [More cards below...]                                  |
+--------------------------------------------------------+
```

### Key UI Improvements:

* **Card-based layout**: Replaced table with modern card grid for better readability
* **Responsive design**: Adapts from 1-4 columns based on viewport width
* **Full-page option**: "Open in Tab" button opens leads in dedicated browser tab
* **Visual hierarchy**: Chips for metadata, clear sections for AI insights and Virk.dk data
* **Status feedback**: Real-time updates during scanning, evaluation, and Virk enrichment
* **Confirmation dialogs**: Prevent accidental data loss on clear operations
* **Virk.dk integration**: Shows CVR number, official address, company form, and status for Danish companies
* **Conditional display**: Virk data only shown when available, clean fallback for non-Danish leads
