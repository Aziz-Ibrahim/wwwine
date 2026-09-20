# wwwine

World Wide Wine is a Next.js application for exploring wine countries, regions,
and appellations. This document is for local development, deployment, and
maintenance.

## Project status

The project is currently maintained by a single owner. It is not open source
and is not accepting external contributions at this time. See [LICENSE](LICENSE)
for the current terms. Collaboration and contribution terms can be introduced
later without treating the existing repository as an open-source project.

## Technology

- Next.js 14 App Router and React 18
- TypeScript with strict type checking and typed routes
- CSS Modules and global CSS custom properties
- `react-simple-maps` and `d3-geo` for geographic rendering
- Supabase Postgres for anonymous intent events and contact messages
- JSON-backed wine content in `src/data/regions.json`
- Vercel configuration for deployment in the London region

The atlas, search, comparison, food pairing, and wine matching features use the
local JSON dataset. Supabase is required for intent collection, the internal
intelligence dashboard, and contact-form persistence.

## Requirements

- Node.js 20 or a current Node.js LTS release
- npm
- A Supabase project for service-backed features

## Local setup

```bash
git clone <repository-url>
cd wwwine
npm install
```

Create the local environment file from the tracked template:

```bash
cp .env.local.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Fill in the Supabase values, initialise the database as described below, then
start the application:

```bash
npm run dev
```

The default development URL is `http://localhost:3000`.

## Environment variables

| Variable | Required | Scope | Purpose |
|---|---:|---|---|
| `SUPABASE_URL` | Yes | Server | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Server only | Intent-event inserts and dashboard queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | Preferred credential for contact-message reads and writes |
| `INTELLIGENCE_SECRET` | Yes | Server/client entry | Bearer secret entered at `/intelligence` and checked by protected APIs |
| `NEXT_DIST_DIR` | No | Build | Moves Next.js output, useful for OneDrive workspaces on Windows |

Never prefix the service-role key or intelligence secret with `NEXT_PUBLIC_`.
Do not commit `.env.local`, `.env.production`, or any real credentials. The
browser sends the intelligence secret as a bearer token after the operator
enters it; it is not embedded in the client bundle.

## Supabase setup

Run these tracked scripts in the Supabase SQL Editor:

1. `supabase/intent_events.sql`
2. `supabase/contact_messages.sql`

Both tables use Row Level Security, but their access models differ:

- `/api/intent` uses `SUPABASE_ANON_KEY` for both event inserts and dashboard
  reads. The deployed `intent_events` policies must therefore allow the `anon`
  role to perform those operations. The dashboard API still requires
  `INTELLIGENCE_SECRET`, but that bearer check happens in Next.js rather than
  Supabase.
- `/api/contact` prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to the
  configured secret or anonymous key. Production should provide the
  service-role key so contact data remains inaccessible through public RLS
  policies.

All Supabase credentials are currently consumed by server routes. Keep the
service-role key restricted to server environments and do not expose the anon
key through a `NEXT_PUBLIC_` variable unless the client architecture changes.

The current intent dashboard aggregates rows in the API process. This is fine
for the present volume, but should move to SQL views or RPC functions before
the event table becomes large. A retention job is not installed automatically;
configure a scheduled deletion policy in Supabase if raw events should expire.

## Internal services

| Route | Access | Responsibility |
|---|---|---|
| `POST /api/intent` | Application, Supabase anon role | Validate and store anonymous interaction events |
| `GET /api/intent?hours=24` | Bearer secret, Supabase anon role | Return aggregated intelligence data, up to 720 hours |
| `POST /api/contact` | Public form | Validate and store contact messages |
| `GET /api/contact` | Bearer secret | Return the latest 200 contact messages |
| `PATCH /api/contact` | Bearer secret | Mark a contact message read or unread |
| `GET /api/regions` | Public | List, search, or filter wine regions |
| `GET /api/regions/[id]` | Public | Return one region |
| `GET /api/compare-wines` | Public | Return comparison-ready appellation data |

The `/intelligence` page is an internal interface over the protected intent and
contact endpoints. Its current shared-secret gate is suitable for a single
operator, not a multi-user team. Before adding collaborators, replace it with
individual authentication, role-based access, and auditable credential
rotation.

Contact rate limiting is currently held in process memory: five submissions per
IP per hour. It resets when a server instance restarts and is not coordinated
across multiple instances. Use a shared rate-limit store before relying on it
for higher traffic or abuse prevention.

## Data and application structure

```text
src/
  app/                  App Router pages and API routes
  components/           Atlas, navigation, tools, forms, and shared UI
  data/regions.json     Canonical wine-region and appellation content
  lib/data.ts           Dataset transforms and lookup helpers
  lib/search.ts         Client search indexing and result resolution
  lib/intent.ts         Anonymous event model and client transport
  types/index.ts        Shared domain types
supabase/               Reproducible database schema scripts
public/                 Static assets
```

`regions.json` is the canonical content source. Appellations drive comparison,
food pairing, wine matching, search, static appellation pages, and map detail.
Changes should satisfy the interfaces in `src/types/index.ts` and preserve
globally unique region and appellation IDs.

The world geometry is fetched at runtime from jsDelivr using the
`world-atlas@2` countries dataset. Local development and production therefore
need outbound access for the map background. Wine pins and application data are
served locally.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run build` | Create and validate the production build |
| `npm run start` | Serve an existing production build |
| `npm run lint` | Run Next.js linting once ESLint has been configured |

Run at least `npm run type-check` and `npm run build` before deployment.

## Deployment

`vercel.json` configures the Next.js build and deploys functions to `lhr1`.
Configure the environment variables in the hosting project for
Preview and Production as appropriate. Apply Supabase schema changes before
deploying code that depends on them.

The Next.js configuration limits build workers to avoid file-locking failures
inside OneDrive-synced Windows directories. `NEXT_DIST_DIR` can move generated
output elsewhere when needed.

## Ownership and future collaboration

Copyright is retained by Aziz Ibrahim. Viewing this repository does not grant
permission to reuse, redistribute, host, or create derivative products from its
code, data, copy, design, or assets.

Before accepting contributions, decide and document:

- whether the project remains proprietary or adopts an open-source license;
- whether contributors assign copyright or grant a contribution license;
- branch protection, review requirements, and release ownership;
- individual access controls for Vercel, Supabase, and the intelligence area;
- secret rotation and offboarding procedures.

Do not accept substantive third-party code before those terms are in place.
