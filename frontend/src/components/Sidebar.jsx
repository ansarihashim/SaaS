import { NavLink } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { MdDashboard, MdFolder, MdChecklist, MdTimeline, MdGroup, MdLogout, MdChevronLeft, MdChevronRight } from "react-icons/md";
import logo from "../assets/logo.png";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: MdDashboard },
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
    <aside 
      className={`hidden md:flex flex-col bg-white h-screen sticky top-0 border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } py-6 overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className={`flex-shrink-0 flex items-center ${collapsed ? 'flex-col gap-4 justify-center' : 'justify-between px-4'} mb-8 transition-all duration-300`}>
        {/* Logo & Title */}
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <img src={logo} alt="TaskFlow" className="w-8 h-8 shrink-0 object-contain" />
          {!collapsed && (
            <h1 className="text-xl font-extrabold text-gray-900 truncate">
              TaskFlow
            </h1>
          )}
        </div>

        {/* Toggle Arrow */}
        <button
          onClick={onToggleCollapse}
          className="rounded-full p-1 hover:bg-gray-100 transition-all duration-200 cursor-pointer text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <MdChevronRight className="w-5 h-5" />
          ) : (
            <MdChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Workspace Selector */}
      {activeWorkspace && (
        <div className={`flex-shrink-0 mb-6 relative ${collapsed ? 'px-2 flex justify-center' : 'px-4'}`}>
          {!collapsed ? (
            <>
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="w-full px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                    {activeWorkspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{activeWorkspace.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Workspace</p>
                  </div>
                </div>
                <MdChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showWorkspaceMenu ? 'rotate-90' : ''}`} />
              </button>

              {/* Workspace Dropdown */}
              {showWorkspaceMenu && workspaces.length > 1 && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
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
                      <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{workspace.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
             <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-semibold text-sm" title={activeWorkspace.name}>
                {activeWorkspace.name.charAt(0).toUpperCase()}
             </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1 px-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = !activeWorkspace && item.path !== '/dashboard';
          
          if (isDisabled) {
            return (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={collapsed ? `${item.name} (No workspace)` : 'Select a workspace first'}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              </div>
            );
          }
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-700 font-medium"
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : ''}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-purple-700" : "text-gray-400 group-hover:text-purple-600"
                  }`} />
                  {!collapsed && <span className="text-sm truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className={`flex-shrink-0 mt-auto pt-4 border-t border-gray-100 ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-purple-50 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-semibold text-white text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <MdLogout className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-semibold text-white text-xs" title={user?.name}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <MdLogout className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
