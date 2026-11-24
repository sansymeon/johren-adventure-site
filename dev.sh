#!/bin/sh
# Local Turbo Adventures site. Serves site/ as the website root.
cd "$(dirname "$0")/site" || exit 1
echo "Turbo Adventures: http://127.0.0.1:8765/"
echo "Stop with Ctrl+C."
exec python3 -m http.server 8765 --bind 127.0.0.1
