import { describe, it, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../src/modules/users/user.model';
import { Note } from '../src/modules/notes/note.model';
import { Post } from '../src/modules/posts/post.model';
import { parsePagination, buildPaginationMeta } from '../src/utils/pagination';
import { analyticsService } from '../src/modules/analytics/analytics.service';
import { UserRole } from '../src/constants';

describe('Indexing and Query Plan Verification', () => {
  const userId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    await Promise.all([User.init(), Note.init(), Post.init()]);

    // Insert dummy records to allow explain plans
    await User.create({
      _id: userId,
      name: 'Plan Tester',
      email: 'plan@test.com',
      password: 'hashedPassword123!',
      role: UserRole.USER,
      interests: ['ai', 'distributed-systems', 'databases'],
    });

    await Note.create([
      { title: 'Note 1', content: 'C1', userId },
      { title: 'Note 2', content: 'C2', userId },
    ]);

    await Post.create([
      { title: 'Post 1', body: 'B1', userId },
      { title: 'Post 2', body: 'B2', userId },
    ]);
  });

  describe('Query Execution Plan Index Leverage', () => {
    it('User role & createdAt sort uses role_1_createdAt_-1 index', async () => {
      const explain = (await User.find({ role: UserRole.USER })
        .sort({ role: 1, createdAt: -1 })
        .explain('executionStats')) as any;

      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage;

      const indexUsed =
        stage === 'IXSCAN'
          ? winningPlan.indexName
          : inputStage?.indexName || inputStage?.inputStage?.indexName;

      expect(indexUsed).toBe('role_1_createdAt_-1');
    });

    it('User own notes query uses userId_1_createdAt_-1 compound index', async () => {
      const explain = (await Note.find({ userId })
        .sort({ createdAt: -1 })
        .explain('executionStats')) as any;

      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage;

      const indexUsed =
        stage === 'IXSCAN'
          ? winningPlan.indexName
          : inputStage?.indexName || inputStage?.inputStage?.indexName;

      expect(indexUsed).toBe('userId_1_createdAt_-1');
    });

    it('Admin all notes list uses createdAt_-1 single index', async () => {
      const explain = (await Note.find()
        .sort({ createdAt: -1 })
        .explain('executionStats')) as any;

      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage;

      const indexUsed =
        stage === 'IXSCAN'
          ? winningPlan.indexName
          : inputStage?.indexName || inputStage?.inputStage?.indexName;

      expect(indexUsed).toBe('createdAt_-1');
    });

    it('User posts query uses userId_1_createdAt_-1 compound index', async () => {
      const explain = (await Post.find({ userId })
        .sort({ createdAt: -1 })
        .explain('executionStats')) as any;

      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage;

      const indexUsed =
        stage === 'IXSCAN'
          ? winningPlan.indexName
          : inputStage?.indexName || inputStage?.inputStage?.indexName;

      expect(indexUsed).toBe('userId_1_createdAt_-1');
    });
  });

  describe('Pagination Utility Edge Cases', () => {
    it('normalizes invalid page and limit inputs', () => {
      const res1 = parsePagination({ page: -1, limit: 0 });
      expect(res1.page).toBe(1);
      expect(res1.limit).toBe(10);
      expect(res1.skip).toBe(0);

      const res2 = parsePagination({ page: 'abc', limit: 'xyz' });
      expect(res2.page).toBe(1);
      expect(res2.limit).toBe(10);
      expect(res2.skip).toBe(0);

      const res3 = parsePagination({ page: '3', limit: '20' });
      expect(res3.page).toBe(3);
      expect(res3.limit).toBe(20);
      expect(res3.skip).toBe(40);

      const res4 = parsePagination({ page: 1, limit: 500 }, 10, 100);
      expect(res4.limit).toBe(100); // Capped at maxLimit
    });

    it('builds accurate pagination metadata', () => {
      const meta = buildPaginationMeta(45, 2, 10);
      expect(meta).toEqual({
        total: 45,
        page: 2,
        limit: 10,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });

      const firstPageMeta = buildPaginationMeta(45, 1, 10);
      expect(firstPageMeta.hasPrevPage).toBe(false);
      expect(firstPageMeta.hasNextPage).toBe(true);

      const lastPageMeta = buildPaginationMeta(45, 5, 10);
      expect(lastPageMeta.hasNextPage).toBe(false);
      expect(lastPageMeta.hasPrevPage).toBe(true);

      const emptyMeta = buildPaginationMeta(0, 1, 10);
      expect(emptyMeta.totalPages).toBe(0);
      expect(emptyMeta.hasNextPage).toBe(false);
      expect(emptyMeta.hasPrevPage).toBe(false);
    });
  });

  describe('Direct Service Aggregation Pipeline Execution', () => {
    it('executes Scenario 1: Group by Interests successfully', async () => {
      const res = await analyticsService.getUsersByInterests();
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBeGreaterThanOrEqual(3);

      for (const item of res) {
        expect(item).toHaveProperty('interest');
        expect(item).toHaveProperty('totalUsers');
        expect(item).toHaveProperty('users');
        expect(Array.isArray(item.users)).toBe(true);
      }
    });

    it('executes Scenario 2: User Posts ($lookup) successfully', async () => {
      const res = await analyticsService.getUserWithPosts(userId.toString());
      expect(res._id.toString()).toBe(userId.toString());
      expect(res.name).toBe('Plan Tester');
      expect((res as any).password).toBeUndefined();
      expect(res.posts.length).toBe(2);
      expect(res.posts[0]).toHaveProperty('title');
      expect(res.posts[0]).toHaveProperty('body');
    });
  });
});
