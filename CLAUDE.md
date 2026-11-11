# CLAUDE.md

Guidance for Claude Code when working in this repository. Following this file
is enough to produce code that matches the repo's bar. Write code
indistinguishable from the best code already here.

## Repository Overview

SecureVault: a zero-knowledge password manager. The browser derives keys from
the master password and encrypts every entry before it leaves the device; the
server only ever stores ciphertext, a bcrypt hash of a derived auth hash, and
the vault key wrapped by a key only the master password can produce.

Tech: React 19, TypeScript (strict), Vite, TanStack Router (file-based routes),
TanStack Query, Zod, Tailwind v4, shadcn-style Radix components. Backend: Hono
on Vercel Node functions, Mongoose (MongoDB). Package manager: bun (Turborepo
monorepo, layout copied from Ledger; see `MONOREPO.md`). Node per `.nvmrc`.

## Development Commands

```bash
bun run typecheck   # turbo typecheck, every workspace
bun run lint        # turbo lint, every workspace
bun run lint:fix    # turbo lint:fix
bun run format      # prettier --write
bun run sync:check  # syncpack version mismatches
```

- Never run `dev` — assume it's already running on http://localhost:5173
  (from `apps/web`; Vite also serves the API under `/api` in dev).
- After every change: `bun run typecheck` and `bun run lint` must both pass
  with zero problems.
- Env vars live in `apps/web/.env.local` (see `apps/web/.env.example`).

## Architecture

Bun + Turborepo monorepo. App: `apps/web` (Vite SPA, plus the Vercel function
in `apps/web/api`).

Packages:

- `secure-api` — the backend. A Hono app (`src/app.ts`, base path `/api`) with
  `routes/auth`, `routes/vault`, `routes/user`, Mongoose models in `src/db`,
  and the security primitives in `src/security` (bcrypt, tokens, TOTP, rate
  limits) and `src/http` (sessions, request parsing, errors, audit log).
  `apps/web`'s `build:api` bundles it into `api/_lib/server.js` (gitignored);
  `api/index.ts` re-exports its `handle` as the HTTP methods. Vercel functions
  can't load workspace packages, so the function only imports the bundle.
- `secure-service` — every browser → API call, one folder per call
  (`src/service/<group>/<callName>/`: `index.ts`, `queryFunction.ts`,
  `schema.ts`). `src/client.ts` holds `requestApi` (sends the
  `x-secure-client: web` header the API requires on writes, parses errors into
  `Error` with `cause: { status, code }`) and `readErrorCause`.
- `crypto-service` — browser crypto, one folder per function:
  `deriveMasterKeys`, `createVaultKey`, `unlockVaultKey`, `sealLegacyVaultKey`,
  `encryptEntry`, `decryptEntry`, `createSalt`, `generatePassword`,
  `generatePassphrase` (EFF large wordlist).
- `formatting-service` — `formatDate`, `formatRelativeTime`.
- `business-logic-secure` — the layer the app consumes: the `secure`
  namespace of hooks (`src/secure.ts`), query options (`src/query/<group>/`),
  the in-memory vault session (`src/vaultSession.ts`), and derivations
  (`src/service/`).

Dependency direction: `apps/web` → `business-logic-secure` →
`secure-service`, `crypto-service`. The app never imports `secure-service`,
`crypto-service` or `secure-api` (ESLint `no-restricted-imports`); it may
import `formatting-service` directly. Packages are TS source (`main`/`exports`
point at `src`), linted and typechecked on their own through turbo.

### The `secure` namespace

Hooks are thin `useQuery`/`useMutation` wrappers. Flows that span several calls
(derive keys → log in → unwrap the vault key) live inside the mutation, so a
component only calls `mutate`.

- `secure.auth`: `useSession()` (user or `null`), `useLogin()`
  (`{ email, password }` → `{ status: "authenticated", user }` or
  `{ status: "mfa", mfaToken }`; unlocks the vault on success),
  `useVerifyMfa()` (`{ method: "totp" | "backup", code, mfaToken? }`),
  `useRegister()` (`{ email, name?, password }` → `{ token, email }`),
  `useConfirmRegistration()` (`{ token, code }`), `useLogout()`.
- `secure.vault`: `useVault({ includeDeleted })` → `{ passwords, categories }`
  with every entry decrypted (`id`, `title`, `username`, `password`, `url`,
  `notes`, `customFields`, `categoryId`, `tags`, `favorite`,
  `passwordStrength` 0–4, `isCompromised`, `isReused` (computed across active
  entries), `createdAt`, `updatedAt`, `lastUsedAt`, `passwordChangedAt`,
  `deletedAt`; dates are ISO strings). Disabled while locked.
  `useVaultKeys()`, `useVaultLock()` (`{ isUnlocked, lock }`),
  `useUnlockVault()` (password), `useCreateMasterPassword()` (password),
  `useCreatePassword()` / `useUpdatePassword()` (the full entry: `title`,
  `username?`, `password`, `url?`, `notes?`, `customFields?`, `categoryId`
  (string or null), `tags`, `favorite`, `isCompromised`; update also takes
  `id` — spread the existing entry and override what changed),
  `useDeletePassword()` (`{ id, isPermanent }`), `useRestorePassword()` (id),
  `useCreateCategory()` (`{ name, icon, color }`), `useUpdateCategory()`
  (`{ id, name?, icon?, color?, order? }`), `useDeleteCategory()`
  (`{ id, moveTo? }`). Every vault mutation invalidates the vault queries.
- `secure.user`: `useUpdateProfile()` (`{ name?, settings? }`),
  `useDeleteAccount()` (master password), `useMfaSetup({ enabled })`,
  `useEnableMfa()` (`{ secret, code }` → `{ backupCodes }`), `useDisableMfa()`
  (`{ password, code }`).
- Plain exports: `calculatePasswordStrength(password)` →
  `{ score, label, entropy, crackTime, feedback, isWeak }`, `STRENGTH_LABELS`,
  `generatePassword(options)`, `generatePassphrase(options)`,
  `toFaviconUrl(url)`, `readErrorCause(error)`, and `type decryptVault` for
  typing props: `Awaited<ReturnType<typeof decryptVault>>["passwords"][number]`.

The user's settings come from `secure.auth.useSession().data.settings`
(`theme`, `autoLockMinutes`, `clearClipboardSeconds`, `showPasswordStrength`,
`defaultView`, `defaultSort`, `showFavicons`, email preferences).

Derivations (filtering, sorting, security reports, chart data, stats) go in
`business-logic-secure/src/service/<topic>.ts` as pure functions exported from
`src/service/index.ts`, never in components and never in `apps/web/src/lib`,
which keeps only web concerns (`cn`, `useAutoLock`, clipboard).

### Security model (do not regress)

- The vault key is a non-extractable `CryptoKey` held only in
  `vaultSession.ts` memory. Never write keys, master passwords, derived hashes
  or decrypted entries to `localStorage`, `sessionStorage`, IndexedDB, cookies,
  URLs or logs. A reload locks the vault; `VaultLayout` shows `UnlockScreen`.
  Locking (`useVaultLock().lock`, auto-lock after `autoLockMinutes` idle,
  logout) removes the decrypted queries from the cache.
- The master password never leaves the browser. Re-authentication for
  dangerous actions (delete account, disable MFA, key upgrade) sends the
  derived auth hash, which the API checks with bcrypt under a rate limit.
- Sessions are opaque random tokens in an `HttpOnly; Secure; SameSite=Strict`
  `__Host-session` cookie, stored hashed server-side and revocable. Every
  non-GET API request must carry `x-secure-client: web` and must not be
  cross-site (enforced in `app.ts`); `requestApi` adds the header.
- Every query filters by the session's `userId`. Category ids in entry writes
  and `moveTo` are checked for ownership.
- Rate limits are keyed by account (email or user id) as well as by IP
  (`x-real-ip`, which Vercel sets), so rotating IPs does not bypass them.
- Legacy accounts (`keyVersion` 1) encrypted entries directly with the
  PBKDF2-derived key. On first unlock the client wraps that key as the vault
  key and uploads it (`PUT /api/vault/keys`, requires the auth hash), after
  which the account is `keyVersion` 2. Keep `deriveMasterKeys`
  byte-compatible with this scheme.
- Render user content as text only. No `dangerouslySetInnerHTML`.
- The CSP in `apps/web/vercel.json` allows scripts from `'self'` only; no
  inline scripts (theme bootstrapping lives in `public/theme-init.js`).

### Web app layout

- `src/routes/` — TanStack file routes. A route file only wires a page
  component (plus `validateSearch`); no markup or logic. `routeTree.gen.ts` is
  generated — never edit it. `_auth` is the pathless auth layout (login,
  register); `vault/route.tsx` is the signed-in layout (session check →
  unlock gate → sidebar).
- `src/components/pages/<Name>Page/` — one folder per page; child components
  in sub-folders of the page. Pages read route data only via
  `Route.useSearch()` / `Route.useParams()` imported from the route file
  (ESLint `nima/restrict-imports`).
- `src/components/layout/` — `AppLayout` (theme + toasts), `AuthLayout`,
  `VaultLayout` (`AppSidebar`, `NavUser`, `UnlockScreen`, `VaultSplash`).
- `src/components/shared/` — components used by more than one page
  (`FormError`, `CodeInput`, `GoogleButton`, `AuthDivider`, …).
- `src/components/ui/` — the shadcn-style kit (Button with `isLoading`,
  `Input`/`PasswordInput` with `label`, Card family, `Modal`,
  `ConfirmDialog`, `EmptyState`, `Spinner`, `Select`, `DropdownMenu`,
  `Checkbox`, `Tooltip`, `Sheet`, `Sidebar`, `DashboardPageHeader`,
  `DashboardContent`, `useToast` with `addToast({ type, title, message })`).
  Import from `@/components/ui`. Not linted; keep edits minimal.
- Loading: gate on `isPending` and render the kit's `Skeleton`/`Spinner`;
  `isError` renders the error with a retry.

## Components

- `React.FC` with inline prop types. Never a separate `type XyzProps` alias.

```tsx
const MyComponent: React.FC<{ title: string; className?: string }> = ({
	title,
	className,
}) => {
	return <p className={cn("text-lg", className)}>{title}</p>;
};

export { MyComponent };
```

- `const` arrow functions, never `function` declarations.
- Named exports only, collected in one `export { … }` at the bottom of the
  file. No `export default`. The one exception is `export const Route` in
  `src/routes/*`, which the TanStack router plugin requires.
- Every component lives in its own folder with an `index.ts` that re-exports
  it (`Foo/Foo.tsx` + `Foo/index.ts`).
- Functions with more than one parameter take a single object
  (`nima/params-naming-convention`). Framework callbacks that can't (Hono
  `(context, next)`) prefix every parameter with `$`.
- Event handlers are prefixed `handle` (`handleClick`, `handleSubmit`).
- Early returns over nested conditionals. One responsibility per component.
- No abbreviated identifiers — spell the full word: `event` not `e`,
  `previous` not `prev`, `index` not `i`. `id` is a word.
- Reuse components from `@/components/shared` and `@/components/ui`. Never
  hand-roll an equivalent. If one lacks a style you need, extend it with a
  prop.
- NEVER write a comment. No `//`, no `/* */`, no JSDoc, no TODO, no
  `eslint-disable`. Code documents itself.
- No dead, commented-out, or speculative code.

## Code Layout

- File order: imports → module constants → private child components and
  helpers → the exported component → one `export { … }` statement.
- Imports in three groups separated by one blank line: external packages,
  then `@/` aliases, then relative imports. Type-only imports use
  `import type` / inline `type` (`verbatimModuleSyntax`).
- Component body order, one blank line between groups: router/context hooks
  and `secure.*` hooks → local state → derived values → effects → handlers →
  early returns → JSX.
- JSX: one blank line between sibling sections. No ternary nested more than
  one level. An inline JSX arrow does exactly one call; anything more becomes
  a `handle…` function.
- A component over ~150 lines, or with 3+ levels of JSX conditionals, is
  split.

## TypeScript

- Strict mode with `noUncheckedIndexedAccess` and `verbatimModuleSyntax`. No
  `any` — use `unknown` and narrow.
- Never create a named type/interface alias unless the compiler literally
  cannot infer without it. Inline type expressions at the call site; derive
  shapes with `typeof`, `ReturnType`, `Awaited`, `Parameters`.
- Never annotate function/component return types.
