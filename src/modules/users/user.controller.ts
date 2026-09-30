import { Request, Response } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class UserController {
  public createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    return ApiResponse.created(res, user, 'User created successfully');
  });

  public getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getUsers(req.query);
    return ApiResponse.paginated(res, result.data, result.meta, 'Users retrieved successfully');
  });

  public getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await userService.updateUser(id, req.body);
    return ApiResponse.success(res, user, 'User updated successfully');
  });

  public deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const currentAdminId = req.user?.userId;
    const result = await userService.deleteUser(id, currentAdminId);
    return ApiResponse.success(res, result, 'User deleted successfully');
  });
}

export const userController = new UserController();
