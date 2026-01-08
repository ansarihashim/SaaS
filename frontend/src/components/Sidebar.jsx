import { NavLink } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { MdDashboard, MdFolder, MdChecklist, MdTimeline, MdGroup, MdLogout, MdChevronLeft, MdChevronRight } from "react-icons/md";

const navItems = [
  { name: "Dashboard", path: "/", icon: MdDashboard },
  { name: "Projects", path: "/projects", icon: MdFolder },
  { name: "Tasks", path: "/tasks", icon: MdChecklist },
  { name: "Activity", path: "/activity", icon: MdTimeline },
  { name: "Team", path: "/team", icon: MdGroup },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspace();
  const { user, logout } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  return (
    <>
      <aside 
        className={`hidden md:block relative bg-white min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } px-4 py-6`}
      >
        {/* Logo */}
        {!collapsed && (
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">
                TaskFlow
              </h1>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              T
            </div>
          </div>
        )}

        {/* Workspace Selector */}
        {activeWorkspace && !collapsed && (
          <div className="mb-8 relative px-2">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                  {activeWorkspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-gray-900">{activeWorkspace.name}</p>
                  <p className="text-xs text-gray-500">Workspace</p>
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
                      <p className="text-xs text-gray-500">Workspace</p>
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
        <nav className="space-y-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = !activeWorkspace && item.path !== '/';
            
            if (isDisabled) {
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 cursor-not-allowed ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  title={collapsed ? `${item.name} (No workspace)` : 'Select a workspace first'}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="text-base font-medium">{item.name}</span>}
                </div>
              );
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? "bg-purple-50 text-purple-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-base">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          {!collapsed ? (
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700 text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
              >
                <MdLogout className="w-5 h-5" />
                <span className="text-base font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700 text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex justify-center px-2 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                title="Logout"
              >
                <MdLogout className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Collapse Toggle Arrow */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:block fixed top-20 z-50 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
        style={{
          left: collapsed ? '60px' : '248px',
          transition: 'left 0.3s ease-in-out'
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <MdChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <MdChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </>
  );
}
