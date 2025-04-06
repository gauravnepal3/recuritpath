FROM node:20.12.2-alpine AS base

# Builder stage
FROM base AS builder
RUN apk update && apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    openssl \
    # Ensure python3 is properly linked
    && ln -sf python3 /usr/bin/python

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune main --docker

# Installer stage
FROM base AS installer
RUN apk update && apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    openssl \
    # Ensure python3 is properly linked
    && ln -sf python3 /usr/bin/python

WORKDIR /app
# 🔧 Add curl here — this is the final image your app runs in
RUN apk add --no-cache curl
RUN yarn global add pnpm turbo

# Explicitly set Python path
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --unsafe-perm

COPY --from=builder /app/out/full/ .
# After installing packages and before `pnpm run generate`

RUN pnpm run generate

# Set build arguments for public environment variables
ARG NEXT_PUBLIC_PADDLE_CLIENT_KEY
ARG NEXT_PUBLIC_PADDLE_ENV
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLIENT_URL

# Set environment variables for Next.js build process
ENV NEXT_PUBLIC_PADDLE_CLIENT_KEY=${NEXT_PUBLIC_PADDLE_CLIENT_KEY}
ENV NEXT_PUBLIC_PADDLE_ENV=${NEXT_PUBLIC_PADDLE_ENV}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_CLIENT_URL=${NEXT_PUBLIC_CLIENT_URL}
RUN pnpm turbo build

# Runner stage
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY ./apps/main/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/main/.next/standalone ./
# Copy generated Prisma client
COPY --from=installer --chown=nextjs:nodejs /app/packages/database/generated /app/packages/database/generated
COPY --from=installer --chown=nextjs:nodejs /app/apps/main/.next/static ./apps/main/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/main/public ./apps/main/public

EXPOSE 3000
ENV PORT=3000
# Run entrypoint script
ENV HOSTNAME="0.0.0.0"
CMD node apps/main/server.js


