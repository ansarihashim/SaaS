const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth.middleware");
const requireWorkspaceRole = require("../../middleware/role.middleware");
const workspaceController = require("./workspace.controller");
const dashboardController = require("./workspace.dashboard.controller");

// Get authenticated user's workspaces (no workspace-specific auth needed)
router.get("/my", authMiddleware, workspaceController.getMyWorkspaces);

router.post("/", authMiddleware, workspaceController.createWorkspace);

router.get(
  "/:workspaceId/dashboard",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN", "MEMBER"]),
  dashboardController.getWorkspaceDashboard
);

router.post(
  "/:workspaceId/invite",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  workspaceController.inviteUser
);

module.exports = router;
