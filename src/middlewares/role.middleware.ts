import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { UserRole, ErrorCode } from '../constants';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        ApiError.unauthorized('User must be authenticated', ErrorCode.AUTHENTICATION_ERROR)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: required role ${roles.join(' or ')}`,
          ErrorCode.AUTHORIZATION_ERROR
        )
      );
    }

    return next();
  };
};
