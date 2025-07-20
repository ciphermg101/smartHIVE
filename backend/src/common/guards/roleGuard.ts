import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@common/middleware/clerkAuth';

interface PublicMetadata {
  role?: string;
}
interface SessionClaims {
  publicMetadata?: PublicMetadata;
}

class StatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);
    const userRole = (auth?.sessionClaims as SessionClaims)?.publicMetadata?.role;
    if (!userRole) {
      return next(new StatusError('Unauthorized', 401));
    }
    const allowed = Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
    if (!allowed) {
      return next(new StatusError('Forbidden: Insufficient role', 403));
    }
    next();
  };
} 