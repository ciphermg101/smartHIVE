import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { getAuth } from '@common/middleware/clerkAuth';

/**
 * Application exception for known error flows:
 *   throw new AppException('Invalid ID', 400);
 */
export class AppException extends Error {
  public statusCode: number;
  public response: any;
  public originalError?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    originalError?: any,
    response?: any
  ) {
    super(message);
    this.name = 'AppException';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.response =
      response ?? { statusCode, message, timestamp: new Date().toISOString() };
  }

  getStatus() {
    return this.statusCode;
  }

  getResponse() {
    return this.response;
  }
}

/**
 * Express error middleware: logs everything to Sentry,
 * then shapes AppException and generic errors
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { method, originalUrl: url, headers, body, query, params } = req;

  // send to Sentry
  Sentry.withScope((scope) => {
    scope.setContext('http', { method, url, headers, body, query, params });
    try {
      const { userId } = getAuth(req);
      if (userId) scope.setUser({ id: userId });
    } catch { }
    const toLog = err instanceof AppException && err.originalError ? err.originalError : err;
    Sentry.captureException(toLog);
  });

  // handle known AppException
  if (err instanceof AppException) {
    return res.status(err.getStatus()).json(err.getResponse());
  }

  // handle other objects with status/response
  if (typeof err === 'object' && err !== null) {
    const e = err as any;
    const code = e.status || e.statusCode;
    const resp = e.response || e.error;
    if (code && resp) {
      return res.status(code).json(resp);
    }
  }

  // default fallback
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err instanceof Error ? err.message : 'Unknown error');

  return res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
