import { NavLink } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Tasks", path: "/tasks" },
  { name: "Activity", path: "/activity" },
  { name: "Team", path: "/team" },
];

export default function Sidebar() {
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspace();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  return (
    <aside className="hidden md:block relative w-64 bg-white border-r min-h-screen px-4 py-6">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        TaskFlow
      </h1>

      {/* Workspace Selector */}
      {activeWorkspace && (
        <div className="mb-8 relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{activeWorkspace.name}</p>
                <p className="text-xs text-gray-500">{activeWorkspace.role}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Workspace Dropdown */}
          {showWorkspaceMenu && workspaces.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    selectWorkspace(workspace);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-2 ${
                    workspace.id === activeWorkspace.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{workspace.name}</p>
                    <p className="text-xs text-gray-500">{workspace.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-purple-100 text-purple-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
