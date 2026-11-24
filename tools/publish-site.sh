#!/bin/sh
# Publish the Turbo site folder only. Run from anywhere. Does not deploy artwork or tools.
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
if ! command -v netlify >/dev/null 2>&1; then
  echo "Install the Netlify CLI and log in once. Then run this script again."
  exit 1
fi
cd /tmp
exec netlify deploy --prod --no-build --site=71c8b581-dddf-4a87-9365-d84c37559d55 --dir="$ROOT/site"
