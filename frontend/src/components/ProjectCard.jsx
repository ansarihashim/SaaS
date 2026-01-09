import { FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { id, name, description, createdAt, createdBy, stats } = project;
  const { totalTasks, inProgressTasks, progressPercent } = stats;

  // Generate creator initials (reusable utility)
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const creatorInitials = createdBy?.name ? getInitials(createdBy.name) : null;

  // Format date as "Created X days ago"
  const formatCreatedAt = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Created today";
    if (diffDays === 1) return "Created 1 day ago";
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
    return `Created ${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div 
      onClick={() => navigate(`/projects/${id}/tasks`)}
      className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer"
    >
      {/* Hover Actions - Top Right */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-1.5 hover:bg-purple-50 rounded transition-colors"
              title="Edit Project"
            >
              <FiEdit2 className="w-4 h-4 text-purple-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id, project.name);
              }}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              title="Delete Project"
            >
              <FiTrash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">{name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description || "No description"}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-purple-600">{progressPercent}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900">{totalTasks}</span>
          <span className="text-sm text-gray-600">tasks</span>
        </div>
        
        {inProgressTasks > 0 && (
          <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
            {inProgressTasks} in progress
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <FiCalendar className="w-4 h-4 mr-1.5" />
          {formatCreatedAt(createdAt)}
        </div>
        
        {/* Creator Initials Badge */}
        {creatorInitials && (
          <div 
            className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold transition-transform hover:scale-110"
            title={`Created by ${createdBy?.name || 'Unknown'}`}
          >
            {creatorInitials}
          </div>
        )}
      </div>
    </div>
  );
}
