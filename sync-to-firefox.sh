#!/bin/bash
# Sync Chrome code to Firefox
# Since both use identical api/ imports, files can be copied directly

echo "🔄 Syncing Chrome → Firefox..."
echo ""

# Copy shared code (everything except api/ and manifest.json)
rsync -av --exclude='api/' --exclude='manifest.json' \
  chrome/popup/ firefox/popup/

rsync -av --exclude='api/' \
  chrome/background/ firefox/background/

rsync -av chrome/scripts/ firefox/scripts/
rsync -av chrome/styles/ firefox/styles/
rsync -av chrome/icons/ firefox/icons/

# Copy HTML/CSS files
cp chrome/popup.html firefox/popup.html
cp chrome/popup.css firefox/popup.css
cp chrome/popup.js firefox/popup.js
cp chrome/leads.html firefox/leads.html
cp chrome/leads.css firefox/leads.css
cp chrome/leads.js firefox/leads.js
cp chrome/sample.html firefox/sample.html
cp chrome/background.js firefox/background.js

echo ""
echo "✅ Sync complete! Chrome and Firefox are now in sync."
echo ""
echo "📋 Browser-specific files (NOT synced):"
echo "   • chrome/api/ vs firefox/api/"
echo "   • chrome/manifest.json vs firefox/manifest.json"
echo ""
echo "🔍 Manifest differences:"
echo "   Chrome:  \"background\": { \"service_worker\": \"background.js\", \"type\": \"module\" }"
echo "   Firefox: \"background\": { \"scripts\": [\"background.js\"], \"type\": \"module\" }"
echo ""
echo "💡 Firefox MV3 uses 'scripts' array, not 'service_worker'"
echo ""
