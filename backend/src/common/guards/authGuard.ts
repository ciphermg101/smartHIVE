import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@common/middleware/clerkAuth';
import { errorHandler } from '@common/error-handler/errorHandler';

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return errorHandler({
      status: 401,
      message: 'Unauthorized: Not authenticated',
    }, req, res, next);
  }
  return next();
} 