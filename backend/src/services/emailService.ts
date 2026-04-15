import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * DevSync Email Service
 * Uses Nodemailer with Gmail API to dispatch real emails for free.
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.gmailUser && env.gmailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.gmailUser,
          pass: env.gmailPass,
        },
      });
    } else {
      console.warn('⚠️ No GMAIL_USER or GMAIL_PASS provided. Emails will not be sent.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html } = options;
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    if (!this.transporter) {
      console.log('\n📧 ─── EMAIL (API KEY MISSING) ───');
      console.log(`   To: ${recipients}`);
      console.log(`   Subject: ${subject}`);
      console.log('────────────────────────────────────\n');
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"DevSync" <${env.gmailUser}>`,
        to: recipients,
        subject,
        html,
      });

      console.log(`✅ Email dispatched to ${recipients} (ID: ${result.messageId})`);
      return { success: true, messageId: result.messageId };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown email error';
      console.error(`❌ Email failed: ${error}`);
      return { success: false, error };
    }
  }

  // Template: PR Created notification
  async sendPRCreatedEmail(params: {
    to: string[];
    prTitle: string;
    prNumber: number;
    authorName: string;
    branchName: string;
    githubUrl: string;
    devSyncUrl: string;
  }): Promise<EmailResult> {
    const subject = `[DevSync] New PR #${params.prNumber}: ${params.prTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">🔔 New Pull Request</h2>
        <p><strong>${params.authorName}</strong> created a new pull request:</p>
        <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>📌 <strong>PR Title:</strong> ${params.prTitle}</p>
          <p>🌿 <strong>Branch:</strong> ${params.branchName}</p>
          <p>👤 <strong>Author:</strong> ${params.authorName}</p>
        </div>
        <div style="margin: 24px 0;">
          <a href="${params.githubUrl}" style="background: #24292e; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-right: 12px;">
            View on GitHub
          </a>
          <a href="${params.devSyncUrl}" style="background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
            Discuss in DevSync
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">
          You received this email because you're a member of this DevSync team.
          <a href="${params.devSyncUrl}/dashboard/settings">Manage preferences</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }

  // Template: PR Merged notification
  async sendPRMergedEmail(params: {
    to: string[];
    prTitle: string;
    prNumber: number;
    mergedBy: string;
    githubUrl: string;
    devSyncUrl: string;
  }): Promise<EmailResult> {
    const subject = `[DevSync] PR Merged #${params.prNumber}: ${params.prTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🎉 Pull Request Merged</h2>
        <p><strong>${params.mergedBy}</strong> just merged a pull request:</p>
        <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>📌 <strong>PR Title:</strong> ${params.prTitle}</p>
          <p>👑 <strong>Merged by:</strong> ${params.mergedBy}</p>
        </div>
        <div style="margin: 24px 0;">
          <a href="${params.devSyncUrl}/dashboard/prs" style="background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
            View Dashboard
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({ to: params.to, subject, html });
  }

  // Template: PR Updated notification
  async sendPRUpdatedEmail(params: {
    to: string[];
    prTitle: string;
    prNumber: number;
    authorName: string;
    githubUrl: string;
    devSyncUrl: string;
  }): Promise<EmailResult> {
    const subject = `[DevSync] PR Updated #${params.prNumber}: ${params.prTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔄 Pull Request Updated</h2>
        <p><strong>${params.authorName}</strong> pushed new commits to:</p>
        <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>📌 <strong>PR Title:</strong> ${params.prTitle}</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: params.to, subject, html });
  }
}

export const emailService = new EmailService();
