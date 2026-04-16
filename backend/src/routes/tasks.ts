import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to get user's team
const getUserTeamId = async (userId: string) => {
  const { data } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data?.team_id || null;
};

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamId = await getUserTeamId(req.user!.id);
    if (!teamId) return res.status(200).json({ success: true, data: [] });

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned:profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        pr:pull_requests(id, title, github_pr_id)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamId = await getUserTeamId(req.user!.id);
    if (!teamId) return res.status(403).json({ success: false, error: { message: 'No team found' } });

    const { title, description, status, priority, assigned_to, related_pr_id } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        team_id: teamId,
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        assigned_to: assigned_to || null,
        created_by: req.user!.id,
        related_pr_id: related_pr_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to activity
    await supabase.from('activity_events').insert({
      team_id: teamId,
      actor_id: req.user!.id,
      actor_name: req.user!.email?.split('@')[0] || 'Team Member',
      event_type: 'task_created',
      description: `created a new task: ${title}`,
      metadata: { task_id: task.id },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─── PATCH /api/tasks/:id ────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teamId = await getUserTeamId(req.user!.id);
    if (!teamId) return res.status(403).json({ success: false, error: { message: 'No team found' } });

    const updates = req.body;
    updates.updated_at = new Date().toISOString();

    const { data: oldTask } = await supabase.from('tasks').select('*').eq('id', id).single();

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw error;

    if (oldTask && oldTask.status !== task.status) {
       await supabase.from('activity_events').insert({
         team_id: teamId,
         actor_id: req.user!.id,
         actor_name: req.user!.email?.split('@')[0] || 'Team Member',
         event_type: 'task_status_changed',
         description: `moved task "${task.title}" to ${task.status.replace('_', ' ')}`,
         metadata: { task_id: task.id, status: task.status },
       });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teamId = await getUserTeamId(req.user!.id);
    if (!teamId) return res.status(403).json({ success: false, error: { message: 'No team found' } });

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);

    if (error) throw error;
    res.status(200).json({ success: true, data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
