import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error';
import { HttpStatus, ErrorCode } from '../constants';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(
    ApiError.notFound(
      `Cannot find endpoint ${req.method} ${req.originalUrl} on this server`,
      ErrorCode.NOT_FOUND
    )
  );
};

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: unknown = undefined;

  // Custom Operational ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    errors = err.errors;
  }
  // Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = 'Validation error';
    errors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Mongoose CastError 
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.BAD_REQUEST;
    message = `Invalid format for '${err.path}': ${err.value}`;
  }
  // Mongoose Schema Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = 'Database validation error';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }
  // MongoDB Duplicate Key Error (Code 11000)
  else if ((err as { code?: number }).code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    errorCode = ErrorCode.CONFLICT;
    const mongoErr = err as { keyValue?: Record<string, unknown> };
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : 'field';
    const value = mongoErr.keyValue ? mongoErr.keyValue[field] : '';
    message = `Duplicate value '${value}' for unique field '${field}'`;
  }
  // JSON parse error
  else if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.BAD_REQUEST;
    message = 'Malformed JSON in request body';
  } else {
    // Unhandled / server errors
    message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message || message;
  }

  // Log unexpected errors
  if (statusCode >= 500) {
    console.error('💥 Unhandled Exception:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(errors !== undefined ? { errors } : {}),
    ...(env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};
