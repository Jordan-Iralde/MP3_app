import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint for service availability monitoring.
 * Used for load balancers and health probes.
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

export default router;
