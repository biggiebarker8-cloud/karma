#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required. Install it, then double-click Start Karma.command again."
  read -r -p "Press Return to close"
  exit 1
fi
if ! python3 -c 'import sys; assert sys.version_info >= (3, 10)' 2>/dev/null; then
  echo "Karma needs Python 3.10 or newer."
  read -r -p "Press Return to close"
  exit 1
fi

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
if ! .venv/bin/python -c 'import fastapi, uvicorn' >/dev/null 2>&1; then
  .venv/bin/python -m pip install -r requirements.txt
fi

mkdir -p .data
if [ ! -s .data/access-key ]; then
  .venv/bin/python -c 'import secrets; print(secrets.token_urlsafe(32))' > .data/access-key
  chmod 600 .data/access-key
fi
export AUTH_ENABLED=true
export AUTH_BEARER_TOKEN="$(cat .data/access-key)"
export KARMA_DATA_FILE="$PWD/.data/karma.json"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo
echo "Karma access key: $AUTH_BEARER_TOKEN"
echo "On this iMac: http://localhost:7071"
if [ -n "$LAN_IP" ]; then
  echo "On your phone (same Wi-Fi): http://$LAN_IP:7071"
else
  echo "Connect the iMac to Wi-Fi to show a phone address."
fi
echo "Keep this window open while using Karma. Data saves under .data."
echo
if lsof -nPiTCP:7071 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 7071 is already in use. Close the other server, then try again."
  read -r -p "Press Return to close"
  exit 1
fi
.venv/bin/python -m uvicorn WrapperFunction:app --host 0.0.0.0 --port 7071 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
READY=false
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://localhost:7071/ >/dev/null 2>&1; then READY=true; break; fi
  sleep 1
done
if [ "$READY" != true ] || ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "Karma did not start. Check the error above."
  read -r -p "Press Return to close"
  exit 1
fi
open http://localhost:7071
wait "$SERVER_PID"
