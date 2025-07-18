import { Request, Response, NextFunction } from 'express';

export interface StandardResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export function responseInterceptor(req: Request, res: Response, next: NextFunction) {
  const oldJson = res.json;
  res.json = function <T>(data: StandardResponse<T> | T) {
    if (data && typeof data === 'object' && 'success' in data) {
      return oldJson.call(this, data);
    }
    return oldJson.call(this, {
      success: true,
      message: undefined,
      data,
    } as StandardResponse<T>);
  };
  next();
} 