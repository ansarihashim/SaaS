import { useState, createContext, useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import EmptyWorkspaceState from "../components/EmptyWorkspaceState";
import Loader from "../components/Loader";
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
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Transition Effect on Route Change
  useEffect(() => {
    // Start transition
    setIsTransitioning(true);

    // Minimum visual hold time for stability (250ms)
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname]); // Trigger on path change

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
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
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto h-full">
            {isTransitioning ? (
              <div className="h-full flex items-center justify-center min-h-[50vh]">
                <Loader />
              </div>
            ) : (
               <div className="animate-fadeIn">
                 {children || <Outlet />}
               </div>
            )}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
