#!/bin/bash

echo "☩ Initializing Codex Ecclesia Git Strategy..."

# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create dev branch
git checkout -b dev
git push -u origin dev

echo "☩ Created and pushed 'dev' branch."

# Show branch structure suggestion
echo "☩ Suggested branch naming:"
echo "  scroll/<scroll-name>"
echo "  tool/<tool-name>"
echo "  profile/<heir-name>"
echo "  fix/<area>-<issue>"
echo "  release/<version>"
echo "  hotfix/<issue>"

echo "☩ Next steps:"
echo "1. Protect 'main' branch in GitHub Settings > Branches"
echo "2. Commit all new work to 'dev'"
echo "3. Open Pull Requests from 'dev' to 'main' for review and merge"

echo "☩ Codex structure initialized. Let the scrolls begin."
