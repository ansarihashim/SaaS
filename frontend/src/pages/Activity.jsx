import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { activityAPI } from "../services/api";
import {
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

        {/* Activity List */}
        {!loading && !error && activities && activities.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Latest actions in your workspace
              </h3>
              <div className="divide-y divide-gray-100">
                {activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ActivityItem({ activity }) {
  // Defensive null checks
  if (!activity) return null;

  const userName = activity.user?.name || "System";
  const message = activity.message || activity.description || "No description";

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        {/* Activity Icon */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
          <FiActivity className="w-5 h-5 text-purple-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <p className="leading-relaxed flex-1">
              <span className="text-lg font-semibold text-gray-900">{userName}</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-base text-gray-700">{message}</span>
            </p>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatTime(activity.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffMins === 1) return "1 minute ago";
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
