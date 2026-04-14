# Ztube — Knowledge Sharing Platform

## Overview
An enterprise knowledge-sharing video platform where employees can upload, discover, and request expertise from colleagues.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js API server (port 3001), auto-started alongside Vite via `npm run dev`
- **Database**: Replit PostgreSQL via Drizzle ORM + `pg` driver
- **Styling**: Tailwind CSS + Shadcn UI (Radix UI)
- **State**: React Context (AuthContext, DataContext) + TanStack React Query
- **Routing**: React Router v6

## Key Files
- `server/index.ts` — Express REST API (all CRUD for videos, comments, categories, profiles, requests)
- `server/schema.ts` — Drizzle ORM schema (mirrors Supabase migration)
- `server/db.ts` — PostgreSQL pool + Drizzle client
- `src/contexts/DataContext.tsx` — Frontend data layer (fetches from `/api/*` endpoints)
- `src/contexts/AuthContext.tsx` — Auth using mock LDAP (`src/lib/auth.ts`)
- `vite.config.ts` — Vite proxies `/api` → `localhost:3001`
- `drizzle.config.ts` — Drizzle Kit config for schema push

## Auth
Uses a mock LDAP system (no real auth server). Demo credentials:
- `admin` / `admin123` — admin role
- `user1` / `user123` — regular user
- `user2` / `user123` — regular user

## Database Tables
- `categories` — Video categories with icon
- `profiles` — User profiles (linked by user_id string)
- `videos` — Video posts with metadata
- `comments` — Comments on videos
- `service_requests` — Peer service/help requests
- `request_messages` — Chat messages within a service request
- `user_follows` — Follow relationships between users
- `points_history` — Gamification points log per user
- `notifications` — In-app notifications (like, save, comment, follow events)

## Key Features
- **Categories bar**: Horizontal filter strip at top of Feed for quick category filtering
- **TikTok-style feed**: Snap-scroll video feed with YouTube thumbnail extraction and real video embedding
- **Follow from Explore**: Follow/unfollow button on both user profiles and video modals in Explore
- **Video interactions in Explore**: Like, save, and comment on videos directly from the Explore modal
- **Push Notifications**: Per-user notification panel in Profile (bell icon) showing likes, saves, comments, follows — with unread badge and mark-read support
- **Gamification**: Points system with badges, awarded for video approvals, likes, views, comments, follows, requests

## Running
```bash
npm run dev        # starts both Vite (5000) and Express (3001)
npm run db:push    # push schema changes to database
npm run build      # production build
```

## Migration Notes
Migrated from Lovable/Supabase to Replit:
- Replaced Supabase client with an Express REST API backed by Replit PostgreSQL
- Removed `@supabase/supabase-js` and `lovable-tagger` dependencies
- CSS `@import` moved before Tailwind directives to fix build warning
- Vite configured for Replit (`host: 0.0.0.0`, `allowedHosts: true`, port 5000)
- Supabase config/migrations folder removed; schema managed via Drizzle (`npm run db:push`)
- Database seeded automatically on first startup via `server/seed.ts`
