# Production-Grade Secure REST API Backend

A production-grade, highly scalable, and secure Node.js/TypeScript REST API backend built with Express, MongoDB, and Mongoose adhering to SOLID principles and layered architecture (Controller-Service-Repository/Model pattern).

---

## 🛠️ Technology Stack & Core Libraries

- **Runtime:** Node.js (TypeScript with strict type-checking)
- **Web Framework:** Express.js 5
- **Database & ODM:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Security:**
  - Password Hashing: `bcryptjs` with 12 salt rounds
  - HTTP Header Security: `helmet`
  - Cross-Origin Resource Sharing: `cors`
  - Input Sanitization & Strict Request Validation: `zod`
- **Documentation:** Swagger / OpenAPI 3.0 via `swagger-ui-express` (Interactive UI at `/api/docs`)
- **Testing & Quality Assurance:**
  - `vitest` (fast test runner)
  - `supertest` (HTTP integration testing)
  - `mongodb-memory-server` (isolated in-memory integration testing)

---

## 🏛️ Architecture & Folder Structure

```text
Secure_backend/
├── docker-compose.yml     # Local MongoDB container definition
├── package.json           # Scripts and dependency specifications
├── tsconfig.json          # Strict TypeScript configuration
├── vitest.config.ts       # Vitest integration test configuration
├── tests/
│   ├── api.test.ts                     # Comprehensive API endpoint & RBAC tests
│   ├── indexing_and_pagination.test.ts # Execution plan & pagination tests
│   └── setup.ts                        # In-memory MongoDB lifecycle setup
└── src/
    ├── config/            # Environment variables (Zod validated) & Database connection
    │   ├── database.ts
    │   └── env.ts
    ├── constants/         # Roles, Error Codes, and HTTP Status Codes
    │   └── index.ts
    ├── middlewares/       # Express middlewares
    │   ├── auth.middleware.ts      # JWT verification & request context
    │   ├── error.middleware.ts     # Global centralized error handler
    │   ├── role.middleware.ts      # Role-Based Access Control (RBAC)
    │   └── validate.middleware.ts  # Zod schema validation for body, query, and params
    ├── modules/
    │   ├── analytics/     # Mandatory aggregation pipelines (Scenario 1 & 2)
    │   │   ├── analytics.controller.ts
    │   │   ├── analytics.dto.ts
    │   │   ├── analytics.routes.ts
    │   │   └── analytics.service.ts
    │   ├── auth/          # Authentication module (register, login, me)
    │   │   ├── auth.controller.ts
    │   │   ├── auth.dto.ts
    │   │   ├── auth.routes.ts
    │   │   └── auth.service.ts
    │   ├── notes/         # Notes module with user/admin RBAC
    │   │   ├── note.controller.ts
    │   │   ├── note.dto.ts
    │   │   ├── note.model.ts
    │   │   ├── note.routes.ts
    │   │   └── note.service.ts
    │   ├── posts/         # Posts module with public feed & author relations
    │   │   ├── post.controller.ts
    │   │   ├── post.dto.ts
    │   │   ├── post.model.ts
    │   │   ├── post.routes.ts
    │   │   └── post.service.ts
    │   └── users/         # Admin user management module
    │       ├── user.controller.ts
    │       ├── user.dto.ts
    │       ├── user.model.ts
    │       ├── user.routes.ts
    │       └── user.service.ts
    ├── types/             # Global ambient type augmentations (Express Request User)
    │   └── express.d.ts
    ├── utils/             # Reusable enterprise utilities
    │   ├── api-error.ts        # Operational ApiError class with factory helpers
    │   ├── api-response.ts     # Standardized API response formatters
    │   ├── async-handler.ts    # Unhandled promise catch wrapper
    │   ├── jwt.ts              # JWT signing & verification utilities
    │   ├── pagination.ts       # Pagination query parsing and meta builder
    │   └── password.ts         # Bcrypt hashing and comparison
    ├── app.ts             # Express application setup and routing
    └── server.ts          # Server bootstrap & graceful shutdown lifecycle
```

---

## 🗄️ Database Design & Strict Indexing Strategy

Only strictly necessary indexes are defined. To prevent duplicate or overlapping indexes, field-level `unique` / `index` declarations are avoided; every index is explicitly defined using Mongoose's `schema.index(...)` method:

### 1. `User` Collection
- **Fields:** `name` (String), `email` (String, unique), `password` (String, `select: false`), `role` (`'user' | 'admin'`), `interests` (`[String]`), timestamps (`createdAt`, `updatedAt`).
- **Indexes:**
  ```typescript
  // Fast lookup for login & registration uniqueness checks
  userSchema.index({ email: 1 }, { unique: true });

  // Admin paginated user listing sorted by creation date
  userSchema.index({ role: 1, createdAt: -1 });

  // Multikey index strictly supporting $unwind & $group aggregation by interests
  userSchema.index({ interests: 1 });
  ```

### 2. `Note` Collection
- **Fields:** `title` (String), `content` (String), `userId` (`ObjectId` ref: 'User'), timestamps (`createdAt`, `updatedAt`).
- **Indexes:**
  ```typescript
  // Compound index for regular users fetching their own notes paginated and sorted
  noteSchema.index({ userId: 1, createdAt: -1 });

  // Admin paginated list across all notes sorted by date
  noteSchema.index({ createdAt: -1 });
  ```

### 3. `Post` Collection
- **Fields:** `title` (String), `body` (String), `userId` (`ObjectId` ref: 'User'), timestamps (`createdAt`, `updatedAt`).
- **Indexes:**
  ```typescript
  // Directly supports retrieving all posts belonging to a particular user (Scenario 2 $lookup and matching) with sorting
  postSchema.index({ userId: 1, createdAt: -1 });
  ```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Resource | Operation | Endpoint | User Role | Admin Role |
| :--- | :--- | :--- | :---: | :---: |
| **Auth** | Register | `POST /api/v1/auth/register` | Public | Public |
| **Auth** | Login | `POST /api/v1/auth/login` | Public | Public |
| **Auth** | Profile | `GET /api/v1/auth/me` | Allowed (Own) | Allowed (Own) |
| **Notes** | Create | `POST /api/v1/notes` | Allowed | Allowed |
| **Notes** | List Notes | `GET /api/v1/notes` | Own Only | Own Only |
| **Notes** | Read Note | `GET /api/v1/notes/:id` | Own Only | Any Note |
| **Notes** | Update Note | `PUT /api/v1/notes/:id` | Own Only | Own Only |
| **Notes** | Delete Note | `DELETE /api/v1/notes/:id` | Own Only | Own Only |
| **Notes** | Admin All Notes | `GET /api/v1/admin/notes` | Denied (403) | Allowed (All) |
| **Posts** | Create | `POST /api/v1/posts` | Allowed | Allowed |
| **Posts** | Public Feed | `GET /api/v1/posts` | Public | Public |
| **Posts** | Read Single | `GET /api/v1/posts/:id` | Public | Public |
| **Users** | Create User | `POST /api/v1/admin/users` | Denied (403) | Allowed |
| **Users** | List Users | `GET /api/v1/admin/users` | Denied (403) | Allowed |
| **Users** | Get User | `GET /api/v1/admin/users/:id` | Denied (403) | Allowed |
| **Users** | Update User | `PUT /api/v1/admin/users/:id` | Denied (403) | Allowed |
| **Users** | Delete User | `DELETE /api/v1/admin/users/:id` | Denied (403) | Allowed (not self) |
| **Analytics**| By Interests | `GET /api/v1/analytics/interests` | Allowed | Allowed |
| **Analytics**| User Posts | `GET /api/v1/analytics/users/:userId/posts` | Allowed | Allowed |

---

## 📊 Mandatory Aggregation Pipelines

### Scenario 1: Group by Interests
- **Endpoint:** `GET /api/v1/analytics/interests`
- **Rule:** Exactly ONE `User.aggregate([...])` call.
- **Pipeline Implementation:**
  ```typescript
  User.aggregate([
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        totalUsers: { $sum: 1 },
        users: { $push: { _id: "$_id", name: "$name", email: "$email" } }
      }
    },
    { $sort: { totalUsers: -1, _id: 1 } },
    {
      $project: {
        _id: 0,
        interest: "$_id",
        totalUsers: 1,
        users: 1
      }
    }
  ])
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "message": "Users grouped by interests retrieved successfully",
    "data": [
      {
        "interest": "coding",
        "totalUsers": 5,
        "users": [
          { "_id": "660000000000000000000001", "name": "Alice", "email": "alice@example.com" }
        ]
      }
    ]
  }
  ```

### Scenario 2: User Posts ($lookup)
- **Endpoint:** `GET /api/v1/analytics/users/:userId/posts`
- **Rule:** A single aggregation pipeline using a `$lookup` stage to retrieve a specific user and all posts belonging to them.
- **Pipeline Implementation:**
  ```typescript
  User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts"
      }
    },
    { $project: { password: 0 } }
  ])
  ```

---

## 📄 Pagination & Query Optimization

All list endpoints (`/notes`, `/admin/notes`, `/admin/users`, `/posts`) implement query-based pagination (`page`, `limit`) and return standard metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Queries enforce index scans (`IXSCAN`) and eliminate in-memory sorting:
- User notes list leverages `{ userId: 1, createdAt: -1 }`.
- Admin all-notes list leverages `{ createdAt: -1 }`.
- Admin user listing leverages `{ role: 1, createdAt: -1 }`.
- User posts query leverages `{ userId: 1, createdAt: -1 }`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose (optional for local MongoDB)

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Start Local MongoDB (Docker)
```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run in Development Mode
```bash
npm run dev
```

### 6. Build & Run in Production Mode
```bash
npm run build
npm start
```

### 7. Run Automated Tests
```bash
npm test
```
The test suite utilizes `mongodb-memory-server` and runs 100% self-contained without needing an external MongoDB instance.

---

## 🧪 Automated Test Coverage Summary

- ✅ **Strict Database Indexing:** Verifies exact `schema.index(...)` definitions on `User`, `Note`, and `Post` collections.
- ✅ **Execution Plan Verification:** `explain('executionStats')` confirms queries utilize `IXSCAN` on compound indexes.
- ✅ **Authentication:** Registration, Password Hashing, Login, JWT verification, and Protected Profile retrieval.
- ✅ **RBAC Enforcement:** User note isolation, cross-user modification prevention (403), Admin access elevation.
- ✅ **Admin User Management:** CRUD operations, self-deletion prevention for admins.
- ✅ **Aggregation Scenarios:** Both mandatory aggregation pipelines tested and validated.
- ✅ **Pagination Boundaries:** Invalid query handling, metadata calculation, and boundary edge cases.
