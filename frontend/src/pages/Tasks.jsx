import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useToast } from "../contexts/ToastContext";
import { tasksAPI, projectsAPI } from "../services/api";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import ConfirmModal from "../components/modals/ConfirmModal";
import { FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Single source of truth for status order
const STATUS_ORDER = ["TODO", "IN_PROGRESS", "DONE"];

export default function Tasks() {
  const { projectId } = useParams(); // Extract projectId from URL
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const { success, error: toastError } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projectId || "all");
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
    }
  }, [activeWorkspace]);

  // Sync selectedProject with URL params
  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (activeWorkspace && selectedProject) {
      fetchTasks();
    }
  }, [activeWorkspace, selectedProject]);

  const fetchProjects = async () => {
    if (!activeWorkspace?.id) {
      setProjects([]);
      return;
    }

    try {
      const response = await projectsAPI.getAll(activeWorkspace.id);
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchTasks = async () => {
    if (!activeWorkspace?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorStatus("");

      let allTasks = [];
      
      if (selectedProject === "all") {
        // Fetch tasks from all projects
        const projectsResponse = await projectsAPI.getAll(activeWorkspace.id);
        const projectsList = projectsResponse.data.projects || projectsResponse.data;
        
        // Only fetch tasks if there are projects
        if (projectsList && projectsList.length > 0) {
          const tasksPromises = projectsList.map(project =>
            tasksAPI.getByProject(project.id).catch(() => ({ data: [] }))
          );
          
          const tasksResponses = await Promise.all(tasksPromises);
          allTasks = tasksResponses.flatMap(response => response.data.tasks || response.data || []);
        }
      } else if (selectedProject) {
        // Fetch tasks from selected project - validate projectId
        const projectId = parseInt(selectedProject);
        if (!isNaN(projectId)) {
          const response = await tasksAPI.getByProject(projectId);
          allTasks = response.data.tasks || response.data || [];
        }
      }

      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setErrorStatus(err.response?.data?.message || "Server error");
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
        success("Task updated successfully");
      } else {
        // Create new task - POST /api/projects/:projectId/tasks
        const createData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        };
        await tasksAPI.create(formData.projectId, createData);
        success("Task created successfully");
      }
      setShowCreateModal(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      toastError(err.response?.data?.message || "Failed to save task");
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
      toastError(err.response?.data?.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    setDeleteModal({ isOpen: true, taskId, taskTitle });
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal.taskId) return;
    
    try {
      setIsDeleting(true);
      await tasksAPI.delete(deleteModal.taskId);
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: "" });
      success("Task deleted successfully");
      await fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      toastError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await tasksAPI.restore(taskId);
      await fetchTasks();
      success("Task restored successfully");
    } catch (err) {
      console.error("Error restoring task:", err);
      toastError(err.response?.data?.message || "Failed to restore task");
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

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      const response = await tasksAPI.updateStatus(taskId, newStatus);
      const updatedTask = response.data.task;
      
      // Merge updated task into state without refetching
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
    } catch (err) {
      console.error("Error moving task:", err);
      toastError(err.response?.data?.message || "Failed to move task");
    }
  };

  return (
    <DashboardLayout>
      <Topbar
        title="Tasks"
        subtitle={`Manage tasks in ${activeWorkspace.name}`}
        action={
          canManageTasks && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          )
        }
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateTask}
        loading={creating}
        task={editingTask}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />

      <div>
        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="projectFilter" className="text-sm font-medium text-gray-700">
              Filter by Project:
            </label>
            <select
              id="projectFilter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
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
        {!loading && errorStatus && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{errorStatus}</p>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && !errorStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                title={status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Done"}
                status={status}
                tasks={tasksByStatus[status]}
                onMove={handleMoveTask}
                onDelete={handleDeleteTask}
                onEdit={canManageTasks ? handleEditTask : null}
                canManage={canManageTasks}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !errorStatus && tasks.filter(t => !t.deletedAt).length === 0 && (
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

function KanbanColumn({ title, status, tasks, onMove, onDelete, onEdit, canManage }) {
  const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DONE: "bg-green-100 text-green-800",
  };

  const columnBgColors = {
    TODO: "bg-gray-100",
    IN_PROGRESS: "bg-purple-100",
    DONE: "bg-green-100",
  };

  return (
    <div className={`${columnBgColors[status]} rounded-xl p-4 min-h-[80vh]`}>
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
            onMove={onMove}
            onDelete={onDelete}
            onEdit={onEdit}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onMove, onDelete, onEdit, canManage }) {
  const priorityColors = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
  };

  // Calculate movement permissions
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1;
  const leftStatus = canMoveLeft ? STATUS_ORDER[currentIndex - 1] : null;
  const rightStatus = canMoveRight ? STATUS_ORDER[currentIndex + 1] : null;

  const getInitials = (name) => {
    if (!name) return null;
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const assigneeInitials = task.assignee?.name ? getInitials(task.assignee.name) : null;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Section: Title & Description */}
      <div className="p-4 relative">
        {/* Actions (Absolute Top Right) */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm rounded-lg p-1">
          {canManage && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded transition-colors"
              title="Edit Task"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canManage && (
            <button
              onClick={() => onDelete(task.id, task.title)}
              className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
              title="Delete Task"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-gray-900 mb-2 pr-16 leading-tight">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-3 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Project Tag */}
        {task.project && (
           <div className="mb-1">
             <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                {task.project.name}
             </span>
           </div>
        )}
      </div>

      {/* Footer Section: Metadata & Controls */}
      <div className="mt-auto px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        {/* Left: Priority & Move Left */}
        <div className="flex items-center gap-3">
          {canManage && canMoveLeft && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(task.id, leftStatus); }}
              className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded p-1 transition-all"
              title="Move Left"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Right: Assignee & Move Right */}
        <div className="flex items-center gap-3">
          {assigneeInitials && (
            <div 
              className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white"
              title={`Assigned to ${task.assignee.name}`}
            >
              {assigneeInitials}
            </div>
          )}
          
          {canManage && canMoveRight && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(task.id, rightStatus); }}
              className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded p-1 transition-all"
              title="Move Right"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
