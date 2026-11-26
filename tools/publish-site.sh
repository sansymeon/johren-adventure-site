#!/bin/sh
# Publish the Turbo site folder only. Run from anywhere. Does not deploy artwork or tools.
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
NETLIFY=/usr/bin/netlify
if [ ! -x "$NETLIFY" ]; then
  echo "The Netlify CLI is not installed at /usr/bin/netlify. Install that copy and log in once. Then run this script again."
  exit 1
fi
echo "Checking player data persistence before deploy..."
if ! node "$ROOT/tools/player-data/persistence-test.js"; then
  echo "Player data persistence test failed. Deploy stopped. See docs/player-data.md."
  exit 1
fi
cd /tmp
exec "$NETLIFY" deploy --prod --no-build --site=71c8b581-dddf-4a87-9365-d84c37559d55 --dir="$ROOT/site"
