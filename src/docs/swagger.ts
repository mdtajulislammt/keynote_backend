export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Secure Backend REST API',
    version: '1.0.0',
    description:
      'Production-grade, highly scalable, and secure REST API backend built with Express, TypeScript, and MongoDB adhering to SOLID principles and strict indexing constraints.',
    contact: {
      name: 'Engineering Team',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base URL',
    },
    {
      url: '/',
      description: 'Root Base URL',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT Bearer token in the format: <token>',
      },
    },
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 45 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found' },
          errorCode: { type: 'string', example: 'NOT_FOUND' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['coding', 'music', 'gaming'],
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'SecurePassword123!' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660000000000000000000001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['coding', 'music'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Authentication successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
            },
          },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Jane Smith' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, example: 'AdminSetPassword123!' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['ai', 'databases'],
          },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['user', 'admin'] },
          interests: { type: 'array', items: { type: 'string' } },
        },
      },
      Note: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660000000000000000000002' },
          title: { type: 'string', example: 'Backend Architecture Plan' },
          content: { type: 'string', example: 'Using Controller-Service-Model pattern with explicit compound indexes.' },
          userId: { type: 'string', example: '660000000000000000000001' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateNoteInput: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', maxLength: 200, example: 'Meeting Notes' },
          content: { type: 'string', example: 'Discussed compound index performance and aggregation pipelines.' },
        },
      },
      UpdateNoteInput: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 200, example: 'Updated Notes' },
          content: { type: 'string', example: 'Updated content body.' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660000000000000000000003' },
          title: { type: 'string', example: 'Welcome to our developer platform!' },
          body: { type: 'string', example: 'Building scalable Node.js applications with MongoDB and TypeScript.' },
          userId: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePostInput: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', maxLength: 200, example: 'My First Post' },
          body: { type: 'string', example: 'Excited to share our technical achievements!' },
        },
      },
      InterestGroup: {
        type: 'object',
        properties: {
          interest: { type: 'string', example: 'coding' },
          totalUsers: { type: 'integer', example: 3 },
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
      },
      UserWithPosts: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660000000000000000000001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', example: 'user' },
          interests: {
            type: 'array',
            items: { type: 'string' },
          },
          posts: {
            type: 'array',
            items: { $ref: '#/components/schemas/Post' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'User registration, login, and profile operations' },
    { name: 'Notes', description: 'User note CRUD (personal note isolation)' },
    { name: 'Admin Notes', description: 'Admin note overview across all users' },
    { name: 'Posts', description: 'Public feed & community posts' },
    { name: 'Admin Users', description: 'Admin user management' },
    { name: 'Analytics', description: 'MongoDB aggregation pipelines (Interests & User Posts)' },
    { name: 'Health', description: 'Server and database connection status' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API and Database Health Status',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 42.12 },
                    database: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          409: {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          422: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized access',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/notes': {
      post: {
        tags: ['Notes'],
        summary: 'Create a personal note',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Note created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Note' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Notes'],
        summary: 'List own notes (paginated, uses compound index { userId: 1, createdAt: -1 })',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated user notes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/notes/{id}': {
      get: {
        tags: ['Notes'],
        summary: 'Read single note (User: own note; Admin: any note)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Note details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Note' },
                  },
                },
              },
            },
          },
          404: { description: 'Note not found' },
        },
      },
      put: {
        tags: ['Notes'],
        summary: 'Update own note (Only owner allowed)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateNoteInput' },
            },
          },
        },
        responses: {
          200: { description: 'Note updated successfully' },
          403: { description: 'Forbidden: not your note' },
          404: { description: 'Note not found' },
        },
      },
      delete: {
        tags: ['Notes'],
        summary: 'Delete own note (Only owner allowed)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Note deleted successfully' },
          403: { description: 'Forbidden: not your note' },
          404: { description: 'Note not found' },
        },
      },
    },
    '/admin/notes': {
      get: {
        tags: ['Admin Notes'],
        summary: 'List all notes across all users (Admin only, uses { createdAt: -1 } index)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated all notes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden: Admin access required' },
        },
      },
    },
    '/posts': {
      post: {
        tags: ['Posts'],
        summary: 'Create a post',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Posts'],
        summary: 'Public feed of posts (paginated, optional userId filter)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Filter posts by user ID' },
        ],
        responses: {
          200: {
            description: 'Paginated public post feed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Read single post with author populated',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Post details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
          404: { description: 'Post not found' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin Users'],
        summary: 'List users (Admin only, paginated, uses { role: 1, createdAt: -1 } index)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
        ],
        responses: {
          200: {
            description: 'Paginated users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden: Admin access required' },
        },
      },
      post: {
        tags: ['Admin Users'],
        summary: 'Create user with role (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden: Admin access required' },
        },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get user details by ID (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
      put: {
        tags: ['Admin Users'],
        summary: 'Update user (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          200: { description: 'User updated successfully' },
          403: { description: 'Forbidden' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Admin Users'],
        summary: 'Delete user (Admin only; cannot delete self)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User deleted successfully' },
          400: { description: 'Cannot delete own admin account' },
          403: { description: 'Forbidden' },
          404: { description: 'User not found' },
        },
      },
    },
    '/analytics/interests': {
      get: {
        tags: ['Analytics'],
        summary: 'Scenario 1: Group by Interests (exactly one User.aggregate call)',
        security: [{ BearerAuth: [] }],
        description:
          'Uses $unwind, $group, $sort, and $project to group users by interests. Backed by multikey index { interests: 1 }.',
        responses: {
          200: {
            description: 'Grouped interests list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/InterestGroup' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/analytics/users/{userId}/posts': {
      get: {
        tags: ['Analytics'],
        summary: 'Scenario 2: User Posts ($lookup aggregation)',
        security: [{ BearerAuth: [] }],
        description:
          'Single pipeline using $match and $lookup on the posts collection with $project excluding password.',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'User with associated posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserWithPosts' },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
    },
  },
};
