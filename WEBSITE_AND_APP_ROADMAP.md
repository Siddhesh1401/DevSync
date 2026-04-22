# DevSync - Website & App Feature Roadmap

**This document outlines what actual product features to build for the website first, then mobile app later.**

**References:**
- [SRS_DEVSYNC.md](srs-project%20overview/SRS_DEVSYNC.md) - Complete requirements specification
- [PROJECT_DOCUMENTATION.md](srs-project%20overview/PROJECT_DOCUMENTATION.md) - Plain language overview

**Important Note:** Website first (Phases 2-7), Mobile app after (Phases 8-10).

---

## Phase 1 (Week 2): Engineering Foundation
### Website & App: Not applicable
- Focus: Backend/frontend setup, CI/CD, databases
- No features visible to users yet
- Infrastructure ready
- **Reference:** [PHASE_WISE_IMPLEMENTATION_PLAN.md](PHASE_WISE_IMPLEMENTATION_PLAN.md#phase-1---week-2-engineering-foundation)

---

## Phase 2 (Weeks 3-4): Authentication & Team Management

### Website Features ONLY
*Mobile app will be built after website is complete.*

**SRS References:** [FR1: User Authentication & Authorization](srs-project%20overview/SRS_DEVSYNC.md#fr1-user-authentication--authorization) | [FR2: GitHub Integration](srs-project%20overview/SRS_DEVSYNC.md#fr2-github-integration)

1. **Landing Page** (`/`)
   - Hero section: "Simplify Team Coordination"
   - Feature highlights with icons
   - Sign Up / Sign In buttons
   - Call-to-action
   - **SRS:** Introduction to platform value

2. **Sign Up Page** (`/signup`)
   - Form: name, email, password
   - Password strength indicator
   - Terms & conditions checkbox
   - Link to login page
   - **SRS FR1.1:** Email and password based signup, password validation

3. **Email Verification** (`/verify-email`)
   - Message: "Check your email for verification link"
   - Resend button
   - **SRS FR1.1:** Verification email sent after signup

4. **Login Page** (`/login`)
   - Form: email, password
   - "Remember me" checkbox
   - "Forgot password" link
   - "Sign up" link
   - GitHub OAuth option (optional Phase 2)
   - **SRS FR1.2:** Email/password login with session timeout (30 min)

5. **Forgot Password** (`/forgot-password`)
   - Email input
   - "Reset link sent" confirmation
   - **SRS FR1.2:** Forgot password link

6. **Reset Password** (`/reset-password?token=xxx`)
   - New password form with strength indicator
   - **SRS FR1.1:** Password validation

7. **Dashboard Home** (`/teams/:teamId/dashboard`)
   - User profile dropdown (top right)
   - Team selector dropdown
   - Summary: "You have X PRs, X tasks"
   - Recent activity placeholder
   - **SRS FR4:** PR Management page

8. **Team Settings Page** (`/teams/:teamId/settings`)
   - Edit team name, description, avatar
   - Member list view
   - Invite members button
   - Remove member option (admin)
   - **SRS FR8: Team Management**

9. **User Profile Page** (`/profile`)
   - View/edit name, email, avatar
   - Change password
   - Notification preferences section (skeleton)
   - **SRS FR1.3:** User Profile management

### No Mobile App in Phase 2
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 3 (Weeks 5-6): GitHub Integration & PR Sync

### Website Features ONLY

**SRS References:** [FR2: GitHub Integration](srs-project%20overview/SRS_DEVSYNC.md#fr2-github-integration) | [FR4: Pull Request Management](srs-project%20overview/SRS_DEVSYNC.md#fr4-pull-request-management)

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
   - **SRS FR2.1:** Repository Connection setup

2. **PR List Page** (`/teams/:teamId/pull-requests`)
   - Table showing all PRs from GitHub
   - Columns: PR #, Title, Author, Branch, Created, Status
   - Status badges: Open (blue), Merged (green), Closed (gray)
   - Pagination (20 per page)
   - Filters: status, author
   - Search: by title or branch
   - Sort: newest, oldest, most active
   - Each row is clickable → PR details
   - **SRS FR4.1:** View Pull Requests with filtering & sorting

3. **PR Details Page** (`/teams/:teamId/pull-requests/:prId`)
   - PR header: Title, PR #, author avatar
   - Metadata: branch, base, created date, commits, changed files
   - Status badge
   - "View on GitHub" button (opens in new tab)
   - PR description (from GitHub)
   - Discussion section placeholder (Phase 5)
   - **SRS FR4.2:** PR Details page with GitHub link

### No Mobile App in Phase 3
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 4 (Week 7): Notification Engine

### Website Features ONLY

**SRS References:** [FR3: Email Notification System](srs-project%20overview/SRS_DEVSYNC.md#fr3-email-notification-system)

1. **Settings → Notifications Page** (`/settings/notifications`) ✅
   - Notification type toggles:
     - [x] New PR created
     - [x] PR merged
     - [x] PR updated
     - [ ] Comment on PR
     - [ ] Task assigned
   - Per-type setting: Instant or Daily digest
   - Email address verification status
   - **SRS FR3.3:** Notification Preferences

2. **Settings → Notification History** (`/settings/notification-history`) ✅
   - Table: notification type, date sent, status (sent/failed)
   - Retroactive audit implementation complete.
   - Clear history button

3. **Email Templates** (sent to users) ✅
   - Welcome email (post-signup)
   - PR created email
   - PR merged email
   - PR updated email (new commits)
   - **SRS FR3.2:** Email Template & Content with standardized format

### No Mobile App in Phase 4
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 5 (Weeks 8-10): Core Website Product Features

### Website Features ONLY

**SRS References:** [FR4: Pull Request Management](srs-project%20overview/SRS_DEVSYNC.md#fr4-pull-request-management) | [FR5: In-App Messaging](srs-project%20overview/SRS_DEVSYNC.md#fr5-in-app-messaging--discussion) | [FR6: Task Management](srs-project%20overview/SRS_DEVSYNC.md#fr6-simple-task-management) | [FR7: Activity Feed](srs-project%20overview/SRS_DEVSYNC.md#fr7-activity-feed--history)

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
- **SRS:** Dashboard/Home page overview

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
- **SRS FR5:** In-App Messaging & Discussion with @mentions and markdown

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
- **SRS FR6.1-6.4:** Create Tasks, Assignment, Status Updates, Visibility

#### 4. Task Filtering & Search
- Filter by: assigned to (dropdown), priority
- Search by title
- Show: "All tasks" or "My tasks"
- **SRS FR6:** Task Management with filtering

#### 5. Task Details Modal (`/teams/:teamId/tasks/:taskId`)
- Full task info
- Edit fields: title, description, priority, due date, assignee
- Status dropdown (To Do / In Progress / Done)
- Activity log: who changed what, when
- Delete button (author/admin)
- **SRS FR6.2-6.3:** Task Assignment & Status Updates

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
- **SRS FR7.1-7.3:** Activity Feed with Filtering & Search

#### 7. Team Members Page (`/teams/:teamId/members`)
**Fully Developed Now**
- List of all team members
- Columns: Name, Email, Role (owner/admin/member), Joined date
- Admin can:
  - Invite new member (email input form)
  - Remove member
  - Change member role
- Invite link generation (shareable)
- **SRS FR8: Team Management** with add/remove/role management

#### 8. Navigation & Layout
- Header: DevSync logo, team selector, user dropdown
- Sidebar: Dashboard, PRs, Tasks, Activity, Team, Settings, Logout
- Responsive (desktop, tablet, mobile web)

### No Mobile App in Phase 5
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 6 (Week 11): Real-Time, Performance, Accessibility

### Website Features ONLY

**SRS References:** [NFR1-6: Non-Functional Requirements](srs-project%20overview/SRS_DEVSYNC.md#32-non-functional-requirements) | [UI/UX Specifications](srs-project%20overview/SRS_DEVSYNC.md#4-uiux-specifications)

- Real-time comment updates (WebSocket)
- Real-time task status updates
- Real-time activity feed
- Responsive design polish
- Accessibility compliance (WCAG 2.1 AA) - **SRS NFR5**
- Dark mode support (optional)
- Keyboard navigation
- **SRS NFR4:** Scalability optimizations
- **SRS NFR1:** Performance targets (< 2 seconds page load)

### No Mobile App in Phase 6
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 7 (Week 12): Security & Testing

### Website ONLY
- No new features
- Bug fixes, security hardening, testing
- **SRS:** Security audit against NFR3

### No Mobile App in Phase 7
Mobile app development will start after website is complete (Phase 8+).

---

## Phase 8 (Week 13): Website Launch

### Website Launch to Production
- Frontend deployment on Vercel
- Backend deployment on Render
- Supabase used as managed database/auth/realtime in production
- Released to production
- User onboarding email
- Support documentation
- **SRS:** Go-live checklist

### Mobile App: START HERE
**This is when mobile app development begins (after website is stable).**

---

## Phase 8-10 (After Website Launch): Mobile App Development

**Important:** Mobile app only starts after website is production-ready and stable.

**SRS References:** [Project Type](srs-project%20overview/SRS_DEVSYNC.md#1-introduction) - "Web & Mobile Application"

### Phase 8 - Mobile Foundation
1. **React Native Project Setup**
   - Project scaffold
   - Navigation structure (React Navigation)
   - Design system (same tokens as web)
   - API client (reuse web client)

2. **Authentication Screens**
   - Login / Signup (mobile versions)
   - Email verification (mobile)
   - Forgot password (mobile)
   - **SRS FR1:** Same auth as website

### Phase 9 - Mobile Core Features
1. **Home/Dashboard Screen**
   - Quick summary cards
   - Team selector
   - Recent activity feed
   - **SRS:** Same data as web dashboard

2. **PR List Screen**
   - Scrollable PR list
   - Filter by status
   - Search PR title
   - **SRS FR4:** Same PR data as web

3. **PR Details Screen**
   - PR metadata + discussion thread
   - Add comment
   - Tap "View on GitHub" to open browser
   - **SRS FR4 & FR5:** Same PR details and discussion as web

4. **Task Board Screen**
   - Kanban-style task list (swipe between columns)
   - Create task
   - Status updates
   - **SRS FR6:** Same task management as web

5. **Activity Feed Screen**
   - Scrollable timeline
   - Filters (simplified for mobile)
   - **SRS FR7:** Same activity as web

6. **Team Members Screen**
   - List of members
   - Invite button (admin)
   - **SRS FR8:** Same team management as web

### Phase 10 - Mobile Polish & Launch
- Push notifications (Phase 9 feature)
- Performance optimization
- Offline mode (sync when online)
- App store deployment
- User onboarding for mobile

---

## Summary: Website First, Then Mobile App

| Phase | Weeks | Product | Focus | SRS Reference |
|-------|-------|---------|-------|---------------|
| **1** | 2 | Both | Engineering foundation | Setup |
| **2** | 3-4 | **Website** | Auth & team management | FR1, FR8 |
| **3** | 5-6 | **Website** | GitHub integration & PR sync | FR2, FR4 |
| **4** | 7 | **Website** | Email notifications | FR3 |
| **5** | 8-10 | **Website** | Core product (dashboard, discussions, tasks) | FR4, FR5, FR6, FR7 |
| **6** | 11 | **Website** | Real-time, performance, accessibility | NFR1-6 |
| **7** | 12 | **Website** | Security hardening & testing | NFR3, Security |
| **8** | 13 | **Website** | Launch to production | Go-live |
| **9-11** | 14-16+ | **Mobile App** | Feature parity with website | All FRs |

---

## Key Points

✅ **Website First (Weeks 1-13):** All 7 phases focus on building the complete website product and launching it.

✅ **Mobile App Second (Weeks 14+):** After website is stable in production, build mobile app with feature parity to website.

✅ **SRS Compliant:** Every phase references the SRS document for requirements (FR1-8, NFR1-6).

✅ **User Value Timeline:**
- **Week 4:** Team can sign up and manage accounts (Phase 2)
- **Week 6:** Team can see GitHub PRs from DevSync (Phase 3)
- **Week 7:** Team gets email notifications (Phase 4)
- **Week 10:** ⭐ **Team fully coordinates work using DevSync (no more WhatsApp!)** (Phase 5)
- **Week 13:** 🎉 Website launches to production (Phase 8)
- **Week 16+:** Mobile app available (Phases 9-11)

---

## Development Team Allocation

**Phases 2-8 (Website):**
- 1 Backend Engineer: APIs, database, GitHub integration, emails
- 1 Frontend Engineer: React, UI, forms, pages
- 1 QA/DevOps: testing, CI/CD, deployment

**Phase 9-11 (Mobile App):**
- 1 Mobile Engineer (React Native) can start after Phase 8
- Other team members continue maintaining website in production

