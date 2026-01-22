# SaaS Project Documentation

## 1. Project Overview
This is a comprehensive multi-tenant SaaS application designed for project and task management. It allows users to create workspaces, invite team members, manage projects, and track tasks. The application features a robust role-based access control (RBAC) system, ensuring secure collaboration within workspaces.

### Key Features
- **Multi-tenancy:** Users can belong to multiple workspaces with different roles.
- **Authentication:** Secure user registration and login using JWT.
- **RBAC:** Roles (OWNER, ADMIN, MEMBER) define permissions for creating projects, assigning tasks, and inviting users.
- **Task Management:** Create, assign, update, and soft-delete tasks.
- **Activity Logging:** Tracks important actions (e.g., task creation, status updates) for audit trails.
- **Responsive Frontend:** Modern UI built with React and Tailwind CSS.
- **Email Notifications:** Integration with Nodemailer for invitations.

---

## 2. Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens), bcryptjs (password hashing)
- **Email:** Nodemailer
- **Validation:** validator library
- **Security:** Helmet, CORS

### Frontend
- **Build Tool:** Vite
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **State Management:** React Context API (AuthContext, WorkspaceContext, ToastContext)
- **UI Components:** React Icons, Framer Motion

---

## 3. Database Design (Prisma Schema)

### Models
1. **User**: Stores user credentials and profile.
   - Relations: `workspaces` (WorkspaceUser), `assignedTasks`, `createdTasks`, `createdProjects`, `activityLogs`.

2. **Workspace**: The core container for collaboration.
   - Relations: `users`, `projects`, `activityLogs`.

3. **WorkspaceUser**: Junction table for Many-to-Many relationship between User and Workspace.
   - Stores `role` (OWNER, ADMIN, MEMBER).

4. **Project**: Groups tasks within a workspace.
   - Fields: `name`, `description`, `workspaceId`.
   - Supports Soft Delete (`deletedAt`).

5. **Task**: Individual actionable items.
   - Fields: `title`, `description`, `status` (TODO, IN_PROGRESS, DONE), `priority` (LOW, MEDIUM, HIGH), `deadline`.
   - Supports Soft Delete (`deletedAt`).

6. **ActivityLog**: Audit trail for workspace actions.
   - Fields: `action`, `entityType`, `entityId`, `message`.

### Enums
- **Role:** OWNER, ADMIN, MEMBER
- **TaskStatus:** TODO, IN_PROGRESS, DONE
- **Priority:** LOW, MEDIUM, HIGH

---

## 4. API Architecture

Base URL: `/api`

### Authentication (`/api/auth`)
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate and receive a JWT.

### Workspaces (`/api/workspaces`)
- `POST /`: Create a new workspace.
- `POST /:workspaceId/invite`: Invite a user (OWNER/ADMIN only).
- `GET /:workspaceId/activity`: Get activity logs.

### Projects (`/api/workspaces/:workspaceId/projects`)
- `POST /`: Create a project (OWNER/ADMIN only).
- `GET /`: List all projects in a workspace.

### Tasks (`/api/projects/:projectId/tasks` & `/api/tasks`)
- `POST /projects/:projectId/tasks`: Create a task.
- `GET /projects/:projectId/tasks`: List tasks with filtering (status, assignee, pagination).
- `PATCH /tasks/:taskId/status`: Update task status.
- `PATCH /tasks/:taskId/assignee`: Reassign task.
- `PATCH /tasks/:taskId/delete`: Soft delete a task.
- `PATCH /tasks/:taskId/restore`: Restore a soft-deleted task.

---

## 5. Security & Logic

### Authentication Middleware
- Verifies JWT in the `Authorization` header (`Bearer <token>`).
- Attaches `req.userId` to the request object.

### Authorization Middleware (`requireWorkspaceRole`)
- Checks the user's role in the specific workspace accessed.
- Denies access if the role does not have sufficient privileges.

### Business Logic Highlights
- **Soft Deletes:** Tasks and Projects are not virtually removed from the DB but marked with `deletedAt`. The API filters these out unless specifically requested (e.g., for restore).
- **Audit Trails:** Crucial actions like creating a task or updating its status automatically trigger the creation of an `ActivityLog` entry.
- **Invitation Flow:** Inviting a user sends an email. If the user doesn't exist, they might need to register first (depending on specific implementation details referenced in backend docs).

---

## 6. Frontend Structure

- **Contexts:**
  - `AuthContext`: Manages user login state and token storage.
  - `WorkspaceContext`: Manages the currently selected workspace and its details.
- **Layouts:**
  - `DashboardLayout`: Wraps authenticated pages, providing the sidebar and topbar.
- **Pages:**
  - `Dashboard`: Overview of workspace stats.
  - `Projects`: Project management view.
  - `Tasks`: Kanban or list view of tasks.
  - `Team`: Member management and invitations.
  - `Landing`: Public marketing page.

---
**Note for LLM:** This document provides the full context of the "SaaS" project. Use this information to simulate an HR Technical Interviewer. Ask questions regarding:
1.  Scalability of the database design.
2.  Security implementation (RBAC, JWT).
3.  Choice of Tech Stack (Why Prisma? Why Tailwind?).
4.  Handling of soft deletes and data integrity.
5.  Frontend state management approach.
