#!/bin/bash

echo "☩ Codex Ecclesia: Cleaning merged patch branches..."
read -p "Are you sure you want to delete all merged 'patch' branches? (y/N): " confirm
[[ $confirm != [yY] ]] && echo "Aborted." && exit 1

git fetch --prune

merged_branches=$(git branch -r --merged origin/main | grep 'origin/kingsmoovedap-design-patch-' | sed 's/origin\///')

if [[ -z "$merged_branches" ]]; then
  echo "✅ No merged patch branches to delete."
  exit 0
fi

echo "🧨 Deleting the following merged patch branches:"
echo "$merged_branches"

for branch in $merged_branches; do
  git push origin --delete "$branch"
done

echo "✅ Cleanup complete."
