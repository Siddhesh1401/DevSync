-- ============================================================
-- DevSync Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────
-- Extends Supabase's built-in auth.users table
-- Created automatically when a user signs up (via trigger below)

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT,
  avatar_url    TEXT,
  github_username TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'Public user profile data, extends Supabase auth.users';

-- ─── TEAMS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  description   TEXT,
  avatar_url    TEXT,
  owner_id      UUID        REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE teams IS 'Teams/projects that group members and repos together';

-- ─── TEAM MEMBERS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_members (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (team_id, user_id)
);

COMMENT ON TABLE team_members IS 'Junction table: which users belong to which teams and their roles';

-- ─── REPOSITORIES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS repositories (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id           UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  github_repo_name  TEXT        NOT NULL,
  github_repo_url   TEXT        NOT NULL,
  webhook_secret    TEXT        NOT NULL,
  is_connected      BOOLEAN     DEFAULT FALSE NOT NULL,
  connected_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE repositories IS 'GitHub repos connected to teams via webhooks';

-- ─── PULL REQUESTS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pull_requests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id             UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  repo_id             UUID        REFERENCES repositories(id) ON DELETE SET NULL,
  github_pr_id        BIGINT      NOT NULL,
  title               TEXT        NOT NULL,
  description         TEXT,
  author_name         TEXT        NOT NULL,
  author_avatar       TEXT,
  branch_name         TEXT        NOT NULL,
  base_branch         TEXT        NOT NULL DEFAULT 'main',
  status              TEXT        NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'merged', 'closed')),
  github_url          TEXT        NOT NULL,
  commits_count       INT         DEFAULT 0,
  changed_files_count INT         DEFAULT 0,
  merged_at           TIMESTAMPTZ,
  merged_by           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (team_id, github_pr_id)
);

COMMENT ON TABLE pull_requests IS 'PRs synced from GitHub via webhooks';
CREATE INDEX idx_pull_requests_team_id ON pull_requests (team_id);
CREATE INDEX idx_pull_requests_status  ON pull_requests (status);

-- ─── PR COMMENTS ─────────────────────────────────────────────
-- In-app discussion threads (NOT GitHub code review comments)

CREATE TABLE IF NOT EXISTS pr_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id       UUID        REFERENCES pull_requests(id) ON DELETE CASCADE NOT NULL,
  author_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  content     TEXT        NOT NULL CHECK (char_length(content) <= 5000),
  is_edited   BOOLEAN     DEFAULT FALSE NOT NULL,
  edited_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE pr_comments IS 'DevSync in-app discussion comments per PR';
CREATE INDEX idx_pr_comments_pr_id ON pr_comments (pr_id);

-- ─── TASKS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo', 'in_progress', 'done')),
  priority        TEXT        NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  related_pr_id   UUID        REFERENCES pull_requests(id) ON DELETE SET NULL,
  due_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE tasks IS 'Lightweight Kanban task board per team';
CREATE INDEX idx_tasks_team_id     ON tasks (team_id);
CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to);
CREATE INDEX idx_tasks_status      ON tasks (status);

-- ─── ACTIVITY EVENTS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  actor_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name   TEXT        NOT NULL,
  event_type   TEXT        NOT NULL
               CHECK (event_type IN (
                 'pr_created', 'pr_merged', 'pr_closed', 'pr_updated',
                 'comment_added', 'task_created', 'task_updated',
                 'task_status_changed', 'member_joined', 'member_removed',
                 'repo_connected', 'push_received'
               )),
  description  TEXT        NOT NULL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE activity_events IS 'Audit log of all significant team events for the activity feed';
CREATE INDEX idx_activity_team_id    ON activity_events (team_id);
CREATE INDEX idx_activity_created_at ON activity_events (created_at DESC);
CREATE INDEX idx_activity_event_type ON activity_events (event_type);

-- ─── NOTIFICATION PREFERENCES ───────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pr_created       BOOLEAN     DEFAULT TRUE NOT NULL,
  pr_merged        BOOLEAN     DEFAULT TRUE NOT NULL,
  pr_updated       BOOLEAN     DEFAULT TRUE NOT NULL,
  comment_added    BOOLEAN     DEFAULT TRUE NOT NULL,
  task_assigned    BOOLEAN     DEFAULT TRUE NOT NULL,
  digest_mode      BOOLEAN     DEFAULT FALSE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE notification_preferences IS 'Per-user email notification preferences';

-- ─── TEAM INVITES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_invites (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID        REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  invited_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  email           TEXT,
  invite_token    TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role            TEXT        NOT NULL DEFAULT 'member'
                  CHECK (role IN ('admin', 'member')),
  is_used         BOOLEAN     DEFAULT FALSE NOT NULL,
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE team_invites IS 'Pending invitations to join a team';

-- ─── TRIGGERS: Auto-update updated_at ────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pull_requests_updated_at
  BEFORE UPDATE ON pull_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── TRIGGER: Auto-create profile on signup ──────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
