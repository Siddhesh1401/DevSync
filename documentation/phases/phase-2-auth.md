# Phase 2 — Auth & Team Management ⬜

**Status:** In Progress  
**Goal:** Users can sign up, log in, verify their email, and see a dashboard skeleton.

---

## What Will Be Built

### Pages
| Page | Route | Description |
|---|---|---|
| Landing Page | `/` | Real marketing page — replaces ComingSoon placeholder |
| Sign Up | `/signup` | Email + password registration via Supabase Auth |
| Login | `/login` | Email/password + GitHub OAuth login |
| Verify Email | `/verify-email` | Instructional page shown after signup |
| Forgot Password | `/forgot-password` | Password reset request form |
| Reset Password | `/reset-password` | New password form (from email link) |
| Dashboard | `/dashboard` | Skeleton home after login (fills up in Phase 5) |
| Profile | `/profile` | Edit name, avatar, GitHub username |

### Components
| Component | Description |
|---|---|
| `AuthLayout` | Wrapper for auth pages (centered card, branding) |
| `DashboardLayout` | Sidebar + header for all authenticated pages |
| `Sidebar` | Navigation for dashboard (PRs, Tasks, Activity, Settings) |
| `ProtectedRoute` | Redirects to `/login` if user is not authenticated |

### Backend
| Endpoint | Description |
|---|---|
| `GET /api/users/me` | Returns current user's profile from `profiles` table |
| `PUT /api/users/me` | Updates profile (name, avatar, github_username) |

### Auth Flow
1. User fills in Sign Up form → Supabase creates auth user + sends verification email
2. User clicks email link → Supabase verifies → DevSync creates row in `profiles` table
3. User lands on Dashboard skeleton

---

## Verification Plan

- [ ] Sign up with real email — verification email arrives
- [ ] Log in — redirected to dashboard
- [ ] Log out — redirected to login
- [ ] GitHub OAuth — logs in with GitHub account
- [ ] Protected routes redirect unauthenticated users
- [ ] Profile update saves to `profiles` table in Supabase

---

## Commit Message (To Be Filled)

```
feat: Phase 2 — Auth & Team Management complete

- ...
```

---

> _This document will be completed when Phase 2 is done._
