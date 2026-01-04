const prisma = require("../../config/db");

/*
 * GET WORKSPACE ACTIVITY LOGS
 * OWNER / ADMIN
 */
exports.getWorkspaceActivity = async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = req.userId;

    // Check membership
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ logs });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
