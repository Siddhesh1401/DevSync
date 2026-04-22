import dotenv from 'dotenv';

dotenv.config();

const normalizeFrontendUrl = (rawUrl?: string): string => {
  const fallback = 'http://localhost:5173';
  if (!rawUrl || !rawUrl.trim()) return fallback;

  const trimmed = rawUrl.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : (process.env.NODE_ENV === 'production' ? `https://${trimmed}` : `http://${trimmed}`);

  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return fallback;
  }
};

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GITHUB_WEBHOOK_SECRET',
];

const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error('\nPlease copy .env.example to .env and fill in the values.');
  process.exit(1);
}

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
  gmailUser: process.env.GMAIL_USER || '',
  gmailPass: process.env.GMAIL_PASS || '',
  frontendUrl: normalizeFrontendUrl(process.env.FRONTEND_URL),
  isDev: process.env.NODE_ENV !== 'production',
};
