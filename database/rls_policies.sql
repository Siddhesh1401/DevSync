-- ============================================================
-- DevSync Row Level Security (RLS) Policies
-- Run this AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites             ENABLE ROW LEVEL SECURITY;

-- ─── Helper Function ─────────────────────────────────────────
-- Returns all team IDs that the current user is a member of

CREATE OR REPLACE FUNCTION get_my_team_ids()
RETURNS SETOF UUID AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES ────────────────────────────────────────────────

-- Users can view all profiles (needed for @mentions, member lists)
CREATE POLICY "profiles_select_any"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ─── TEAMS ───────────────────────────────────────────────────

-- Users can see teams they belong to
CREATE POLICY "teams_select_member"
  ON teams FOR SELECT
  USING (id IN (SELECT get_my_team_ids()));

-- Authenticated users can create teams
CREATE POLICY "teams_insert_authenticated"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Only team owner can update team details
CREATE POLICY "teams_update_owner"
  ON teams FOR UPDATE
  USING (owner_id = auth.uid());

-- Only team owner can delete the team
CREATE POLICY "teams_delete_owner"
  ON teams FOR DELETE
  USING (owner_id = auth.uid());

-- ─── TEAM MEMBERS ────────────────────────────────────────────

-- Members can see other members of their teams
CREATE POLICY "team_members_select_member"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Admins/owners can add members
CREATE POLICY "team_members_insert_admin"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_members.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Admins/owners can remove members
CREATE POLICY "team_members_delete_admin"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

-- ─── REPOSITORIES ────────────────────────────────────────────

-- Team members can view connected repos
CREATE POLICY "repos_select_member"
  ON repositories FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Admins/owners can add repos
CREATE POLICY "repos_insert_admin"
  ON repositories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = repositories.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Admins/owners can update repos
CREATE POLICY "repos_update_admin"
  ON repositories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = repositories.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ─── PULL REQUESTS ────────────────────────────────────────────

-- Team members can view PRs
CREATE POLICY "prs_select_member"
  ON pull_requests FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Only backend (service role) inserts PRs via webhook
-- No client-side insert policy needed

-- ─── PR COMMENTS ─────────────────────────────────────────────

-- Team members can view all comments on PRs they can see
CREATE POLICY "pr_comments_select_member"
  ON pr_comments FOR SELECT
  USING (
    pr_id IN (
      SELECT id FROM pull_requests
      WHERE team_id IN (SELECT get_my_team_ids())
    )
  );

-- Authenticated team members can add comments
CREATE POLICY "pr_comments_insert_member"
  ON pr_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND pr_id IN (
      SELECT id FROM pull_requests
      WHERE team_id IN (SELECT get_my_team_ids())
    )
  );

-- Users can only edit their own comments
CREATE POLICY "pr_comments_update_own"
  ON pr_comments FOR UPDATE
  USING (author_id = auth.uid());

-- Users can only delete their own comments
CREATE POLICY "pr_comments_delete_own"
  ON pr_comments FOR DELETE
  USING (author_id = auth.uid());

-- ─── TASKS ───────────────────────────────────────────────────

-- Team members can see all tasks in their team
CREATE POLICY "tasks_select_member"
  ON tasks FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Team members can create tasks
CREATE POLICY "tasks_insert_member"
  ON tasks FOR INSERT
  WITH CHECK (
    team_id IN (SELECT get_my_team_ids())
    AND created_by = auth.uid()
  );

-- Task creator and assignee can update tasks
CREATE POLICY "tasks_update_member"
  ON tasks FOR UPDATE
  USING (
    team_id IN (SELECT get_my_team_ids())
    AND (created_by = auth.uid() OR assigned_to = auth.uid())
  );

-- Only task creator or admin can delete
CREATE POLICY "tasks_delete_creator_or_admin"
  ON tasks FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = tasks.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ─── ACTIVITY EVENTS ─────────────────────────────────────────

-- Team members can see their team's activity
CREATE POLICY "activity_select_member"
  ON activity_events FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- Only backend inserts activity events (no client policy)

-- ─── NOTIFICATION PREFERENCES ────────────────────────────────

-- Users can only see/edit their own preferences
CREATE POLICY "notif_prefs_select_own"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notif_prefs_update_own"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- ─── TEAM INVITES ────────────────────────────────────────────

-- Admins can see invites for their team
CREATE POLICY "team_invites_select_admin"
  ON team_invites FOR SELECT
  USING (
    team_id IN (SELECT get_my_team_ids())
  );

-- Admins can create invites
CREATE POLICY "team_invites_insert_admin"
  ON team_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_invites.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
