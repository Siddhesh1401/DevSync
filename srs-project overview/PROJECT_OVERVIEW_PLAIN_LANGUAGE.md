# DevSync - Project Overview (Plain Language)

## 1) What This App Does

DevSync is a team coordination app for software projects.

In simple words:
- You still use GitHub for code, branches, pull requests, and merge.
- You use DevSync for communication and tracking.
- When someone pushes code or opens/updates a pull request, DevSync notifies the team.
- Team members can discuss that work inside DevSync instead of WhatsApp.

So the goal is not to replace GitHub. The goal is to replace scattered communication.

## 2) Who Uses It

### Project Owner
- Creates the project space.
- Connects the GitHub repo.
- Adds team members.

### Team Admin
- Manages members and project settings.
- Checks whether notifications and repo connection are working.

### Team Member (Developer)
- Gets alerts when code is pushed or PR is ready.
- Opens the PR link on GitHub to review code.
- Uses DevSync for team messages and updates.
- Updates assigned task status.

## 3) Website Screens in Simple Words

### 1. Landing Page
What people see first.
- Explains what DevSync is.
- Has Sign Up and Sign In buttons.

### 2. Sign Up Page
For creating a new account.
- Name, email, password.
- Optional GitHub sign-in.

### 3. Login Page
For existing users.
- Email/password login.
- Forgot password option.

### 4. Email Verification Page
Confirms the user email after signup.

### 5. Dashboard (Home)
Main summary page.
- How many PRs need review.
- How many tasks are assigned.
- Recent project activity.

### 6. Pull Requests Page
List of PRs from connected repos.
- See who created a PR.
- See status (open/merged/closed).
- Filter and search PRs.

### 7. PR Details Page
Detailed page for one PR.
- PR title, branch, author, date.
- Button to open GitHub PR.
- Team discussion thread (chat for this PR).

### 8. Tasks Page
Simple task board.
- To Do, In Progress, Done.
- Assign tasks to members.
- Update task status.

### 9. Task Details Page
Open one task and edit details.
- Description, assignee, due date, priority.

### 10. Activity Feed Page
Timeline of everything happening.
- PR created, comment added, task completed, etc.

### 11. Team Page
Manage project people and repo connection.
- Add/remove members.
- See roles.
- See if GitHub webhook is connected.

### 12. Notifications Page
All alerts in one place.
- Unread/read notifications.
- Open related PR/task directly.

### 13. Settings Page
Personal and app preferences.
- Profile details.
- Notification choices.
- Password/account options.

## 4) Mobile App Screens in Simple Words

### 1. Mobile Login/Signup
Quick access from phone.

### 2. Mobile Home
Short summary:
- PRs waiting,
- tasks assigned,
- latest updates.

### 3. Mobile PR List
See PRs quickly while on the go.

### 4. Mobile PR Details
View PR info and discussion, then jump to GitHub for code review.

### 5. Mobile Tasks
Check your assigned tasks and update status quickly.

### 6. Mobile Activity Feed
Catch up with team updates in one scroll.

### 7. Mobile Settings
Manage profile and notification preferences.

## 5) Real-Life Example (How It Works Day to Day)

Example: A teammate finishes a feature and wants review.

1. Developer A pushes branch to GitHub.
2. GitHub sends event to DevSync.
3. DevSync sends notification email to team members.
4. Team sees alert in DevSync and email.
5. Reviewer opens the PR on GitHub to review code.
6. Team discussion happens in DevSync (not WhatsApp).
7. After approval, PR is merged on GitHub.
8. DevSync updates status and logs full history.

Result:
- No missed review messages.
- One clear record of what happened.
- Less back-and-forth in multiple apps.

## 6) Phase 1 vs Phase 2

## Phase 1 (MVP - Build First)
Focus: core value quickly.

Includes:
- Account login/signup.
- Connect one GitHub repo.
- Receive push and PR events.
- Email notifications.
- Dashboard with PR list and activity.
- PR discussion thread in app.
- Basic task assignment and status tracking.

Goal of Phase 1:
- Team can stop using WhatsApp for project coordination.

## Phase 2 (Enhancement)
Focus: better experience and scale.

Includes:
- Multiple repositories per team.
- Better notification controls (digest, custom rules).
- Mobile app polish and smoother interactions.
- Better search and filters.
- Basic analytics (review time, task progress).
- Quality improvements, performance, and UX refinement.

Goal of Phase 2:
- Make the system faster, smarter, and ready for bigger teams.

## 7) What This Project Is Not

To avoid confusion:
- DevSync is not replacing GitHub.
- DevSync is not a full Jira alternative.
- DevSync is not a code hosting tool.

It is a communication and coordination layer for teams already using GitHub.

## 8) One-Line Summary

DevSync helps development teams coordinate code review and work updates in one place, while GitHub continues to handle the code itself.
