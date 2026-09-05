# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base — pnpm is pinned from the root package.json "packageManager" field so
# builds are reproducible.
# ---------------------------------------------------------------------------
FROM node:22.14-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# Pruner — reduce the monorepo to just what `client` needs.
# ---------------------------------------------------------------------------
FROM base AS pruner
RUN --mount=type=cache,target=/root/.npm npm i -g turbo@2.3.3
COPY . .
RUN turbo prune client --docker

# ---------------------------------------------------------------------------
# Installer — deps, codegen, build.
# ---------------------------------------------------------------------------
FROM base AS installer
# canvas builds from source (node-gyp) and needs a full toolchain plus the
# cairo/pango headers. Installer stage only — none of this reaches the runtime
# image, which is a separate stage.
RUN apk add --no-cache \
    libc6-compat openssl \
    python3 make g++ pkgconfig \
    cairo-dev pango-dev giflib-dev librsvg-dev pixman-dev \
    && ln -sf python3 /usr/bin/python
ENV PYTHON=/usr/bin/python3

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store \
    pnpm config set store-dir /pnpm-store && \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm run generate

# NEXT_PUBLIC_* values are inlined at build time, so they must be correct here
# and not merely present at runtime.
ARG NEXT_PUBLIC_PADDLE_CLIENT_KEY
ARG NEXT_PUBLIC_PADDLE_ENV
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLIENT_URL
ARG S3_IMAGE_HOSTNAME
ENV NEXT_PUBLIC_PADDLE_CLIENT_KEY=${NEXT_PUBLIC_PADDLE_CLIENT_KEY} \
    NEXT_PUBLIC_PADDLE_ENV=${NEXT_PUBLIC_PADDLE_ENV} \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_CLIENT_URL=${NEXT_PUBLIC_CLIENT_URL} \
    S3_IMAGE_HOSTNAME=${S3_IMAGE_HOSTNAME} \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo build --filter=client

# ---------------------------------------------------------------------------
# Runner — standalone server only. No package manager, no source, no secrets.
# ---------------------------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/client/public ./apps/client/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/client/mailTemplates ./apps/client/mailTemplates

USER nextjs
EXPOSE 3001

# The public site has no API surface of its own; probe the rendered root.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3001/ || exit 1

CMD ["node", "apps/client/server.js"]
