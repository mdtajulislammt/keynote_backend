import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';

export class AuthController {
  public register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, 'User registered successfully');
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  });

  public getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }
    const profile = await authService.getProfile(req.user.userId);
    return ApiResponse.success(res, profile, 'User profile retrieved successfully');
  });
}

export const authController = new AuthController();
