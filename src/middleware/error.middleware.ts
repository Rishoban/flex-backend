import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ResponseUtils } from '@/utils/helpers';
import { ValidationError } from '@/types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const validationErrors = Object.values((error as any).errors).map(
      (err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      })
    ) as ValidationError[];
    
    res.status(statusCode).json(
      ResponseUtils.error(message, statusCode, validationErrors)
    );
    return;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if ((error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Log error
  if (statusCode >= 500 || !isOperational) {
    logger.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  res.status(statusCode).json(ResponseUtils.error(message, statusCode));
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });
  
  res.status(404).json(ResponseUtils.error(message, 404));
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};