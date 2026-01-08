const express = require("express");
const router = express.Router();

router.use("/auth", require("./modules/auth/auth.routes"));
router.use("/workspaces", require("./modules/workspace/workspace.routes"));
router.use("/workspaces", require("./modules/project/project.routes"));
router.use("/projects", require("./modules/project/project.routes"));
router.use("/", require("./modules/task/task.routes"));
router.use("/", require("./modules/activity/activity.routes"));




module.exports = router;
