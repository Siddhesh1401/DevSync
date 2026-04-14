import { Router } from 'express';
import { healthCheck } from './health';
import { handleGitHubWebhook } from './webhook';
import usersRouter from './users';
import teamsRouter from './teams';
import reposRouter from './repos';
import pullRequestsRouter from './pullRequests';

const router = Router();

// ─── Phase 1 ──────────────────────────────────────────────────────────────────
router.get('/health', healthCheck);
router.post('/webhook/github', handleGitHubWebhook);

// ─── Phase 2 ──────────────────────────────────────────────────────────────────
router.use('/users', usersRouter);

// ─── Phase 3 ──────────────────────────────────────────────────────────────────
router.use('/teams', teamsRouter);
router.use('/repos', reposRouter);
router.use('/prs', pullRequestsRouter);

// ─── Phase 4 (upcoming) ───────────────────────────────────────────────────────
// router.use('/notifications', notificationsRouter);

// ─── Phase 5 (upcoming) ───────────────────────────────────────────────────────
// router.use('/comments', commentsRouter);
// router.use('/tasks', tasksRouter);
// router.use('/activity', activityRouter);

export default router;
