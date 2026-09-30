import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../constants';
import { ApiError } from './api-error';

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const signToken = (
  payload: UserTokenPayload,
  expiresIn: string | number = env.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): UserTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as UserTokenPayload;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Authentication token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid authentication token');
    }
    throw ApiError.unauthorized('Could not authenticate token');
  }
};
