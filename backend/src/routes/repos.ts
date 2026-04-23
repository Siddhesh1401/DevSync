import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

const getUserTeamMembership = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) return null;
  return data;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/repos
 * List all repositories connected to the user's team.
 */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const membership = await getUserTeamMembership(req.user!.id);

    if (!membership) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('team_id', membership.team_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * POST /api/repos
 * Connect a new GitHub repository to the user's team.
 * Returns the webhook URL and secret to configure in GitHub.
 */
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { github_repo_name, github_repo_url } = req.body;

    if (!github_repo_name?.trim() || !github_repo_url?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'github_repo_name and github_repo_url are required' },
      });
    }

    // Validate URL format (basic check)
    if (!github_repo_url.includes('github.com')) {
      return res.status(400).json({
        success: false,
        error: { message: 'github_repo_url must be a valid GitHub URL' },
      });
    }

    const membership = await getUserTeamMembership(req.user!.id);

    if (!membership) {
      return res.status(400).json({
        success: false,
        error: { message: 'You must create a team before connecting a repository' },
      });
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('repositories')
      .select('id')
      .eq('team_id', membership.team_id)
      .eq('github_repo_name', github_repo_name.trim())
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: 'This repository is already connected to your team' },
      });
    }

    const { data, error } = await supabase
      .from('repositories')
      .insert({
        team_id: membership.team_id,
        github_repo_name: github_repo_name.trim(),
        github_repo_url: github_repo_url.trim(),
        webhook_secret: env.githubWebhookSecret,
        is_connected: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Build the webhook URL pointing to this backend (production-safe)
    const webhookUrl = `${env.backendPublicUrl}/api/webhook/github`;

    return res.status(201).json({
      success: true,
      data: {
        ...data,
        webhook_url: webhookUrl,
        webhook_secret: env.githubWebhookSecret,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * PATCH /api/repos/:id/verify
 * Mark a repository as connected (called after GitHub sends a ping event).
 */
router.patch('/:id/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const membership = await getUserTeamMembership(req.user!.id);

    if (!membership) {
      return res.status(403).json({ success: false, error: { message: 'No team found' } });
    }

    const { data, error } = await supabase
      .from('repositories')
      .update({ is_connected: true, connected_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('team_id', membership.team_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * DELETE /api/repos/:id
 * Disconnect a repository from the team.
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const membership = await getUserTeamMembership(req.user!.id);

    if (!membership) {
      return res.status(403).json({ success: false, error: { message: 'No team found' } });
    }

    const { error } = await supabase
      .from('repositories')
      .delete()
      .eq('id', req.params.id)
      .eq('team_id', membership.team_id);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Repository disconnected' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
