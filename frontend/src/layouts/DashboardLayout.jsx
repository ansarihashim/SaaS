import { useState, createContext, useContext } from "react";
import Sidebar from "../components/Sidebar";
import EmptyWorkspaceState from "../components/EmptyWorkspaceState";
import { useWorkspace } from "../contexts/WorkspaceContext";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within DashboardLayout');
  }
  return context;
};

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { workspaces, loading } = useWorkspace();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no workspaces
  if (workspaces.length === 0) {
    return <EmptyWorkspaceState />;
  }

  return (
    <SidebarContext.Provider value={{ toggleSidebar, collapsed: sidebarCollapsed }}>
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
