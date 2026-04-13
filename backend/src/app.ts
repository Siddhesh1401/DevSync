import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testSupabaseConnection } from './config/supabase';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies (needed for webhook payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging (Dev Only) ────────────────────────────────────────────────

if (env.isDev) {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', router);

// Root redirect
app.get('/', (_req, res) => {
  res.redirect('/api/health');
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const start = async (): Promise<void> => {
  // Verify environment (will exit if missing required vars)
  console.log('🚀 Starting DevSync API Server...');
  console.log(`   Mode: ${env.nodeEnv}`);

  // Test Supabase connection
  await testSupabaseConnection();

  // Start listening
  app.listen(env.port, () => {
    console.log(`✅ Server running at http://localhost:${env.port}`);
    console.log(`   Health: http://localhost:${env.port}/api/health`);
    console.log(`   Webhook: POST http://localhost:${env.port}/api/webhook/github`);
  });
};

start().catch((err) => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});

export default app;
