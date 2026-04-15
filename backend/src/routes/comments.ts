import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/comments/pr/:prId
router.get('/pr/:prId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { prId } = req.params;
    const { data, error } = await supabase
      .from('pr_comments')
      .select('*, author:profiles!pr_comments_author_id_fkey(full_name, avatar_url)')
      .eq('pr_id', prId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// POST /api/comments/pr/:prId
router.post('/pr/:prId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { prId } = req.params;
    const { content, teamId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Comment cannot be empty' } });
    }

    const { data: comment, error } = await supabase
      .from('pr_comments')
      .insert({
        pr_id: prId,
        author_id: req.user!.id,
        content: content.trim()
      })
      .select('*, author:profiles!pr_comments_author_id_fkey(full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Log to activity feed
    await supabase.from('activity_events').insert({
      team_id: teamId,
      actor_id: req.user!.id,
      actor_name: req.user!.email?.split('@')[0] || 'User',
      event_type: 'comment_added',
      description: `commented on PR`,
      metadata: { comment_id: comment.id, pr_id: prId }
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
