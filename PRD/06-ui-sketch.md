## 6. UI Sketch

### Popup View (Compact):

```
+----------------------------------------+
| LinkedIn Lead Exporter                 |
+----------------------------------------+
| [Scan] [View] [Evaluate]               |
| [Generate AI Query] [Open in Tab]      |
| [Export CSV] [Export JSON] [🗑]        |
+----------------------------------------+
| Settings: [ OpenAI Key _________ ]     |
|           [Save Key]                   |
+----------------------------------------+
| Status: Loaded 15 leads                |
+----------------------------------------+
| Card Grid View:                        |
|                                        |
| +----------------+ +----------------+  |
| | John Doe       | | Jane Smith     |  |
| | ACME Corp • NY | | TechCo • SF    |  |
| | Score: 85      | | Score: 92      |  |
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
| [🔍 Scan] [⚡ Evaluate] [🤖 AI Query] [👁️ Refresh]   |
| [📊 CSV] [📄 JSON] [🗑️ Clear All]                     |
+--------------------------------------------------------+
| OpenAI API Key: [_______________] [💾 Save Key]       |
+--------------------------------------------------------+
| Status: Evaluation complete                            |
+--------------------------------------------------------+
| Responsive Card Grid (3-4 columns on desktop):         |
|                                                        |
| +---------------+ +---------------+ +---------------+  |
| | John Doe      | | Jane Smith    | | Bob Johnson   |  |
| | CEO @ ACME    | | CTO @ TechCo  | | VP @ StartupX |  |
| | New York, NY  | | San Francisco | | Los Angeles   |  |
| | Score: 85     | | Score: 92     | | Score: 78     |  |
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
* **Visual hierarchy**: Chips for metadata, clear sections for AI insights
* **Status feedback**: Real-time updates during scanning and evaluation
* **Confirmation dialogs**: Prevent accidental data loss on clear operations
