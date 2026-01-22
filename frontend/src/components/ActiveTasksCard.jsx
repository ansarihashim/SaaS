import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI, tasksAPI } from "../services/api";

export default function ActiveTasksCard({ workspaceId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveTasks = async () => {
      if (!workspaceId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch all projects in workspace
        const projectsResponse = await projectsAPI.getAll(workspaceId);
        const projectsList = projectsResponse.data.projects || projectsResponse.data;

        let allTasks = [];

        // Fetch tasks from all projects
        if (projectsList && projectsList.length > 0) {
          const tasksPromises = projectsList.map(project =>
            tasksAPI.getByProject(project.id).catch(() => ({ data: [] }))
          );

          const tasksResponses = await Promise.all(tasksPromises);
          allTasks = tasksResponses.flatMap(response => response.data.tasks || response.data || []);
        }

        // Filter for active tasks (TODO or IN_PROGRESS, not deleted)
        const activeTasks = allTasks.filter(
          task =>
            task.deletedAt === null &&
            (task.status === "TODO" || task.status === "IN_PROGRESS")
        );

        // Sort by priority (HIGH > MEDIUM > LOW) then by createdAt desc
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const sortedTasks = activeTasks.sort((a, b) => {
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setTasks(sortedTasks);
      } catch (err) {
        console.error("Failed to fetch active tasks:", err);
        setError(err.response?.data?.message || "Failed to load active tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTasks();
  }, [workspaceId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";
      case "TODO":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTaskClick = (taskId) => {
    navigate("/tasks");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Active Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Tasks that need attention</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg h-16"
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
            <h3 className="text-xl font-bold text-gray-900">Active Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Tasks that need attention</p>
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
          <h3 className="text-xl font-bold text-gray-900">Active Tasks</h3>
          <p className="text-sm text-gray-500 mt-1">Tasks that need attention</p>
        </div>
        <button
          onClick={() => navigate("/tasks")}
          className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors"
        >
          View all
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No active tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => {
             const deadlineDate = task.deadline ? new Date(task.deadline) : null;
             const isOverdue = deadlineDate && deadlineDate < new Date();
             const isDueToday = deadlineDate && new Date().toDateString() === deadlineDate.toDateString();
            
             return (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${isOverdue ? "border-red-200 bg-red-50/50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"}`}
            >
              {/* Priority Badge */}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.project && (
                    <p className="text-xs text-gray-500">{task.project.name}</p>
                  )}
                  {deadlineDate && (
                     <span className={`text-[10px] font-medium flex items-center gap-1 ${
                       isOverdue ? "text-red-600" : isDueToday ? "text-yellow-600" : "text-gray-400"
                     }`}>
                       • {isOverdue ? "Overdue" : isDueToday ? "Due Today" : deadlineDate.toLocaleDateString()}
                     </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status === "IN_PROGRESS" ? "IN PROGRESS" : task.status}
              </span>

              {/* Assignee Avatar */}
              {task.assignee && (
                <div
                  className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold"
                  title={task.assignee.name}
                >
                  {getInitials(task.assignee.name)}
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
