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
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err instanceof ZodError ? err : new Error('Validation failed'));
    }
  };
}
