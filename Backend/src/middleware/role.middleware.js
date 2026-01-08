const prisma = require("../config/db");

const requireWorkspaceRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const workspaceId = parseInt(req.params.workspaceId);

      console.log('Role check - userId:', userId, 'workspaceId:', workspaceId);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!workspaceId || isNaN(workspaceId)) {
        return res.status(400).json({ message: "Invalid workspace ID" });
      }

      const membership = await prisma.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId
          }
        }
      });

      console.log('Membership found:', membership);

      if (!membership) {
        return res.status(403).json({ message: "You are not a member of this workspace" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ 
          message: "Insufficient permissions", 
          yourRole: membership.role,
          requiredRoles: allowedRoles 
        });
      }

      req.workspaceRole = membership.role;
      next();

    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};

module.exports = requireWorkspaceRole;
