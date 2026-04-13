import { Router } from 'express';
import { healthCheck } from './health';
import { handleGitHubWebhook } from './webhook';
import usersRouter from './users';

const router = Router();

// Health check
router.get('/health', healthCheck);

// GitHub webhook receiver
router.post('/webhook/github', handleGitHubWebhook);

// User routes (Phase 2)
router.use('/users', usersRouter);

// Placeholder: Team routes will be added in Phase 2
// router.use('/teams', teamRoutes);

// Placeholder: PR routes will be added in Phase 3
// router.use('/pull-requests', prRoutes);

export default router;
