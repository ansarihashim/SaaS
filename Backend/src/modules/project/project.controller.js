const prisma = require("../../config/db");

/**
 * CREATE PROJECT
 * Only OWNER / ADMIN
 */
exports.createProject = async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    if (!workspaceId || isNaN(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        workspaceId
      }
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    console.error('Error creating project:', error);
    console.error('Prisma error:', error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * LIST PROJECTS (workspace scoped)
 * Any member of workspace
 */
exports.getProjects = async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    if (!workspaceId || isNaN(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    const projects = await prisma.project.findMany({
      where: { 
        workspaceId
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ projects });

  } catch (error) {
    console.error('Error fetching projects:', error);
    console.error('Prisma error:', error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * UPDATE PROJECT
 * Only OWNER / ADMIN
 */
exports.updateProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.userId;
    const { name, description } = req.body;

    // 1️⃣ Get project and verify workspace membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2️⃣ Check role in workspace
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Not allowed to update project" });
    }

    // 3️⃣ Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      message: "Project updated successfully",
      project: updatedProject
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE PROJECT (SOFT DELETE)
 * Only OWNER / ADMIN
 */
exports.deleteProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.userId;

    // 1️⃣ Get project and verify workspace membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true, name: true }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2️⃣ Check role in workspace
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Not allowed to delete project" });
    }

    // 3️⃣ Soft delete project
    await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() }
    });

    // 4️⃣ Log activity
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_DELETED",
        entityType: "PROJECT",
        entityId: projectId,
        message: `Project "${project.name}" deleted`,
        userId,
        workspaceId: project.workspaceId
      }
    });

    res.json({
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
