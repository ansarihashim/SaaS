const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const activityController = require("./activity.controller");

router.get(
  "/workspaces/:workspaceId/activity",
  authMiddleware,
  activityController.getWorkspaceActivity
);

module.exports = router;
