# Monorepo

Bun workspaces + Turborepo, laid out like Ledger.

## Layout

```
apps/web/                       the Vite app, its Vercel function (api/) and vercel.json
packages/secure-api             the Hono backend: routes, Mongoose models, sessions, security primitives
packages/business-logic-secure  query options and hooks (`secure`), vault session, derivations
packages/secure-service         every browser → API call
packages/crypto-service         browser crypto: key derivation, vault key wrapping, entry encryption, generators
packages/formatting-service     date formatters
packages/eslint-config-base     shared ESLint rules
packages/eslint-config-react    React, hooks and router ESLint rules
packages/typescript-config      base.json, react-library.json
```

Packages ship TypeScript source (`main`/`exports` point at `src`) with no build
step. Vercel functions cannot load workspace packages, so `apps/web` bundles
the API into `api/_lib/server.js` itself (`build:api`).

Dependency direction: `apps/web` → `business-logic-secure` →
`secure-service`, `crypto-service`. The app never imports the services or the
API package (enforced by ESLint).

## Local development

1. `cp apps/web/.env.example apps/web/.env.local` and fill in `MONGODB_URI`
   and a random `SERVER_SECRET` (32+ characters). Google and SMTP are
   optional locally: without SMTP the verification code is printed to the
   dev server console.
2. `bun install`
3. `bun run dev` — Vite on http://localhost:5173 serves the SPA and mounts the
   Hono app under `/api` (`@hono/vite-dev-server`).

## Vercel

The project's Root Directory is `apps/web`. Vercel installs from the repo root
(bun.lock), runs `turbo build` for the web app (`build:api`, typecheck,
`vite build`), serves `dist`, and deploys `apps/web/api/index.ts` as the one
function; `vercel.json` rewrites `/api/*` to it and everything else to
`index.html`, and sets the CSP and security headers.

Environment variables: `MONGODB_URI`, `SERVER_SECRET`, `NODE_ENV=production`
(set by Vercel), `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASSWORD`, `SMTP_FROM`, and optionally `GOOGLE_CLIENT_ID` /
`GOOGLE_CLIENT_SECRET` (authorized redirect URI:
`https://<host>/api/auth/callback/google`).

## Tasks

```bash
bun run dev          # web dev server + API
bun run typecheck    # every workspace
bun run lint         # every workspace
bun run lint:fix
bun run format
bun run clean:all    # caches and node_modules
```

## Dependencies

```bash
bun add <package> --cwd apps/web          # add to one workspace
bun add -d <package>                      # root dev tool
bun run sync:check                        # version mismatches (syncpack)
bun run sync:fix
```

Internal packages are always `workspace:*` (enforced by `.syncpackrc.json`).
