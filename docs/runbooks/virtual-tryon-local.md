# Virtual Try-On Local Runbook

## Environment

- Use Node `18.20.8`.
- Load Node with `source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null`.
- Install workspace dependencies with `export COREPACK_HOME=/private/tmp/corepack && corepack pnpm install`.

## Current Local Mode

- The default API task persistence is in-memory.
- The default queue publisher is an in-memory placeholder that reports accepted queueing metadata.
- Uploads return session and expiry metadata, but do not write to real object storage.
- Asset bootstrap data comes from local seed payloads unless an override provider is wired in.
- Worker providers are local fake providers that do not make network calls.

## Startup Order

1. Install dependencies:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null
export COREPACK_HOME=/private/tmp/corepack
corepack pnpm install
```
2. Start API from `services/api` using the repo's normal dev entrypoint if one is added later.
3. Start worker from `services/worker` using the repo's normal dev entrypoint if one is added later.
4. Start miniapp and admin from their app directories with the repo's usual frontend commands.

## Test Commands

- API tests:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/api test
```
- Worker tests:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/worker test
```
- Miniapp tests:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/miniapp test
```
- Admin tests:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/admin test
```

## Typecheck Commands

- API:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/api typecheck
```
- Worker:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && corepack pnpm --filter @virtual-tryon/worker typecheck
```

## Database Notes

- `DATABASE_URL` is not required for the default local in-memory mode.
- `DATABASE_URL` is only needed when running Prisma validation or future database-backed persistence wiring.
- Example validation flow:
```sh
source ~/.nvm/nvm.sh && nvm use 18.20.8 >/dev/null && export COREPACK_HOME=/private/tmp/corepack && export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/virtual_tryon && corepack pnpm --filter @virtual-tryon/api prisma:validate
```

## Placeholder Boundaries

- Tasks are not yet persisted to Postgres by default.
- Queue publishing does not yet talk to Redis or BullMQ.
- Upload metadata does not mean the file has been copied into durable storage.
- Worker provider outputs are deterministic local placeholders intended to keep development and tests offline-friendly.
