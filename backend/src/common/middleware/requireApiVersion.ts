import { Request, Response, NextFunction } from 'express';

export function requireApiVersion(req: Request, res: Response, next: NextFunction) {
  if (!req.originalUrl.startsWith('/api/v1/')) {
    return next(Object.assign(new Error('API version missing or incorrect. Use /api/v1/'), { status: 400 }));
  }
  next();
} 