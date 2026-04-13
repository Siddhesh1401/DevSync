# DevSync — Documentation Index

> Living documentation for the DevSync project. Updated after every phase.

## 📁 Structure

```
documentation/
├── README.md                        ← You are here (index)
├── CHANGELOG.md                     ← Running log of all changes
├── DECISIONS.md                     ← Architecture & tech decision log
├── api/
│   └── endpoints.md                 ← All API endpoints documented
└── phases/
    ├── phase-1-foundation.md        ✅ Complete
    ├── phase-2-auth.md              ⬜ In Progress
    ├── phase-3-github-integration.md ⬜ Upcoming
    ├── phase-4-email-notifications.md ⬜ Upcoming
    ├── phase-5-core-features.md     ⬜ Upcoming
    ├── phase-6-realtime.md          ⬜ Upcoming
    ├── phase-7-security.md          ⬜ Upcoming
    └── phase-8-launch.md            ⬜ Upcoming
```

---

## 🚀 Project Status

| Phase | Name | Status | Week |
|---|---|---|---|
| Phase 1 | Engineering Foundation | ✅ Complete | Week 2 |
| Phase 2 | Auth & Team Management | ⬜ Next | Weeks 3-4 |
| Phase 3 | GitHub Integration & PR Sync | ⬜ | Weeks 5-6 |
| Phase 4 | Email Notification Engine | ⬜ | Week 7 |
| Phase 5 | Core Product Features | ⬜ | Weeks 8-10 |
| Phase 6 | Real-Time, Performance, A11y | ⬜ | Week 11 |
| Phase 7 | Security & Testing | ⬜ | Week 12 |
| Phase 8 | Website Launch 🎉 | ⬜ | Week 13 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | Vite + React + TypeScript + React Router |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password + GitHub OAuth) |
| Email | Nodemailer stub → SendGrid (Phase 4) |
| Real-time | Supabase Realtime / WebSockets (Phase 6) |
| CI/CD | GitHub Actions |

---

## 👋 New to the Project? Start Here

| Document | What it tells you |
|---|---|
| [WEBSITE_AND_APP_ROADMAP.md](../WEBSITE_AND_APP_ROADMAP.md) | **← Start here.** Every phase, every page, every feature to build |
| [srs-project overview/SRS_DEVSYNC.md](../srs-project%20overview/SRS_DEVSYNC.md) | Full requirements spec (FR1-8, NFR1-6, data models, wireframes) |
| [DECISIONS.md](./DECISIONS.md) | Why we chose each technology |
| [CHANGELOG.md](./CHANGELOG.md) | What has been built so far, phase by phase |
| [api/endpoints.md](./api/endpoints.md) | All API endpoints (current + upcoming) |

---

## 🔗 Quick Links

- [📋 Full Feature Roadmap](../WEBSITE_AND_APP_ROADMAP.md) ← **what to build**
- [📝 Changelog](./CHANGELOG.md) ← **what's done**
- [🏗️ Architecture Decisions](./DECISIONS.md) ← **why we built it this way**
- [🔌 API Endpoints](./api/endpoints.md) ← **backend reference**
- [📄 Phase 1 Docs](./phases/phase-1-foundation.md)
- [📄 Phase 2 Docs](./phases/phase-2-auth.md)
