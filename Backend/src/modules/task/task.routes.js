const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const requireWorkspaceRole = require("../../middleware/role.middleware");
const taskController = require("./task.controller");

/*
 * Create task → OWNER / ADMIN
 */
router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  taskController.createTask
);

/*
 * Get tasks → workspace members
 */
router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  taskController.getTasksByProject
);


/*
 * Update task status → assignee or admin
 */
router.patch(
  "/tasks/:taskId/status",
  authMiddleware,
  taskController.updateTaskStatus
);

/*
 * Update task → OWNER / ADMIN
 */
router.patch(
  "/tasks/:taskId",
  authMiddleware,
  taskController.updateTask
);

router.patch(
  "/tasks/:taskId/assignee",
  authMiddleware,
  taskController.reassignTask
);

router.patch(
  "/tasks/:taskId/delete",
  authMiddleware,
  taskController.deleteTask
);

router.patch(
  "/tasks/:taskId/restore",
  authMiddleware,
  taskController.restoreTask
);

module.exports = router;
