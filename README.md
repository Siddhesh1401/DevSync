# DevSync

> **Team coordination & notification platform** — replaces scattered WhatsApp messages with a professional GitHub-integrated workspace.

---

## What Is DevSync?

DevSync sits between your team and GitHub. When someone pushes code or opens a PR, the whole team gets notified via email and can discuss it inside DevSync — not WhatsApp.

- GitHub handles the **code**
- DevSync handles the **communication**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Email | SendGrid (Phase 4) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
DevSync/
├── backend/          # Node.js + Express API server
├── frontend/         # Vite + React web app
├── database/         # SQL schema & migrations
└── .github/          # CI/CD workflows
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier is fine)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/DevSync.git
cd DevSync
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `devsync`, choose a region close to you, set a DB password
3. Wait for the project to be provisioned (~1 minute)
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret!)
5. Go to **SQL Editor** → paste and run the contents of `database/schema.sql`
6. Then run `database/rls_policies.sql`

### 3. Set Up Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Fill in your Supabase URL, service role key, and webhook secret
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Fill in your Supabase URL and anon key
```

### 4. Install Dependencies & Run

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# Server starts at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:5173
```

### 5. Verify Everything Works

```bash
# Check backend health
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

Open `http://localhost:5173` → you should see the DevSync placeholder page.

---

## Git Workflow

See [TEAM_COLLABORATION_AND_GITHUB_STANDARDS.md](srs-project%20overview/TEAM_COLLABORATION_AND_GITHUB_STANDARDS.md) for the full guide.

**Quick summary:**
- Branch from `develop` for all work
- `feature/DS-XXX-description` for features
- `fix/DS-XXX-description` for bug fixes
- PRs require 1 approval before merging
- Never push directly to `main` or `develop`

---

## Roadmap

See [WEBSITE_AND_APP_ROADMAP.md](WEBSITE_AND_APP_ROADMAP.md) for the full phase-by-phase plan.

| Phase | Focus | Status |
|---|---|---|
| 1 | Engineering Foundation | 🟡 In Progress |
| 2 | Auth & Team Management | ⬜ Planned |
| 3 | GitHub Integration & PR Sync | ⬜ Planned |
| 4 | Email Notifications | ⬜ Planned |
| 5 | Core Product Features | ⬜ Planned |
| 6 | Real-time & Performance | ⬜ Planned |
| 7 | Security & Testing | ⬜ Planned |
| 8 | Website Launch | ⬜ Planned |
| 9-11 | Mobile App | ⬜ Planned |

---

## Questions?

Read the [SRS Document](srs-project%20overview/SRS_DEVSYNC.md) for full technical requirements.
