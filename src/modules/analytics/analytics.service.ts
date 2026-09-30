import mongoose from 'mongoose';
import { User } from '../users/user.model';
import { ApiError } from '../../utils/api-error';
import { ErrorCode } from '../../constants';

export interface GroupedInterestItem {
  interest: string;
  totalUsers: number;
  users: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  }>;
}

export interface UserWithPostsResult {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  posts: Array<{
    _id: mongoose.Types.ObjectId;
    title: string;
    body: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// Group by Interests
export class AnalyticsService {
  public async getUsersByInterests(): Promise<GroupedInterestItem[]> {
    const results = await User.aggregate<GroupedInterestItem>([
      {
        $unwind: '$interests',
      },
      {
        $group: {
          _id: '$interests',
          totalUsers: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
            },
          },
        },
      },
      {
        $sort: {
          totalUsers: -1,
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          interest: '$_id',
          totalUsers: 1,
          users: 1,
        },
      },
    ]).exec();

    return results;
  }

  // User Posts

  public async getUserWithPosts(userId: string): Promise<UserWithPostsResult> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const results = await User.aggregate<UserWithPostsResult>([
      {
        $match: {
          _id: userObjectId,
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]).exec();

    if (!results || results.length === 0) {
      throw ApiError.notFound(`User with id '${userId}' not found`, ErrorCode.NOT_FOUND);
    }

    return results[0];
  }
}

export const analyticsService = new AnalyticsService();
