import { Request, Response, NextFunction } from 'express';

export function responseInterceptor(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;

  res.json = function(data: any) {
    if (res.statusCode >= 400) {
      return originalJson.call(this, data);
    }
    const transformedResponse = {
      statusCode: res.statusCode,
      data: data,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    return originalJson.call(this, transformedResponse);
  };

  next();
}