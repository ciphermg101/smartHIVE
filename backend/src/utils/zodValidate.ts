import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { ZodType, ZodError } from 'zod';

type Schemas<T, Q extends ParsedQs, P extends ParamsDictionary> = {
  body?: ZodType<T>;
  query?: ZodType<Q>;
  params?: ZodType<P>;
};

export function zodValidate<T = any, Q extends ParsedQs = ParsedQs, P extends ParamsDictionary = ParamsDictionary>(
  schemas: Schemas<T, Q, P>
) {
  return (req: Request<P, any, T, Q>, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        (req as any).validatedQuery = parsedQuery;
      }
      
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        (req as any).validatedParams = parsedParams;
      }
      
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(Object.assign(new Error('Validation failed'), { status: 400, error: err.issues }));
      }
      next(err);
    }
  };
}
