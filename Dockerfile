# syntax=docker/dockerfile:1.6
# Hermes Workspace + Agent — Single-container Render deployment

# ─── build stage ──────────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ─── runtime stage ────────────────────────────────────────────────────────────
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl tini python3 supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r workspace && useradd -r -g workspace -u 10010 -m workspace

# Install hermes-agent globally
RUN npm install -g hermes-agent --legacy-peer-deps || true

WORKDIR /app

COPY --from=build --chown=workspace:workspace /app/dist ./dist
COPY --from=build --chown=workspace:workspace /app/node_modules ./node_modules
COPY --from=build --chown=workspace:workspace /app/package.json ./package.json
COPY --from=build --chown=workspace:workspace /app/server-entry.js ./server-entry.js
COPY --from=build --chown=workspace:workspace /app/skills ./skills

# Supervisor config to run both processes
COPY supervisord.conf /etc/supervisor/conf.d/hermes.conf

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    HERMES_API_URL=http://127.0.0.1:8642 \
    HERMES_DASHBOARD_URL=http://127.0.0.1:9119

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/hermes.conf"]
