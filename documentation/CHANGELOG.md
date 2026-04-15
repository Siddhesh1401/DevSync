# DevSync — Changelog

> All notable changes to this project will be documented here.
> Format: `[Phase X] — Date — Description`

---

## [Phase 1] — April 2026 — Engineering Foundation ✅

### Added
- **Monorepo structure** — `backend/`, `frontend/`, `database/`, `.github/`, `documentation/`
- **Backend** — Node.js + Express + TypeScript server on port 3001
  - `GET /api/health` — health check endpoint
  - `POST /api/webhook/github` — GitHub webhook receiver with HMAC-SHA256 validation
  - Global error handler middleware
  - CORS configured for `http://localhost:5173`
  - Env variable validation on startup (fails fast if missing)
  - Supabase service-role client (admin access)
  - Email service stub (console logs in dev, SendGrid-ready)
- **Frontend** — Vite + React + TypeScript on port 5173
  - React Router set up with placeholder routes
  - Supabase anon client (browser-safe)
  - Full CSS design system (variables, tokens, glassmorphism)
  - `ComingSoon.tsx` placeholder landing page with phase tracker
  - `Header.tsx` glassmorphism sticky header
- **Database** — Supabase PostgreSQL
  - `schema.sql` — 8 tables: `profiles`, `teams`, `team_members`, `repositories`, `pull_requests`, `pr_comments`, `tasks`, `activity_events`, `notification_preferences`
  - Auto-updated `updated_at` triggers on all relevant tables
  - Indexes on foreign keys and frequently queried columns
  - `rls_policies.sql` — Row Level Security for all tables
- **CI/CD** — GitHub Actions
  - `ci.yml` — runs TypeScript check + Vite build on every push/PR to `main` and `develop`
- **Documentation** — `documentation/` folder with index, changelog, decisions log, API docs, phase docs

### Verified
- ✅ Backend TypeScript — 0 errors
- ✅ Frontend TypeScript — 0 errors
- ✅ `/api/health` returns `200 OK`
- ✅ Supabase connected (no warnings after schema applied)
- ✅ Both servers running simultaneously

### Commit
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

## [Phase 2] — April 2026 — Auth & Team Management ✅

### Added
- **Authentication System** — Email/Password sign up, login, verification, and reset password flows.
- **Protected Routes** — Middleware implementation to block unauthorized users.
- **Frontend Pages** — Developed dark-themed `LandingPage`, `SignUpPage`, `LoginPage`.
- **Database Logic** — User profiles tied securely to Supabase Auth.
- **Team Creation** — Teams auto-linked to members upon creation.

---

## [Phase 3] — April 2026 — GitHub Integration & PR Sync ✅

### Added
- **GitHub Webhook Wizard** — `/dashboard/repos` UI to generate payload URLs and webhook secrets for easy connection.
- **Webhook Handlers** — `/api/webhook/github` endpoint successfully parses `pull_request` (`opened`, `synchronize`, `closed`) and `push` events.
- **Database Upserts** — Secure background ingestion of GitHub events directly into `repositories`, `pull_requests`, and `activity_events` tables.
- **Live Sync Tests** — Connected endpoints dynamically via `ngrok` allowing real-world end-to-end webhook validation.
- **Pull Request Dashboard** — Sleek dark-mode grid displaying all interconnected team PRs across multiple repositories.

---

## [Phase 4] — April 2026 — Email Notification Engine ✅

### Added
- **Dynamic Settings UI:** `SettingsNotificationsPage.tsx` interface to control notification preferences.
- **Backend Email Service:** Developed robust `emailService.ts` utilizing `nodemailer` mapped to an organic SMTP setup (Gmail App Passwords) for totally free global emailing.
- **Beautiful HTML Templates:** Created engaging, visually impressive email templates for `PR Opened`, `PR Merged`, and `PR Updated` events.
- **Database Target Filtering:** Linked webhook triggers to dynamically query the `notification_preferences` and `team_members` tables to only email subscribed members.

---

## [Phase 5] — April 2026 — Core Product Features ✅

### Added
- **Global Activity Timeline**: A rich `ActivityPage.tsx` interface rendering an immutable scrolling ledger of every push, pull request merge, and task action.
- **Kanban Board UI**: Added HTML5 drag-and-drop based `TasksPage.tsx` enabling columns for `To Do`, `In Progress`, and `Done`.
- **Backend Task Engine**: Created `/api/tasks` handling creation (`POST`), cross-team reads (`GET`), and state mutation (`PATCH`).
- **Audit Logging Connectors**: Attached backend tasks API dynamically to `activity_events` so dragging a task instantly alerts the Activity feed timeline.

---

## [Phase 6] — TBD — Real-Time, Performance, Accessibility

> _To be filled when Phase 6 is complete._

---

## [Phase 7] — TBD — Security & Testing

> _To be filled when Phase 7 is complete._

---

## [Phase 8] — TBD — Website Launch 🎉

> _To be filled when Phase 8 is complete._
