# DevSync — API Endpoints

> Base URL (local): `http://localhost:3001`  
> All responses are JSON. All authenticated routes require a Supabase JWT in the `Authorization: Bearer <token>` header.

---

## Phase 1 — Currently Live ✅

### Health Check
```
GET /api/health
```
**Auth required:** No  
**Response:**
```json
{
  "success": true,
  "status": "ok",
  "service": "DevSync API",
  "version": "1.0.0",
  "timestamp": "2026-04-13T06:42:17.432Z",
  "environment": "development"
}
```

---

### GitHub Webhook
```
POST /api/webhook/github
```
**Auth required:** No (validated via HMAC-SHA256 signature)  
**Headers required:**
```
X-Hub-Signature-256: sha256=<hmac>
X-GitHub-Event: pull_request | push | ...
```
**Behavior (Phase 1):** Validates signature, logs event, returns 200  
**Behavior (Phase 3):** Will parse and store PR/push data in database  
**Response (success):**
```json
{ "success": true, "message": "Webhook received" }
```
**Response (invalid signature):**
```json
{ "success": false, "error": "Invalid signature" }
```

---

## Phase 2 — Coming Soon

### Auth Routes (handled by Supabase client-side)
> Supabase Auth is handled directly from the frontend using `@supabase/supabase-js`.
> No custom backend auth routes needed for basic login/signup.

---

### User Profile
```
GET  /api/users/me          ← Get current user profile
PUT  /api/users/me          ← Update profile (name, avatar, github_username)
```

---

## Phase 3 — Coming Soon

### Repositories
```
POST   /api/repos           ← Connect a GitHub repo to a team
GET    /api/repos           ← List connected repos for a team
DELETE /api/repos/:id       ← Disconnect a repo
```

### Pull Requests
```
GET  /api/prs               ← List PRs (filter by status, repo, author)
GET  /api/prs/:id           ← Get PR details
```

---

## Phase 4 — Coming Soon

### Notifications
```
GET  /api/notifications/preferences     ← Get user notification prefs
PUT  /api/notifications/preferences     ← Update prefs
GET  /api/notifications/history         ← Get notification history
```

---

## Phase 5 — Coming Soon

### PR Comments
```
GET    /api/prs/:id/comments    ← List comments on a PR
POST   /api/prs/:id/comments    ← Add a comment
PUT    /api/comments/:id        ← Edit a comment (within 5 min)
DELETE /api/comments/:id        ← Delete a comment
```

### Tasks
```
GET    /api/tasks               ← List tasks for team (filter by status/assignee)
POST   /api/tasks               ← Create a task
PUT    /api/tasks/:id           ← Update task (title, status, assignee, priority)
DELETE /api/tasks/:id           ← Delete a task
```

### Activity Feed
```
GET  /api/activity              ← Get team activity (filter by type/actor/date)
```

### Teams
```
GET    /api/teams/me            ← Get current user's team
POST   /api/teams/invite        ← Invite a member via email
DELETE /api/teams/members/:id   ← Remove a member
PUT    /api/teams/members/:id/role ← Change member role
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (valid token, no permission) |
| 404 | Not found |
| 500 | Internal server error |
