import { HttpStatus, ErrorCode } from '../constants';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly errors?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(
    message: string = 'Bad request',
    errors?: unknown,
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST
  ): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, errorCode, errors);
  }

  public static unauthorized(
    message: string = 'Unauthorized access',
    errorCode: ErrorCode = ErrorCode.AUTHENTICATION_ERROR
  ): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, errorCode);
  }

  public static forbidden(
    message: string = 'Forbidden resource',
    errorCode: ErrorCode = ErrorCode.AUTHORIZATION_ERROR
  ): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message, errorCode);
  }

  public static notFound(
    message: string = 'Resource not found',
    errorCode: ErrorCode = ErrorCode.NOT_FOUND
  ): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message, errorCode);
  }

  public static conflict(
    message: string = 'Resource already exists',
    errorCode: ErrorCode = ErrorCode.CONFLICT
  ): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, errorCode);
  }

  public static unprocessableEntity(
    message: string = 'Unprocessable entity',
    errors?: unknown,
    errorCode: ErrorCode = ErrorCode.VALIDATION_ERROR
  ): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, errorCode, errors);
  }

  public static internal(
    message: string = 'Internal server error',
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR
  ): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, errorCode, undefined, false);
  }
}
