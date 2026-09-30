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

export class AnalyticsService {
  /**
   * Scenario 1: Group by Interests
   * Strictly uses exactly ONE User.aggregate([...]) call.
   * Pipeline stages:
   * 1. $unwind: "$interests" (deconstructs array)
   * 2. $group: { _id: "$interests", totalUsers: { $sum: 1 }, users: { $push: { _id: "$_id", name: "$name", email: "$email" } } }
   * 3. $sort: { totalUsers: -1, _id: 1 }
   * 4. $project: Cleans up response shape
   */
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

  /**
   * Scenario 2: User Posts ($lookup)
   * Strictly uses a single aggregation pipeline using a $lookup stage to retrieve
   * a specific user and all posts belonging to them.
   * Pipeline stages:
   * 1. $match: { _id: new mongoose.Types.ObjectId(userId) }
   * 2. $lookup: { from: "posts", localField: "_id", foreignField: "userId", as: "posts" }
   * 3. $project: Excluding sensitive fields like password
   */
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
