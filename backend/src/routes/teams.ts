import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { emailService } from '../services/emailService';
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
router.post('/', 
  requireAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Team name must be 1-100 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const { name, description } = req.body;

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

/**
 * GET /api/teams/members
 * Returns all members of the current user's team
 */
router.get('/members', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamData = await getUserTeam(req.user!.id);
    if (!teamData) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamData.team_id)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    // Flatten the response
    const formattedMembers = members.map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      email: m.profiles?.email,
      name: m.profiles?.full_name,
      avatar: m.profiles?.avatar_url,
      role: m.role,
      joinedAt: m.joined_at
    }));

    return res.status(200).json({ success: true, data: formattedMembers });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * POST /api/teams/members/invite
 * Invites a new member to the team via email
 */
router.post('/members/invite',
  requireAuth,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['member', 'admin'])
      .withMessage('Role must be member or admin')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const { email, role = 'member' } = req.body;

      // Get requester's team
      const teamData = await getUserTeam(req.user!.id);
      if (!teamData) {
        return res.status(404).json({ success: false, error: { message: 'No team found' } });
      }

      // Check if requester is admin/owner
      if (teamData.role !== 'owner' && teamData.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Must be admin to invite members' } });
      }

      // Check if user already in team
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        const { data: alreadyMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamData.team_id)
          .eq('user_id', existing.id)
          .single();

        if (alreadyMember) {
          return res.status(400).json({ success: false, error: { message: 'User already in team' } });
        }
      }

      // Create invite
      const { data: invite, error: inviteError } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamData.team_id,
          invited_by: req.user!.id,
          email: email.toLowerCase(),
          role
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invite email
      const inviteLink = `${env.frontendUrl}/accept-invite?token=${invite.invite_token}`;
      const teamName = (teamData.teams as any)?.name || 'your team';

      try {
        await emailService.sendEmail({
          to: email,
          subject: `Invitation to join ${teamName} on DevSync`,
          html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6366f1;">🎉 You're Invited to ${teamName}</h2>
  <p>Hi there,</p>
  <p>You've been invited to join the team <strong>${teamName}</strong> on DevSync!</p>
  
  <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p>Click the button below to accept the invitation:</p>
    <a href="${inviteLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
      Accept Invitation
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Or copy and paste this link in your browser:<br/>
    <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${inviteLink}</code>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="color: #888; font-size: 12px;">
    This invitation expires in <strong>7 days</strong>. If you didn't expect this, you can safely ignore this email.
  </p>
  <p style="color: #888; font-size: 12px;">
    Best regards,<br/>
    The DevSync Team
  </p>
</div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send invite email:', emailError);
        // Don't fail the invitation if email fails - user can resend
      }

      return res.status(201).json({
        success: true,
        data: {
          id: invite.id,
          email: invite.email,
          inviteToken: invite.invite_token,
          role: invite.role,
          expiresAt: invite.expires_at
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
);

/**
 * POST /api/teams/members/accept
 * Accept an invitation token and join a team
 */
router.post('/members/accept',
  [
    body('inviteToken')
      .trim()
      .notEmpty()
      .withMessage('Invite token is required')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() }
        });
      }

      const { inviteToken } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      }

      // Get invite
      const { data: invite, error: inviteError } = await supabase
        .from('team_invites')
        .select('*')
        .eq('invite_token', inviteToken)
        .single();

      if (inviteError || !invite) {
        return res.status(404).json({ success: false, error: { message: 'Invalid or expired invitation' } });
      }

      if (invite.is_used) {
        return res.status(400).json({ success: false, error: { message: 'Invitation already used' } });
      }

      if (new Date(invite.expires_at) < new Date()) {
        return res.status(400).json({ success: false, error: { message: 'Invitation has expired' } });
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', req.user.id)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ success: false, error: { message: 'User profile not found' } });
      }

      // Check email matches
      if (profile.email?.toLowerCase() !== invite.email?.toLowerCase()) {
        return res.status(400).json({
          success: false,
          error: { message: `This invitation is for ${invite.email}, but you're logged in as ${profile.email}` }
        });
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invite.team_id,
          user_id: req.user.id,
          role: invite.role
        });

      if (memberError) {
        if (memberError.message.includes('duplicate')) {
          return res.status(400).json({ success: false, error: { message: 'Already a member of this team' } });
        }
        throw memberError;
      }

      // Mark invite as used
      await supabase
        .from('team_invites')
        .update({ is_used: true })
        .eq('id', invite.id);

      return res.status(200).json({
        success: true,
        data: { message: 'Successfully joined team', teamId: invite.team_id }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
);

/**
 * GET /api/teams/invites
 * List pending invitations for the current team (admin only)
 */
router.get('/invites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const teamData = await getUserTeam(req.user!.id);
    if (!teamData) {
      return res.status(404).json({ success: false, error: { message: 'No team found' } });
    }

    // Check if requester is admin/owner
    if (teamData.role !== 'owner' && teamData.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Must be admin to view invites' } });
    }

    const { data: invites, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('team_id', teamData.team_id)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: invites });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
