#!/bin/bash
# Pre-implementation hook: validates branch naming before code changes

TOOL="$1"
BRANCH=$(git branch --show-current 2>/dev/null)

# Only check on file write/edit operations
if [[ "$TOOL" != "Write" && "$TOOL" != "Edit" ]]; then
  exit 0
fi

# Warn if on main or dev
if [[ "$BRANCH" == "main" || "$BRANCH" == "dev" ]]; then
  echo "⚠️  WARNING: You are on the '$BRANCH' branch."
  echo "   Create a feature branch first: git checkout -b issue-{N}-{description}"
  echo "   See CLAUDE.md for the workflow."
fi

# Check branch naming convention (issue-N-description)
if [[ "$BRANCH" != issue-* && "$BRANCH" != "main" && "$BRANCH" != "dev" ]]; then
  echo "⚠️  Branch '$BRANCH' does not follow the convention: issue-{N}-{description}"
fi
