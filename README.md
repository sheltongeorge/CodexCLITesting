# Workout Tracker Monorepo

A production-ready monorepo for tracking workouts and sessions. The stack includes:

- **API** – Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Web** – React 18, Vite, TypeScript, React Router, Tailwind CSS, React Hook Form + Zod
- **Tooling** – npm workspaces, shared TypeScript config, linting & formatting, Docker Compose for Postgres

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose plugin

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Launch PostgreSQL:

   ```bash
   npm run db:up
   ```

3. Apply Prisma migrations and seed data:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. Start API and Web apps concurrently:

   ```bash
   npm run dev
   ```

   - API: http://localhost:5174
   - Web: http://localhost:5173

5. Stop database services when finished:

   ```bash
   npm run db:down
   ```

## Environment Variables

### API (`packages/api/.env`)

```
DATABASE_URL=postgresql://app:app@localhost:5432/workouts?schema=public
PORT=5174
CORS_ORIGIN=http://localhost:5173
```

### Web (`packages/web/.env`)

```
VITE_API_URL=http://localhost:5174
```

Copy the `.env.example` files in each workspace to `.env` and adjust as needed.

## npm Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start database (if not running) and run API & Web in parallel |
| `npm run dev:api` | Run the API with hot reload (ts-node-dev) |
| `npm run dev:web` | Run the Vite dev server |
| `npm run build` | Build API and Web packages |
| `npm run lint` | Lint all workspaces |
| `npm run prisma:migrate` | Run Prisma migrations (dev) |
| `npm run prisma:seed` | Seed the database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:up` | Start Docker Compose services |
| `npm run db:down` | Stop Docker Compose services |

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/workouts` | List workouts |
| POST | `/api/workouts` | Create or update a workout with default exercises |
| GET | `/api/workouts/:id` | Fetch workout details including session history |
| POST | `/api/sessions` | Record a workout session with performed sets |
| GET | `/api/sessions?from=&to=` | List sessions with optional date range filter |
| GET | `/api/sessions/:id` | Fetch session details with sets and workout info |

## Frontend Pages

- **Workouts** – CRUD management for base workouts and their default exercises.
- **Start Session** – Pick a workout, auto-load default exercises, adjust sets, and submit a session.
- **History** – Filter sessions by date range and inspect session details.

## Development Notes

- Prisma migrations live in `packages/api/prisma`.
- Seed data provides sample workouts and sessions.
- Tailwind CSS powers styling; adjust via `tailwind.config.js`.
- Axios handles API communication with centralized configuration.

