# CodeCrack — self-contained image: Next.js app + Python judge (+ g++ for C++).
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts/copy-monaco.mjs scripts/copy-monaco.mjs
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node scripts/copy-monaco.mjs && npx next build

FROM node:20-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 g++ util-linux ca-certificates curl gnupg \
 && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
 && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" > /etc/apt/sources.list.d/mongodb-org-7.0.list \
 && apt-get update && apt-get install -y --no-install-recommends mongodb-org-server \
 && apt-get purge -y curl gnupg && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000 PYTHON_BIN=python3 RUNNER_SANDBOX=local RUNNER_CONCURRENCY=1
COPY --from=build /app ./
EXPOSE 3000
# Seeds problems/tracks on start (idempotent), then serves. User code runs as "nobody" inside the container.
# Zero-config: embedded MongoDB + generated secret unless MONGODB_URI / NEXTAUTH_SECRET are provided.
CMD ["sh", "scripts/docker-start.sh"]
