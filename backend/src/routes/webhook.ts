import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { createError } from '../middleware/errorHandler';
import { supabase } from '../config/supabase';

// ─── GitHub payload types ─────────────────────────────────────────────────────

interface GitHubPushPayload {
  ref: string;
  repository: { full_name: string; html_url: string };
  pusher: { name: string; email: string };
  commits: Array<{ id: string; message: string }>;
  head_commit: { id: string; message: string; timestamp: string } | null;
}

interface GitHubPullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    id: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
    user: { login: string; avatar_url: string };
    head: { ref: string };
    base: { ref: string };
    commits: number;
    changed_files: number;
    merged: boolean;
    merged_at: string | null;
    merged_by: { login: string } | null;
  };
  repository: { full_name: string };
}

// ─── Signature validation ─────────────────────────────────────────────────────

const validateWebhookSignature = (
  payload: string,
  signature: string | undefined
): boolean => {
  if (!signature) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', env.githubWebhookSecret)
    .update(payload)
    .digest('hex')}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

// ─── Helper: lookup repo by github_repo_name ──────────────────────────────────

const findRepo = async (repoFullName: string) => {
  const { data } = await supabase
    .from('repositories')
    .select('id, team_id, is_connected')
    .eq('github_repo_name', repoFullName)
    .single();
  return data;
};

// ─── PR status mapping ────────────────────────────────────────────────────────

const getPRStatus = (pr: GitHubPullRequestPayload['pull_request'], action: string): string => {
  if (action === 'closed' && pr.merged) return 'merged';
  if (action === 'closed') return 'closed';
  return 'open';
};

// ─── Event handlers ───────────────────────────────────────────────────────────

import { emailService } from '../services/emailService';

// Fetch emails logic
const getTargetEmails = async (teamId: string, prefKey: 'pr_created' | 'pr_merged' | 'pr_updated', excludeActorName?: string): Promise<string[]> => {
  const { data: members } = await supabase.from('team_members').select('user_id').eq('team_id', teamId);
  if (!members?.length) return [];
  
  const userIds = members.map(m => m.user_id);
  
  // Exclude the person who actually made the PR from getting an email about their own PR
  // But wait, we only have actor_name (github login), not their user_id unless their github_username matches.
  // We'll just rely on preferences for now.
  
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select(`user_id, ${prefKey}`)
    .in('user_id', userIds)
    .eq(prefKey, true);

  if (!prefs?.length) return [];
  
  const targetIds = prefs.map(p => p.user_id);
  const emails: string[] = [];
  
  for (const id of targetIds) {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(id);
    if (!error && user?.email) emails.push(user.email);
  }
  
  return emails;
};

const handlePullRequest = async (payload: GitHubPullRequestPayload): Promise<void> => {
  const { action, pull_request: pr, repository } = payload;

  const handledActions = ['opened', 'synchronize', 'closed', 'reopened'];
  if (!handledActions.includes(action)) return;

  const repo = await findRepo(repository.full_name);
  if (!repo) return;

  const status = getPRStatus(pr, action);

  const { error } = await supabase
    .from('pull_requests')
    .upsert(
      {
        team_id: repo.team_id,
        repo_id: repo.id,
        github_pr_id: pr.id,
        title: pr.title,
        description: pr.body || null,
        author_name: pr.user.login,
        author_avatar: pr.user.avatar_url,
        branch_name: pr.head.ref,
        base_branch: pr.base.ref,
        status,
        github_url: pr.html_url,
        commits_count: pr.commits,
        changed_files_count: pr.changed_files,
        merged_at: pr.merged_at || null,
        merged_by: pr.merged_by?.login || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'team_id,github_pr_id' }
    );

  if (error) {
    console.error('   ❌ Failed to save PR:', error.message);
    return;
  }

  // Handle Notifications
  try {
    const devSyncUrl = env.frontendUrl;

    if (action === 'opened') {
      const emails = await getTargetEmails(repo.team_id, 'pr_created');
      if (emails.length > 0) {
        await emailService.sendPRCreatedEmail({
          to: emails,
          prTitle: pr.title,
          prNumber: payload.number,
          authorName: pr.user.login,
          branchName: pr.head.ref,
          githubUrl: pr.html_url,
          devSyncUrl,
        });
      }
    } else if (action === 'closed' && pr.merged) {
      const emails = await getTargetEmails(repo.team_id, 'pr_merged');
      if (emails.length > 0) {
        await emailService.sendPRMergedEmail({
          to: emails,
          prTitle: pr.title,
          prNumber: payload.number,
          mergedBy: pr.merged_by?.login || pr.user.login,
          githubUrl: pr.html_url,
          devSyncUrl,
        });
      }
    } else if (action === 'synchronize') {
      const emails = await getTargetEmails(repo.team_id, 'pr_updated');
      if (emails.length > 0) {
        await emailService.sendPRUpdatedEmail({
          to: emails,
          prTitle: pr.title,
          prNumber: payload.number,
          authorName: pr.user.login,
          githubUrl: pr.html_url,
          devSyncUrl,
        });
      }
    }
  } catch (err) {
    console.error('   ⚠️ Failed to dispatch emails:', err);
  }

  const eventTypeMap: Record<string, string> = {
    opened: 'pr_created',
    synchronize: 'pr_updated',
    closed: pr.merged ? 'pr_merged' : 'pr_closed',
    reopened: 'pr_updated',
  };

  const descriptionMap: Record<string, string> = {
    opened: `opened PR #${payload.number}: ${pr.title}`,
    synchronize: `pushed new commits to PR #${payload.number}: ${pr.title}`,
    closed: pr.merged
      ? `merged PR #${payload.number}: ${pr.title}`
      : `closed PR #${payload.number}: ${pr.title}`,
    reopened: `reopened PR #${payload.number}: ${pr.title}`,
  };

  await supabase.from('activity_events').insert({
    team_id: repo.team_id,
    actor_name: pr.user.login,
    event_type: eventTypeMap[action],
    description: descriptionMap[action],
    metadata: { github_pr_id: pr.id, pr_url: pr.html_url },
  });

  if (!repo.is_connected) {
    await supabase.from('repositories').update({ is_connected: true, connected_at: new Date().toISOString() }).eq('id', repo.id);
  }

  console.log(`   ✅ PR #${payload.number} saved & processed — status: ${status}`);
};

const handlePush = async (payload: GitHubPushPayload): Promise<void> => {
  const repo = await findRepo(payload.repository.full_name);
  if (!repo) {
    console.log(`   ⚠️  Repo "${payload.repository.full_name}" not found — skipping push`);
    return;
  }

  const commitCount = payload.commits?.length || 0;
  const branch = payload.ref?.replace('refs/heads/', '') || 'unknown';

  await supabase.from('activity_events').insert({
    team_id: repo.team_id,
    actor_name: payload.pusher?.name || 'unknown',
    event_type: 'push_received',
    description: `pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${branch}`,
    metadata: {
      branch,
      commit_count: commitCount,
      repo: payload.repository.full_name,
    },
  });

  console.log(`   ✅ Push event saved — ${commitCount} commit(s) to ${branch}`);
};

const handlePing = async (repoFullName: string): Promise<void> => {
  const repo = await findRepo(repoFullName);
  if (repo) {
    await supabase
      .from('repositories')
      .update({ is_connected: true, connected_at: new Date().toISOString() })
      .eq('id', repo.id);
    console.log(`   ✅ Repo "${repoFullName}" marked as connected`);
  }
};

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/webhook/github
 * Receives, validates, and processes GitHub webhook events.
 */
export const handleGitHubWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;
    const delivery = req.headers['x-github-delivery'] as string | undefined;

    const rawBody = JSON.stringify(req.body);

    if (!validateWebhookSignature(rawBody, signature)) {
      throw createError('Invalid webhook signature', 401);
    }

    console.log(`📦 GitHub Webhook:`);
    console.log(`   Event: ${event} | Delivery: ${delivery}`);

    // Always respond quickly — process asynchronously
    res.status(200).json({ success: true, message: 'Webhook received', event, delivery });

    // Process event after responding (non-blocking)
    switch (event) {
      case 'pull_request':
        await handlePullRequest(req.body as GitHubPullRequestPayload);
        break;

      case 'push':
        await handlePush(req.body as GitHubPushPayload);
        break;

      case 'ping': {
        const repoName = req.body?.repository?.full_name;
        if (repoName) await handlePing(repoName);
        else console.log('   Ping event received — webhook connection successful ✅');
        break;
      }

      default:
        console.log(`   Event type "${event}" — not handled (ignored)`);
    }
  } catch (err) {
    next(err);
  }
};
