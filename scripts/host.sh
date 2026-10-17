#!/usr/bin/env bash
# Publish this machine's CodeCrack on a public HTTPS URL (ngrok), with sandboxed code execution.
#   ./scripts/host.sh         start (or restart)
#   ./scripts/host.sh stop    stop
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-3100}"
DIR=.host
mkdir -p "$DIR"

stop() {
  for f in app ngrok; do
    if [ -f "$DIR/$f.pid" ]; then kill -- "-$(cat "$DIR/$f.pid")" 2>/dev/null || kill "$(cat "$DIR/$f.pid")" 2>/dev/null || true; rm -f "$DIR/$f.pid"; fi
  done
}
if [ "${1:-}" = "stop" ]; then stop; echo "stopped"; exit 0; fi
stop

command -v ngrok >/dev/null || { echo "ngrok is not installed (sudo snap install ngrok, then: ngrok config add-authtoken <token>)"; exit 1; }
docker image inspect python:3.12-slim >/dev/null 2>&1 || docker pull python:3.12-slim

echo "→ building production bundle"
NEXT_DIST_DIR=.next-prod npx next build >"$DIR/build.log" 2>&1 || { tail -30 "$DIR/build.log"; exit 1; }

echo "→ starting tunnel"
setsid nohup ngrok http "$PORT" --log stdout >"$DIR/ngrok.log" 2>&1 &
echo $! >"$DIR/ngrok.pid"
URL=""
for _ in $(seq 1 30); do
  URL=$(curl -s localhost:4040/api/tunnels | python3 -c 'import sys,json
try:
    t=json.load(sys.stdin)["tunnels"]; print(next((x["public_url"] for x in t if x["public_url"].startswith("https")),""))
except Exception: print("")' || true)
  [ -n "$URL" ] && break
  sleep 1
done
[ -n "$URL" ] || { echo "ngrok did not start, see $DIR/ngrok.log"; exit 1; }

echo "→ starting app on :$PORT (Docker sandbox for user code)"
NEXTAUTH_URL="$URL" RUNNER_SANDBOX=docker NEXT_DIST_DIR=.next-prod \
  setsid nohup npx next start -p "$PORT" >"$DIR/app.log" 2>&1 &
echo $! >"$DIR/app.pid"
for _ in $(seq 1 30); do curl -s -o /dev/null "localhost:$PORT" && break; sleep 1; done
echo "$URL" >"$DIR/url"
echo "✔ CodeCrack is live at: $URL"
