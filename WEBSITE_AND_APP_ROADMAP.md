# DevSync - Website & App Feature Roadmap

**This document outlines what actual product features to build for the website and mobile app in each phase.**

---

## Phase 1 (Week 2): Engineering Foundation
### Website & App: Not applicable
- Focus: Backend/frontend setup, CI/CD, databases
- No features visible to users yet
- Infrastructure ready

---

## Phase 2 (Weeks 3-4): Authentication & Team Management

### Website Features
1. **Landing Page** (`/`)
   - Hero section: "Simplify Team Coordination"
   - Feature highlights with icons
   - Sign Up / Sign In buttons
   - Call-to-action

2. **Sign Up Page** (`/signup`)
   - Form: name, email, password
   - Password strength indicator
   - Terms & conditions checkbox
   - Link to login page

3. **Email Verification** (`/verify-email`)
   - Message: "Check your email for verification link"
   - Resend button

4. **Login Page** (`/login`)
   - Form: email, password
   - "Remember me" checkbox
   - "Forgot password" link
   - "Sign up" link
   - GitHub OAuth option (optional Phase 2)

5. **Forgot Password** (`/forgot-password`)
   - Email input
   - "Reset link sent" confirmation

6. **Reset Password** (`/reset-password?token=xxx`)
   - New password form with strength indicator

7. **Dashboard Home** (`/teams/:teamId/dashboard`)
   - User profile dropdown (top right)
   - Team selector dropdown
   - Summary: "You have X PRs, X tasks"
   - Recent activity placeholder

8. **Team Settings Page** (`/teams/:teamId/settings`)
   - Edit team name, description, avatar
   - Member list view
   - Invite members button
   - Remove member option (admin)

9. **User Profile Page** (`/profile`)
   - View/edit name, email, avatar
   - Change password
   - Notification preferences section (skeleton)

### Mobile App Features
1. **Login/Signup Screens**
   - Email/password forms
   - GitHub OAuth option

2. **Home Screen** (Post-login)
   - Quick summary: "X PRs, X tasks"
   - Team selector
   - Recent activity (short list)

3. **Profile Screen** (Settings tab)
   - View/edit profile
   - Logout button

---

## Phase 3 (Weeks 5-6): GitHub Integration & PR Sync

### Website Features
1. **Repository Connection Page** (`/teams/:teamId/repos`)
   - Step-by-step wizard:
     1. Copy webhook secret from DevSync
     2. Go to GitHub repo settings → Webhooks
     3. Paste DevSync webhook URL + secret
     4. Select push & pull_request events
     5. Save and verify
   - Status indicator: "Connected" ✅ or "Pending" ⏳
   - "Test connection" button
   - Disconnect button

2. **PR List Page** (`/teams/:teamId/pull-requests`)
   - Table showing all PRs from GitHub
   - Columns: PR #, Title, Author, Branch, Created, Status
   - Status badges: Open (blue), Merged (green), Closed (gray)
   - Pagination (20 per page)
   - Filters: status, author
   - Search: by title or branch
   - Sort: newest, oldest, most active
   - Each row is clickable → PR details

3. **PR Details Page** (`/teams/:teamId/pull-requests/:prId`)
   - PR header: Title, PR #, author avatar
   - Metadata: branch, base, created date, commits, changed files
   - Status badge
   - "View on GitHub" button (opens in new tab)
   - PR description (from GitHub)
   - Discussion section placeholder (Phase 5)

### Mobile App Features
1. **PR List Screen**
   - Simplified PR list
   - Scrollable, similar layout to web
   - Tap to view details

2. **PR Details Screen**
   - PR metadata
   - Tap "View on GitHub" to open browser

---

## Phase 4 (Week 7): Notification Engine

### Website Features
1. **Settings → Notifications Page** (`/settings/notifications`)
   - Notification type toggles:
     - [ ] New PR created
     - [ ] PR merged
     - [ ] PR updated
     - [ ] Comment on PR
     - [ ] Task assigned
   - Per-type setting: Instant or Daily digest
   - Email address verification status

2. **Settings → Notification History** (`/settings/notification-history`)
   - Table: notification type, date sent, status (sent/failed)
   - Retry button for failed emails
   - Clear history button

3. **Email Templates** (sent to users)
   - Welcome email (post-signup)
   - PR created email
   - PR merged email
   - PR updated email (new commits)

### Mobile App Features
1. **Notification Settings Tab**
   - Same toggles as web
   - Notification history

---

## Phase 5 (Weeks 8-10): Core Website Product Features

### Website Features

#### 1. Dashboard Home Page (`/teams/:teamId/dashboard`)
**Fully Developed Now**
- Summary cards:
  - "PRs pending review" - count + link
  - "PRs merged this week" - count
  - "Tasks assigned to you" - count + link
  - "Messages waiting" - count (Phase 5)
- Recent activity feed (last 10 events)
- Quick actions:
  - "Create task" button
  - "View latest PR" button
  - "See all activity" button

#### 2. PR Discussion Thread (`/teams/:teamId/pull-requests/:prId`)
**Fully Developed Now**
- Full PR card (metadata, status, GitHub link)
- **Discussion thread**
  - List of all comments
  - Sorted by date (oldest → newest)
  - Per comment: author avatar, name, timestamp, text
  - Comment input box
  - @mention support
  - Markdown: bold, italic, code blocks
  - Send button + Ctrl+Enter
- Comment actions (on own comments):
  - Edit (within 5 min)
  - Delete
  - Show "edited" indicator

#### 3. Task Board Page (`/teams/:teamId/tasks`)
**Fully Developed Now**
- Kanban board: "To Do", "In Progress", "Done"
- Drag-and-drop between columns
- "+ New Task" button → modal form
  - Fields: title (required), description, priority, due date, assignee
  - Create task
- Task card design:
  - Title, priority badge (low/medium/high)
  - Assignee avatar + name
  - Due date if set
  - Related PR link

#### 4. Task Filtering & Search
- Filter by: assigned to (dropdown), priority
- Search by title
- Show: "All tasks" or "My tasks"

#### 5. Task Details Modal (`/teams/:teamId/tasks/:taskId`)
- Full task info
- Edit fields: title, description, priority, due date, assignee
- Status dropdown (To Do / In Progress / Done)
- Activity log: who changed what, when
- Delete button (author/admin)

#### 6. Activity Feed Page (`/teams/:teamId/activity`)
**Fully Developed Now**
- Timeline of all team events
- Event types:
  - PR created: "Dev A created PR #23: Feature login"
  - PR merged: "Dev B merged PR #23"
  - Comment added: "Dev C commented on PR #23"
  - Task created: "Admin created task: Auth feature"
  - Task status: "Dev A moved task to In Progress"
  - Member joined: "Dev D joined team"
- Each event shows: actor (avatar + name), action, timestamp, link to item
- Filters: by type, by actor, by date (7d, 30d, all)
- Search by keyword

#### 7. Team Members Page (`/teams/:teamId/members`)
**Fully Developed Now**
- List of all team members
- Columns: Name, Email, Role (owner/admin/member), Joined date
- Admin can:
  - Invite new member (email input form)
  - Remove member
  - Change member role
- Invite link generation (shareable)

#### 8. Navigation & Layout
- Header: DevSync logo, team selector, user dropdown
- Sidebar: Dashboard, PRs, Tasks, Activity, Team, Settings, Logout
- Responsive (desktop, tablet, mobile web)

### Mobile App Features

#### 1. Home Screen
- Quick summary cards (PRs, tasks, recent activity)
- Tap to navigate to lists

#### 2. PR List Screen
- Scrollable PR list
- Filter by status
- Search PR title

#### 3. PR Details Screen
- PR metadata + discussion thread
- Tap "View on GitHub" to open browser
- Add comment (simplified interface)

#### 4. Task List Screen
- Kanban-style task list (swipe between columns)
- Create task
- Tap to edit

#### 5. Activity Feed Screen
- Scrollable timeline
- Filters (simplified)

#### 6. Team Members Screen
- List of members
- Invite button (admin)

---

## Phase 6 (Week 11): Real-Time, Performance, Accessibility

### Website Features
- Real-time comment updates (WebSocket)
- Real-time task status updates
- Real-time activity feed
- Responsive design polish
- Accessibility compliance (WCAG 2.1 AA)
- Dark mode support (optional)
- Keyboard navigation

### Mobile App Features
- Real-time comment updates
- Smooth animations
- Performance optimization
- App-like responsiveness

---

## Phase 7 (Week 12): Security & Testing

### Website & App
- No new features
- Bug fixes, security hardening, testing

---

## Phase 8 (Week 13): Launch

### Website & App
- Released to production
- User onboarding email
- Support documentation

---

## Phase 9 (Post-Launch): Enhancement

### Website Features
- [ ] Daily digest email option
- [ ] Advanced search (date range, advanced filters)
- [ ] Exportable reports (CSV, PDF)
- [ ] Multiple repos per team
- [ ] Custom notification templates
- [ ] Dark mode (if not in Phase 5)
- [ ] API for third-party integrations
- [ ] Analytics dashboard (review time, team velocity)

### Mobile App Features
- [ ] Push notifications
- [ ] Voice messaging
- [ ] Offline mode
- [ ] Home screen widgets
- [ ] App shortcuts

---

## Feature Checklist

### Phase 2: Auth & Team (MVP Auth)
- [ ] Landing page
- [ ] Sign up → email verify → login flow
- [ ] User profile & settings
- [ ] Team creation
- [ ] Invite team members
- [ ] Team settings
- [ ] RBAC (owner/admin/member)

### Phase 3: GitHub Integration (MVP Data)
- [ ] Webhook setup wizard
- [ ] PR list from GitHub
- [ ] PR details page
- [ ] PR status sync from GitHub

### Phase 4: Notifications (MVP Alerts)
- [ ] Email notification sending
- [ ] Notification preferences
- [ ] Notification history

### Phase 5: Core Product (MVP Product)
- [ ] Dashboard home
- [ ] PR discussion thread
- [ ] Task board (Kanban)
- [ ] Activity feed
- [ ] Team members management

### Phase 6: Polish (MVP Quality)
- [ ] Real-time updates
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Mobile responsiveness

### Phase 7: Security (MVP Hardening)
- [ ] Security testing
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 8: Launch (MVP Release)
- [ ] Production deployment
- [ ] User onboarding

---

## Summary: What's Built by Phase

| Phase | Weeks | Website Focus | App Focus | User Value |
|-------|-------|---------------|-----------|------------|
| **Phase 2** | 3-4 | Login/signup, team setup | Login/signup | Create accounts & teams |
| **Phase 3** | 5-6 | Connect GitHub repo, see PRs | View PRs on mobile | See code review updates |
| **Phase 4** | 7 | Email notifications, preferences | Get notified | Stay informed about PRs |
| **Phase 5** | 8-10 | Dashboard, discuss PRs, task board | Same on mobile | Fully coordinate work (no WhatsApp!) |
| **Phase 6** | 11 | Fast, accessible, real-time | Responsive | Smooth professional experience |
| **Phase 7** | 12 | Security hardened, tested | Tested | Safe to use |
| **Phase 8** | 13 | Live for users | Available | Platform ready for team use |

