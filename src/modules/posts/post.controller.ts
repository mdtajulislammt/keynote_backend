import { Request, Response } from 'express';
import { postService } from './post.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';

export class PostController {
  public createPost = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('User not authenticated');

    const post = await postService.createPost(req.user.userId, req.body);
    return ApiResponse.created(res, post, 'Post created successfully');
  });

  public getPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await postService.getPosts(req.query);
    return ApiResponse.paginated(res, result.data, result.meta, 'Posts retrieved successfully');
  });

  public getPostById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const post = await postService.getPostById(id);
    return ApiResponse.success(res, post, 'Post retrieved successfully');
  });
}

export const postController = new PostController();
