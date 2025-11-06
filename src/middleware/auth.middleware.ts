import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { ResponseUtils } from '@/utils/helpers';
import { JwtPayload } from '@/types';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Access attempt without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method
      });
      res.status(401).json(ResponseUtils.error('Access token required', 401));
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      
      logger.info('Token validated successfully', {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        endpoint: req.originalUrl,
        method: req.method
      });

      next();
    } catch (jwtError: any) {
      let message = 'Invalid token';
      
      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Invalid token format';
      }

      logger.warn('Token validation failed', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method
      });

      res.status(401).json(ResponseUtils.error(message, 401));
      return;
    }
  } catch (error: any) {
    logger.error('Authentication middleware error', {
      error: error.message,
      endpoint: req.originalUrl,
      method: req.method
    });
    res.status(500).json(ResponseUtils.error('Internal server error', 500));
    return;
  }
};

// Optional middleware for role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtils.error('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method
      });
      res.status(403).json(ResponseUtils.error('Insufficient permissions', 403));
      return;
    }

    next();
  };
};