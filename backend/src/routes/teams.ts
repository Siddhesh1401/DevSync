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

export default router;
