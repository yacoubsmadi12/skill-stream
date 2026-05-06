# Ztube
A knowledge-sharing social platform where employees can watch, upload, like, comment on, and share short educational videos, send service requests, earn points, and receive notifications.

## Run & Operate
- **Dev**: `npm run dev` (runs Express backend on port 3001 + Vite frontend on port 5000 concurrently)
- **DB schema push**: `npm run db:push`
- **Build**: `npm run build`
- **Required env vars**: `DATABASE_URL` (Replit PostgreSQL, auto-provided)

## Stack
- **Frontend**: React 18, React Router v6, TanStack Query v5, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Node.js 20, Express 5, Drizzle ORM, PostgreSQL 16 (via `pg`)
- **Build tool**: Vite 5 with `@vitejs/plugin-react-swc`
- **Tooling**: TypeScript, drizzle-kit, concurrently, tsx, ESLint, Vitest

## Where things live
- Frontend entry: `src/main.tsx` → `src/App.tsx`
- Pages: `src/pages/` (FeedPage, ExplorePage, UploadPage, ProfilePage, RequestsPage, SavedPage, AdminPage, LoginPage)
- Auth context: `src/contexts/AuthContext.tsx` + `src/lib/auth.ts` (mock LDAP, localStorage-backed)
- Data/API context: `src/contexts/DataContext.tsx`
- Backend entry: `server/index.ts`
- DB connection: `server/db.ts`
- DB schema (source of truth): `server/schema.ts`
- DB seed: `server/seed.ts`
- Drizzle config: `drizzle.config.ts`
- Vite config (with `/api` proxy to port 3001): `vite.config.ts`

## Architecture decisions
- Backend and frontend run as separate processes (concurrently) in dev; Vite proxies `/api` → `http://localhost:3001`
- Auth is mock-LDAP stored in localStorage — no external auth provider; demo credentials shown on login page
- Drizzle ORM with `drizzle-kit push` for schema management (no migration files)
- Server seeds demo data on first startup via `seedIfEmpty()` in `server/seed.ts`
- In-memory settings object in `server/index.ts` for app-wide config (e.g. video approval toggle)

## Product
- Vertical video feed with swipe/scroll UX
- Like, save, follow, comment on videos
- Upload videos (with optional admin approval workflow)
- Service requests tied to videos with threaded messaging and ratings
- Points/rewards system for engagement actions
- Notifications for likes, comments, follows, and admin posts
- Admin panel for managing videos, categories, users

## User preferences
_Populate as you build_

## Gotchas
- `DATABASE_URL` must be set before starting the server (Replit provides this automatically)
- Run `npm run db:push` after any schema changes in `server/schema.ts`
- The server listens on port 3001; Vite frontend on port 5000 — do not swap these
- Demo login: `admin / admin123` or `user1 / user123`

## Pointers
- Drizzle ORM docs: https://orm.drizzle.team/
- Radix UI: https://www.radix-ui.com/
- TanStack Query: https://tanstack.com/query/v5
