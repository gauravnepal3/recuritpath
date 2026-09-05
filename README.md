# Requro

Recruitment platform. Turborepo monorepo with two Next.js 16 apps over a shared
Postgres database.

| Workspace | Port | Purpose |
| --- | --- | --- |
| `apps/main` | 3000 | Recruiter dashboard — auth, jobs, candidates, billing, email |
| `apps/client` | 3001 | Public job boards, one per tenant subdomain |
| `packages/database` | — | Prisma schema, migrations, generated client |
| `packages/ui` | — | Shared component library |
| `packages/config-eslint` | — | Shared flat ESLint config |
| `packages/config-typescript` | — | Shared tsconfig bases |

## Local development

```bash
pnpm install
cp .env.example .env          # then fill it in
pnpm run generate             # generate the Prisma client
pnpm --filter @repo/database run db:migrate:deploy
pnpm run dev
```

The dashboard is at `http://localhost:3000`. The public site resolves tenants by
hostname, so use `http://<subdomain>.localhost:3001`.

## Checks

```bash
pnpm turbo run typecheck   # tsc --noEmit across every workspace
pnpm turbo run lint        # ESLint 9 flat config
pnpm turbo run build       # production build of both apps
```

CI runs all three plus a migration apply against a clean Postgres and a build of
both Docker images. See `.github/workflows/ci.yml`.

## Configuration

Every setting is an environment variable; `.env.example` is the complete list.

Two things are easy to get wrong:

- **`NEXT_PUBLIC_*` are inlined at build time.** They must be correct when the
  image is built, not just when it runs. They are passed as `build.args` in
  `docker-compose.yml`.
- **No `.env` file may enter the Docker build context.** `next build` with
  `output: 'standalone'` copies any `.env` it finds into `.next/standalone`,
  which lands in the runtime image. `.dockerignore` excludes them; do not
  loosen it. Supply secrets through the orchestrator instead.

## Deployment

Coolify + Traefik. `docker-compose.yml` defines three services:

- `migration` — runs `prisma migrate deploy` once and exits
- `main` — dashboard, routed on `APP_HOSTNAME`
- `client` — public sites, routed on `*.CLIENT_DOMAIN`

Both apps wait for `migration` to complete successfully before starting, so a
failed migration blocks the rollout rather than half-applying it.

```bash
docker compose build
docker compose up -d
```

### Infrastructure this expects

- **Postgres**, with automated backups and PITR. Set `connection_limit` in
  `DATABASE_URL` so replicas don't exhaust `max_connections`.
- **DNS**: an `A` record for `APP_HOSTNAME` and a wildcard `*.CLIENT_DOMAIN`,
  both pointing at the Traefik host. The wildcard certificate requires a DNS-01
  challenge — configure the `letsencrypt` resolver accordingly.
- **S3**: a private bucket for résumés/uploads, and a second bucket the SES
  receipt rule writes inbound mail into under `mail/`. The upload bucket needs
  CORS allowing `PUT` from `CLIENT_DOMAIN`.
- **SES** in production mode (not sandbox), with `MAIL_FROM_ADDRESS` verified
  and SPF, DKIM and DMARC published for its domain.
- **IAM**: one principal scoped to those two buckets and SES. Rotate the keys
  on a schedule.
- **Paddle**: production API key and webhook secret, webhook pointed at
  `https://APP_HOSTNAME/api/paddle/webhook`, and production price IDs in
  `apps/main/constants/price-tier.tsx` — sandbox IDs will not work live.

### Inbound email

SES receipt rule → S3 (`mail/{messageId}`) → `POST /api/emails/webhook` with
`Authorization: Bearer $WEBHOOK_SECRET`.

## Authorization model

A user belongs to organizations through `OrganizationUserRole`. The active
organization lives in two cookies, both set server-side only after membership is
verified: `organizationRole` (a signed JWT) and `organization`.

Read the active organization through `lib/organization.ts` — never from the
cookie directly. `requireActiveOrganization()` re-checks membership against the
database on every call, so revoking a member takes effect immediately rather
than at token expiry. Candidate queries must additionally spread
`candidateAccessScope(userId)` into their `where`; candidate ids appear in URLs
and email metadata, so an unscoped `where: { id }` is cross-tenant read access.
