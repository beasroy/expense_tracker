# Expense Tracker

A small full-stack **personal expense tracker**: create expenses, list them with **category filter** and **date sort**, and see a **running total** for the current view. Built as a production-minded exercise (reliable API, validation, idempotent writes) while keeping the feature set small.

## Features

- **Create expense** — amount (₹), category, description, date (calendar picker).
- **List expenses** — table with server-backed data.
- **Filter** by category and **sort** by date (newest / oldest first).
- **Total** for the rows returned by the current filter + sort.
- **Resilient `POST`** — same request can be retried (network / refresh) without duplicating rows, using an **idempotency key**.
- **Validation** — shared **Zod** rules on the API; client shows inline errors after touch / submit.

## Tech stack

| Layer | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js** (App Router) | One codebase for UI + API routes, easy deploy to **Vercel**, good defaults for React 19. |
| Language | **TypeScript** | Safer refactors and clearer contracts between client, API, and DB. |
| Database | **PostgreSQL** via **Neon** | Managed Postgres, branching-friendly, works well with serverless-style workloads. |
| ORM | **Prisma** | Schema-first migrations, type-safe queries, straightforward Neon setup (`DATABASE_URL` + `DIRECT_URL`). |
| HTTP client | **Axios** | Simple error handling and interceptors if the app grows. |
| Validation | **Zod** | One schema shape for API validation; reusable on the client. |
| UI | **Tailwind CSS** + **Radix**-style primitives (dropdown, popover) + **react-day-picker** | Accessible components without a heavy design system; calendar for dates. |

## Why PostgreSQL (Neon) and not MongoDB?

- **Relational fit** — Expenses naturally belong to a **Category** with a foreign key. Joins, filters, and aggregates (e.g. totals) are straightforward in SQL.
- **Constraints & correctness** — Unique indexes (e.g. category name, idempotency key) and transactions are first-class; good fit for **money** and **no duplicate submits**.
- **Prisma workflow** — Migrations and a single schema file match how I wanted to evolve the model under a timebox.
- **MongoDB** would be fine for a document-only prototype, but I’d still want careful handling of **deduplication**, **numeric precision**, and **consistency** for retries — often ending up reintroducing relational patterns anyway.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/expenses` | Create expense. Body: `amount`, `category`, `description`, `date`. Header: **`X-Idempotency-Key`** (required). |
| `GET` | `/api/expenses` | List expenses. Query: `category` (optional), `sort` (`date_desc` \| `date_asc`, optional; default newest first). Response: `{ items, totalPaise }`. |

Category names are **normalized** (trim + lowercase) so `Food` and `food` map to one category.

## Data model (high level)

- **Category** — `id`, `name` (unique, normalized).
- **Expense** — `id`, `amountPaise`, `categoryId`, `description`, `date`, `createdAt`.
- **IdempotencyKey** — ties a client key to one expense for safe retries.

Amounts are stored as **integer paise** to avoid floating-point issues.

## Local setup

1. **Node** — use a current LTS (e.g. 20+); project targets Next 16 / React 19.

2. **Environment** — copy `.env.example` to `.env.local` and set:

   - **`DATABASE_URL`** — Neon **pooled** connection string (app runtime).
   - **`DIRECT_URL`** — Neon **direct** connection string (Prisma migrations).  
     Example:

   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```

3. **Database schema**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

Optional: `GET /api/health/db` runs a simple `SELECT 1` check against the database.

## Trade-offs (timebox)

- **Single-user / no auth** — Faster to ship; see “Intentionally not done” below.
- **No pagination** — Acceptable for a small personal list; would add `cursor` / `limit` for scale.
- **Totals from listed rows only** — Matches the assignment (“total for the current list”); global analytics would be separate queries.
- **Idempotency header required** — Clients must send `X-Idempotency-Key`; documented but not a browser form default (the UI generates it).
- **Category UX** — Free-text category with normalization; no full “category admin” CRUD.

## Intentionally not done

Things that are reasonable next steps but were **out of scope** for this pass:

- **Authentication / JWT (or sessions)** — No login, no multi-tenant isolation; all data is effectively “global” for the deployment.
- **Authorization** — No per-user `ownerId` on rows.
- **E2E / load tests** — Manual and lint/build only.
- **Prisma Accelerate / edge DB** — Standard Node Prisma client for API routes; no edge caching layer.
- **i18n / multi-currency** — INR-focused formatting; amounts still stored as paise for precision.

## Deploy (Vercel)

- Set **Root Directory** to the repo root (where `package.json` and `app/` live).
- Add **`DATABASE_URL`** and **`DIRECT_URL`** in the Vercel project settings.
- Run migrations against production (e.g. `npx prisma migrate deploy` in CI or a one-off job) so the schema matches the app.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Create/apply dev migrations (`prisma migrate dev`) |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:studio` | Prisma Studio (browse data) |
