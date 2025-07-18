import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

interface ErrorWithStatus extends Error {
  status?: number;
  error?: unknown;
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  Sentry.captureException(err);

  const errorObj = err as ErrorWithStatus;
  const status = errorObj.status || 500;
  const message = errorObj.message || 'Internal Server Error';
  const error = errorObj.error || (status === 500 ? undefined : err);

  res.status(status).json({
    success: false,
    message,
    error,
  });
} 