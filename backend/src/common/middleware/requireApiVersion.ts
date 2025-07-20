import { Request, Response, NextFunction } from 'express';

class StatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function requireApiVersion(req: Request, res: Response, next: NextFunction) {
  if (!req.originalUrl.startsWith('/api/v1/')) {
    return next(new StatusError('API version missing or incorrect. Use /api/v1/', 400));
  }
  next();
} 