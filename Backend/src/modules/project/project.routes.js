const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const requireWorkspaceRole = require("../../middleware/role.middleware");
const projectController = require("./project.controller");

/**
 * Create project → OWNER / ADMIN
 */
router.post(
  "/:workspaceId/projects",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  projectController.createProject
);

/**
 * Get projects → any workspace member
 */
router.get(
  "/:workspaceId/projects",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN", "MEMBER"]),
  projectController.getProjects
);

/**
 * Update project → OWNER / ADMIN
 */
router.patch(
  "/:projectId",
  authMiddleware,
  projectController.updateProject
);

/**
 * Delete project (soft delete) → OWNER / ADMIN
 */
router.patch(
  "/:projectId/delete",
  authMiddleware,
  projectController.deleteProject
);

module.exports = router;