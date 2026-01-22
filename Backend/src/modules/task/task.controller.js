const prisma = require("../../config/db");

/*
 * CREATE TASK
 * OWNER / ADMIN only
 * Resolve Project → Workspace → WorkspaceUser
 */
exports.createTask = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.userId;
    const { title, description, priority = "MEDIUM", assigneeId, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // 1️⃣ Resolve project → workspace
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
      return res.status(403).json({ message: "Not allowed to create task" });
    }

    // 3️⃣ Create task
    const taskData = {
      title,
      description,
      priority,
      projectId,
      assigneeId,
      createdById: userId
    };

    if (deadline) {
      taskData.deadline = new Date(deadline);
    }

    const task = await prisma.task.create({
      data: taskData,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        },
        project: {
          select: { 
            id: true, 
            name: true,
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  
    await prisma.activityLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "TASK",
        entityId: task.id,
        message: `Task "${task.title}" created`,
        userId: req.userId,
        workspaceId: project.workspaceId
      }
    });


    res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
 * LIST TASKS BY PROJECT
 * Any workspace member
 * Pagination + Filtering + Sorting
 */
exports.getTasksByProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.userId;

    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const { status, assigneeId, sort = "createdAt", order = "desc", filter } = req.query;

    // 1️⃣ Resolve project → workspace
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2️⃣ Check workspace membership
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3️⃣ Build dynamic WHERE clause
    const where = { projectId, deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = parseInt(assigneeId);
    }

    // Date Filters
    if (filter === 'overdue') {
      where.deadline = { lt: new Date() };
      where.status = { not: 'DONE' };
    } else if (filter === 'due_today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      where.deadline = { 
        gte: startOfDay, 
        lte: endOfDay 
      };
    } else if (filter === 'upcoming') {
      where.deadline = { gt: new Date() };
    }

    // 4️⃣ Fetch tasks
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sort]: order
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        deadline: true,
        completedAt: true,
        projectId: true,
        assigneeId: true,
        createdById: true,
        deletedAt: true,
        createdBy: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { 
            id: true, 
            name: true,
            workspaceId: true, // Needed for auth checks later if any
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    console.log('DEBUG: Fetched tasks', tasks.map(t => ({ id: t.id, deadline: t.deadline, completedAt: t.completedAt })));


    // 5️⃣ Total count for pagination
    const total = await prisma.task.count({ where });

    res.json({
      page,
      limit,
      total,
      tasks
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.error('Prisma error:', error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/*
 * UPDATE TASK STATUS
 * Assignee OR OWNER / ADMIN
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = req.userId;
    const { status } = req.body;

    const allowedStatuses = ["TODO", "IN_PROGRESS", "DONE"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 1️⃣ Resolve task → project → workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Check workspace membership
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3️⃣ Authorization rule
    const isAssignee = task.assigneeId === userId;
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    if (!isAssignee && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to update task" });
    }

    // 4️⃣ Update status
    const updateData = { status };
    if (status === 'DONE') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        },
        project: {
          select: { 
            id: true, 
            name: true,
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
   
    await prisma.activityLog.create({
      data: {
        action: "TASK_STATUS_UPDATED",
        entityType: "TASK",
        entityId: updatedTask.id,
        message: `Task status changed to ${status}`,
        userId: req.userId,
        workspaceId: task.project.workspaceId
      }
    });


    res.json({
      message: "Task status updated",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
 * UPDATE TASK
 * OWNER / ADMIN only
 */
exports.updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = req.userId;
    const { title, description, priority, deadline } = req.body;

    // 1️⃣ Resolve task → project → workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Check workspace membership
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Not allowed to update task" });
    }

    // 3️⃣ Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null })
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        },
        project: {
          select: { 
            id: true, 
            name: true,
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        entityType: "TASK",
        entityId: updatedTask.id,
        message: `Task "${updatedTask.title}" updated`,
        userId: req.userId,
        workspaceId: task.project.workspaceId
      }
    });

    res.json({
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
 * REASSIGN TASK
 * OWNER / ADMIN only
 */
exports.reassignTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { assigneeId } = req.body;
    const userId = req.userId;

    if (!assigneeId) {
      return res.status(400).json({ message: "assigneeId is required" });
    }

    // 1️⃣ Fetch task → project → workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Check requester role
    const requesterMembership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (
      !requesterMembership ||
      !["OWNER", "ADMIN"].includes(requesterMembership.role)
    ) {
      return res.status(403).json({ message: "Not allowed to reassign task" });
    }

    // 3️⃣ Check new assignee belongs to same workspace
    const assigneeMembership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId: assigneeId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (!assigneeMembership) {
      return res.status(400).json({
        message: "Assignee does not belong to this workspace"
      });
    }

    // 4️⃣ Reassign task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        },
        project: {
          select: { 
            id: true, 
            name: true,
            createdBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_REASSIGNED",
        entityType: "TASK",
        entityId: updatedTask.id,
        message: `Task reassigned to user ${assigneeId}`,
        userId: req.userId,
        workspaceId: task.project.workspaceId
      }
    });


    res.json({
      message: "Task reassigned successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
 * SOFT DELETE TASK
 * OWNER / ADMIN only
 */
exports.deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = req.userId;

    // 1️⃣ Fetch task → project → workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Check requester role
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Not allowed to delete task" });
    }

    // 3️⃣ Soft delete
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() }
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_DELETED",
        entityType: "TASK",
        entityId: taskId,
        message: `Task "${task.title}" deleted`,
        userId: req.userId,
        workspaceId: task.project.workspaceId
      }
    });

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
 * RESTORE TASK
 * OWNER / ADMIN only
 */
exports.restoreTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = req.userId;

    // 1️⃣ Fetch task → project → workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Check requester role
    const membership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: task.project.workspaceId
        }
      }
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({ message: "Not allowed to restore task" });
    }

    // 3️⃣ Restore task
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: null }
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_RESTORED",
        entityType: "TASK",
        entityId: taskId,
        message: `Task "${task.title}" restored`,
        userId: req.userId,
        workspaceId: task.project.workspaceId
      }
    });

    res.json({ message: "Task restored successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
