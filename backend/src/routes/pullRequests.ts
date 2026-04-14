import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

const getUserTeamId = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) return null;
  return data.team_id;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/prs
 * List pull requests for the user's team with filtering and pagination.
 *
 * Query params:
 *   status  — 'open' | 'merged' | 'closed' | 'all'
 *   search  — search by PR title
 *   author  — filter by author name
 *   page    — page number (default: 1)
 *   limit   — items per page (default: 20)
 */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamId = await getUserTeamId(req.user!.id);

    if (!teamId) {
      return res.status(200).json({ success: true, data: [], total: 0, page: 1, limit: 20 });
    }

    const {
      status,
      search,
      author,
      page = '1',
      limit = '20',
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('pull_requests')
      .select('*, repositories(github_repo_name)', { count: 'exact' })
      .eq('team_id', teamId)
      .range(offset, offset + limitNum - 1);

    // Sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Filters
    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (author) {
      query = query.ilike('author_name', `%${author}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error('Error fetching PRs:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * GET /api/prs/:id
 * Fetch a single pull request by ID with repository info.
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamId = await getUserTeamId(req.user!.id);

    if (!teamId) {
      return res.status(403).json({ success: false, error: { message: 'No team found' } });
    }

    const { data, error } = await supabase
      .from('pull_requests')
      .select('*, repositories(github_repo_name, github_repo_url)')
      .eq('id', req.params.id)
      .eq('team_id', teamId)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ success: false, error: { message: 'Pull request not found' } });
    }

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching PR:', error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
