# syntax=docker/dockerfile:1.6
# Hermes Workspace — production Docker image
#
# ─── build stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install deps — ignore native build scripts first, then rebuild esbuild explicitly
COPY package.json pnpm-lock.yaml* .npmrc* pnpm-workspace.yaml* ./
RUN pnpm config set unsafe-perm true && \
    pnpm install --frozen-lockfile --ignore-scripts && \
    ./node_modules/.bin/esbuild --version || \
    (cd node_modules/esbuild && node install.js) || \
    npx --yes esbuild@0.27.7 || true

# Copy sources and build
COPY . .
RUN pnpm build

# ─── runtime stage ────────────────────────────────────────────────────────
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl tini python3 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r workspace && useradd -r -g workspace -u 10010 -m workspace

WORKDIR /app

COPY --from=build --chown=workspace:workspace /app/dist ./dist
COPY --from=build --chown=workspace:workspace /app/node_modules ./node_modules
COPY --from=build --chown=workspace:workspace /app/package.json ./package.json
COPY --from=build --chown=workspace:workspace /app/server-entry.js ./server-entry.js
COPY --from=build --chown=workspace:workspace /app/skills ./skills

USER workspace
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    HERMES_API_URL=http://hermes-agent:8642

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "--max-old-space-size=2048", "server-entry.js"]
