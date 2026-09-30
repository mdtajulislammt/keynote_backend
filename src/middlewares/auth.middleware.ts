import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { verifyToken } from '../utils/jwt';
import { ErrorCode } from '../constants';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      ApiError.unauthorized('Authorization header is missing', ErrorCode.AUTHENTICATION_ERROR)
    );
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(
      ApiError.unauthorized(
        'Invalid authorization header format. Expected "Bearer <token>"',
        ErrorCode.AUTHENTICATION_ERROR
      )
    );
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};
