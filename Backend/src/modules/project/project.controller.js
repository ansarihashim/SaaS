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
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LIST PROJECTS (workspace scoped)
 * Any member of workspace
 */
exports.getProjects = async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ projects });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
