# DevSync - Project Documentation

## 📋 Table of Contents
1. [What is DevSync?](#what-is-devsync)
2. [Why Do We Need It?](#why-do-we-need-it)
3. [How Will It Work?](#how-will-it-work)
4. [Features - Web App](#features---web-app)
5. [Features - Mobile App](#features---mobile-app)
6. [Complete Workflow](#complete-workflow)
7. [Technology Stack](#technology-stack)
8. [Project Timeline](#project-timeline)

---

## What is DevSync?

DevSync is a **notification and communication platform** that sits between your team and GitHub. 

**In Simple Terms:**
- It's like a WhatsApp replacement BUT specifically for code/development work
- When someone pushes code or creates a Pull Request (PR) on GitHub, everyone gets an **email notification**
- Your team can **discuss** the code in one place instead of WhatsApp
- Instead of saying "Bro review my code" on WhatsApp, you say it in DevSync

---

## Why Do We Need It?

### Current Problem (Using WhatsApp + GitHub):
- ❌ Important code review requests get lost in WhatsApp chats
- ❌ No history of who asked for what
- ❌ Notifications come at random times
- ❌ Hard to keep track of what needs to be done
- ❌ Mix of work and personal messages

### DevSync Solution:
- ✅ All code-related updates in one place
- ✅ Email notifications so you don't miss anything
- ✅ Complete history of who did what
- ✅ Easy to track pending reviews and tasks
- ✅ Professional and organized

---

## How Will It Work?

### Step 1: Setup
- Your team creates accounts in DevSync
- Link your GitHub repo to DevSync (1-time setup)
- Everyone gets added to the project

### Step 2: Developer Pushes Code
```
Developer A → Pushes code to GitHub branch → GitHub sends event to DevSync
```

### Step 3: Notification Sent
```
DevSync → Sends email to Team → "Developer A pushed branch: feature/login-fix"
```

### Step 4: Team Reviews
```
Team → Reads email → Opens GitHub → Reviews code → Merges PR
Team → Also can chat in DevSync → "Looks good!" or "Fix this bug"
```

### Step 5: Updates
```
Everything gets saved → History is maintained → Team stays updated
```

---

## Features - Web App

### 1. **Dashboard**
   - See all recent Pull Requests (PRs)
   - See all team members and what they're working on
   - Quick overview of what needs review

### 2. **PR Feed**
   - List of all pushed branches / Pull Requests
   - Who pushed it
   - When it was pushed
   - Link to GitHub PR directly

### 3. **Team Chat on PRs**
   - Click on a PR → See discussion thread
   - Add comments like "I've reviewed it, looks good!"
   - Instead of WhatsApp: "bhai merge kr de", you do it here
   - Everyone in the team sees the conversation

### 4. **Notifications & Alerts**
   - Get email when someone pushes code
   - Get email when someone comments on your PR
   - Mark emails as read/unread in the app
   - Customize notification settings (all the time? daily digest? real-time?)

### 5. **Simple Task Board**
   - Who's doing what? (Light tracking)
   - Example: "Siddhesh working on authentication" 
   - Mark tasks as "In Progress" or "Done"
   - NOT the full GitHub Issues - just lightweight tracking

### 6. **Activity Feed**
   - Timeline showing: "Friend1 pushed branch X at 5:30 PM"
   - "PR #23 was merged"
   - "Friend2 commented: Looks good!"

### 7. **User Profile**
   - Show email, GitHub username
   - Notification preferences
   - Change password

---

## Features - Mobile App

### 1. **Home Screen**
   - Quick summary: "3 PRs waiting for review"
   - "2 tasks assigned to you"
   - Recent activity in your team

### 2. **PR Notifications**
   - Push notifications (nice to have, v2)
   - Tap notification → Open PR details
   - See branch name, who pushed, quick review link

### 3. **Chat on PRs**
   - See messsages on each PR
   - Send quick messages: "Looks good!" or "Fix this"
   - Read notifications on the go

### 4. **Task List**
   - What's assigned to me?
   - What did I assign to others?
   - Update status while traveling

### 5. **Activity Feed**
   - Scroll through team updates
   - See what happened in the last 1 hour / 1 day
   - Catch up quickly before opening GitHub

### 6. **Settings**
   - Email preferences
   - Notification frequency
   - Profile settings

---

## Complete Workflow

### **Scenario: Developer Pushes Code for Review**

```
STEP 1: Developer A starts working
├─ Developer A → GitHub → Creates branch "feature/login-fix"
├─ Codes for 2 hours
└─ Pushes code to the branch

STEP 2: GitHub Notifies DevSync
├─ GitHub → Sends webhook event to DevSync server
├─ Event: "Branch pushed: feature/login-fix by Developer A"
└─ DevSync receives and processes it

STEP 3: DevSync Sends Notifications
├─ DevSync → Saves PR info in database
├─ Sends EMAIL to Team B: "Developer A pushed branch: feature/login-fix"
├─ Sends EMAIL to Team C: "Developer A pushed branch: feature/login-fix"
└─ Also shows in DevSync Web App

STEP 4: Developers See In DevSync
├─ Open DevSync web/mobile app
├─ See new PR in feed
├─ Can click "View on GitHub" to see code
└─ Can send message in DevSync: "I've started reviewing"

STEP 5: Discussion Happens in DevSync (Not WhatsApp!)
├─ Developer A: "Please review, I've completed the feature"
├─ Developer B: "On it, reviewing now"
├─ Developer C: "Looks good, but fix line 45"
├─ Developer A: "Fixed it, pushed new commit"
└─ All this is saved in DevSync history

STEP 6: Merge on GitHub
├─ Developer B → GitHub → Reviews code → Clicks Merge
└─ PR is merged to main branch

STEP 7: Update in DevSync
├─ GitHub → Sends "PR merged" event
├─ DevSync → Updates status to "Merged"
├─ Sends email to team: "PR #23 merged by Developer B"
└─ All history is maintained

STEP 8: Team Always Knows What's Happening
├─ Activity feed shows: "PR merged at 6:30 PM"
├─ No one asks "Did you merge?" on WhatsApp
├─ Complete record of who did what and when
└─ Professional and organized! ✅
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend Server** | Node.js + Express (or Python + Django) |
| **Database** | PostgreSQL (stores all PRs, messages, users) |
| **Email Service** | SendGrid (sends notification emails) |
| **GitHub Connection** | GitHub Webhooks (GitHub automatically tells us when something happens) |
| **Web App** | React + Tailwind CSS (looks nice, easy to use) |
| **Mobile App** | React Native (works on both iOS and Android) |
| **Hosting** | AWS / Heroku / Azure (put it on the internet) |

---

## Project Timeline

### **Phase 1: Foundation (Week 1-2)**
- Set up backend server
- Connect GitHub webhooks
- Create database
- Basic login/signup system

### **Phase 2: Core Features (Week 3-4)**
- Build email notification system
- Create web app dashboard
- Show PR list
- Save chat messages

### **Phase 3: Polish Web App (Week 5)**
- Improve UI design
- Add settings/preferences
- Test everything thoroughly
- Deploy to live server

### **Phase 4: Mobile App (Week 6-7)**
- Build React Native app
- Add all features from web
- Test on phones
- Deploy to app stores (later)

### **Phase 5: Test with Team (Week 8)**
- Your 2 friends use it
- Get feedback
- Fix bugs
- Make improvements

---

## Database Structure (Simple Explanation)

```
USERS Table
├─ User ID
├─ Name
├─ Email
├─ GitHub Username
└─ Password

TEAMS Table
├─ Team ID
├─ Team Name (e.g., "My Project")
├─ GitHub Repo Name
└─ Created Date

PULL_REQUESTS Table
├─ PR ID
├─ Team ID
├─ Branch Name (e.g., "feature/login-fix")
├─ Title
├─ Who Pushed It
├─ When Pushed
└─ GitHub Link

MESSAGES Table
├─ Message ID
├─ Which PR (PR ID)
├─ Who Sent It
├─ Message Text
├─ When Sent
└─ Read/Unread Status

TASKS Table
├─ Task ID
├─ Task Title (e.g., "Authentication Feature")
├─ Assigned To
├─ Status (To Do / In Progress / Done)
└─ Team ID
```

---

## What GitHub Does vs What DevSync Does

### **GitHub Handles:**
- ✅ Storing code
- ✅ Creating branches
- ✅ Creating Pull Requests
- ✅ Code review comments (can still use these)
- ✅ Merging code
- ✅ Version history

### **DevSync Handles:**
- ✅ Notifying via email
- ✅ Team communication
- ✅ Lightweight task tracking
- ✅ Activity history in our app
- ✅ Centralized coordination

**They Work Together!** → GitHub is where code lives, DevSync is where team coordination happens

---

## Key Points to Remember

1. **DevSync is NOT replacing GitHub** - GitHub stays as is
2. **DevSync is a communication layer** - Between your team and GitHub
3. **Notifications are email-based** - So you don't need to use WhatsApp
4. **Chat happens in-app** - Not on GitHub, not on WhatsApp
5. **Everything is saved** - Complete history for future reference
6. **Simple and lightweight** - Created for your specific needs
7. **Scalable** - Works now with 3 people, works later with 30 people

---

## Quick Start Checklist

- [ ] Team members create accounts
- [ ] Connect DevSync to GitHub repo
- [ ] Add team members to project
- [ ] Set email preferences
- [ ] Try pushing a test branch
- [ ] See email notification
- [ ] Add a chat message in DevSync
- [ ] Merge PR on GitHub
- [ ] See update in DevSync
- [ ] Celebrate! 🎉

---

## Questions?

- **Q: Will we stop using GitHub?**
  - A: No! GitHub is where code lives. DevSync is just for notifications and chat.

- **Q: What if I want to check emails offline?**
  - A: No problem! You'll get emails whether or not you open DevSync. You can reply to emails too (v2 feature).

- **Q: Can we add more repos later?**
  - A: Yes! Very easy. Just repeat the GitHub webhook setup.

- **Q: What if someone is not available?**
  - A: They'll get an email notification. They can catch up later by opening DevSync.

- **Q: Do we need GitHub notifications?**
  - A: You can turn off GitHub native notifications and only use DevSync notifications. Less spam!

---

**This is your project! Customize it as you need. Let's build something awesome together! 🚀**
