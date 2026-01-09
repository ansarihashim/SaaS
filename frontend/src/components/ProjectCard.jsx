import { FiCalendar, FiMoreVertical } from "react-icons/fi";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { name, description, createdAt, stats } = project;
  const { totalTasks, inProgressTasks, progressPercent } = stats;

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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description || "No description"}
          </p>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          title="More actions"
        >
          <FiMoreVertical className="w-5 h-5" />
        </button>
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
      <div className="flex items-center text-xs text-gray-500">
        <FiCalendar className="w-4 h-4 mr-1.5" />
        {formatCreatedAt(createdAt)}
      </div>
    </div>
  );
}
