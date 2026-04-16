import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/settings/notifications
 * Get the current user's notification preferences.
 */
router.get('/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * PATCH /api/settings/notifications
 * Update the current user's notification preferences.
 */
router.patch('/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pr_created, pr_merged, pr_updated, task_assigned } = req.body;

    const updates: Record<string, boolean> = {};
    if (typeof pr_created === 'boolean') updates.pr_created = pr_created;
    if (typeof pr_merged === 'boolean') updates.pr_merged = pr_merged;
    if (typeof pr_updated === 'boolean') updates.pr_updated = pr_updated;
    if (typeof task_assigned === 'boolean') updates.task_assigned = task_assigned;

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * GET /api/settings/notifications/history
 * Get the current user's notification history.
 */
router.get('/notifications/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('notification_history')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
