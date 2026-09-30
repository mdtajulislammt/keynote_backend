import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/api-error';
import { ErrorCode } from '../constants';

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schema: RequestValidationSchema | ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const compositeSchema = schema as RequestValidationSchema;
        if (compositeSchema.body) {
          req.body = await compositeSchema.body.parseAsync(req.body);
        }
        if (compositeSchema.query) {
          const parsedQuery = await compositeSchema.query.parseAsync(req.query);
          Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
        if (compositeSchema.params) {
          const parsedParams = await compositeSchema.params.parseAsync(req.params);
          Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      } else {
        req.body = await (schema as ZodSchema).parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(
          new ApiError(
            422,
            'Request validation failed',
            ErrorCode.VALIDATION_ERROR,
            formattedErrors
          )
        );
      }
      return next(error);
    }
  };
};
