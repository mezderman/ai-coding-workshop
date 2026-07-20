#!/bin/bash
# Run the Ralph AFK loop against the habit-tracker app.
# Usage: ./ralph/ralph-loop.sh <iterations>   (run from the repo root)
# Set SANDBOX=1 to run each iteration inside 'docker sandbox run claude'.
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  echo "Set SANDBOX=1 to run each iteration inside 'docker sandbox run claude' instead of a bare 'claude' call."
  exit 1
fi

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$RALPH_DIR/.." && pwd)"
APP_DIR="${APP_DIR:-$REPO_ROOT/habit-tracker}"
cd "$APP_DIR"

stream_text='select(.type=="assistant") | .message.content[] | select(.type=="text") | .text'
final_result='select(.type=="result") | .result'

runner="claude"
if [ "$SANDBOX" = "1" ]; then
  runner="docker sandbox run claude"
fi

for ((i=1; i<=$1; i++)); do
  echo "=== Ralph iteration $i/$1 ==="

  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  tickets=$(shopt -s nullglob; cat "$REPO_ROOT"/tickets/*.md "$REPO_ROOT"/tickets/done/*.md 2>/dev/null)
  tickets="${tickets:-No tickets found}"
  prompt=$(cat "$RALPH_DIR/prompt.md")

  tmpfile=$(mktemp)

  $runner \
    --verbose \
    --print \
    --output-format stream-json \
    --permission-mode bypassPermissions \
    "Previous commits: $commits Tickets: $tickets $prompt" \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")
  rm -f "$tmpfile"

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done

echo "Reached iteration limit ($1) without exhausting the backlog."
