#!/bin/zsh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$PROJECT_DIR/app"
PORT="${PORT:-4173}"
URL="http://127.0.0.1:${PORT}"
BUNDLED_NODE="/Users/toddbailey/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Todd Bailey Music ESP is already running."
  echo "Opening $URL"
  open "$URL" || echo "Open this URL in your browser: $URL"
  exit 0
fi

if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [ -x "$BUNDLED_NODE" ]; then
  NODE_BIN="$BUNDLED_NODE"
else
  echo "Node.js was not found. Install Node.js 20+ or open this project in Codex Desktop."
  exit 1
fi

echo "Starting Todd Bailey Music ESP at $URL"
echo "Leave this Terminal window open while using the dashboard."
cd "$APP_DIR"

(
  sleep 1
  open "$URL" || echo "Open this URL in your browser: $URL"
) &

exec "$NODE_BIN" server.js
