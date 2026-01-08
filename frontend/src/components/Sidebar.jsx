import { NavLink } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useState } from "react";
import { FiHome, FiFolder, FiCheckSquare, FiActivity, FiUsers } from "react-icons/fi";

const navItems = [
  { name: "Dashboard", path: "/", icon: FiHome },
  { name: "Projects", path: "/projects", icon: FiFolder },
  { name: "Tasks", path: "/tasks", icon: FiCheckSquare },
  { name: "Activity", path: "/activity", icon: FiActivity },
  { name: "Team", path: "/team", icon: FiUsers },
];

export default function Sidebar({ collapsed }) {
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspace();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  return (
    <aside 
      className={`hidden md:block relative bg-white border-r min-h-screen transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      } px-4 py-6`}
    >
      {/* Logo */}
      {!collapsed && (
        <h1 className="text-2xl font-bold text-purple-600 mb-6">
          TaskFlow
        </h1>
      )}
      
      {collapsed && (
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
            T
          </div>
        </div>
      )}

      {/* Workspace Selector */}
      {activeWorkspace && !collapsed && (
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

      {/* Collapsed Workspace Icon */}
      {activeWorkspace && collapsed && (
        <div className="mb-8 flex justify-center">
          <div className="w-10 h-10 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-purple-100 text-purple-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-6 left-4 right-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700">
              JD
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
