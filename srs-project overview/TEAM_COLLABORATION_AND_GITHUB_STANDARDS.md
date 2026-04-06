# DevSync Team Collaboration and GitHub Standards

This document explains how our 3-person team will work together professionally while building DevSync.

## 1. Team Setup and Roles

Our team has 3 people:

- **Owner/Lead (You)**: Make big decisions, approve releases, final approval for merging to `main`
- **Engineer 1**: Build features and review others' code
- **Engineer 2**: Build features and review others' code

Key rules:
- Everyone writes code AND reviews code.
- You cannot merge your own code. Someone else must check it first.

## 2. Branching Strategy (How We Organize Our Code)

Think of branches like separate working areas. We use two main branches:

- **`main`**: The final, working version that users see (production)
- **`develop`**: Where we test and prepare code before it goes to `main`

For your work, create temporary branches:
- **`feature/*`**: For new features (example: `feature/DS-101-auth-login`)
- **`fix/*`**: For bug fixes (example: `fix/DS-202-webhook-fix`)
- **`hotfix/*`**: For emergency fixes (example: `hotfix/DS-301-email-crash`)
- **`docs/*`**: For documentation changes (example: `docs/DS-50-readme-update`)

Important:
- Always use `main` as the main branch name (not `master`).
- Each feature gets its own temporary branch.
- Branch names should be clear so everyone knows what it's for.

## 3. How We Work (Step by Step)

**For adding a new feature or fixing a bug:**

1. Create a GitHub Issue (this is your task to-do list).
2. Create a new branch from `develop`.
3. Write code in small, clear changes.
4. Push your branch and ask for a review (open a PR).
5. Wait for someone to review your code.
6. Fix any problems they find.
7. Merge your code when it's approved.
8. Delete your branch after merging (clean up).

**When we want to release to users:**

1. Stop adding new features to `develop` (freeze it).
2. Test everything thoroughly.
3. Ask for final approval and merge to `main`.
4. Add a version number (like v1.0.0).

## 4. How to Ask for Code Review (Pull Requests)

**How to title your PR:**
- Start with type: `feat`, `fix`, `docs`, `chore`
- Example: `feat: add login form` or `fix: email sending error`

**Keep PRs small:**
- Don't change more than 400 lines at once.
- If it's bigger, split it into 2 PRs.
- Small = easier to review, fewer mistakes.

**Before asking for review, check:**
- [ ] Your code does what the GitHub Issue says
- [ ] You added a clear description
- [ ] If you changed the UI, add a screenshot
- [ ] You tested it and it works
- [ ] No passwords or secrets in your code
- [ ] You updated the README or docs if needed

**What reviewers (your teammates) will check:**
- Does the code actually work?
- Are there any security problems?
- Is it easy to understand?
- Are there enough tests?

**Review timing:**
- During work hours: response within 24 hours
- For urgent fixes: response within 2 hours

## 5. How to Write Clear Commit Messages

A commit message explains what you changed. Use this format:

- `feat(auth): add login button` ← Feature
- `fix(email): fix sending error` ← Bug fix
- `docs(readme): update setup steps` ← Documentation
- `chore(npm): update dependencies` ← Tools/setup

**Rules:**
- One change = one commit
- Write messages that are clear (avoid `wip`, `fix`, `test`)
- Before asking for review, clean up messy commits (combine small ones)

## 6. GitHub Settings to Set Up (One-Time Setup)

These settings protect your branches from mistakes:

**For `main` branch:**
- Require code review before merging
- Require at least 1 approval
- Require tests to pass
- Don't allow force push
- Don't allow deletion

**For `develop` branch:**
- Require code review before merging
- Require tests to pass
- Don't allow force push

**Merging strategy:**
- Use squash merge (combines all commits into one)

## 7. When is Work Actually Complete?

Your work is done when:
- [ ] Code is merged to `develop`
- [ ] All tests passed
- [ ] You added tests for your code
- [ ] No security problems
- [ ] README or docs updated (if needed)
- [ ] It works the way it was supposed to

## 8. Testing (How to Make Sure Your Code Works)

**What to test:**
- Test the important parts of your code
- Test login, user features, important functions
- For UI changes, test or take screenshots

**Before releasing to users:**
- Test everything one more time
- No critical bugs left unfixed

## 9. Places Where Code Runs

We have 3 places:
- **Local**: On your computer (for testing)
- **Staging**: A test server (final test before users)
- **Production**: Live for real users

**Rules:**
- Never put unreviewed code in production
- Only deploy to production from `main` branch
- Add a version number like v1.0.0
- Write a summary of what changed

## 10. Emergency Fixes (When Something Breaks in Production)

If something breaks for users:

1. Create a GitHub Issue labeled "urgent"
2. Create a branch from `main` called `hotfix/...`
3. Fix it quickly
4. Ask for fast review
5. Merge to `main` and deploy
6. Merge back to `develop` so it's fixed there too
7. Write down what went wrong and how to prevent it

## 11. How We Talk to Each Other

**Every morning (10 minutes):**
- What did you finish yesterday?
- What will you do today?
- Any problems blocking you?

**Every week:**
- Pick issues for next week
- Review code quality
- Show what you built
- Talk about what went well and what to improve

**Where to talk:**
- Use GitHub Issues to discuss tasks
- Use GitHub PR comments to discuss code
- Use chat for quick questions
- Write important decisions in issues, not just chat (so we remember later)

## 12. How to Use GitHub Issues (Your To-Do List)

**When creating an issue, explain:**
- What's the problem?
- What should we build?
- How will we know it's done?
- Any special notes?

**Labels (tags) to use:**
- `feature` = new feature
- `bug` = something broken
- `docs` = documentation
- `important`, `medium`, `low` = how urgent
- `backend`, `frontend` = what part of project

**Move issues through:**
- Not started → Working on it → Done

**WIP Rule (Work In Progress):**
- Each person should work on only 1 big issue at a time

## 13. Security (How to Keep Passwords Safe)

- **Never** put passwords or API keys in your code
- Use `.env` files (these don't go to GitHub)
- Create `.env.example` so team knows what variables are needed
- If you accidentally publish a password, change it immediately
- Don't log passwords or user data
- Give each service only the permissions it needs

## 14. Documentation (How to Write Instructions)

**When you add a feature, also update:**
- README.md (how to set up and run the project)
- How the feature works
- Any setup steps others need

**Always keep updated:**
- README with setup steps
- A summary of how things work
- Phase checklist
- Release notes (what changed in each version)

## 15. First Steps to Do (Before You Start Coding)

- [ ] Protect `main` and `develop` branches
- [ ] Add GitHub issue templates
- [ ] Add a PR template
- [ ] Set up labels (feature, bug, important, etc.)
- [ ] Set up a project board (Backlog → In Progress → Done)
- [ ] Create `.env.example` file
- [ ] Start using this guide

## 16. Team Agreement

All 3 team members agree to follow this guide for the entire DevSync project.

- Version: 1.0
- Start date: April 1, 2026
- Review this again: Every 2 weeks

## 17. Git Commands (Copy and Paste These)

Use these commands exactly as shown. Open your terminal and copy-paste them.

### 17.1 First Time Setup (Do This Once)

Tell Git who you are:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Download the project (replace `<repo-url>` with actual URL):

```bash
git clone <repo-url>
cd DevSync
```

Get all branches from GitHub:

```bash
git fetch --all --prune
```

### 17.2 Get the Main Branches (Do This Once)

Download and switch to `main`:

```bash
git checkout main
git pull origin main
```

Download and switch to `develop`:

```bash
git checkout develop
git pull origin develop
```

### 17.3 Daily Work Flow (Do This Every Day)

**Step 1: Get latest code from team**

```bash
git checkout develop
git pull origin develop
```

**Step 2: Create your branch**

```bash
git checkout -b feature/DS-123-my-feature
```

**Step 3: Write your code**

Edit files in your code editor.

**Step 4: Check what you changed**

```bash
git status
```

**Step 5: Save your changes (commit)**

```bash
git add .
git commit -m "feat(auth): add login form"
```

**Step 6: Upload to GitHub**

```bash
git push -u origin feature/DS-123-my-feature
```

**Step 7: Ask for review on GitHub**

- Go to GitHub website
- Click "Create Pull Request"
- Pick a teammate to review
- Wait for approval

**Step 8: After code is approved and merged**

```bash
git checkout develop
git pull origin develop
git branch -d feature/DS-123-my-feature
```

### 17.4 Getting Latest Changes (When Others Pushed Code)

If your branch is old:

```bash
git checkout develop
git pull origin develop
git checkout feature/DS-123-my-feature
git merge develop
```

If there are conflicts (Git can't merge automatically):

1. Open the conflicted files and fix them (choose which version to keep)
2. Save the fixed files
3. Run:

```bash
git add .
git commit -m "fix: merged latest develop"
git push
```

### 17.5 Fixing a Bug

```bash
git checkout develop
git pull origin develop
git checkout -b fix/DS-456-my-bug-fix
```

Write your fix, then:

```bash
git add .
git commit -m "fix(email): fix sending error"
git push -u origin fix/DS-456-my-bug-fix
```

Open PR on GitHub.

### 17.6 Emergency Fix (Something Broken for Users!)

**Step 1: Branch from `main`**

```bash
git checkout main
git pull origin main
git checkout -b hotfix/DS-999-urgent-fix
```

**Step 2: Fix it and push**

```bash
git add .
git commit -m "fix: fix crash in email sending"
git push -u origin hotfix/DS-999-urgent-fix
```

**Step 3: Open PR to `main` and get fast approval**

**Step 4: Make sure develop has the fix too**

```bash
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### 17.7 Releasing to Users

When you're ready to release:

```bash
git checkout develop
git pull origin develop
git checkout main
git pull origin main
```

Open PR on GitHub: `develop` → `main`, then merge.

Add version number:

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 17.8 Most Used Commands

**See what's changed:**

```bash
git status
```

**Switch to a branch:**

```bash
git checkout develop
git checkout feature/DS-123-my-feature
```

**See history of changes:**

```bash
git log --oneline -10
```

**Get latest code from GitHub:**

```bash
git fetch --all
```

**Download and merge latest:**

```bash
git pull origin develop
```

**Upload your branch:**

```bash
git push
```

**Save your work without committing:**

```bash
git stash
```

**Get your work back:**

```bash
git stash pop
```

### 17.9 Safe Rules (Don't Do These)

✅ **DO:**
- Always run `git status` to see what changed
- Create a branch for every task
- Push to your branch, not to `main` or `develop`
- Write clear commit messages

❌ **DON'T:**
- Don't use `git push --force`
- Don't use `git reset --hard`
- Don't change someone else's commits
- Don't push directly to `main` or `develop`

If you're confused, ask before running any command!

### 17.10 Your Daily Copy-Paste Routine

Every day, do this:

```bash
# 1. Get latest code
git checkout develop
git pull origin develop

# 2. Create your branch
git checkout -b feature/DS-123-my-feature

# 3. Write code here

# 4. Save your work
git add .
git commit -m "feat(auth): add login form"

# 5. Upload to GitHub
git push -u origin feature/DS-123-my-feature
```

Then on GitHub: Open PR → Request review → Wait for approval → Merge
