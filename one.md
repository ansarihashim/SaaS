# Application Documentation

## Project Overview
This is a Full-Stack SaaS application for project and task management. It allows users to create workspaces, manage projects within those workspaces, assign tasks to team members, and track activity.

### Tech Stack
**Frontend:**
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **State Management:** React Context API (Auth, Workspace)
- **Icons:** React Icons

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Manual validation + libraries
- **Security:** Helmet, CORS, Bcrypt

---

## Backend Architecture

### Database Schema (Prisma)
The database consists of the following core models:
- **User**: Authentication details and relationships to workspaces/tasks.
- **Workspace**: Top-level container for projects and users.
- **WorkspaceUser**: Junction table for User-Workspace many-to-many relationship, storing roles (`OWNER`, `ADMIN`, `MEMBER`).
- **Project**: Contains tasks, linked to a workspace. Supports soft delete (`deletedAt`).
- **Task**: Unit of work with status (`TODO`, `IN_PROGRESS`, `DONE`), priority, and assignee. Supports soft delete.
- **ActivityLog**: Tracks actions within a workspace.

### Key API Endpoints
**Authentication** (`/api/auth`)
- `POST /register`: Create a new user.
- `POST /login`: Authenticate and receive token.
- `GET /me`: Get current user details.

**Workspaces** (`/api/workspaces`)
- `GET /my`: Get workspaces the user belongs to.
- `POST /`: Create a new workspace.
- `GET /:workspaceId/dashboard`: Get stats for a workspace.
- `GET /:workspaceId/users`: Get team members.
- `POST /:workspaceId/invite`: Invite a user (by email) to the workspace.

**Projects**
- `POST /api/workspaces/:workspaceId/projects`: Create a project.
- `GET /api/workspaces/:workspaceId/projects`: List projects.
- `PATCH /api/projects/:projectId/delete`: Soft delete a project.
- `PATCH /api/projects/:projectId`: Update project details.

**Tasks**
- `POST /api/projects/:projectId/tasks`: Create a task.
- `GET /api/projects/:projectId/tasks`: Get tasks for a project.
- `PATCH /api/tasks/:taskId/status`: Update task status.
- `PATCH /api/tasks/:taskId/assignee`: Assign task.
- `PATCH /api/tasks/:taskId/delete`: Soft delete task.
- `PATCH /api/tasks/:taskId/restore`: Restore task.

### Middleware
1.  **Auth Middleware** (`auth.middleware.js`): Verifies JWT token and populates `req.userId`.
2.  **Role Middleware** (`role.middleware.js`): Verifies if a user belongs to the workspace and has the required `Role` (OWNER, ADMIN, MEMBER) to perform an action.

---

## Frontend Architecture

### Routing (`App.jsx`)
- **Public**: `/login`, `/register`
- **Protected** (requires auth):
    - Wrapped in `WorkspaceContext` and `ProtectedRoute`.
    - `/dashboard`: Overview of active workspace.
    - `/projects`: List of projects.
    - `/projects/:projectId/tasks`: Kanban/List view of tasks for a specific project.
    - `/tasks`: All tasks view (implied).
    - `/activity`: Audit log of workspace actions.
    - `/team`: Member management.

### Key Contexts
- **AuthContext**: Handles token storage (localStorage), user loading, login, logout, and register functions.
- **WorkspaceContext**: Manages the "Active Workspace" state, fetching the list of workspaces available to the user.

### Key Components
- **DashboardLayout**: Provides the Sidebar and responsive structure for the protected pages.
- **Sidebar**: Navigation menu.
- **Modals**:
    - `CreateProjectModal`: Form to add a new project.
    - `CreateTaskModal`: Form to add a new task with priority/assignee.
    - `CreateWorkspaceModal`: Form to create a new workspace.
- **Cards**: `TaskCard`, `ProjectCard`, `StatCard`, `ActivityItem`.

---

## Current Status & Features
- **Authentication**: Fully functional (Register/Login).
- **Workspace Management**: Users can create workspaces and switch between them.
- **Team Management**: Owners can invite other users by email.
- **Project Tracking**: Create, edit, and soft-delete projects.
- **Task Management**: Create tasks, change status (Todo/In Progress/Done), assign to members.
- **Activity Feed**: Logs actions like "User X created task Y".
- **Dashboard**: Visual statistics of the current workspace.

### Data Flow
1.  User logs in -> received JWT.
2.  App fetches User Profile & User's Workspaces.
3.  If no workspace exists, prompts to create one.
4.  User selects a workspace -> `activeWorkspace` is set in context.
5.  Dashboard/Projects/Tasks API calls use the `activeWorkspace.id` to fetch relevant data.
