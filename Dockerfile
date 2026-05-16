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
      ca-certificates curl tini python3 python3-pip python3-venv \
      supervisor git build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r workspace && useradd -r -g workspace -u 10010 -m workspace

# Install uv (fast Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Install hermes-agent via Nous official method
RUN git clone https://github.com/NousResearch/hermes-agent.git /opt/hermes-agent \
    && cd /opt/hermes-agent \
    && uv venv /opt/hermes-venv --python 3.11 \
    && /opt/hermes-venv/bin/pip install -e . --no-cache-dir \
    && chown -R workspace:workspace /opt/hermes-agent /opt/hermes-venv

# Set up hermes home dir
RUN mkdir -p /home/workspace/.hermes \
    && chown -R workspace:workspace /home/workspace/.hermes

# Write hermes config with Gemini provider
COPY hermes-config.yaml /home/workspace/.hermes/config.yaml
COPY hermes.env /home/workspace/.hermes/.env
RUN chown workspace:workspace /home/workspace/.hermes/config.yaml \
                               /home/workspace/.hermes/.env

WORKDIR /app
COPY --from=build --chown=workspace:workspace /app/dist ./dist
COPY --from=build --chown=workspace:workspace /app/node_modules ./node_modules
COPY --from=build --chown=workspace:workspace /app/package.json ./package.json
COPY --from=build --chown=workspace:workspace /app/server-entry.js ./server-entry.js
COPY --from=build --chown=workspace:workspace /app/skills ./skills

COPY supervisord.conf /etc/supervisor/conf.d/hermes.conf

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    HERMES_API_URL=http://127.0.0.1:8642 \
    HERMES_DASHBOARD_URL=http://127.0.0.1:9119 \
    HERMES_ALLOW_INSECURE_REMOTE=1 \
    PATH="/opt/hermes-venv/bin:/root/.local/bin:$PATH"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/hermes.conf"]
