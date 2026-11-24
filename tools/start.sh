#!/bin/sh
# Start the local site and the local admin. Does not deploy.
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! ss -ltn | awk '{print $4}' | grep -q ':8765$'; then
  python3 -m http.server 8765 --bind 127.0.0.1 --directory "$ROOT/site" >/tmp/turbo-site.log 2>&1 &
  echo $! > /tmp/turbo-site.pid
fi
if ! ss -ltn | awk '{print $4}' | grep -q ':8770$'; then
  python3 "$ROOT/tools/puzzle-admin/server.py" >/tmp/turbo-admin.log 2>&1 &
  echo $! > /tmp/turbo-admin.pid
fi
echo "Player site   http://127.0.0.1:8765/"
echo "Admin         http://127.0.0.1:8770/"
echo "Stop with: kill \$(cat /tmp/turbo-site.pid /tmp/turbo-admin.pid)"
