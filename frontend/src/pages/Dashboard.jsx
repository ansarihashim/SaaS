import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ActiveTasksCard from "../components/ActiveTasksCard";
import RecentActivityCard from "../components/RecentActivityCard";
import { MdFolder, MdChecklist, MdGroup, MdTrendingUp, MdArrowForward } from "react-icons/md";
import api from "../api/axios";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { activeWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const { user, loading: userLoading } = useAuth();
  const navigate = useNavigate();
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
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.email || 'there'}.`}
        action={
          <button 
            onClick={() => navigate('/tasks')}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            View All Tasks
            <MdArrowForward className="w-5 h-5" />
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Projects" value={stats.projects} icon={MdFolder} to="/projects" />
        <StatCard label="Total Tasks" value={stats.tasks} icon={MdChecklist} to="/tasks" />
        <StatCard label="Team Members" value={stats.members} icon={MdGroup} to="/team" />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={MdTrendingUp}
        />
      </div>

      {/* Task Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Task Overview</h3>
        <p className="text-sm text-gray-500 mb-6">
          Current status distribution of all tasks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 transition-all duration-200 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-5xl font-bold text-gray-900">{overview.TODO}</p>
            <p className="text-gray-600 mt-2 font-medium">To Do</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-200 transition-all duration-200 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-5xl font-bold text-purple-600">
              {overview.IN_PROGRESS}
            </p>
            <p className="text-gray-600 mt-2 font-medium">In Progress</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200 transition-all duration-200 hover:border-green-400 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-5xl font-bold text-green-600">
              {overview.DONE}
            </p>
            <p className="text-gray-600 mt-2 font-medium">Done</p>
          </div>
        </div>
      </div>

      {/* Active Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveTasksCard workspaceId={activeWorkspace.id} />
        <RecentActivityCard workspaceId={activeWorkspace.id} />
      </div>
    </DashboardLayout>
  );
}
