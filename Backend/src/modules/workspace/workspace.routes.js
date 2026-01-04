const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth.middleware");
const requireWorkspaceRole = require("../../middleware/role.middleware");
const workspaceController = require("./workspace.controller");

router.post("/", authMiddleware, workspaceController.createWorkspace);

router.post(
  "/:workspaceId/invite",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  workspaceController.inviteUser
);

module.exports = router;
