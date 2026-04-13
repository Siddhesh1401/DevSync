import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * DevSync Email Service
 *
 * Phase 1: Logs emails to console in dev mode (no real sending)
 * Phase 4: Switch to SendGrid for production email delivery
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.isDev) {
      // In development: use Ethereal (fake SMTP) or just log
      console.log('📧 Email service running in DEV mode (emails logged to console)');
    } else {
      // Production: configure SendGrid SMTP
      // TODO Phase 4: Set up SendGrid transport
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: env.sendgridApiKey,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text } = options;
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    if (env.isDev) {
      // Dev mode: just log the email
      console.log('\n📧 ─── EMAIL (DEV MODE - Not actually sent) ───');
      console.log(`   To: ${recipients}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Preview: ${text?.slice(0, 100) || html.slice(0, 100)}...`);
      console.log('────────────────────────────────────────────\n');
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    if (!this.transporter) {
      console.error('Email transporter not configured');
      return { success: false, error: 'Email transporter not configured' };
    }

    try {
      const result = await this.transporter.sendMail({
        from: '"DevSync" <noreply@devsync.app>',
        to: recipients,
        subject,
        html,
        text,
      });

      console.log(`✅ Email sent to ${recipients} (ID: ${result.messageId})`);
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
          <a href="${params.devSyncUrl}/settings/notifications">Manage preferences</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: params.to,
      subject,
      html,
      text: `New PR by ${params.authorName}: ${params.prTitle} | GitHub: ${params.githubUrl}`,
    });
  }
}

export const emailService = new EmailService();
