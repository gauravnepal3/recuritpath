#!/bin/sh
set -e

# Only run migrations if not in production or if explicitly set
if [ "$NODE_ENV" != "production" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  pnpm --filter database run db:migrate:deploy
fi

echo "Starting application..."
exec "$@"