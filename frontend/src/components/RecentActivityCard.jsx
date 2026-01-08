import { useEffect, useState } from "react";
import api from "../api/axios";

export default function RecentActivityCard({ workspaceId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      if (!workspaceId) return;

      try {
        setLoading(true);
        setError("");
        const res = await api.get(
          `/workspaces/${workspaceId}/activity?limit=8`
        );
        setActivities(res.data.logs || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        setError(err.response?.data?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [workspaceId]);

  const getActivityIcon = (action) => {
    if (action.includes("CREATED")) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      );
    }
    if (action.includes("UPDATED") || action.includes("STATUS")) {
      return (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    }
    if (action.includes("DELETED")) {
      return (
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      );
    }
    if (action.includes("ASSIGNED") || action.includes("REASSIGNED")) {
      return (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    }
    // Default icon
    return (
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return "1 day ago";
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const parseActivityMessage = (log) => {
    // Message format: "Task 'Title' created" or similar
    const actor = log.user?.name || "Someone";
    const message = log.message;
    
    return { actor, message };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500">
              Latest actions in your workspace
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg h-14"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500">
              Latest actions in your workspace
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-gray-500">
            Latest actions in your workspace
          </p>
        </div>
        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">
          View all
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((log) => {
            const { actor, message } = parseActivityMessage(log);
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
              >
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  {getActivityIcon(log.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{actor}</span>
                    <span className="text-gray-600"> · {message}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
