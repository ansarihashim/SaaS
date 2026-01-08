import { useState, createContext, useContext } from "react";
import Sidebar from "../components/Sidebar";

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
