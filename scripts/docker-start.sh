#!/bin/sh
# Container entrypoint. Works with zero configuration (embedded DB, generated secret) or with a real MONGODB_URI.
set -e
export PORT="${PORT:-3000}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-${RENDER_EXTERNAL_URL:-http://localhost:$PORT}}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(head -c 32 /dev/urandom | base64)}"

if [ -z "$MONGODB_URI" ]; then
  echo "MONGODB_URI not set → starting embedded MongoDB (demo mode: data resets when the container restarts)"
  mkdir -p /data/db
  PW="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9')"
  # --auth + a random password: user code running in the judge cannot touch the database.
  mongod --dbpath /data/db --bind_ip 127.0.0.1 --auth --wiredTigerCacheSizeGB 0.25 --quiet --fork --logpath /tmp/mongod.log >/dev/null || { cat /tmp/mongod.log 2>/dev/null | tail -5; exit 1; }
  node scripts/mongo-bootstrap.mjs codecrack "$PW"
  export MONGODB_URI="mongodb://codecrack:$PW@127.0.0.1:27017/codecrack?authSource=admin"
fi

npx tsx scripts/seed.ts --if-changed
exec npx next start -p "$PORT"
