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
 && apt-get install -y --no-install-recommends python3 g++ util-linux ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000 PYTHON_BIN=python3 RUNNER_SANDBOX=local
COPY --from=build /app ./
EXPOSE 3000
# Seeds problems/tracks on start (idempotent), then serves. User code runs as "nobody" inside the container.
# NEXTAUTH_URL falls back to Render's public URL; seeding is skipped when content/ hasn't changed.
CMD ["sh", "-c", "export NEXTAUTH_URL=${NEXTAUTH_URL:-$RENDER_EXTERNAL_URL}; npx tsx scripts/seed.ts --if-changed && exec npx next start -p ${PORT}"]
