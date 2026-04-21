import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

const getUserTeam = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, role, teams(*)')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) return null;
  return data;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/teams/me
 * Returns the current user's team, or null if they don't have one yet.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamData = await getUserTeam(req.user!.id);

    if (!teamData) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: teamData.teams });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * GET /api/teams/stats
 * Returns dashboard stats for the current user's team.
 */
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamData = await getUserTeam(req.user!.id);
    if (!teamData) {
      return res.status(200).json({ success: true, data: { openPrs: 0, assignedTasks: 0, teamMembers: 0, newMessages: 0 } });
    }

    const teamId = teamData.team_id;

    // Count open PRs
    const { count: openPrs, error: prError } = await supabase
      .from('pull_requests')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'open');

    if (prError) throw prError;

    // Count assigned tasks for user
    const { count: assignedTasks, error: taskError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('assigned_user_id', req.user!.id);

    if (taskError) throw taskError;

    // Count team members
    const { count: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (memberError) throw memberError;

    // Count new messages (unread comments since last login? For now, total comments today)
    const today = new Date().toISOString().split('T')[0];
    const { count: newMessages, error: msgError } = await supabase
      .from('pr_comments')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('created_at', today);

    if (msgError) throw msgError;

    return res.status(200).json({
      success: true,
      data: {
        openPrs: openPrs || 0,
        assignedTasks: assignedTasks || 0,
        teamMembers: teamMembers || 0,
        newMessages: newMessages || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * POST /api/teams
 * Creates a new team and adds the creator as owner.
 */
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Team name is required' },
      });
    }

    // Ensure user has a profile row (auto-created by trigger, but just in case)
    await supabase
      .from('profiles')
      .upsert({ id: req.user!.id }, { onConflict: 'id' });

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: req.user!.id,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as owner member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, user_id: req.user!.id, role: 'owner' });

    if (memberError) throw memberError;

    return res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});
/**
 * PATCH /api/teams/:id
 * Update team name and description. Must be an owner or admin.
 */
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const requesterData = await getUserTeam(req.user!.id);
    if (!requesterData || requesterData.team_id !== id || (requesterData.role !== 'owner' && requesterData.role !== 'admin')) {
      return res.status(403).json({ success: false, error: { message: 'Must be admin or owner to edit team settings' } });
    }

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Team name is required' } });
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update({ name: name.trim(), description: description?.trim() || null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: team });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
// ─── Member Management ────────────────────────────────────────────────────────

router.patch('/members/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Check if requester is owner/admin
    const requesterData = await getUserTeam(req.user!.id);
    if (!requesterData || (requesterData.role !== 'owner' && requesterData.role !== 'admin')) {
      return res.status(403).json({ success: false, error: { message: 'Must be admin to change roles' } });
    }

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('user_id', userId)
      .eq('team_id', requesterData.team_id);

    if (error) throw error;
    res.status(200).json({ success: true, data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/members/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if requester is owner/admin
    const requesterData = await getUserTeam(req.user!.id);
    if (!requesterData || (requesterData.role !== 'owner' && requesterData.role !== 'admin')) {
      return res.status(403).json({ success: false, error: { message: 'Must be admin to remove members' } });
    }

    // Owner cannot remove themselves (unless deleting team, which isn't covered here)
    if (userId === req.user!.id && requesterData.role === 'owner') {
      return res.status(400).json({ success: false, error: { message: 'Owner cannot remove themselves' } });
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('user_id', userId)
      .eq('team_id', requesterData.team_id);

    if (error) throw error;
    res.status(200).json({ success: true, data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
