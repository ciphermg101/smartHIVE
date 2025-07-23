import { Request, Response, NextFunction } from 'express';
import { AppException } from '@common/error-handler/errorHandler';

export function requireApiVersion(req: Request, res: Response, next: NextFunction) {
  if (!req.originalUrl.startsWith('/api/v1/')) {
    return next(new AppException('API version missing or incorrect. Use /api/v1/', 400));
  }
  next();
} 