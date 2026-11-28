#!/bin/sh
# Start the local site and the one Admin server. Does not deploy.
#   sh tools/start.sh          start only if the ports are free
#   sh tools/start.sh restart  stop the old listeners, then start fresh
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

stop_port() {
  port="$1"
  # Only python listeners on these local ports. Leaves other programs alone.
  python3 - "$port" << 'PY'
import os, signal, subprocess, sys
port = sys.argv[1]
try:
    text = subprocess.check_output(["ss", "-ltnp"], text=True, stderr=subprocess.DEVNULL)
except Exception:
    sys.exit(0)
for line in text.splitlines():
    if ":%s " % port not in line and not line.rstrip().endswith(":%s" % port):
        continue
    if "python" not in line:
        continue
    marker = line.find("pid=")
    if marker < 0:
        continue
    number = ""
    for char in line[marker + 4:]:
        if char.isdigit():
            number += char
        else:
            break
    if number:
        try:
            os.kill(int(number), signal.SIGTERM)
        except ProcessLookupError:
            pass
PY
}

if [ "${1:-}" = "restart" ]; then
  stop_port 8765
  stop_port 8770
  stop_port 8791
  sleep 1
fi

busy() {
  ss -ltn | awk '{print $4}' | grep -q ":$1$"
}

if busy 8765; then
  echo "Player site already running at http://127.0.0.1:8765/"
else
  python3 -m http.server 8765 --bind 127.0.0.1 --directory "$ROOT/site" >/tmp/turbo-site.log 2>&1 &
  echo $! > /tmp/turbo-site.pid
  echo "Player site   http://127.0.0.1:8765/"
fi

if busy 8770; then
  echo "Admin already running at http://127.0.0.1:8770/"
  echo "A second Admin is not started. If a page is missing, run: sh tools/start.sh restart"
else
  python3 "$ROOT/tools/puzzle-admin/server.py" >/tmp/turbo-admin.log 2>&1 &
  echo $! > /tmp/turbo-admin.pid
  echo "Admin         http://127.0.0.1:8770/"
fi
