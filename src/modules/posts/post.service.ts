import { Post, IPost } from './post.model';
import { CreatePostDto, PostQueryDto } from './post.dto';
import { ApiError } from '../../utils/api-error';
import { ErrorCode } from '../../constants';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { PaginationMeta } from '../../utils/api-response';

export interface PaginatedPostsResult {
  data: IPost[];
  meta: PaginationMeta;
}

export class PostService {
  public async createPost(userId: string, dto: CreatePostDto): Promise<IPost> {
    const post = await Post.create({
      title: dto.title,
      body: dto.body,
      userId,
    });
    return post;
  }

  // Fetch public feed of posts (or filtered by user).
  public async getPosts(query: PostQueryDto): Promise<PaginatedPostsResult> {
    const { page, limit, skip } = parsePagination(query);

    const filter: Record<string, unknown> = {};
    if (query.userId) {
      filter.userId = query.userId;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .exec(),
      Post.countDocuments(filter).exec(),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      data: posts,
      meta,
    };
  }

  public async getPostById(postId: string): Promise<IPost> {
    const post = await Post.findById(postId).populate('userId', 'name email role').exec();
    if (!post) {
      throw ApiError.notFound(`Post with id '${postId}' not found`, ErrorCode.NOT_FOUND);
    }
    return post;
  }
}

export const postService = new PostService();
