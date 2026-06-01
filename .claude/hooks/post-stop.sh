#!/bin/bash
# Post-stop hook: reminds about PR creation if branch has unpushed commits

BRANCH=$(git branch --show-current 2>/dev/null)

if [[ "$BRANCH" == issue-* ]]; then
  UNPUSHED=$(git log @{u}..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$UNPUSHED" -gt 0 ]]; then
    echo ""
    echo "📋 Branch '$BRANCH' has $UNPUSHED unpushed commit(s)."
    echo "   When ready to merge: gh pr create --base dev --title 'feat: ...' --body 'Closes #N'"
  fi
fi
