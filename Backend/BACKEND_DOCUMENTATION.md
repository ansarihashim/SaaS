# SaaS Backend API - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [Business Logic & Features](#business-logic--features)
7. [File Structure](#file-structure)
8. [Environment Variables](#environment-variables)
9. [Key Concepts](#key-concepts)

---

## Overview

This is a **multi-tenant SaaS backend** built with **Node.js**, **Express**, and **Prisma ORM** using **PostgreSQL**. The system supports:
- User authentication with JWT
- Multi-workspace architecture
- Role-based access control (RBAC)
- Project and task management
- Activity logging
- Email notifications
- Soft delete functionality

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework |
| **Prisma ORM** | Database ORM and migrations |
| **PostgreSQL** | Primary database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email notifications |
| **Validator** | Input validation |
| **CORS** | Cross-origin resource sharing |
| **Helmet** | Security headers |

---

## Database Schema

### Models

#### 1. **User**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String   (hashed with bcrypt)
  createdAt DateTime @default(now())
  
  // Relations
  workspaces   WorkspaceUser[]
  tasks        Task[]          @relation("TaskAssignee")
  activityLogs ActivityLog[]
}
```

**Purpose**: Stores all registered users. Users can belong to multiple workspaces.

---

#### 2. **Workspace**
```prisma
model Workspace {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  
  // Relations
  users        WorkspaceUser[]
  projects     Project[]
  activityLogs ActivityLog[]
}
```

**Purpose**: A workspace is a container for projects and tasks. Each workspace has multiple members with different roles.

---

#### 3. **WorkspaceUser** (Junction Table)
```prisma
model WorkspaceUser {
  id          Int  @id @default(autoincrement())
  role        Role  // OWNER, ADMIN, MEMBER
  userId      Int
  workspaceId Int
  
  user      User      @relation(fields: [userId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@unique([userId, workspaceId])
}
```

**Purpose**: Maps users to workspaces with their respective roles.

**Roles**:
- `OWNER`: Full control, can manage all resources
- `ADMIN`: Can create/manage projects and tasks
- `MEMBER`: Can view tasks and update assigned tasks

---

#### 4. **Project**
```prisma
model Project {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  workspaceId Int
  createdAt   DateTime @default(now())
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  tasks     Task[]
}
```

**Purpose**: Projects belong to workspaces and contain tasks.

---

#### 5. **Task**
```prisma
model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(TODO)  // TODO, IN_PROGRESS, DONE
  priority    Priority   @default(MEDIUM) // LOW, MEDIUM, HIGH
  projectId   Int
  assigneeId  Int?
  createdAt   DateTime   @default(now())
  deletedAt   DateTime?  // Soft delete
  
  project  Project @relation(fields: [projectId], references: [id])
  assignee User?   @relation("TaskAssignee", fields: [assigneeId], references: [id])
}
```

**Purpose**: Tasks belong to projects and can be assigned to users. Supports soft delete.

**Enums**:
```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

---

#### 6. **ActivityLog**
```prisma
model ActivityLog {
  id          Int      @id @default(autoincrement())
  action      String   // TASK_CREATED, TASK_STATUS_UPDATED, etc.
  entityType  String   // "TASK", "PROJECT"
  entityId    Int
  message     String
  userId      Int
  workspaceId Int
  createdAt   DateTime @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id])
}
```

**Purpose**: Tracks all actions performed in a workspace for audit trails.

---

## Authentication & Authorization

### Authentication Flow

1. **Registration** (`POST /api/auth/register`)
   - User provides: `name`, `email`, `password`
   - Password validation:
     - Minimum 8 characters
     - At least 1 uppercase letter
     - At least 1 lowercase letter
     - At least 1 number
     - At least 1 special character
   - Email format validation
   - Password is hashed with **bcrypt** (10 salt rounds)
   - User record created in database

2. **Login** (`POST /api/auth/login`)
   - User provides: `email`, `password`
   - System verifies email format
   - System finds user by email
   - Password compared with bcrypt
   - JWT token generated with:
     - Payload: `{ userId: user.id }`
     - Secret: `process.env.JWT_SECRET`
     - Expiration: 1 day
   - Token returned to client

3. **Protected Routes**
   - Client sends token in header: `Authorization: Bearer <token>`
   - `authMiddleware` extracts and verifies token
   - `req.userId` is set for downstream handlers
   - Invalid/missing tokens return `401 Unauthorized`

### Authorization (RBAC)

**Middleware**: `requireWorkspaceRole(allowedRoles)`

This middleware:
1. Extracts `workspaceId` from route params
2. Queries `WorkspaceUser` table to find user's role
3. Checks if role is in `allowedRoles` array
4. Returns `403 Forbidden` if unauthorized

**Example**:
```javascript
router.post(
  "/:workspaceId/projects",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  projectController.createProject
);
```

---

## API Endpoints

### Base URL: `/api`

---

### 🔐 **Authentication** (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get JWT token |

#### Request/Response Examples

**Register**:
```json
// Request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response (201)
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Login**:
```json
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🏢 **Workspaces** (`/api/workspaces`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/workspaces` | Yes | Any | Create workspace |
| POST | `/workspaces/:workspaceId/invite` | Yes | OWNER, ADMIN | Invite user to workspace |

#### Request/Response Examples

**Create Workspace**:
```json
// Request
POST /api/workspaces
Authorization: Bearer <token>
{
  "name": "My Workspace"
}

// Response (201)
{
  "message": "Workspace created successfully",
  "workspace": {
    "id": 1,
    "name": "My Workspace",
    "createdAt": "2026-01-07T10:00:00Z"
  }
}
```

**Important**: When a workspace is created, the creator is automatically added as `OWNER`.

**Invite User**:
```json
// Request
POST /api/workspaces/1/invite
Authorization: Bearer <token>
{
  "email": "member@example.com",
  "role": "MEMBER"
}

// Response (200)
{
  "message": "User invited successfully"
}
```

**Email sent to invited user**:
- Subject: `{inviter.name} invited you to join {workspace.name}`
- Contains inviter details and workspace name
- HTML formatted email

---

### 📁 **Projects** (`/api/workspaces/:workspaceId/projects`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/workspaces/:workspaceId/projects` | Yes | OWNER, ADMIN | Create project |
| GET | `/workspaces/:workspaceId/projects` | Yes | OWNER, ADMIN, MEMBER | List projects |

#### Request/Response Examples

**Create Project**:
```json
// Request
POST /api/workspaces/1/projects
Authorization: Bearer <token>
{
  "name": "Website Redesign",
  "description": "Redesign company website"
}

// Response (201)
{
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website",
    "workspaceId": 1,
    "createdAt": "2026-01-07T10:00:00Z"
  }
}
```

**List Projects**:
```json
// Request
GET /api/workspaces/1/projects
Authorization: Bearer <token>

// Response (200)
{
  "projects": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Redesign company website",
      "workspaceId": 1,
      "createdAt": "2026-01-07T10:00:00Z"
    }
  ]
}
```

---

### ✅ **Tasks** (`/api/projects/:projectId/tasks` and `/api/tasks/:taskId`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/projects/:projectId/tasks` | Yes | OWNER, ADMIN | Create task |
| GET | `/projects/:projectId/tasks` | Yes | Any workspace member | List tasks with filters |
| PATCH | `/tasks/:taskId/status` | Yes | Assignee or OWNER/ADMIN | Update task status |
| PATCH | `/tasks/:taskId/assignee` | Yes | OWNER, ADMIN | Reassign task |
| PATCH | `/tasks/:taskId/delete` | Yes | OWNER, ADMIN | Soft delete task |
| PATCH | `/tasks/:taskId/restore` | Yes | OWNER, ADMIN | Restore deleted task |

#### Request/Response Examples

**Create Task**:
```json
// Request
POST /api/projects/1/tasks
Authorization: Bearer <token>
{
  "title": "Design homepage mockup",
  "description": "Create mockup for new homepage",
  "priority": "HIGH",
  "assigneeId": 2
}

// Response (201)
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Design homepage mockup",
    "description": "Create mockup for new homepage",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": 1,
    "assigneeId": 2,
    "createdAt": "2026-01-07T10:00:00Z",
    "deletedAt": null
  }
}
```

**Activity log is automatically created** with action `TASK_CREATED`.

**List Tasks with Filters**:
```json
// Request
GET /api/projects/1/tasks?status=TODO&assigneeId=2&page=1&limit=10&sort=createdAt&order=desc
Authorization: Bearer <token>

// Response (200)
{
  "page": 1,
  "limit": 10,
  "total": 15,
  "tasks": [
    {
      "id": 1,
      "title": "Design homepage mockup",
      "description": "Create mockup for new homepage",
      "status": "TODO",
      "priority": "HIGH",
      "projectId": 1,
      "assigneeId": 2,
      "createdAt": "2026-01-07T10:00:00Z",
      "deletedAt": null,
      "assignee": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

**Query Parameters**:
- `status`: Filter by status (TODO, IN_PROGRESS, DONE)
- `assigneeId`: Filter by assignee
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order - asc or desc (default: desc)

**Note**: Only returns tasks where `deletedAt` is `null`.

**Update Task Status**:
```json
// Request
PATCH /api/tasks/1/status
Authorization: Bearer <token>
{
  "status": "IN_PROGRESS"
}

// Response (200)
{
  "message": "Task status updated",
  "task": {
    "id": 1,
    "title": "Design homepage mockup",
    "status": "IN_PROGRESS",
    ...
  }
}
```

**Authorization**: 
- Task assignee can update their own tasks
- OWNER/ADMIN can update any task

**Activity log created** with action `TASK_STATUS_UPDATED`.

**Reassign Task**:
```json
// Request
PATCH /api/tasks/1/assignee
Authorization: Bearer <token>
{
  "assigneeId": 3
}

// Response (200)
{
  "message": "Task reassigned successfully",
  "task": {
    "id": 1,
    "assigneeId": 3,
    ...
  }
}
```

**Validation**: New assignee must be a member of the workspace.

**Activity log created** with action `TASK_REASSIGNED`.

**Soft Delete Task**:
```json
// Request
PATCH /api/tasks/1/delete
Authorization: Bearer <token>

// Response (200)
{
  "message": "Task deleted (soft delete)"
}
```

Sets `deletedAt` to current timestamp. Task is hidden from normal queries.

**Activity log created** with action `TASK_DELETED`.

**Restore Task**:
```json
// Request
PATCH /api/tasks/1/restore
Authorization: Bearer <token>

// Response (200)
{
  "message": "Task restored successfully"
}
```

Sets `deletedAt` to `null`. Task becomes visible again.

**Activity log created** with action `TASK_RESTORED`.

---

### 📊 **Activity Logs** (`/api/workspaces/:workspaceId/activity`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/workspaces/:workspaceId/activity` | Yes | OWNER, ADMIN | Get workspace activity logs |

#### Request/Response Example

```json
// Request
GET /api/workspaces/1/activity
Authorization: Bearer <token>

// Response (200)
{
  "logs": [
    {
      "id": 5,
      "action": "TASK_STATUS_UPDATED",
      "entityType": "TASK",
      "entityId": 1,
      "message": "Task status changed to IN_PROGRESS",
      "userId": 2,
      "workspaceId": 1,
      "createdAt": "2026-01-07T11:00:00Z",
      "user": {
        "id": 2,
        "name": "Jane Smith"
      }
    },
    {
      "id": 4,
      "action": "TASK_CREATED",
      "entityType": "TASK",
      "entityId": 1,
      "message": "Task \"Design homepage mockup\" created",
      "userId": 1,
      "workspaceId": 1,
      "createdAt": "2026-01-07T10:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ]
}
```

**Activity Actions Tracked**:
- `TASK_CREATED`
- `TASK_STATUS_UPDATED`
- `TASK_REASSIGNED`
- `TASK_DELETED`
- `TASK_RESTORED`

---

## Business Logic & Features

### 1. **Multi-Tenant Architecture**

- Each workspace is isolated
- Users can belong to multiple workspaces with different roles
- All data is scoped to workspaces (projects, tasks, activity logs)

### 2. **Role-Based Access Control (RBAC)**

**Permission Matrix**:

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| Create workspace | ✅ | ✅ | ✅ |
| Invite users | ✅ | ✅ | ❌ |
| Create projects | ✅ | ✅ | ❌ |
| View projects | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ❌ |
| View tasks | ✅ | ✅ | ✅ |
| Update task status (assigned) | ✅ | ✅ | ✅ |
| Update any task status | ✅ | ✅ | ❌ |
| Reassign tasks | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ✅ | ❌ |
| View activity logs | ✅ | ✅ | ❌ |

### 3. **Task Management**

**Features**:
- ✅ Pagination and filtering
- ✅ Multiple status transitions (TODO → IN_PROGRESS → DONE)
- ✅ Priority levels (LOW, MEDIUM, HIGH)
- ✅ Task assignment to workspace members
- ✅ Soft delete (tasks can be deleted and restored)
- ✅ Activity logging for all task operations

**Soft Delete**:
- Tasks are marked with `deletedAt` timestamp instead of being permanently removed
- Deleted tasks are excluded from queries (`WHERE deletedAt IS NULL`)
- OWNER/ADMIN can restore deleted tasks

### 4. **Activity Logging**

Every important action is logged:
- Who performed the action (`userId`)
- What was the action (`action`)
- Which entity was affected (`entityType`, `entityId`)
- Descriptive message (`message`)
- When it happened (`createdAt`)
- Which workspace (`workspaceId`)

This provides a complete audit trail for compliance and debugging.

### 5. **Email Notifications**

**Invite Email Flow**:
1. OWNER/ADMIN invites user via email
2. System checks if user exists in database
3. User is added to workspace with specified role
4. Email sent to invited user using Nodemailer
5. Email contains:
   - Inviter's name and email
   - Workspace name
   - Formatted HTML content

**Configuration** (in `src/utils/email.js`):
- Uses Gmail SMTP
- Credentials from environment variables
- Graceful error handling (invitation succeeds even if email fails)

### 6. **Database Transactions**

**Where Used**:
1. **Workspace creation**: 
   - Creates workspace
   - Adds creator as OWNER
   - Both must succeed or both fail

2. **User invitation**:
   - Checks existing membership
   - Creates new membership
   - Ensures no duplicate memberships

**Why**: Ensures data consistency and prevents partial updates.

### 7. **Input Validation**

**Email Validation**:
- Uses `validator` library
- Checks proper email format
- Applied on registration and login

**Password Validation**:
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 symbol
- Strong password requirements enforced

**Field Validation**:
- Required fields checked (name, email, title, etc.)
- Enum values validated (status, priority, role)
- IDs validated and parsed as integers

### 8. **Security Features**

- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **JWT Authentication**: Tokens expire after 1 day
- ✅ **CORS**: Configured for cross-origin requests
- ✅ **Helmet**: Security headers
- ✅ **Authorization Checks**: Every route validates user permissions
- ✅ **SQL Injection Prevention**: Prisma uses parameterized queries
- ✅ **Input Sanitization**: Validator library for email/password

---

## File Structure

```
Backend/
├── package.json                      # Dependencies and scripts
├── README.md                         # Basic project info
├── .env                              # Environment variables (not in repo)
│
├── prisma/
│   ├── schema.prisma                 # Database schema definition
│   └── migrations/                   # Database migration history
│       ├── migration_lock.toml
│       ├── 20260102121623_init/
│       ├── 20260104082949_add_soft_delete_to_task/
│       └── 20260104085451_add_activity_logs/
│
└── src/
    ├── app.js                        # Express app setup
    ├── server.js                     # Server entry point
    ├── routes.js                     # Main route aggregator
    │
    ├── config/
    │   └── db.js                     # Prisma client instance
    │
    ├── middleware/
    │   ├── auth.middleware.js        # JWT authentication
    │   └── role.middleware.js        # Role-based authorization
    │
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.js    # Register, Login
    │   │   └── auth.routes.js
    │   │
    │   ├── workspace/
    │   │   ├── workspace.controller.js  # Create workspace, Invite users
    │   │   └── workspace.routes.js
    │   │
    │   ├── project/
    │   │   ├── project.controller.js    # Create, List projects
    │   │   └── project.routes.js
    │   │
    │   ├── task/
    │   │   ├── task.controller.js       # CRUD + status updates, reassign, delete/restore
    │   │   └── task.routes.js
    │   │
    │   └── activity/
    │       ├── activity.controller.js   # Get activity logs
    │       └── activity.routes.js
    │
    └── utils/
        ├── ApiError.js                   # Custom error class
        └── email.js                      # Email sending utility
```

---

## Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Email (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Server
PORT=5000
NODE_ENV="development"
```

**Important**:
- Use a strong, random JWT_SECRET in production
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- Never commit `.env` to version control

---

## Key Concepts

### 1. **Workspace Hierarchy**
```
Workspace
  ├── WorkspaceUsers (with roles)
  ├── Projects
  │   └── Tasks
  │       └── Assignee (User)
  └── ActivityLogs
```

### 2. **Authorization Flow**

```
Client Request
    ↓
authMiddleware (verify JWT, extract userId)
    ↓
requireWorkspaceRole (check user's role in workspace)
    ↓
Controller (business logic)
    ↓
Response
```

### 3. **Task Permission Logic**

```javascript
// Task status update authorization
const canUpdate = 
  (task.assigneeId === userId) ||           // User is assignee
  (["OWNER", "ADMIN"].includes(role));      // Or user is OWNER/ADMIN
```

### 4. **Soft Delete Pattern**

```javascript
// Mark as deleted
await prisma.task.update({
  where: { id: taskId },
  data: { deletedAt: new Date() }
});

// Exclude from queries
const tasks = await prisma.task.findMany({
  where: { deletedAt: null }  // Only non-deleted
});

// Restore
await prisma.task.update({
  where: { id: taskId },
  data: { deletedAt: null }
});
```

---

## Dependencies

### Production Dependencies

```json
{
  "@prisma/client": "^5.22.0",      // ORM client
  "bcrypt": "^6.0.0",                // Password hashing
  "bcryptjs": "^2.4.3",              // Alternative bcrypt
  "cors": "^2.8.5",                  // CORS middleware
  "dotenv": "^16.6.1",               // Environment variables
  "express": "^4.22.1",              // Web framework
  "helmet": "^7.0.0",                // Security headers
  "jsonwebtoken": "^9.0.3",          // JWT tokens
  "nodemailer": "^7.0.12",           // Email sending
  "validator": "^13.15.26"           // Input validation
}
```

### Development Dependencies

```json
{
  "nodemon": "^3.1.11",              // Auto-restart server
  "prisma": "^5.22.0"                // Prisma CLI
}
```

---

## Scripts

```json
{
  "start": "node src/server.js",           // Production start
  "dev": "nodemon src/server.js",          // Development with auto-reload
  "prisma:generate": "prisma generate",    // Generate Prisma client
  "prisma:migrate": "prisma migrate dev",  // Run migrations
  "prisma:studio": "prisma studio",        // Open Prisma Studio GUI
  "prisma:seed": "node prisma/seed.js"     // Seed database (if exists)
}
```

---

## Database Migrations

The project has the following migrations:

1. **`20260102121623_init`**: Initial schema with User, Workspace, WorkspaceUser, Project, Task models
2. **`20260104082949_add_soft_delete_to_task`**: Added `deletedAt` field to Task model
3. **`20260104085451_add_activity_logs`**: Added ActivityLog model

To apply migrations:
```bash
npm run prisma:migrate
```

---

## Summary of Achievements

✅ **Authentication System**
- User registration with strong password validation
- Login with JWT token generation
- Protected routes with middleware

✅ **Multi-Workspace Architecture**
- Create workspaces
- Automatic OWNER role assignment
- Invite users with role assignment

✅ **Role-Based Access Control**
- Three-tier role system (OWNER, ADMIN, MEMBER)
- Granular permissions per endpoint
- Middleware-based authorization

✅ **Project Management**
- Create projects within workspaces
- List projects with workspace scoping

✅ **Task Management**
- Full CRUD operations
- Status workflow (TODO → IN_PROGRESS → DONE)
- Priority levels
- Task assignment to workspace members
- Pagination and advanced filtering
- Soft delete and restore functionality

✅ **Activity Logging**
- Comprehensive audit trail
- All task operations logged
- User and timestamp tracking

✅ **Email Notifications**
- Workspace invitation emails
- HTML formatted messages
- Graceful error handling

✅ **Security**
- Password hashing with bcrypt
- JWT authentication
- Input validation
- CORS and Helmet security
- SQL injection prevention via Prisma

✅ **Database**
- PostgreSQL with Prisma ORM
- Proper relationships and foreign keys
- Database transactions for critical operations
- Migration history

---

## Frontend Implementation Guide

When building the frontend, you'll need to implement:

### 1. **Authentication Pages**
- Registration form (name, email, password with validation)
- Login form
- Store JWT token (localStorage or cookie)
- Auto-attach token to API requests

### 2. **Workspace Management**
- Create workspace form
- Workspace list/dashboard
- Invite user form (email + role dropdown)

### 3. **Project Management**
- Project list view (workspace-scoped)
- Create project form

### 4. **Task Management**
- Task board (Kanban-style with columns: TODO, IN_PROGRESS, DONE)
- Create task form (title, description, priority, assignee)
- Task detail view
- Status update buttons
- Reassign task dialog
- Delete/restore functionality
- Filter by status, assignee
- Pagination controls
- Sorting options

### 5. **Activity Feed**
- Display activity logs
- Show user avatars, action descriptions, timestamps
- Real-time updates (optional)

### 6. **Role-Based UI**
- Hide/disable actions based on user role
- Show appropriate buttons for OWNER/ADMIN only
- Display role badges

### 7. **API Integration**
- Axios/Fetch wrapper with auth headers
- Error handling (401 → redirect to login)
- Loading states
- Success/error notifications

### 8. **State Management**
- User state (logged-in user, token)
- Current workspace context
- Projects and tasks
- Consider: Redux, Zustand, or Context API

---

## Error Codes Reference

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing fields, invalid enum values, validation errors |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions for the workspace/action |
| 404 | Not Found | Resource (project, task, user) doesn't exist |
| 500 | Server Error | Database errors, unexpected exceptions |

---

## Testing Recommendations

For the frontend team, test these scenarios:

1. ✅ Register → Login → Create Workspace
2. ✅ Invite user with different roles
3. ✅ MEMBER cannot create projects (should see 403)
4. ✅ Create project → Create tasks
5. ✅ Assignee can update their task status
6. ✅ MEMBER cannot update other users' tasks
7. ✅ ADMIN can reassign any task
8. ✅ Soft delete → task disappears → restore → task reappears
9. ✅ Activity logs show all actions
10. ✅ Pagination and filters work correctly

---

## API Testing with cURL Examples

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

**Create Workspace**:
```bash
curl -X POST http://localhost:5000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Workspace"}'
```

**Create Task**:
```bash
curl -X POST http://localhost:5000/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Design homepage","priority":"HIGH"}'
```

---

## Contact & Support

For questions about the backend implementation:
- Review this documentation
- Check Prisma schema for data relationships
- Inspect controller files for business logic
- Review middleware for authorization rules

---

**Last Updated**: January 7, 2026  
**Version**: 1.0.0
