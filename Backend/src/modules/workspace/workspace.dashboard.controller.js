const prisma = require("../../config/db");

const getWorkspaceDashboard = async (req, res, next) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    // Total projects
    const projectsCount = await prisma.project.count({
      where: { workspaceId },
    });

    // Total tasks (excluding soft deleted)
    const tasksCount = await prisma.task.count({
      where: {
        project: { workspaceId },
        deletedAt: null,
      },
    });

    // Task status distribution
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

    // Workspace members
    const membersCount = await prisma.workspaceUser.count({
      where: { workspaceId },
    });

    // Completion rate
    const doneTasks = overview.DONE;
    const completionRate =
      tasksCount === 0 ? 0 : Math.round((doneTasks / tasksCount) * 100);

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

module.exports = { getWorkspaceDashboard };
