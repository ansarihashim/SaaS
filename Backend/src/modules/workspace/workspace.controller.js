const prisma = require("../../config/db");
const { sendEmail } = require("../../utils/email");


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

