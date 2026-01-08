import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { tasksAPI, projectsAPI } from "../services/api";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import { FiPlus, FiMoreVertical, FiTrash2, FiRotateCcw, FiUser } from "react-icons/fi";

export default function Tasks() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState("all");

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeWorkspace && selectedProject) {
      fetchTasks();
    }
  }, [activeWorkspace, selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll(activeWorkspace.id);
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchTasks = async () => {
    if (!activeWorkspace) return;

    try {
      setLoading(true);
      setError("");

      let allTasks = [];
      
      if (selectedProject === "all") {
        // Fetch tasks from all projects
        const projectsResponse = await projectsAPI.getAll(activeWorkspace.id);
        const projectsList = projectsResponse.data.projects || projectsResponse.data;
        
        const tasksPromises = projectsList.map(project =>
          tasksAPI.getByProject(project.id).catch(() => ({ data: [] }))
        );
        
        const tasksResponses = await Promise.all(tasksPromises);
        allTasks = tasksResponses.flatMap(response => response.data.tasks || response.data || []);
      } else {
        // Fetch tasks from selected project
        const response = await tasksAPI.getByProject(selectedProject);
        allTasks = response.data.tasks || response.data || [];
      }

      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      setCreating(true);
      if (editingTask) {
        // Update existing task - PATCH /api/tasks/:taskId
        const updateData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        };
        await tasksAPI.update(editingTask.id, updateData);
      } else {
        // Create new task - POST /api/projects/:projectId/tasks
        const createData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        };
        await tasksAPI.create(formData.projectId, createData);
      }
      setShowCreateModal(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      alert(err.response?.data?.message || "Failed to save task");
    } finally {
      setCreating(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      await fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
      alert(err.response?.data?.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksAPI.softDelete(taskId);
      await fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await tasksAPI.restore(taskId);
      await fetchTasks();
    } catch (err) {
      console.error("Error restoring task:", err);
      alert(err.response?.data?.message || "Failed to restore task");
    }
  };

  if (workspaceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Workspace Selected
          </h3>
          <p className="text-yellow-700">
            Please select a workspace to view tasks.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const canManageTasks =
    activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN";

  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === "TODO" && !t.deletedAt),
    IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS" && !t.deletedAt),
    DONE: tasks.filter(t => t.status === "DONE" && !t.deletedAt),
  };

  return (
    <DashboardLayout>
      <Topbar
        title="Tasks"
        subtitle={`Manage tasks in ${activeWorkspace.name}`}
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateTask}
        loading={creating}
        task={editingTask}
      />

      <div className="p-6">
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="projectFilter" className="text-sm font-medium text-gray-700">
              Filter by Project:
            </label>
            <select
              id="projectFilter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create Task Button */}
          {canManageTasks && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              title="To Do"
              status="TODO"
              tasks={tasksByStatus.TODO}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onRestore={handleRestoreTask}
              onEdit={canManageTasks ? handleEditTask : null}
              canManage={canManageTasks}
            />
            <KanbanColumn
              title="In Progress"
              status="IN_PROGRESS"
              tasks={tasksByStatus.IN_PROGRESS}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onRestore={handleRestoreTask}
              onEdit={canManageTasks ? handleEditTask : null}
              canManage={canManageTasks}
            />
            <KanbanColumn
              title="Done"
              status="DONE"
              tasks={tasksByStatus.DONE}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onRestore={handleRestoreTask}
              onEdit={canManageTasks ? handleEditTask : null}
              canManage={canManageTasks}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tasks.filter(t => !t.deletedAt).length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FiPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Tasks Yet
            </h3>
            <p className="text-gray-500 mb-6">
              {canManageTasks
                ? "Get started by creating your first task."
                : "No tasks have been created yet."}
            </p>
            {canManageTasks && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function KanbanColumn({ title, status, tasks, onStatusChange, onDelete, onRestore, onEdit, canManage }) {
  const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DONE: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onRestore={onRestore}
            onEdit={onEdit}
            canManage={canManage}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onStatusChange, onDelete, onRestore, onEdit, canManage }) {
  const [showMenu, setShowMenu] = useState(false);

  const priorityColors = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== task.status) {
      onStatusChange(task.id, newStatus);
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200 group">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
          {onEdit && !task.deletedAt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
              title="Edit Task"
            >
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        {canManage && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Move to
                  </div>
                  {task.status !== "TODO" && (
                    <button
                      onClick={() => handleStatusChange("TODO")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      To Do
                    </button>
                  )}
                  {task.status !== "IN_PROGRESS" && (
                    <button
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      In Progress
                    </button>
                  )}
                  {task.status !== "DONE" && (
                    <button
                      onClick={() => handleStatusChange("DONE")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Done
                    </button>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  {task.deletedAt ? (
                    <button
                      onClick={() => {
                        onRestore(task.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                      <FiRotateCcw className="w-4 h-4" />
                      Restore Task
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete Task
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority Badge */}
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {/* Project Name */}
        {task.project && (
          <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
            {task.project.name}
          </span>
        )}

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FiUser className="w-3 h-3" />
            <span>{task.assignee.name}</span>
          </div>
        )}

        {/* Deleted Badge */}
        {task.deletedAt && (
          <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-medium">
            Deleted
          </span>
        )}
      </div>
    </div>
  );
}
