import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { activityAPI } from "../services/api";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiFolder,
  FiActivity,
} from "react-icons/fi";

export default function Activity() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspace) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Only fetch if user has permission
    const canViewActivity =
      activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN";

    if (!canViewActivity) {
      setActivities([]);
      setLoading(false);
      return;
    }

    fetchActivities();
  }, [activeWorkspace]);

  const fetchActivities = async () => {
    if (!activeWorkspace?.id) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await activityAPI.getAll(activeWorkspace.id);
      
      // Backend returns { logs: [...] }
      const logs = response?.data?.logs || [];
      setActivities(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      
      // Handle 403 Forbidden specifically
      if (err.response?.status === 403) {
        setError("You don't have permission to view activity logs");
      } else {
        setError(err.response?.data?.message || "Failed to load activity logs");
      }
      
      setActivities([]);
    } finally {
      setLoading(false);
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
            Please select a workspace to view activity.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Only OWNER and ADMIN can view activity logs
  const canViewActivity =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  if (!canViewActivity) {
    return (
      <DashboardLayout>
        <Topbar
          title="Activity"
          subtitle={activeWorkspace ? `Activity logs in ${activeWorkspace.name}` : "Activity"}
        />
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Access Restricted
            </h3>
            <p className="text-yellow-700">
              Only workspace owners and administrators can view activity logs.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Group activities by date - safely handle empty array
  const groupedActivities = Array.isArray(activities) && activities.length > 0 
    ? groupByDate(activities) 
    : [];

  return (
    <DashboardLayout>
      <Topbar
        title="Activity"
        subtitle={activeWorkspace ? `Activity logs in ${activeWorkspace.name}` : "Activity"}
      />

      <div className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-500">Loading activity...</p>
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
                <h3 className="text-red-800 font-semibold">Error Loading Activity</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!activities || activities.length === 0) && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FiActivity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Activity Yet
            </h3>
            <p className="text-gray-500">
              Activity logs will appear here as team members work on projects and tasks.
            </p>
          </div>
        )}

        {/* Activity Timeline */}
        {!loading && !error && activities && activities.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {groupedActivities.map(({ date, items }) => (
              <div key={date} className="mb-8">
                {/* Date Header */}
                <div className="sticky top-0 bg-white z-10 py-2 mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {formatDateHeader(date)}
                  </h3>
                </div>

                {/* Activity Items */}
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
                  {Array.isArray(items) && items.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ActivityItem({ activity }) {
  // Defensive null checks
  if (!activity) return null;

  const icon = getActivityIcon(activity.action);
  const iconColor = getActivityIconColor(activity.action);

  return (
    <div className="relative pl-8 pb-6">
      {/* Timeline Icon */}
      <div className={`absolute -left-4 w-8 h-8 rounded-full ${iconColor} flex items-center justify-center border-4 border-white shadow`}>
        {icon}
      </div>

      {/* Activity Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200">
        {/* Activity Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {activity.user?.name || "Unknown User"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {formatActionText(activity.action)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {activity.message || activity.description || "No description"}
            </p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
            {formatTime(activity.createdAt)}
          </span>
        </div>

        {/* Entity Info */}
        {(activity.entityType || activity.entityId) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {activity.entityType === "TASK" && <FiCheckCircle className="w-4 h-4" />}
              {activity.entityType === "PROJECT" && <FiFolder className="w-4 h-4" />}
              {activity.entityType === "USER" && <FiUser className="w-4 h-4" />}
              <span className="capitalize">{activity.entityType?.toLowerCase() || "Unknown"}</span>
              {activity.entityId && (
                <>
                  <span>•</span>
                  <span className="font-mono">ID: {activity.entityId}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Functions
function getActivityIcon(action) {
  switch (action) {
    case "CREATED":
      return <FiPlus className="w-4 h-4 text-white" />;
    case "UPDATED":
      return <FiEdit className="w-4 h-4 text-white" />;
    case "DELETED":
      return <FiTrash2 className="w-4 h-4 text-white" />;
    case "COMPLETED":
      return <FiCheckCircle className="w-4 h-4 text-white" />;
    default:
      return <FiActivity className="w-4 h-4 text-white" />;
  }
}

function getActivityIconColor(action) {
  switch (action) {
    case "CREATED":
      return "bg-green-500";
    case "UPDATED":
      return "bg-blue-500";
    case "DELETED":
      return "bg-red-500";
    case "COMPLETED":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

function formatActionText(action) {
  const actionMap = {
    CREATED: "created",
    UPDATED: "updated",
    DELETED: "deleted",
    COMPLETED: "completed",
  };
  return actionMap[action] || action.toLowerCase();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toDateString();
  const todayOnly = today.toDateString();
  const yesterdayOnly = yesterday.toDateString();

  if (dateOnly === todayOnly) return "Today";
  if (dateOnly === yesterdayOnly) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function groupByDate(activities) {
  // Defensive check
  if (!Array.isArray(activities) || activities.length === 0) {
    return [];
  }

  const groups = {};

  activities.forEach(activity => {
    if (!activity || !activity.createdAt) return;
    
    const date = new Date(activity.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  });

  // Convert to array and sort by date (newest first)
  return Object.entries(groups)
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
