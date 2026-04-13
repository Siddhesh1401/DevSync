import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { createError } from '../middleware/errorHandler';

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

/**
 * Validates the GitHub webhook signature against our secret.
 * GitHub signs all payloads with HMAC-SHA256.
 */
const validateWebhookSignature = (
  payload: string,
  signature: string | undefined
): boolean => {
  if (!signature) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', env.githubWebhookSecret)
    .update(payload)
    .digest('hex')}`;

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

/**
 * POST /api/webhook/github
 * Receives GitHub webhook events and processes them.
 * Phase 1: Receives and validates. Full processing in Phase 3.
 */
export const handleGitHubWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;
    const delivery = req.headers['x-github-delivery'] as string | undefined;

    // Get raw body for signature validation
    const rawBody = JSON.stringify(req.body);

    // Validate webhook signature
    if (!validateWebhookSignature(rawBody, signature)) {
      throw createError('Invalid webhook signature', 401);
    }

    console.log(`📦 GitHub Webhook received:`);
    console.log(`   Event: ${event}`);
    console.log(`   Delivery ID: ${delivery}`);

    // Route event types — full processing added in Phase 3
    switch (event) {
      case 'push': {
        const payload = req.body as GitHubPushPayload;
        console.log(
          `   Push to: ${payload.ref} by ${payload.pusher?.name || 'unknown'}`
        );
        console.log(`   Repo: ${payload.repository?.full_name}`);
        // TODO Phase 3: Store push event, trigger notifications
        break;
      }

      case 'pull_request': {
        const payload = req.body as GitHubPullRequestPayload;
        console.log(
          `   PR #${payload.number} - Action: ${payload.action}`
        );
        console.log(`   Title: ${payload.pull_request?.title}`);
        // TODO Phase 3: Store PR, update status, trigger notifications
        break;
      }

      case 'ping': {
        console.log('   Ping event - webhook connection successful! ✅');
        break;
      }

      default: {
        console.log(`   Unhandled event type: ${event} (ignored)`);
      }
    }

    // Always return 200 quickly so GitHub doesn't retry
    res.status(200).json({
      success: true,
      message: 'Webhook received',
      event,
      delivery,
    });
  } catch (err) {
    next(err);
  }
};
