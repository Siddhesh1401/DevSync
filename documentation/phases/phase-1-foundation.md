# Phase 1 — Engineering Foundation ✅

**Status:** Complete  
**Completed:** April 2026  
**Goal:** Set up the full project infrastructure. No user-facing features — just the foundation the team builds on.

---

## What Was Built

### Backend — `backend/`
Node.js + Express + TypeScript server

| File | Purpose |
|---|---|
| `src/app.ts` | Express app — CORS, middleware, startup, Supabase connection check |
| `src/config/env.ts` | Validates all required env vars on startup (fails fast if any missing) |
| `src/config/supabase.ts` | Supabase client with service_role key (admin/server-side access) |
| `src/routes/index.ts` | Registers all routes — health, webhook (auth/PR routes added per phase) |
| `src/routes/health.ts` | `GET /api/health` — returns server status |
| `src/routes/webhook.ts` | `POST /api/webhook/github` — validates HMAC-SHA256 signature, logs event |
| `src/middleware/errorHandler.ts` | Global Express error handler — catches all errors, returns JSON |
| `src/services/emailService.ts` | Email stub — logs to console in dev, SendGrid-ready for Phase 4 |

### Frontend — `frontend/`
Vite + React + TypeScript SPA

| File | Purpose |
|---|---|
| `src/main.tsx` | React app entry point |
| `src/App.tsx` | Root component with React Router route definitions |
| `src/index.css` | Full design system — CSS variables, tokens, base resets, glassmorphism |
| `src/lib/supabase.ts` | Supabase anon client (browser-safe, public key only) |
| `src/pages/ComingSoon.tsx` | Placeholder landing page shown at `/` until Phase 2 |
| `src/components/layout/Header.tsx` | Glassmorphism sticky header (logo + nav skeleton) |
| `index.html` | SEO meta tags, OG tags, inline SVG favicon |

### Database — `database/`
Supabase PostgreSQL schema

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth.users — name, avatar, GitHub username |
| `teams` | Team entity — name, description, owner |
| `team_members` | Junction table — user ↔ team with role (owner/admin/member) |
| `repositories` | GitHub repos connected to teams |
| `pull_requests` | PR data received from GitHub webhooks |
| `pr_comments` | In-app discussion threads per PR |
| `tasks` | Kanban task board items |
| `activity_events` | Timeline of all team events |
| `notification_preferences` | Per-user notification settings |

**Also applied:**
- `updated_at` auto-update triggers on all tables
- Indexes on all foreign keys and commonly queried columns
- Row Level Security (RLS) — users can only read/write their team's data

### CI/CD — `.github/workflows/ci.yml`
Runs on every push and PR to `main` and `develop`:
- Install dependencies (backend + frontend)
- TypeScript type check
- Vite production build (validates no build errors)

---

## Verification Results

| Check | Result |
|---|---|
| `tsc --noEmit` (backend) | ✅ 0 errors |
| `tsc --noEmit` (frontend) | ✅ 0 errors |
| `GET /api/health` | ✅ 200 OK |
| `POST /api/webhook/github` (no signature) | ✅ 400 (correct) |
| Supabase connection | ✅ Connected (after schema applied) |
| Frontend loads at `http://localhost:5173` | ✅ |

---

## Environment Variables Required

### `backend/.env`
```env
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GITHUB_WEBHOOK_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001
```

---

## Running Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

---

## Commit Message

```
feat: Phase 1 — Engineering Foundation complete

- Set up monorepo with backend (Node/Express/TypeScript) and frontend (Vite/React/TypeScript)
- Configured Supabase PostgreSQL with 8-table schema and RLS policies
- Implemented GitHub webhook handler with HMAC-SHA256 signature validation
- Added global error handler, CORS middleware, and env validation
- Built email service stub (SendGrid-ready for Phase 4)
- Created full CSS design system with glassmorphism placeholder UI
- Set up GitHub Actions CI/CD pipeline (TypeScript check + Vite build)
- Verified: health endpoint ✅, Supabase connected ✅, both servers running ✅
```

---

## What's Ready for Phase 2

- ✅ Supabase Auth client configured — just needs real users
- ✅ Auth routes stubbed in `App.tsx` — uncomment when building login/signup
- ✅ Design system ready — all variables, animations, components defined
- ✅ Database `profiles` table ready — stores user data after signup
