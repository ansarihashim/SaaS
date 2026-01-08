import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { projectsAPI } from "../services/api";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Projects() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    if (!activeWorkspace?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await projectsAPI.getAll(activeWorkspace.id);
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    if (!activeWorkspace?.id) {
      alert("No workspace selected");
      return;
    }

    try {
      setCreating(true);
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData);
      } else {
        await projectsAPI.create(activeWorkspace.id, formData);
      }
      setShowCreateModal(false);
      setEditingProject(null);
      await fetchProjects(); // Refresh list
    } catch (err) {
      console.error("Error saving project:", err);
      alert(err.response?.data?.message || "Failed to save project");
    } finally {
      setCreating(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return;
    }

    try {
      // Optimistically remove from UI
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Call API to soft delete
      await projectsAPI.delete(projectId);
    } catch (err) {
      console.error("Error deleting project:", err);
      
      // Restore on error
      await fetchProjects();
      
      const errorMessage = err.response?.data?.message || "Failed to delete project";
      alert(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
  };

  // Show workspace loading state
  if (workspaceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  // No active workspace
  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Workspace Selected
          </h3>
          <p className="text-yellow-700">
            Please select a workspace to view projects.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user can create projects (OWNER or ADMIN only)
  const canCreateProject = activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN";

  return (
    <DashboardLayout>
      <Topbar
        title="Projects"
        subtitle={`Manage projects in ${activeWorkspace.name}`}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateProject}
        loading={creating}
        project={editingProject}
      />

      <div className="p-6">
        {/* Create Project Button */}
        {canCreateProject && (
          <div className="mb-6">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          </div>
        )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-red-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Projects</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Projects Yet
          </h3>
          <p className="text-gray-500 mb-6">
            {canCreateProject
              ? "Get started by creating your first project."
              : "No projects have been created in this workspace yet."}
          </p>
          {canCreateProject && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              Create Your First Project
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onEdit={canCreateProject ? () => handleEditProject(project) : null}
              onDelete={canCreateProject ? () => handleDeleteProject(project.id, project.name) : null}
            />
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-200 group relative">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded transition-all"
                  title="Edit Project"
                >
                  <FiEdit2 className="w-4 h-4 text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                  title="Delete Project"
                >
                  <FiTrash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {project.description || "No description provided"}
          </p>
        </div>
        <div className="ml-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
            {project.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Project Metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Created {formatDate(project.createdAt)}</span>
        </div>

        {/* Task count if available */}
        {project.taskCount !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>{project.taskCount || 0} tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}
