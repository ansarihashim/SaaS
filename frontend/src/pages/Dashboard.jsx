import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { activeWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const { user, loading: userLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
    completionRate: 0,
  });

  const [overview, setOverview] = useState({
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!activeWorkspace) return;
      
      try {
        setLoading(true);
        setError("");
        const res = await api.get(
          `/workspaces/${activeWorkspace.id}/dashboard`
        );

        setStats(res.data.stats);
        setOverview(res.data.overview);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [activeWorkspace]);

  // Show workspace loading state
  if (workspaceLoading) {
    return (
      <DashboardLayout>
        <p className="text-gray-500">Loading workspace...</p>
      </DashboardLayout>
    );
  }

  // Show workspace error
  if (workspaceError) {
    return (
      <DashboardLayout>
        <p className="text-red-500">Error: {workspaceError}</p>
      </DashboardLayout>
    );
  }

  // No active workspace available
  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Workspace Available</h3>
          <p className="text-yellow-700">You don't have access to any workspaces yet. Please create one or ask to be invited.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-gray-500">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Topbar
        title={user ? `Welcome back, ${user.name}` : "Welcome back"}
        action={
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200">
            View All Tasks
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Projects" value={stats.projects} />
        <StatCard label="Total Tasks" value={stats.tasks} />
        <StatCard label="Team Members" value={stats.members} />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
        />
      </div>

      {/* Task Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-1">Task Overview</h3>
        <p className="text-sm text-gray-500 mb-6">
          Current status distribution of all tasks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <p className="text-4xl font-bold">{overview.TODO}</p>
            <p className="text-gray-500 mt-2">To Do</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <p className="text-4xl font-bold text-purple-600">
              {overview.IN_PROGRESS}
            </p>
            <p className="text-gray-500 mt-2">In Progress</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <p className="text-4xl font-bold text-green-600">
              {overview.DONE}
            </p>
            <p className="text-gray-500 mt-2">Done</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
