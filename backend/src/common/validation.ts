import type { RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';

import { ValidationError, type ErrorDetail } from './errors';

export type ValidationTarget = 'body' | 'query' | 'params';

export interface RequestValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Converts Zod issues into a flat `{ field, message }` list so clients get
 * predictable error payloads without depending on Zod's internal shape.
 */
export function formatZodIssues(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'body',
    message: issue.message,
  }));
}

/**
 * Validates `req.body`, `req.query` and/or `req.params` against Zod schemas.
 *
 * Validated output is written to `req.validated` instead of mutating `req.query`,
 * because Express 5 exposes `req.query` as a read-only getter.
 */
export const validate = (schemas: RequestValidationSchema): RequestHandler => {
  return (req, _res, next) => {
    const validated: NonNullable<typeof req.validated> = { ...req.validated };

    for (const target of ['params', 'query', 'body'] as const) {
      const schema = schemas[target];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        next(new ValidationError(formatZodIssues(result.error)));
        return;
      }

      validated[target] = result.data;
    }

    req.validated = validated;
    next();
  };
};
