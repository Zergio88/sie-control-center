# SIE Control Center

Frontend web app for the **SIE** (Sistema Integral de Inventario) warehouse
inventory system. React 19 + TypeScript + Vite, talking to the Spring Boot
backend at [sie-sistema-integral-inventario](https://github.com/Zergio88/sie-sistema-integral-inventario).

## Stack

- React 19, React Router 7 (data router / `createBrowserRouter`)
- TanStack Query 5 (server state)
- TypeScript 6, Vite 8, Tailwind CSS 4 (`@theme` design tokens)
- oxlint (linting) + Prettier (formatting)

## Prerequisites

- Node 20+ and npm
- Docker (for the local backend stack)
- The backend repo cloned locally — the `docker-compose.yml` lives there

## Local development

1. **Start the backend stack** from the backend repo directory:

   ```bash
   docker compose up -d --build
   ```

   This starts:
   - the API at `http://localhost:8080`
   - Postgres on host port `5433` (named volume `sie-db-data`)

2. **Configure the frontend API URL:**

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` already defaults to `VITE_API_URL=http://localhost:8080`.
   The Render URL is **not** a local default — it is set only as a production
   build setting on Cloudflare Pages, because `VITE_*` vars are inlined at
   build time.

3. **Run the app:**

   ```bash
   npm install
   npm run dev
   ```

   Open `http://localhost:5173` (already allowed by the backend CORS config).

### Reset to a clean state (empty DB)

Useful for testing empty/error states (Phase 2):

```bash
docker compose down -v && docker compose up -d
```

`down -v` removes the `sie-db-data` named volume, so the next `up` starts from
a freshly migrated, empty database.

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite dev server                |
| `npm run build`        | Type-check + production build to `dist/` |
| `npm run typecheck`    | Type-check only (`tsc -b`)               |
| `npm run lint`         | Run oxlint                               |
| `npm run format`       | Format all files with Prettier           |
| `npm run format:check` | Verify formatting (CI gate)              |
| `npm run preview`      | Preview the production build locally     |

## Project structure

```
src/
  api/          # HTTP clients (auth header, 401/403 → logout)
  auth/         # AuthContext, ProtectedRoute, AdminRoute
  components/   # shared UI (Button, Table, EmptyState, ErrorState, Badge…)
  hooks/        # data hooks (useDevices, …)
  layouts/      # AppLayout (dark-violet sidebar + light content)
  lib/          # helpers (API error mapping, date formatting, …)
  pages/        # route pages (Login, Devices, Users, catalog…)
  routes/       # routes.tsx — single source of truth for the route tree
  types/        # domain types mirroring the backend DTOs
```

## Development phases

Phase 0 bootstrap → DONE
Phase 1 auth + layout shell → DONE
Phase 2 device list → DONE
Phase 3 inventory capture → DONE
Phase 4 user management → DONE
Phases 5–9 → pending
