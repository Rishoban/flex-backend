import { Request, Response } from 'express';
import { ResponseUtils } from '@/utils/helpers';
import { config } from '@/config';

export class HealthController {
  /**
   * @swagger
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Health check endpoint
   *     responses:
   *       200:
   *         description: Service is healthy
   *       503:
   *         description: Service unavailable
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.api.version,
        services: {
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
          },
          cpu: process.cpuUsage(),
        },
      };

      // Service is always healthy without database
      const isHealthy = true;

      if (!isHealthy) {
        res.status(503).json(ResponseUtils.error('Service unavailable', 503, health));
        return;
      }

      res.json(ResponseUtils.success('Service is healthy', health));
    } catch (error) {
      res.status(503).json(ResponseUtils.error('Health check failed', 503));
    }
  }

  /**
   * @swagger
   * /health/ready:
   *   get:
   *     tags: [Health]
   *     summary: Readiness check endpoint
   *     responses:
   *       200:
   *         description: Service is ready
   *       503:
   *         description: Service not ready
   */
  static async readinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Service is always ready without database dependencies
      res.json(ResponseUtils.success('Service is ready'));
    } catch (error) {
      res.status(503).json(ResponseUtils.error('Readiness check failed', 503));
    }
  }

  /**
   * @swagger
   * /health/live:
   *   get:
   *     tags: [Health]
   *     summary: Liveness check endpoint
   *     responses:
   *       200:
   *         description: Service is alive
   */
  static async livenessCheck(req: Request, res: Response): Promise<void> {
    res.json(ResponseUtils.success('Service is alive'));
  }
}