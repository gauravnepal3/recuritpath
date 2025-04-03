FROM node:20-alpine AS builder

# 1. Set up pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Set working directory to monorepo root
WORKDIR /app

# 3. Copy only the minimal files needed first
COPY pnpm-lock.yaml package.json turbo.json ./

# 4. Install dependencies at root level
RUN pnpm install --frozen-lockfile

# 5. Now copy the database package files
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma

# 6. Install the database package dependencies
RUN cd packages/database && pnpm install

# 7. Generate Prisma client
RUN cd packages/database && pnpm exec prisma generate

# 8. Runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy only what's needed for runtime
COPY --from=builder /app/packages/database/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENTRYPOINT ["pnpm", "exec", "prisma", "migrate", "deploy"]