#!/bin/bash
# Automatically fix Chrome API calls in Firefox folder
# Run this after sync-to-firefox.sh

cd firefox || exit 1

echo "🔧 Fixing Firefox API calls..."

# Find all JS files (except in api/ folder) and replace chrome.* with proper imports
find . -name "*.js" -type f ! -path "*/api/*" ! -path "*/node_modules/*" | while read -r file; do
  # Check if file contains chrome.tabs, chrome.storage, etc.
  if grep -q "chrome\.\(tabs\|storage\|runtime\|scripting\|notifications\|action\|downloads\)" "$file"; then
    echo "  Fixing: $file"

    # Create backup
    cp "$file" "$file.bak"

    # Replace chrome.tabs with tabs (and add import if needed)
    if grep -q "chrome\.tabs" "$file" && ! grep -q "import.*tabs.*from.*api/tabs" "$file"; then
      # Add import at top (after first comment block or at line 1)
      sed -i '1 i\import { tabs } from '"'"'../api/tabs.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.tabs\./tabs\./g' "$file"

    # Replace chrome.storage with storage
    if grep -q "chrome\.storage" "$file" && ! grep -q "import.*storage.*from.*api/storage" "$file"; then
      sed -i '1 i\import { storage } from '"'"'../api/storage.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.storage\./storage\./g' "$file"

    # Replace chrome.runtime with runtime
    if grep -q "chrome\.runtime" "$file" && ! grep -q "import.*runtime.*from.*api/runtime" "$file"; then
      sed -i '1 i\import { runtime } from '"'"'../api/runtime.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.runtime\./runtime\./g' "$file"

    # Replace chrome.scripting with scripting
    if grep -q "chrome\.scripting" "$file" && ! grep -q "import.*scripting.*from.*api/scripting" "$file"; then
      sed -i '1 i\import { scripting } from '"'"'../api/scripting.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.scripting\./scripting\./g' "$file"

    # Replace chrome.notifications with notifications
    if grep -q "chrome\.notifications" "$file" && ! grep -q "import.*notifications.*from.*api/notifications" "$file"; then
      sed -i '1 i\import { notifications } from '"'"'../api/notifications.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.notifications\./notifications\./g' "$file"

    # Replace chrome.action with action
    if grep -q "chrome\.action" "$file" && ! grep -q "import.*action.*from.*api/action" "$file"; then
      sed -i '1 i\import { action } from '"'"'../api/action.js'"'"';' "$file"
    fi
    sed -i 's/chrome\.action\./action\./g' "$file"

    # Remove backup if changes were made
    rm -f "$file.bak"
  fi
done

echo "✅ Firefox API calls fixed!"
echo ""
echo "📊 Remaining direct chrome.* calls:"
grep -r "chrome\." . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "api/" | grep ".js:" | wc -l
