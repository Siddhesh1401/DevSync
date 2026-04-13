import { Router } from 'express';
import { healthCheck } from './health';
import { handleGitHubWebhook } from './webhook';

const router = Router();

// Health check
router.get('/health', healthCheck);

// GitHub webhook receiver
router.post('/webhook/github', handleGitHubWebhook);

// Placeholder: Auth routes will be added in Phase 2
// router.use('/auth', authRoutes);

// Placeholder: Team routes will be added in Phase 2
// router.use('/teams', teamRoutes);

// Placeholder: PR routes will be added in Phase 3
// router.use('/pull-requests', prRoutes);

export default router;
