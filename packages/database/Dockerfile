FROM node:20-alpine
WORKDIR /app

# Copy only what's needed for migrations
COPY packages/database/package.json .
COPY packages/database/pnpm-lock.yaml .
COPY packages/database/prisma ./prisma

RUN corepack enable && pnpm install

ENTRYPOINT ["pnpm", "exec", "prisma", "migrate", "deploy"]