import { Router } from 'express';
import { HealthController } from '@/controllers/health.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */

router.get('/', HealthController.healthCheck);
router.get('/ready', HealthController.readinessCheck);
router.get('/live', HealthController.livenessCheck);

export { router as healthRoutes };