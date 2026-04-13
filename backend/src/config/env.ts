import dotenv from 'dotenv';

dotenv.config();

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
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isDev: process.env.NODE_ENV !== 'production',
};
