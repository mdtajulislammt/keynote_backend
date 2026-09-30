import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class AnalyticsController {
  public getUsersByInterests = asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getUsersByInterests();
    return ApiResponse.success(res, data, 'Users grouped by interests retrieved successfully');
  });

  public getUserWithPosts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const data = await analyticsService.getUserWithPosts(userId);
    return ApiResponse.success(res, data, 'User with associated posts retrieved successfully');
  });
}

export const analyticsController = new AnalyticsController();
