# DevSync — Architecture & Decision Log

> Every major technical decision made during this project, with reasoning.
> Helps the team understand *why* things were built the way they were.

---

## Decision 1 — TypeScript over JavaScript
**Date:** Phase 1  
**Decision:** Use TypeScript for both backend and frontend  
**Reasoning:**
- Catches bugs at compile time (especially with Supabase response types)
- Better autocomplete and IntelliSense for the whole team
- Enforce consistent data shapes across frontend ↔ backend ↔ database
- Small upfront complexity, big long-term payoff

---

## Decision 2 — Supabase over self-hosted PostgreSQL
**Date:** Phase 1  
**Decision:** Use Supabase as the database + auth provider  
**Reasoning:**
- PostgreSQL included — no server to manage
- Supabase Auth handles email/password, GitHub OAuth, email verification out of the box
- Row Level Security (RLS) built into PostgreSQL — no custom auth middleware needed
- Supabase Realtime for Phase 6 WebSocket updates — no extra infra
- Free tier is generous enough for a team of 3
- Allows us to focus on product code, not DevOps

---

## Decision 3 — Express backend kept (not serverless)
**Date:** Phase 1  
**Decision:** Keep a dedicated Node.js + Express server instead of going serverless  
**Reasoning:**
- GitHub webhooks need a persistent server to receive POST requests
- Sending emails via SendGrid needs server-side code
- Business logic (webhook validation, email queuing) shouldn't run client-side
- Easier to debug and run locally for the whole team

---

## Decision 4 — Vite over Create React App
**Date:** Phase 1  
**Decision:** Use Vite as the frontend build tool  
**Reasoning:**
- CRA is deprecated and unmaintained
- Vite is significantly faster (HMR is instant vs. seconds)
- Better TypeScript support out of the box
- Smaller bundle size

---

## Decision 5 — Vanilla CSS over Tailwind
**Date:** Phase 1  
**Decision:** Use a custom CSS design system with CSS variables instead of Tailwind  
**Reasoning:**
- Full control over the design — no fighting Tailwind defaults
- CSS variables allow easy dark mode toggling (Phase 6)
- Design tokens (colors, spacing, shadows) defined once and reused everywhere
- Team can understand styles without knowing Tailwind class names

---

## Decision 6 — React Router over Next.js
**Date:** Phase 1  
**Decision:** Use React + Vite + React Router (SPA) instead of Next.js  
**Reasoning:**
- DevSync is a dashboard app — all pages require auth, SEO is not a priority
- SSR (Next.js's main benefit) is not needed for authenticated dashboards
- Simpler setup and faster development
- Next.js adds complexity (SSR, API routes) we don't need

---

## Decision 7 — GitHub Actions for CI/CD
**Date:** Phase 1  
**Decision:** Use GitHub Actions as the CI/CD pipeline  
**Reasoning:**
- Free for public repos, generous free minutes for private
- Native GitHub integration — no third-party setup
- YAML configs live in the repo — visible to the whole team
- Enough for Phase 1 needs (lint + build checks)

---

## Decision 8 — Squash Merge Strategy
**Date:** Phase 1 (from TEAM_COLLABORATION standards)  
**Decision:** Use squash merge for all PRs  
**Reasoning:**
- Keeps `main` and `develop` history clean and readable
- One commit per feature/fix — easy to revert if needed
- Conventional commit format enforced per PR

---

## Future Decisions (To Be Made)

| Topic | When | Options |
|---|---|---|
| Email provider | Phase 4 | SendGrid vs AWS SES |
| Hosting platform | Phase 8 | Vercel (frontend) + Railway/Render (backend) |
| Push notifications | Phase 10 | Firebase FCM vs OneSignal |
| Mobile framework | Phase 9 | Expo (React Native) |
