#!/bin/bash
# Run ONE Ralph iteration against the habit-tracker app.
# Usage: ./ralph/ralph-once.sh   (run from the repo root)
set -e

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$RALPH_DIR/.." && pwd)"
APP_DIR="${APP_DIR:-$REPO_ROOT/habit-tracker}"

prompt=$(cat "$RALPH_DIR/prompt.md")

cd "$APP_DIR"
tickets=$(shopt -s nullglob; cat "$REPO_ROOT"/tickets/*.md "$REPO_ROOT"/tickets/done/*.md 2>/dev/null)
tickets="${tickets:-No tickets found}"
commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")

claude --permission-mode bypassPermissions \
  "Previous commits: $commits Tickets: $tickets $prompt"
