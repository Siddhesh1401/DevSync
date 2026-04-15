import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/activity
 * Fetches the recent activity events for the user's active team.
 */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Get the user's team ID
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user!.id)
      .limit(1)
      .single();

    if (teamError || !teamData) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Fetch the activity feed logs restricted to this team
    const { data: activities, error: activityError } = await supabase
      .from('activity_events')
      .select('*')
      .eq('team_id', teamData.team_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (activityError) throw activityError;

    return res.status(200).json({ success: true, data: activities || [] });
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
