import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/config';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';
import { healthRoutes } from '@/routes/health.routes';
import { apiRoutes } from '@/routes/api.routes';
import { ReviewSyncService } from '@/services/reviewSync.service';

const app = express();

// Trust proxy - IMPORTANT for Vercel/serverless deployments
// This must come before other middleware
// Use '1' to trust only the first proxy (Vercel) in production
// Use 'loopback' for local development
if (process.env.VERCEL || config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', 'loopback');
}

// Security middleware
app.use(helmet());

// CORS configuration - more permissive for development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [config.cors.origin, ...config.cors.allowedOrigins];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator to correctly extract client IP from Vercel's forwarded headers
  keyGenerator: (req) => {
    // For Vercel deployments, use x-forwarded-for or x-real-ip
    if (process.env.VERCEL || config.nodeEnv === 'production') {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        // x-forwarded-for can be a comma-separated list, take the first (client) IP
        return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
      }
      const realIp = req.headers['x-real-ip'];
      if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
      }
    }
    // Fallback to req.ip (works with trust proxy configuration)
    return req.ip || 'unknown';
  },
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flex Backend API',
      version: config.api.version,
      description: 'Production-ready Node.js REST API with Express and TypeScript',
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.prefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check (before API prefix)
app.use('/health', healthRoutes);

// API routes
app.use(config.api.prefix, apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
      logger.info(`🏥 Health check available at http://localhost:${config.port}/health`);
      
      // Start background review sync service
      reviewSyncService.startBackgroundSync();
      logger.info('🔄 Background review sync service started');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Initialize background services
const reviewSyncService = ReviewSyncService.getInstance();

// Start background sync only in non-serverless environments
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  reviewSyncService.startBackgroundSync();
  logger.info('🔄 Background review sync service started', {
    service: 'flex-backend'
  });
} else {
  logger.info('📱 API service ready (serverless mode)', {
    service: 'flex-backend',
    environment: process.env.VERCEL ? 'vercel' : 'production'
  });
}

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  reviewSyncService.stopBackgroundSync();
  process.exit(0);
});

// Only start server if this file is run directly (not in Vercel)
if (require.main === module && !process.env.VERCEL) {
  startServer().catch(error => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export default app;