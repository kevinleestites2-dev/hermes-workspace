# syntax=docker/dockerfile:1.6
# Hermes Workspace — production Docker image
#
# ─── build stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate && \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy manifests
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

# Install — pnpm 9 (no build-script blocking), onlyBuiltDependencies in workspace.yaml
RUN pnpm install --frozen-lockfile

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
