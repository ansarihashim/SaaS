const prisma = require("../../config/db");
const { sendEmail } = require("../../utils/email");

/**
 * GET USER'S WORKSPACES
 * Returns all workspaces the authenticated user belongs to
 */
exports.getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.userId; // from JWT middleware

    const workspaces = await prisma.workspaceUser.findMany({
      where: {
        userId: userId
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        workspace: {
          createdAt: 'asc' // Order by related Workspace's createdAt
        }
      }
    });

    // Transform to clean response
    const result = workspaces.map(wu => ({
      id: wu.workspace.id,
      name: wu.workspace.name,
      role: wu.role,
      joinedAt: wu.workspace.createdAt
    }));

    res.json({ workspaces: result });

  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CREATE WORKSPACE
 * Only authenticated users can create
 */
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // from JWT middleware

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    /**
     * Using transaction because:
     * - Workspace creation
     * - WorkspaceUser creation
     * must succeed together
     */
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name
        }
      });

      // Add creator as OWNER
      await tx.workspaceUser.create({
        data: {
          userId: userId,
          workspaceId: workspace.id,
          role: "OWNER"
        }
      });

      return workspace;
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use transaction to add membership
    await prisma.$transaction(async (tx) => {
      // Check if already a member
      const existing = await tx.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId
          }
        }
      });

      if (existing) {
        throw new Error("User already in workspace");
      }

      // Add user to workspace
      await tx.workspaceUser.create({
        data: {
          userId: user.id,
          workspaceId,
          role
        }
      });
    });

    // Fetch workspace only for email content
const workspace = await prisma.workspace.findUnique({
  where: { id: workspaceId }
});

const inviter = await prisma.user.findUnique({
  where: { id: req.userId },
  select: { name: true, email: true }
});


try{
await sendEmail({
  to: email,
  subject: `${inviter.name} invited you to join ${workspace.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>${inviter.name} invited you</h2>

      <p>
        <strong>${inviter.name}</strong> (${inviter.email}) has invited you
        to join the workspace <strong>${workspace.name}</strong>.
      </p>

      
      <hr />

      <p style="font-size: 12px; color: #777;">
        This invitation was sent via SaaS App.
      </p>
    </div>
  `
});
}

catch (err){
  console.error("Email failed:",err.message);

}

    res.json({ message: "User invited successfully" });

  } catch (error) {
    if (error.message === "User already in workspace") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWorkspaceDashboard = async (req, res, next) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    const projectsCount = await prisma.project.count({
      where: { workspaceId },
    });

    const tasksCount = await prisma.task.count({
      where: {
        project: { workspaceId },
        deletedAt: null,
      },
    });

    const statusCounts = await prisma.task.groupBy({
      by: ["status"],
      where: {
        project: { workspaceId },
        deletedAt: null,
      },
      _count: { status: true },
    });

    const overview = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    statusCounts.forEach((item) => {
      overview[item.status] = item._count.status;
    });

    const membersCount = await prisma.workspaceUser.count({
      where: { workspaceId },
    });

    const completionRate =
      tasksCount === 0
        ? 0
        : Math.round((overview.DONE / tasksCount) * 100);

    res.status(200).json({
      stats: {
        projects: projectsCount,
        tasks: tasksCount,
        members: membersCount,
        completionRate,
      },
      overview,
    });
  } catch (error) {
    next(error);
  }
};

