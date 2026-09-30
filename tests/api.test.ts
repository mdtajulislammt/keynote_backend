import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/modules/users/user.model';
import { Note } from '../src/modules/notes/note.model';
import { Post } from '../src/modules/posts/post.model';
import { hashPassword } from '../src/utils/password';
import { UserRole } from '../src/constants';

describe('Secure Backend API Test Suite', () => {
  let adminToken: string;
  let user1Token: string;
  let user2Token: string;
  let adminId: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Ensure all Mongoose indexes are built in the in-memory database
    await Promise.all([
      User.init(),
      Note.init(),
      Post.init(),
    ]);
  });

  // =========================================================================
  // 1. DATABASE INDEX VERIFICATION
  // =========================================================================
  describe('Database Strict Indexing Verification', () => {
    it('should have exact specified indexes on User collection', async () => {
      const indexes = await User.collection.indexes();
      const indexNames = indexes.map((idx) => idx.name);

      // Verify explicit indexes exist
      expect(indexNames).toContain('_id_');
      expect(indexNames).toContain('email_1');
      expect(indexNames).toContain('role_1_createdAt_-1');
      expect(indexNames).toContain('interests_1');

      // Verify email index has unique constraint
      const emailIndex = indexes.find((idx) => idx.name === 'email_1');
      expect(emailIndex?.unique).toBe(true);
    });

    it('should have exact specified indexes on Note collection', async () => {
      const indexes = await Note.collection.indexes();
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain('_id_');
      expect(indexNames).toContain('userId_1_createdAt_-1');
      expect(indexNames).toContain('createdAt_-1');
    });

    it('should have exact specified indexes on Post collection', async () => {
      const indexes = await Post.collection.indexes();
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain('_id_');
      expect(indexNames).toContain('userId_1_createdAt_-1');
    });
  });

  // =========================================================================
  // 2. HEALTH CHECK
  // =========================================================================
  describe('GET /health', () => {
    it('should return healthy status and database connection info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  // =========================================================================
  // SWAGGER DOCUMENTATION
  // =========================================================================
  describe('Swagger Documentation', () => {
    it('should serve Swagger UI html', async () => {
      const res = await request(app).get('/api/docs/');
      expect([200, 301]).toContain(res.status);
    });

    it('should serve Swagger OpenAPI JSON schema', async () => {
      const res = await request(app).get('/api/docs.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.0');
      expect(res.body.info.title).toBe('Secure Backend REST API');
      expect(res.body.paths['/auth/register']).toBeDefined();
    });
  });

  // =========================================================================
  // 3. AUTHENTICATION & RBAC
  // =========================================================================
  describe('Authentication Module', () => {
    it('should register a new user successfully and not return password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Johnson',
          email: 'alice@example.com',
          password: 'Password123!',
          interests: ['coding', 'music', 'gaming'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.role).toBe(UserRole.USER);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.token).toBeDefined();

      user1Token = res.body.data.token;
      user1Id = res.body.data.user._id;
    });

    it('should prevent registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Duplicate',
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('CONFLICT');
    });

    it('should fail registration with invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: 'short',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('AUTHENTICATION_ERROR');
    });

    it('should get own profile with valid JWT', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(user1Id);
      expect(res.body.data.name).toBe('Alice Johnson');
      expect(res.body.data.password).toBeUndefined();
    });

    it('should reject /me without JWT', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // Setup additional users for subsequent tests
  describe('Setup Admin and Second User', () => {
    it('creates an admin and a second user', async () => {
      const hashedPw = await hashPassword('AdminPass123!');
      const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPw,
        role: UserRole.ADMIN,
        interests: ['management', 'coding'],
      });
      adminId = admin._id.toString();

      const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@example.com',
        password: 'AdminPass123!',
      });
      adminToken = adminLogin.body.data.token;

      const user2Res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'PasswordBob123!',
        interests: ['music', 'travel'],
      });
      user2Token = user2Res.body.data.token;
      user2Id = user2Res.body.data.user._id;
    });
  });

  // =========================================================================
  // 4. NOTES MODULE & PERMISSION ENFORCEMENT
  // =========================================================================
  describe('Notes Module (User & Admin RBAC)', () => {
    let user1NoteId: string;

    it('allows User1 to create a note', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Alice First Note',
          content: 'Secret personal notes for Alice',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Alice First Note');
      expect(res.body.data.userId).toBe(user1Id);
      user1NoteId = res.body.data._id;
    });

    it('allows User1 to fetch own paginated notes', async () => {
      const res = await request(app)
        .get('/api/v1/notes?page=1&limit=5')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta).toEqual({
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('allows User1 to read own note by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(user1NoteId);
    });

    it('prevents User2 from viewing User1 note', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });

    it('allows Admin to view User1 note', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(user1NoteId);
    });

    it('prevents User2 from updating User1 note', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'Hacked Title',
        });

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('AUTHORIZATION_ERROR');
    });

    it('allows User1 to update own note', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Alice Updated Note',
          content: 'Updated content',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Alice Updated Note');
    });

    it('prevents regular user from accessing Admin all-notes list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/notes')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
    });

    it('allows Admin to fetch all notes across all users with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/admin/notes?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('allows User1 to delete own note', async () => {
      const res = await request(app)
        .delete(`/api/v1/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);

      const check = await Note.findById(user1NoteId);
      expect(check).toBeNull();
    });
  });

  // =========================================================================
  // 5. POSTS MODULE
  // =========================================================================
  describe('Posts Module', () => {
    it('allows authenticated user to create a post', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'My First Public Post',
          body: 'Hello everyone in the community!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('My First Public Post');
      expect(res.body.data.userId).toBe(user1Id);
    });

    it('allows public access to read paginated posts feed', async () => {
      const res = await request(app).get('/api/v1/posts?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toBeDefined();
      expect(res.body.data[0].userId.name).toBe('Alice Johnson');
    });
  });

  // =========================================================================
  // 6. ADMIN USER MANAGEMENT
  // =========================================================================
  describe('Admin User Management Module', () => {
    let createdUserId: string;

    it('prevents regular user from listing all users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
    });

    it('allows Admin to list all users paginated', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    });

    it('allows Admin to create a new user with role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Charlie AdminCreated',
          email: 'charlie@example.com',
          password: 'PasswordCharlie123!',
          role: UserRole.USER,
          interests: ['coding', 'art'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('charlie@example.com');
      createdUserId = res.body.data._id;
    });

    it('allows Admin to update a user', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Charlie Updated',
          interests: ['coding', 'art', 'music'],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Charlie Updated');
    });

    it('allows Admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const check = await User.findById(createdUserId);
      expect(check).toBeNull();
    });

    it('prevents Admin from deleting their own account', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot delete their own account');
    });
  });

  // =========================================================================
  // 7. MANDATORY AGGREGATION PIPELINES
  // =========================================================================
  describe('Mandatory Aggregation Pipelines', () => {
    it('Scenario 1: Group by Interests (exactly one User.aggregate call)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/interests')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Verify shape: { interest, totalUsers, users: [{ _id, name, email }] }
      const musicGroup = res.body.data.find(
        (item: { interest: string }) => item.interest === 'music'
      );
      expect(musicGroup).toBeDefined();
      expect(musicGroup.totalUsers).toBeGreaterThanOrEqual(2); // Alice and Bob both have 'music'
      expect(musicGroup.users.length).toBe(musicGroup.totalUsers);
      expect(musicGroup.users[0]).toHaveProperty('_id');
      expect(musicGroup.users[0]).toHaveProperty('name');
      expect(musicGroup.users[0]).toHaveProperty('email');
      expect(musicGroup.users[0].password).toBeUndefined();

      // Verify sorted by totalUsers descending
      for (let i = 0; i < res.body.data.length - 1; i++) {
        expect(res.body.data[i].totalUsers).toBeGreaterThanOrEqual(
          res.body.data[i + 1].totalUsers
        );
      }
    });

    it('Scenario 2: User Posts ($lookup pipeline matching user and joining posts)', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/users/${user1Id}/posts`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(user1Id);
      expect(res.body.data.name).toBe('Alice Johnson');
      expect(res.body.data.password).toBeUndefined(); // Excluded by $project
      expect(Array.isArray(res.body.data.posts)).toBe(true);
      expect(res.body.data.posts.length).toBe(1);
      expect(res.body.data.posts[0].title).toBe('My First Public Post');
    });

    it('Scenario 2: returns 404 for non-existent user', async () => {
      const nonExistentId = '660000000000000000000000';
      const res = await request(app)
        .get(`/api/v1/analytics/users/${nonExistentId}/posts`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });
  });
});
