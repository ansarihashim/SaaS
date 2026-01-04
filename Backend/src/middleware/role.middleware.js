const prisma = require("../config/db");

const requireWorkspaceRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const workspaceId = parseInt(req.params.workspaceId);

      const membership = await prisma.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      req.workspaceRole = membership.role;
      next();

    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = requireWorkspaceRole;
