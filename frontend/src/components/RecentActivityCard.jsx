import { useEffect, useState } from "react";
import { FiActivity } from "react-icons/fi";
import { Link } from "react-router-dom";
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

  const getActivityIcon = () => {
    // Simple activity icon for all actions (matches reference design)
    return <FiActivity className="w-5 h-5 text-purple-400" />;
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



  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-500 mt-1">
            Latest actions in your workspace
          </p>
        </div>
        <Link 
          to="/activity" 
          className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors"
        >
          View all
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((log) => {
            const userName = log.user?.name || "System";
            const message = log.message;
            
            return (
              <div
                key={log.id}
                className="flex items-start gap-4 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                {/* Activity Icon */}
                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <FiActivity className="w-4 h-4 text-purple-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="leading-relaxed text-sm">
                    <span className="font-semibold text-gray-900">{userName}</span>
                    <span className="text-gray-600 mx-1.5">{message}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
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
